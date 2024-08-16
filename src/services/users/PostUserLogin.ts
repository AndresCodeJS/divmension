import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";

const SECRET_KEY = process.env.SECRET_KEY;

export async function postUserLogin(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {

  const { username, password } = JSON.parse(event.body);

  //// Recupera el usuario de la base de datos ------------------------------------------------
  const getUserCommand = new GetCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      pk: username.toLowerCase(),
      sk: "profile",
    },
  });

  const getUser = await ddbDocClient.send(getUserCommand);

  if (!getUser.Item) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        type: "INVALID_USERNAME",
        message: "Invalid Usename",
      }),
    };
  }

  // Combina la contraseña ingresada con la clave secreta
  const passwordWithSecret = password + SECRET_KEY;

  // Verifica la contraseña
  const isPasswordValid = await bcrypt.compare(passwordWithSecret, getUser.Item.password);

  if (!isPasswordValid ) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        type: "INVALID_PASSWORD",
        message: "Invalid Password",
      }),
    };
  }

  //TODO Generar JWT TOKEN
  //Devolver todos los datos para almacenarlos en el storage
  //Almacenar el JWT en el storage

  return {
    statusCode: 200,
    body: JSON.stringify(getUser.Item),
  };

  /* const response: APIGatewayProxyResult = await Auth.userLogin(username, password) */

  /*  return response */
}
