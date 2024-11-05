import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
/* import { AuthService } from "./AuthService"; */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { IChat, IUser } from '../model/model';
import { AuthService } from '../users/AuthService';

const auth = new AuthService();

export async function getAllChats(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  let response = await auth.verifyToken(event); // Autenticacion de usuario

  if (response.statusCode != 200) {
    return response;
  } else {
    try {
      let loggedUser = JSON.parse(response.body).username;

      //OBTIENE LOS PRIMEROS 10 CHATS DE UN USUARIO

      const getChatsCommand = new QueryCommand({
        TableName: process.env.CHAT_TABLE_NAME,
        KeyConditionExpression: 'pk = :pk',
        ExpressionAttributeValues: {
          ':pk': `${loggedUser}#chat`,
        },
        Limit: 9,
        ScanIndexForward: false, // para obtener de los registros mas nuevos a los mas viejos
        /*  ExclusiveStartKey: {
              pk: `${pkParam}#post`,
              sk: skParam,
            }, */
      });

      const getChats = await ddbDocClient.send(getChatsCommand);

      let chats: IChat[] = [];

      if (getChats.Items.length) {
        let chatQueries = getChats.Items.map((chat) => {
          let getChatsInfo = async () => {
            //OBTIENE LOS PRIMEROS 15 MENSAJES DEL CHAT
            const getMessagesCommand = new QueryCommand({
              TableName: process.env.CHAT_TABLE_NAME,
              KeyConditionExpression: 'pk = :pk',
              ExpressionAttributeValues: {
                ':pk': `message#${chat.idChat}`,
              },
              Limit: 15,
              ScanIndexForward: false, // para obtener de los registros mas nuevos a los mas viejos
              /*  ExclusiveStartKey: {
                          pk: `${pkParam}#post`,
                          sk: skParam,
                        }, */
            });

            const getMessages = await ddbDocClient.send(getMessagesCommand);

            if (getMessages.Items.length) {
              //BUSCAR LA URL DE LA FOTO DE PERFIL DEL OTRO USUARIO

              let username = '';

              //SI EL DESTINATARIO DEL MENSAJE ES IGUAL AL USUARIO LOGUEADO SE ASIGNA EL
              //USERNAME DEL REMITENTE SINO SE ASIGNA EL USERNAME DEL DESTINATARIO
              if (getMessages.Items[0].addressee == loggedUser) {
                username = getMessages.Items[0].sender;
              } else {
                username = getMessages.Items[0].addressee;
              }

              //SE OBTIENE LA URL DE LA FOTO DE PERFIL
              const getPhotoCommand = new GetCommand({
                TableName: process.env.TABLE_NAME,
                Key: {
                  pk: username,
                  sk: 'photo',
                },
              });

              const getPhoto = await ddbDocClient.send(getPhotoCommand);

              let photoUrl = '';

              if (getPhoto.Item) {
                photoUrl = getPhoto.Item.url;
              }

              //CONSTRUIR LA ESTRUCTURA DE DATOS QUE SE DEVOLVERA

              let chatObj: IChat = {
                newSortKey: chat.sk,
                oldSortKey: '',
                chatId: chat.idChat,
                messages: getMessages.Items,
                to: username,
                photoUrl,
              };

              return chatObj;
            } else {
              return null;

              //TODO TESTEAR CON UN CHAT SIN MENSAJES
            }
          };

          return chatQueries();
        });

        chats = await Promise.all(chatQueries);
      }

      let chatList: IChat[] = [];

      //DEVUELVE SOLO LOS CHATS QUE CONTIENE MENSAJES
      chats.forEach((chat) => {
        if (chat.chatId) {
          chatList.push(chat);
        }
      });

      return {
        statusCode: 200,
        body: JSON.stringify({ chats: chatList }),
      };
    } catch (error) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error }),
      };
    }
  }
}
