import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  ApiGatewayManagementApiClient,
  DeleteConnectionCommand,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { ulid } from 'ulid';

export async function storeMessage(
  username: string,
  data: any,
  ddbDocClient: DynamoDBClient
) {
  try {
    //SI EN DATA NO VIENE UN VALOR DE OLD SORT KEY SIGNIFICA QUE EL CHAT ES NUEVO
    if (!data.oldSortKey) {
      //CREACION DE CHAT PARA REMITENTE
      const createSenderCommand = new PutCommand({
        TableName: process.env.CHAT_TABLE_NAME,
        Item: {
          pk: `${username}#chat`,
          sk: data.newSortKey,
          idChat: data.id,
        },
      });

      await ddbDocClient.send(createSenderCommand);

      //CREACION DE CHAT PARA DESTINATARIO
      const createAddresseeCommand = new PutCommand({
        TableName: process.env.CHAT_TABLE_NAME,
        Item: {
          pk: `${data.to}#chat`,
          sk: data.newSortKey,
          idChat: data.id,
        },
      });

      await ddbDocClient.send(createAddresseeCommand);

      //REGISTRO DE CHAT PARA EL PAR REMITENTE-DESTINATARIO
      const senderAddresseeCommand = new PutCommand({
        TableName: process.env.CHAT_TABLE_NAME,
        Item: {
          pk: `${username}#${data.to}`,
          sk: 'chat',
          id: data.id, //NO SE GUARDA EN EL ATRIBUTO idChat DEBIDO A QUE ES USADO COMO INDEX PARA EXTRAER EL SORTKEY
        },
      });

      await ddbDocClient.send(senderAddresseeCommand);

      //REGISTRO DE CHAT PARA EL PAR DESTINATARIO-REMITENTE
      const addresseeSenderCommand = new PutCommand({
        TableName: process.env.CHAT_TABLE_NAME,
        Item: {
          pk: `${data.to}#${username}`,
          sk: 'chat',
          id: data.id, //NO SE GUARDA EN EL ATRIBUTO idChat DEBIDO A QUE ES USADO COMO INDEX PARA EXTRAER EL SORTKEY
        },
      });

      await ddbDocClient.send(addresseeSenderCommand);
    } else {

      console.log('se va a actualizar el ULID')

      console.log('username:', username)
      console.log(data)

      //BORRA EL CHAT PARA EL REMITENTE
      const deleteChatCommand = new DeleteCommand({
        TableName: process.env.CHAT_TABLE_NAME,
        Key: {
          pk: `${username}#chat`,
          sk: data.oldSortKey,
        },
        ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
        ReturnValues: 'NONE',
      });

      await ddbDocClient.send(deleteChatCommand);

      //CREA EL CHAT PARA REMITENTE CON EL NUEVO SORTKEY
      const createSenderCommand = new PutCommand({
        TableName: process.env.CHAT_TABLE_NAME,
        Item: {
          pk: `${username}#chat`,
          sk: data.newSortKey,
          idChat: data.id,
        },
      });

      await ddbDocClient.send(createSenderCommand);

      //ACTUALIZACION DEL SORTKEY DE CHAT PARA DESTINATARIO
      //BORRA EL CHAT PARA EL DESTINATARIOS
      const deleteAddresseeChatCommand = new DeleteCommand({
        TableName: process.env.CHAT_TABLE_NAME,
        Key: {
          pk: `${data.to}#chat`,
          sk: data.oldSortKey,
        },
        ConditionExpression: 'attribute_exists(pk) AND attribute_exists(sk)',
        ReturnValues: 'NONE',
      });

      await ddbDocClient.send(deleteAddresseeChatCommand);

      //CREA EL CHAT PARA EL DESTINATARIO CON EL NUEVO SORTKEY
      const createAddresseeCommand = new PutCommand({
        TableName: process.env.CHAT_TABLE_NAME,
        Item: {
          pk: `${data.to}#chat`,
          sk: data.newSortKey,
          idChat: data.id,
        },
      });

      await ddbDocClient.send(createAddresseeCommand);
    }

    //REGISTRO DEL MENSAJE

    const messageId = ulid();
    const currentTimestamp = Math.floor(Date.now() / 1000);

    const createMessageCommand = new PutCommand({
      TableName: process.env.CHAT_TABLE_NAME,
      Item: {
        pk: `message#${data.id}`,
        sk: messageId,
        sender: username,
        addressee: data.to,
        content: data.message,
        timeStamp: currentTimestamp,
      },
    });

    await ddbDocClient.send(createMessageCommand);
  } catch (error) {
    console.log('Ha ocurrido un error: ', JSON.stringify(error, null, 2));
  }
}
