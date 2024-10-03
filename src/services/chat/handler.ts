import { APIGatewayProxyHandler, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
/* import { ApiGatewayManagementApi } from 'aws-sdk'; */


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


  async function handler(
    event: WebSocketEvent
  ): Promise<APIGatewayProxyResult> {

    console.log('Evento recibido:', JSON.stringify(event, null, 2));

    const { routeKey, connectionId, domainName, stage } = event.requestContext;

    console.log('domainName', domainName);

    console.log('stage', stage);

    const callbackUrl = `https://${domainName}/${stage}`;

    
  // Manejar eventos de conexión y desconexión
  if (routeKey === '$connect') {
    console.log('Nueva conexión establecida');
    return { statusCode: 200, body: 'Conectado' };
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
        console.log('mensaje', data.message)
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