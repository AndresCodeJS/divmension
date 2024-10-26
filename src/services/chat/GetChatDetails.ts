import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
/* import { AuthService } from "./AuthService"; */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { IChat, IUser } from '../model/model';
import { AuthService } from '../users/AuthService';

const auth = new AuthService();

export async function getChatDetails(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const addressee = event.pathParameters?.addressee;

  if (!addressee) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: 'missing addressee' }),
    };
  }

  let response = await auth.verifyToken(event); // Autenticacion de usuario

  if (response.statusCode != 200) {
    return response;
  } else {
    try {
      let loggedUser = JSON.parse(response.body).username;

      let chat: IChat = {
        newSortKey: '',
        oldSortKey: '',
        chatId: '',
        messages: [],
      };

      //SE OBTIENE EL ID DEL CHAT EN CASO DE QUE EL CHAT EXISTA
      const getChatCommand = new GetCommand({
        TableName: process.env.CHAT_TABLE_NAME,
        Key: {
          pk: `${loggedUser}#${addressee}`,
          sk: 'chat',
        },
      });

      const getChat = await ddbDocClient.send(getChatCommand);

      if (getChat.Item) {
        let chatId = getChat.Item.id;

        //OBTIENE EL SORT KEY DEL CHAT
        const getChatDetailsParams = {
          TableName: process.env.CHAT_TABLE_NAME,
          IndexName: process.env.CHAT_TABLE_GSI2_NAME,
          KeyConditionExpression: 'idChat = :pk_value',
          ExpressionAttributeValues: {
            ':pk_value': chatId,
          },
        };

        const getDetails = await ddbDocClient.send(
          new QueryCommand(getChatDetailsParams)
        );

        if (getDetails.Items.length) {
          chat.oldSortKey = getDetails.Items[0].sk;
          chat.chatId = chatId;

          //SE OBTIENEN LOS PRIMEROS 15 MENSAJES DEL CHAT

          let params = {
            TableName: process.env.CHAT_TABLE_NAME,
            KeyConditionExpression: 'pk = :pk',
            ExpressionAttributeValues: {
              ':pk': `message#${chatId}`,
            },
            Limit: 15,
            ScanIndexForward: false, // para obtener de los registros mas nuevos a los mas viejos
          };

          const getMessagesCommand = new QueryCommand(params);
          let getMessages = await ddbDocClient.send(getMessagesCommand);

          if (getMessages.Items.length) {
            chat.messages = getMessages.Items;
          }
        }

        /* ScanIndexForward: false, // para obtener de los registros mas nuevos a los mas viejos */
      }

      return {
        statusCode: 200,
        body: JSON.stringify({
          chat,
        }),
      };
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error,
        }),
      };
    }
  }
}
