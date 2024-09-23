import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { QueryCommand, QueryCommandOutput } from '@aws-sdk/lib-dynamodb';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
/* import { AuthService } from "./AuthService";

const auth = new AuthService(); */

export interface IComment {
  user: string;
  imageUrl: string;
  content: string;
  timeStamp: number;
}

export async function getCommentsByPost(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const pkParam = event.pathParameters?.pkParam;
  const skParam = event.pathParameters?.skParam;

  if (!pkParam) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'missing parameters' }),
    };
  }

  try {
    let getComments: QueryCommandOutput;

    //RECUPERA COMENTARIOS DE UN POST

    if (!skParam || skParam == 'none') {
      // Significa que es primera vez que se consulta por los comentarios del post
      let params = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: 'pk = :pk',
        ExpressionAttributeValues: {
          ':pk': `${pkParam}#comment`,
        },
        Limit: 6,
        ScanIndexForward: false, // para obtener de los registros mas nuevos a los mas viejos
      };

      const getCommentsCommand = new QueryCommand(params);
      getComments = await ddbDocClient.send(getCommentsCommand);
    } else {
      // Ya se consultó anteriormente, y se realiza paginación
      let params = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: 'pk = :pk',
        ExpressionAttributeValues: {
          ':pk': `${pkParam}#comment`,
        },
        Limit: 6,
        ScanIndexForward: false, // para obtener de los registros mas nuevos a los mas viejos
        ExclusiveStartKey: {
          pk: `${pkParam}#comment`,
          sk: skParam,
        },
      };

      const getCommentsCommand = new QueryCommand(params);
      getComments = await ddbDocClient.send(getCommentsCommand);
    }

    if (getComments) {
      //Obtiene la foto de perfil del usuario que ha comentado

      let comments: IComment[] = [];

      if (getComments.Items.length) {
        let commentQueries = getComments.Items.map((comment) => {
          let getCommentInfo = async () => {
            //Obtiene foto de perfil del usuario del comentario
            const getImageCommand = new GetCommand({
              TableName: process.env.TABLE_NAME,
              Key: {
                pk: comment.user,
                sk: 'photo',
              },
            });

            let getImage = await ddbDocClient.send(getImageCommand);

            return {
              commentId: comment.sk,
              user: comment.user,
              imageUrl: getImage.Item ? getImage.Item.url : '',
              content: comment.content,
              timeStamp: comment.timeStamp,
            };
          };

          return getCommentInfo();
        });

        comments = await Promise.all(commentQueries);

        let lastEvaluatedKey = getComments.LastEvaluatedKey;

        return {
          statusCode: 200,
          body: JSON.stringify({ comments, lastEvaluatedKey }),
        };
      } else {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: 'No comments found' }),
        };
      }
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: 'Unable get comments for post' }),
      };
    }
  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify(err),
    };
  }
}
