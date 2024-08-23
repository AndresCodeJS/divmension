import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

export async function getProfile(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const usernameParam = event.pathParameters?.username;

  const getUserCommand = new GetCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      pk: usernameParam.toLowerCase(),
      sk: "profile",
    },
  });

  const getUserProfile = await ddbDocClient.send(getUserCommand);

  if(getUserProfile.Item){

      const {pk:username, fullname , photoUrl} = getUserProfile.Item
    
      let user = {
        username,
        fullname: fullname.replace(/\b\w/g, char => char.toUpperCase()), //Transforma a mayusculas las primeras letras del nombre
        photoUrl
      }
    
    
      return {
        statusCode: 200,
        body: JSON.stringify({user}),
      };
  }else{
    return {
        statusCode: 401,
        body: JSON.stringify({message:'user not found'}),
      };
  }
}
