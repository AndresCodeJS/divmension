import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  ApiGatewayManagementApiClient,
  DeleteConnectionCommand,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { GetCommand } from '@aws-sdk/lib-dynamodb';

export async function handleSendMessage(
  client: any,
  data: any,
  ddbDocClient: DynamoDBClient
) {
  try {
    console.log('se buscara la conn del usuario: ', data.to);

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
