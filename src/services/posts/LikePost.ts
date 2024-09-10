import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { AuthService } from "../users/AuthService";

const auth = new AuthService();

export async function likePost(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const { postId } = JSON.parse(event.body);

  if (!postId) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "missing postId" }),
    };
  }

  let response = await auth.verifyToken(event); // Autenticacion de usuario

  if (response.statusCode == 200) {
    let loggedUser = JSON.parse(response.body).username;

    try {
      //GUARDA EL USUARIO QUE DIÓ LIKE AL POST
      const commandLike = new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
          pk: `${postId}#likelist`,
          sk: loggedUser,
        },
        ConditionExpression:
          "attribute_not_exists(pk) AND attribute_not_exists(sk)",
        ReturnValues: "ALL_OLD",
      });

      await ddbDocClient.send(commandLike);

      //INCREMENTA EN 1 EL NUMERO DE LIKES DEL POST
      const commandUpdateLikesQuantity = new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          pk: `${postId}#likecount`,
          sk: "count",
        },
        UpdateExpression: "SET #attrName = #attrName + :incr",
        ExpressionAttributeNames: {
          "#attrName": "quantity",
        },
        ExpressionAttributeValues: {
          ":incr": 1,
        },
      });

      await ddbDocClient.send(commandUpdateLikesQuantity);

      response = {
        statusCode: 200,
        body: JSON.stringify({ isLiked: true }),
      };
    } catch (error) {
      if ((error.name = "ConditionalCheckFailedException")) {
        // Ya dió like al post
        response = {
          statusCode: 401,
          body: JSON.stringify({ message: "already liked this post" }),
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
