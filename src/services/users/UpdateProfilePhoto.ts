import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import { AuthService } from "./AuthService";

const SECRET_KEY = process.env.SECRET_KEY;

const auth = new AuthService();

export async function updateProfilePhoto(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const { photoUrl } = JSON.parse(event.body);

  if (!photoUrl) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        message: "Photo Url required",
      }),
    };
  }

  let response = await auth.verifyToken(event); // Autenticacion de usuario

  if (response.statusCode == 200) {
    let loggedUser = JSON.parse(response.body).username;

    //Actualiza la url de foto de perfil
    const commandUpdateFollowingCounter = new UpdateCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        pk: loggedUser,
        sk: "profile",
      },
      UpdateExpression: "SET #attrName = :url",
      ExpressionAttributeNames: {
        "#attrName": "photoUrl",
      },
      ExpressionAttributeValues: {
        ":url": photoUrl,
      },
    });

    await ddbDocClient.send(commandUpdateFollowingCounter);

    response = {
      statusCode: 200,
      body: JSON.stringify({ message: "photo updated" }),
    };
  } else {
    return response;
  }

  return response;
}
