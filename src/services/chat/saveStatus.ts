import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { PutCommand, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

export async function saveStatus(
  ddbDocClient: DynamoDBClient,
  username: string,
  status: string,
  connId: string
) {
  const saveConnectionCommand = new PutCommand({
    TableName: process.env.CHAT_TABLE_NAME,
    Item: {
      pk: username,
      sk: 'info',
      status,
      connId,
    },
  });

  await ddbDocClient.send(saveConnectionCommand);


}
