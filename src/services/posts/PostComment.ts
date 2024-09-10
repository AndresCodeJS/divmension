import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  PutCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { ulid } from "ulid";
import { AuthService } from "../users/AuthService";

const auth = new AuthService();

export async function postComment(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const { postId, content } = JSON.parse(event.body);

  if (!postId || !content) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "missing attributes" }),
    };
  }

  let response = await auth.verifyToken(event); // Autenticacion de usuario

  if (response.statusCode == 200) {
    let loggedUser = JSON.parse(response.body).username;

    try {
      const commentId = ulid();
      const currentTimestamp = Math.floor(Date.now() / 1000); // Obtener timestamp en segundos

      //CREA EL COMENTARIO
      const createCommentCommand = new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
          pk: `${postId}#comment`,
          sk: commentId,
          user: loggedUser,
          content,
          timeStamp: currentTimestamp,
        },
      });

      await ddbDocClient.send(createCommentCommand);

      //INCREMENTA EN 1 EL CONTEO DE COMENTARIOS DEL POST
      const UpdateCommentQuantity = new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          pk: `${postId}#commentcount`,
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

      await ddbDocClient.send(UpdateCommentQuantity);

      response = {
        statusCode: 200,
        body: JSON.stringify({ currentTimestamp }),
      };
    } catch (error) {
      response = {
        statusCode: 401,
        body: JSON.stringify({ message: error }),
      };
    }
  } else {
    return response;
  }

  return response;
}
