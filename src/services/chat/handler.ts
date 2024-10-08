import {
  APIGatewayProxyHandler,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
} from 'aws-lambda';
import {
  ApiGatewayManagementApiClient,
  DeleteConnectionCommand,
  PostToConnectionCommand,
} from '@aws-sdk/client-apigatewaymanagementapi';
import { AuthChatService } from './auth';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { saveStatus } from './saveStatus';
import { searchUser } from './searchUser';

interface WebSocketEvent extends Omit<APIGatewayProxyEvent, 'requestContext'> {
  requestContext: {
    connectionId: string;
    domainName: string;
    stage: string;
    routeKey: string;
  };
}

interface WebSocketMessage {
  action: string;
  data: any;
}

const dbClient = new DynamoDBClient({});

const docClient = DynamoDBDocumentClient.from(dbClient);

const callbackUrl = `https://narritfovc.execute-api.us-east-1.amazonaws.com/prod/`;
//MANEJO DE CONEXIONES DE LA API DESDE LAMBDA
const client = new ApiGatewayManagementApiClient({
  endpoint: callbackUrl,
});

const auth = new AuthChatService();

async function handler(event: WebSocketEvent): Promise<APIGatewayProxyResult> {
  console.log('Evento recibido:', JSON.stringify(event, null, 2));

  const { routeKey, connectionId, domainName, stage } = event.requestContext;

  // MANEJO DE EVENTO DE CONEXION
  if (routeKey === '$connect') {
    console.log('Nueva conexión establecida');

    let token;

    if (event.queryStringParameters) {
      token = event.queryStringParameters['token'];
      console.log('Token: ', token);
    }

    //VERIFICA EL TOKEN Y EXTRAE EL USERNAME
    let username = await auth.verifyToken(token);

    console.log('usernam es: ', username);

    //SI EL TOKEN NO ES VALIDO SE CIERRA LA CONEXION
    if (!username) {
      return { statusCode: 400, body: 'Invalid token' };
    }

    //TODO --------------------------------------
    //Si el token es valido se guarda en la base de datos la conexion del usuario con un PutCommand

    try {
      await saveStatus(docClient, username, 'online', connectionId);

      /* const client = new ApiGatewayManagementApiClient({
        endpoint: callbackUrl
       }); */
      /*   const input = {
        ConnectionId: connectionId,
      }; */

      /*   const postDataTemplate = {
        Data: JSON.stringify({
          content: 'HOLA',
        }),
      };

      const postData = {
        ...postDataTemplate,
        ConnectionId: connectionId, 
      };
      await client.send(new PostToConnectionCommand(postData)); */

      /*  const command = new DeleteConnectionCommand(input);
      const response = await client.send(command); */
    } catch (error) {
      console.log('Error: ', JSON.stringify(error, null, 2));
      return { statusCode: 400, body: "Can't save user status" };
    }

    return { statusCode: 200, body: 'Conectado y Desconectado' };

    //CUANDO UN USUARIO ES DESCONECTADO
  } else if (routeKey === '$disconnect') {
    console.log('Conexión cerrada');

    try {

          //SE BUSCA A QUIEN PERTENECE EL ID DE CONEXION
    let username = await searchUser(docClient, connectionId);

    console.log('el id de conexion es del usuario', username)

    //SE CAMBIA EL ESTADO DEL USUARIO A OFFLINE Y SE BORRA EL ID DE CONEXION
    if(username){
      await saveStatus(docClient, username, 'offline', 'none');
    }

    return { statusCode: 200, body: 'Desconectado' };

    } catch (error) {
      console.log('Error: ', JSON.stringify(error, null, 2));
      return { statusCode: 400, body: "Can't save user status" };
    }

  }

  // Para mensajes normales, extraer la acción y los datos
  let body: WebSocketMessage;
  try {
    body = JSON.parse(event.body || '{}') as WebSocketMessage;
  } catch (err) {
    return { statusCode: 400, body: 'Invalid JSON' };
  }

  const { action, data } = body;

  try {
    switch (action) {
      case 'SEND_MESSAGE':
        /* await handleSendMessage(apigwManagementApi, connectionId, data); */
        console.log('mensaje', data.message);
        break;
      case 'JOIN_ROOM':
        /* await handleJoinRoom(apigwManagementApi, connectionId, data); */
        break;
      case 'LEAVE_ROOM':
        /*  await handleLeaveRoom(apigwManagementApi, connectionId, data); */
        break;
      default:
        console.log(`Acción no reconocida: ${action}`);
      /*  await sendMessageToClient(apigwManagementApi, connectionId, { error: 'Acción no reconocida' }); */
    }
  } catch (error) {
    console.error('Error handling action:', error);
    return { statusCode: 500, body: 'Internal server error' };
  }

  return { statusCode: 200, body: 'Mensaje procesado' };
}

export { handler };
