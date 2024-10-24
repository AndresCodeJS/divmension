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

      let result: IChat = {
        newSortKey: '',
        oldSortKey: '',
        chatId: '',
        messages: []
      };

      //SE OBTIENE EL ID DEL CHAT EN CASO DE QUE EL CHAT EXISTA
      const getChatCommand = new GetCommand({
        TableName: process.env.CHAT_TABLE_NAME,
        Key: {
          pk: `${loggedUser}#addressee`,
          sk: 'chat',
        },
      });

      const getChat = await ddbDocClient.send(getChatCommand);

      if (getChat.Item) {
        let chatId = getChat.Item.chatId;

        //OBTIENE EL SORT KEY DEL CHAT
        const getChatDetailsParams = {
          TableName: process.env.CHAT_TABLE_NAME,
          IndexName: process.env.CHAT_TABLE_GSI2_NAME,
          KeyConditionExpression: 'chatId = :pk_value',
          ExpressionAttributeValues: {
            ':pk_value': chatId,
          },
        };

        const getDetails = await ddbDocClient.send(
          new QueryCommand(getChatDetailsParams)
        );

        if(getDetails.Items.length){
            result.oldSortKey = getDetails.Items[0].sk
        }


      } else {
        //TODO
        //Generar chatId y ULID
      }
    } catch (error) {}
  }

  console.log('Se recibio el destinatario ', addressee);

  return {
    statusCode: 200,
    body: JSON.stringify({
      users: [],
    }),
  };
}
