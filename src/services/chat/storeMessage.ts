import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  ApiGatewayManagementApiClient,
  DeleteConnectionCommand,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

export async function storeMessage(
  username: string,
  data: any,
  ddbDocClient: DynamoDBClient
) {
  try {
    //SI EN DATA NO VIENE UN VALOR DE OLD SORT KEY SIGNIFICA QUE EL CHAT ES NUEVO
    if(!data.oldSortKey){

        //CREACION DE CHAT PARA REMITENTE
        const createSenderCommand = new PutCommand({
            TableName: process.env.CHAT_TABLE_NAME,
            Item: {
              pk: `${username}#chat`,
              sk: data.newSortKey,
              idChat: data.id
            },
          });
        
          await ddbDocClient.send(createSenderCommand);

        //CREACION DE CHAT PARA DESTINATARIO
        const createAddresseeCommand = new PutCommand({
            TableName: process.env.CHAT_TABLE_NAME,
            Item: {
              pk: `${data.to}#chat`,
              sk: data.newSortKey,
              idChat: data.id
            },
          });
        
          await ddbDocClient.send(createAddresseeCommand);


        //REGISTRO DE CHAT PARA EL PAR REMITENTE-DESTINATARIO
        const senderAddresseeCommand = new PutCommand({
            TableName: process.env.CHAT_TABLE_NAME,
            Item: {
              pk: `${username}#${data.to}`,
              sk: 'chat',
              id: data.id //NO SE GUARDA EN EL ATRIBUTO idChat DEBIDO A QUE ES USADO COMO INDEX PARA EXTRAER EL SORTKEY
            },
          });
        
          await ddbDocClient.send(senderAddresseeCommand);



        //REGISTRO DE CHAT PARA EL PAR DESTINATARIO-REMITENTE
        const addresseeSenderCommand = new PutCommand({
            TableName: process.env.CHAT_TABLE_NAME,
            Item: {
              pk: `${data.to}#${username}`,
              sk: 'chat',
              id: data.id //NO SE GUARDA EN EL ATRIBUTO idChat DEBIDO A QUE ES USADO COMO INDEX PARA EXTRAER EL SORTKEY
            },
          });
        
          await ddbDocClient.send(addresseeSenderCommand);

    }else{
        //ACTUALIZACION DEL SORTKEY DE CHAT PARA REMITENTE


        //ACTUALIZACION DEL SORTKEY DE CHAT PARA DESTINATARIO

    }

    //REGISTRO DEL MENSAJE

    /* const commentId = ulid();
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

      await ddbDocClient.send(createCommentCommand); */



    /* timeToLiveAttribute: 'expirationTime', */

    // VERIFICA QUE EL DESTINATARIO ESTE CONECTADO Y RECUPERA SU ID DE CONEXION
    const getConnIdCommand = new GetCommand({
      TableName: process.env.CHAT_TABLE_NAME,
      Key: {
        pk: data.to,
        sk: 'info',
      },
    });

    const getConnId = await ddbDocClient.send(getConnIdCommand);

    if (getConnId.Item) {
      console.log('se obtiene status ', getConnId.Item.status);

      let connId = '';

      if (getConnId.Item.status == 'online') {
        connId = getConnId.Item.connId;

        //SE ENVIA EL MENSAJE
        const params = {
          ConnectionId: connId,
          Data: data.message,
        };

        const command = new PostToConnectionCommand(params);

        await client.send(command);
      }
    }
  } catch (error) {
    console.log('Ha ocurrido un error: ', JSON.stringify(error, null, 2));
  }
}
