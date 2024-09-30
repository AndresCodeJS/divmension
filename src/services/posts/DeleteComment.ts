import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { ulid } from 'ulid';
import { AuthService } from '../users/AuthService';

const auth = new AuthService();

export async function postComment(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const { postId, commentId } = JSON.parse(event.body);

  if (!postId || !commentId) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'missing attributes' }),
    };
  }

  let response = await auth.verifyToken(event); // Autenticacion de usuario

  if (response.statusCode == 200) {
    let loggedUser = JSON.parse(response.body).username;

    try {
      //BUSCA EL COMENTARIO PARA VERIFICAR QUE EL USUARIO LOGEADO ES EL PROPIETARIO
      const getCommentCommand = new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          pk: `${postId}#comment`,
          sk: commentId,
        },
      });

      const getComment = await ddbDocClient.send(getCommentCommand);

      if (getComment.Item.user) {
        if (getComment.Item.user == loggedUser) {
          // VERIFICA QUE EL USUARIO SEA EL PROPIETAIO DEL COMENTARIO

          //ELIMINA EL COMENTARIO
          const deleteCommentCommand = new DeleteCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
              pk: `${postId}#comment`,
              sk: commentId,
            },
            ConditionExpression:
              'attribute_exists(pk) AND attribute_exists(sk)',
            ReturnValues: 'NONE',
          });

          await ddbDocClient.send(deleteCommentCommand);

          //DECREMENTA EN 1 LA CANTIDAD DE COMENTARIOS DEL POST
          const deleteQuantityCommand = new UpdateCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
              pk: `${postId}#commentcount`,
              sk: 'count',
            },
            UpdateExpression: 'SET #attrName = #attrName - :decr',
            ExpressionAttributeNames: {
              '#attrName': 'quantity',
            },
            ExpressionAttributeValues: {
              ':decr': 1,
            },
          });

          await ddbDocClient.send(deleteQuantityCommand);

          response = {
            statusCode: 200,
            body: JSON.stringify({ message: 'comment deleted' }),
          };
        } else {
          return {
            statusCode: 401,
            body: JSON.stringify({ message: 'invalid user' }),
          };
        }
      } else {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: 'comment does not exists' }),
        };
      }
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
