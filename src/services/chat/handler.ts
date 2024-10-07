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

const callbackUrl = `https://narritfovc.execute-api.us-east-1.amazonaws.com/prod/`

const client = new ApiGatewayManagementApiClient({
   endpoint: callbackUrl
  });

async function handler(event: WebSocketEvent): Promise<APIGatewayProxyResult> {
  console.log('Evento recibido:', JSON.stringify(event, null, 2));

  const { routeKey, connectionId, domainName, stage } = event.requestContext;

  /*   console.log('domainName', domainName);

    console.log('stage', stage); */

  /* const callbackUrl = `https://${domainName}/${stage}`; */

  // Manejar eventos de conexión y desconexión
  if (routeKey === '$connect') {
    console.log('Nueva conexión establecida');

    let connId: any = 'fO5-yezYIAMCFLw='

  if(event.queryStringParameters){
    connId = event.queryStringParameters["connId"]
    console.log('Id de  conexion: ', connId )
  }

    //TODO

    //Verificar el token y extraer el username

    //Si el token es valido se guarda en la base de datos la conexion del usuario con un PutCommand

    //Si el token no es valido se cierra la conexion con el
    try {

      console.log('el endpoint es : ', callbackUrl)
      console.log('conexion a cerrar es: ', connectionId)
      
      /* const client = new ApiGatewayManagementApiClient({
        endpoint: callbackUrl
       }); */
    /*   const input = {
        ConnectionId: connectionId,
      }; */

      const postDataTemplate = {
        Data: JSON.stringify({
          content: "HOLA",
        }),
      };

      const postData = {
        ...postDataTemplate,
        ConnectionId: connectionId,// ppaste desired connectionId
      };
      await client.send(new PostToConnectionCommand(postData));

     /*  const command = new DeleteConnectionCommand(input);
      const response = await client.send(command); */
    } catch (error) {
      console.log('No se pudo cerrar la conexion')
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
