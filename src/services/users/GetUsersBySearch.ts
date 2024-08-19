import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { AuthService } from "./AuthService";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const auth = new AuthService();

export async function getUsersBySearch(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {



  return {
    statusCode: 200,
    body: JSON.stringify({})
  };
}