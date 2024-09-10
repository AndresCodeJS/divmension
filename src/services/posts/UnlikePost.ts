import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import { AuthService } from "../users/AuthService";

const auth = new AuthService();

export async function unlikePost(
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
      //ELIMINA EL USUARIO QUE DIÓ LIKE AL POST
      const commandUnlike = new DeleteCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          pk: `${postId}#likelist`,
          sk: loggedUser,
        },
        ConditionExpression: "attribute_exists(pk) AND attribute_exists(sk)",
        ReturnValues: "NONE",
      });

      await ddbDocClient.send(commandUnlike);

      //DECREMENTA EN UNO LA CANTIDAD DE LIKES DEL POST
      //INCREMENTA EN 1 EL NUMERO DE LIKES DEL POST
      const commandUpdateLikesQuantity = new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          pk: `${postId}#likecount`,
          sk: "count",
        },
        UpdateExpression: "SET #attrName = #attrName - :decr",
        ExpressionAttributeNames: {
          "#attrName": "quantity",
        },
        ExpressionAttributeValues: {
          ":decr": 1,
        },
      });

      await ddbDocClient.send(commandUpdateLikesQuantity);

      response = {
        statusCode: 200,
        body: JSON.stringify({ isLiked: false }),
      };
    } catch (error) {
      if ((error.name = "ConditionalCheckFailedException")) {
        // Este usuario no dio like a este post
        response = {
          statusCode: 401,
          body: JSON.stringify({ message: "this user didn't like this post" }),
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
