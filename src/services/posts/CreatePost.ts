import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import bcrypt from 'bcryptjs';
import { ulid } from 'ulid';
import { AuthService } from '../users/AuthService';
import { timeStamp } from 'console';

const auth = new AuthService();

export async function createPost(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const { imageUrl, description } = JSON.parse(event.body);

  if (!imageUrl || !description) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'missing attributes' }),
    };
  }

  let response = await auth.verifyToken(event); // Autenticacion de usuario

  if (response.statusCode == 200) {
    let loggedUser = JSON.parse(response.body).username;

    try {
      const postId = ulid();
      const currentTimestamp = Math.floor(Date.now() / 1000); // Obtener timestamp en segundos

      //CREA EL POST
      const createPostCommand = new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
          pk: `${loggedUser}#post`,
          sk: postId,
          description,
          imageUrl,
          timeStamp: currentTimestamp,
        },
      });

      await ddbDocClient.send(createPostCommand);

      //INCREMENTA EN 1 EL CONTEO DE POSTS DEL USUARIO
      const UpdatePostsCounter = new UpdateCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          pk: loggedUser,
          sk: 'count',
        },
        UpdateExpression: 'SET #attrName = #attrName + :incr',
        ExpressionAttributeNames: {
          '#attrName': 'posts',
        },
        ExpressionAttributeValues: {
          ':incr': 1,
        },
      });

      await ddbDocClient.send(UpdatePostsCounter);

      //CREA EL CONTADOR DE COMENTARIOS PARA EL POST
      const commetCountCommand = new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
          pk: `${postId}#commentcount`,
          sk: 'count',
          quantity: 0,
        },
      });

      await ddbDocClient.send(commetCountCommand);

      //CREA EL CONTADOR DE LIKES PARA EL POST
      const likeCountCommand = new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
          pk: `${postId}#likecount`,
          sk: 'count',
          quantity: 0,
        },
      });

      await ddbDocClient.send(likeCountCommand);

      //REGISTRA EL POST EN EL FEED GENERAL PARA TODOS LOS USUARIOS
      const feedPostCommand = new PutCommand({
        TableName: process.env.TABLE_NAME,
        Item: {
          pk: `feed`,
          sk: `${postId}#${loggedUser}`,
          quantity: 0,
        },
      });

      await ddbDocClient.send(feedPostCommand);

      response = {
        statusCode: 200,
        body: JSON.stringify({ message: 'exitoso' }),
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
