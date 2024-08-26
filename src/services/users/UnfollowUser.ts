import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import { AuthService } from "./AuthService";

const auth = new AuthService();

export async function unfollowUser(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const { unfollowUser } = JSON.parse(event.body);

  

  let response = await auth.verifyToken(event); // Autenticacion de usuario

  if (response.statusCode == 200) {
    console.log("Token valido");

    let loggedUser = JSON.parse(response.body).username;

    try {
      //Elimina el registro donde el usuario loggeado sigue al usuario seleccionado
      const commandUnfollowing = new DeleteCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          pk: `${loggedUser}#following`,
          sk: unfollowUser,
        },
        ConditionExpression:
        "attribute_exists(pk) AND attribute_exists(sk)",
        ReturnValues: "NONE",
      });

      await ddbDocClient.send(commandUnfollowing);

      //Elimina el registro donde el usuario seleccionado tiene como seguidor al usuario loggeado
      const commandUnfollower = new DeleteCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          pk: `${unfollowUser}#follower`,
          sk: loggedUser,
        },
        ReturnValues: "NONE",
      });

      await ddbDocClient.send(commandUnfollower);

      //Decrementa en 1 los seguidos(following) del usuario loggeado
      const commandUpdateFollowingCounter = new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          pk: loggedUser,
          sk: "count" 
        },
        UpdateExpression: "SET #attrName = #attrName - :decr",
        ExpressionAttributeNames: {
          "#attrName": "following"
        },
        ExpressionAttributeValues: {
          ":decr": 1
        },
      })

      await ddbDocClient.send(commandUpdateFollowingCounter);

      //Decrementa en 1 los seguidos(followers) del usuario seguido
      const commandUpdateFollowersCounter = new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          pk: unfollowUser,
          sk: "count" 
        },
        UpdateExpression: "SET #attrName = #attrName - :decr",
        ExpressionAttributeNames: {
          "#attrName": "followers"
        },
        ExpressionAttributeValues: {
          ":decr": 1
        },
        ReturnValues: "UPDATED_NEW"
      })

      //Devuelve la cantidad de followers del usuario al que se sigue
      let followerCounter = await ddbDocClient.send(commandUpdateFollowersCounter);

      let followers = followerCounter.Attributes.followers

      response = {
        statusCode: 200,
        body: JSON.stringify({ followers }),
      };
    } catch (error) {
      if ((error.name = "ConditionalCheckFailedException")) {
        // No sigue al usuario
        response = {
          statusCode: 401,
          body: JSON.stringify({ message: "already unfollowing this user" }),
        };
      } else {
        response = {
          statusCode: 401,
          body: JSON.stringify({ message: error }),
        };
      }
    }
  } else {
    return response;
  }

  return response;

}
