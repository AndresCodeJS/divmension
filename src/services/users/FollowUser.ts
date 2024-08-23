import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import { AuthService } from "./AuthService";

const auth = new AuthService();

export async function followUser(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const { followingUser } = JSON.parse(event.body);

  console.log( " following:" + followingUser);

  let response = await auth.verifyToken(event);

  if (response.statusCode == 200) {
    console.log("Token valido");

    let loggedUser = JSON.parse(response.body).username

    return {
      statusCode: 200,
      body: JSON.stringify({user:loggedUser, following: followingUser }),
    };
  } else {
    return response;
  }

  //TODO

  //Verificar si el jwt token es valido

  // 1 Guardar pk = loggedUser + '#' + 'following'  ,  sk = followingUser
  // si devuelve ConditionalCheckFailedException es porque ya existe , por lo tanto se corta el flujo

  // 2 Guardar pk = followingUser + '#' + 'follower , sk = loggedUser

  // 3 Incrementa en 1 los following de loggedUser

  // 4 Incrementa en 1 los followers de followingUser

  //Registra el ususario

  /*   const command = new PutCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: username.toLowerCase(),
      sk: "profile",
      email: email.toLowerCase(),
      fullname: fullnameClean,
      password: hashedPassword,
    },
  }); */

  /*  const response = await ddbDocClient.send(command); */
}
