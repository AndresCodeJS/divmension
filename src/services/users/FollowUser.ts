import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import { AuthService } from "./AuthService";

const auth = new AuthService();

export async function followUser(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const { followingUser } = JSON.parse(event.body);

  console.log(" following:" + followingUser);

  let response = await auth.verifyToken(event); // Autenticacion de usuario

  if (response.statusCode == 200) {
    console.log("Token valido");

    let loggedUser = JSON.parse(response.body).username;

    try {
      //Registra que el usuario loggeado sigue al usuario seleccionado
      const commandFollowing = new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
          pk: `${loggedUser}#following`,
          sk: followingUser,
        },
        ConditionExpression:
          "attribute_not_exists(pk) AND attribute_not_exists(sk)",
        ReturnValues: "ALL_OLD",
      });

      await ddbDocClient.send(commandFollowing);

      //Registra que el usuario seleccionado tiene como seguidor al usuario loggeado
      const commandFollower = new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
          pk: `${followingUser}#follower`,
          sk: loggedUser,
        },
      });

      await ddbDocClient.send(commandFollower);

      //Incrementa en 1 los seguidos(following) del usuario loggeado
      const commandUpdateFollowingCounter = new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          pk: loggedUser,
          sk: "count" 
        },
        UpdateExpression: "SET #attrName = #attrName + :incr",
        ExpressionAttributeNames: {
          "#attrName": "following"
        },
        ExpressionAttributeValues: {
          ":incr": 1
        },
      })

      await ddbDocClient.send(commandUpdateFollowingCounter);

      //Incrementa en 1 los seguidos(followers) del usuario seguido
      const commandUpdateFollowersCounter = new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          pk: followingUser,
          sk: "count" 
        },
        UpdateExpression: "SET #attrName = #attrName + :incr",
        ExpressionAttributeNames: {
          "#attrName": "followers"
        },
        ExpressionAttributeValues: {
          ":incr": 1
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
        // Ya se encuentra siguiendo al usuario
        response = {
          statusCode: 401,
          body: JSON.stringify({ message: "already following this user" }),
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

  //TODO

  // 1 Guardar pk = loggedUser + '#' + 'following'  ,  sk = followingUser
  // si devuelve ConditionalCheckFailedException es porque ya existe , por lo tanto se corta el flujo

  // 2 Guardar pk = followingUser + '#' + 'follower , sk = loggedUser

  // 3 Incrementa en 1 los following de loggedUser

  // 4 Incrementa en 1 los followers de followingUser

  //Registra el ususario

  /*   const command = new PutCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: username.toLowerCase(),
      sk: "profile",
      email: email.toLowerCase(),
      fullname: fullnameClean,
      password: hashedPassword,
    },
  }); */

  /*  const response = await ddbDocClient.send(command); */
}
