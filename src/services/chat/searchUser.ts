import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

export async function searchUser(ddbDocClient: DynamoDBClient, connId: string) {
  //BUSCA UN USUARIO POR EL ID DE CONEXION
  const getUserParams = {
    TableName: process.env.CHAT_TABLE_NAME,
    IndexName: process.env.TABLE_GSI1_NAME, 
    KeyConditionExpression: 'connId = :pk_value',
    ExpressionAttributeValues: {
      ':pk_value': connId, 
    },
  };

  const getUser = await ddbDocClient.send(new QueryCommand(getUserParams));

  if (getUser.Items) {
    //Se retorna el username
    return getUser.Items[0].pk;
  } else {
    return null;
  }
}
