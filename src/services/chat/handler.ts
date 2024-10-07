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

const callbackUrl = `https://narritfovc.execute-api.us-east-1.amazonaws.com/prod/`;

const client = new ApiGatewayManagementApiClient({
  endpoint: callbackUrl,
});

const auth = new AuthChatService()

async function handler(event: WebSocketEvent): Promise<APIGatewayProxyResult> {
  console.log('Evento recibido:', JSON.stringify(event, null, 2));

  const { routeKey, connectionId, domainName, stage } = event.requestContext;

  /* const callbackUrl = `https://${domainName}/${stage}`; */

  // MANEJO DE EVENTO DE CONEXION
  if (routeKey === '$connect') {
    console.log('Nueva conexión establecida');

    let token;

    if (event.queryStringParameters) {
      token = event.queryStringParameters['token'];
      console.log('Token: ', token);
    }

    //TODO

    //VERIFICA EL TOKEN Y EXTRAE EL USERNAME
    let username = auth.verifyToken(token)

    //SI EL TOKEN NO ES VALIDO SE CIERRA LA CONEXION
    if(!username){
      return { statusCode: 400, body: JSON.stringify({message:'invalid token'}) };
    }

    //TODO --------------------------------------
    //Si el token es valido se guarda en la base de datos la conexion del usuario con un PutCommand

    
    try {
      console.log('el endpoint es : ', callbackUrl);
      console.log('conexion a cerrar es: ', connectionId);

      /* const client = new ApiGatewayManagementApiClient({
        endpoint: callbackUrl
       }); */
      /*   const input = {
        ConnectionId: connectionId,
      }; */

      const postDataTemplate = {
        Data: JSON.stringify({
          content: 'HOLA',
        }),
      };

      const postData = {
        ...postDataTemplate,
        ConnectionId: connectionId, // ppaste desired connectionId
      };
      await client.send(new PostToConnectionCommand(postData));

      /*  const command = new DeleteConnectionCommand(input);
      const response = await client.send(command); */
    } catch (error) {
      console.log('No se pudo cerrar la conexion');
      console.log('El error es', JSON.stringify(error, null, 2));
      console.log('El error es', JSON.stringify(error.message));
      return { statusCode: 200, body: 'No se pudo cerrar la conexion' };
    }

    return { statusCode: 200, body: 'Conectado y Desconectado' };
  } else if (routeKey === '$disconnect') {
    console.log('Conexión cerrada');
    return { statusCode: 200, body: 'Desconectado' };
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
