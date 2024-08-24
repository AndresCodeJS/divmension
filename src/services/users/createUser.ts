import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import bcrypt from "bcryptjs";
import { AuthService } from "./AuthService";

const SECRET_KEY = process.env.SECRET_KEY;

const auth = new AuthService();

export async function createUser(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const { username, email, fullname, password } = JSON.parse(event.body);

  //Verifica si existe el usuario ------------------------------------------------
  const getUserCommand = new GetCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      pk: username.toLowerCase(),
      sk: "profile",
    },
  });

  const getUser = await ddbDocClient.send(getUserCommand);

  if (getUser.Item) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        type: "USER_EXISTS",
        message: "User already exists",
      }),
    };
  }

  //Verifica si existe el email --------------------------------------------------
  const getEmailParams = {
    TableName: process.env.TABLE_NAME,
    IndexName: process.env.TABLE_GSI1_NAME, // Replace with your GSI name
    KeyConditionExpression: "email = :pk_value",
    ExpressionAttributeValues: {
      ":pk_value": email.toLowerCase(), // Replace with the value you're querying
    },
    // Optionally, specify other query parameters like ProjectionExpression, FilterExpression, etc.
  };

  const getEmail = await ddbDocClient.send(new QueryCommand(getEmailParams));

  if (getEmail.Items.length) {
    return {
      statusCode: 401,
      body: JSON.stringify({
        type: "EMAIL_EXISTS",
        message: "Email already exists",
      }),
    };
  }

  // Combina la contraseña con la clave secreta
  const passwordWithSecret = password + SECRET_KEY;

  // Hash de la contraseña
  const hashedPassword = await bcrypt.hash(passwordWithSecret, 10);

  // Elimina espacios al inicio y al final, y cuando existen 2 o mas espacios intermedios
  let fullnameClean = fullname.trim().replace(/\s+/g, " ").toLowerCase();

  //Registra el ususario

  const command = new PutCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: username.toLowerCase(),
      sk: "profile",
      email: email.toLowerCase(),
      fullname: fullnameClean,
      password: hashedPassword,
    },
  });

  const response = await ddbDocClient.send(command);

  //Registra el elemento Count , para cuantificar cantidad de seguidores, seguidos y posts

  const countCommand = new PutCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: username.toLowerCase(),
      sk: "count",
      posts: 0,
      following: 0,
      followers: 0,
    },
  });

  await ddbDocClient.send(countCommand);


  //Guarda una combinacion de username con fullname para ser usada en la barra de búsqueda de usuarios

  let fullnameFixed = fullnameClean.trim().replace(/\s+/g, "."); //reemplaza espacios por puntos

  let usernameClean = username.toLowerCase(); // lleva minusculas el nombre de usuario

  //Para futuras busquedas por username -----------------------------------------------

  let usernameFullnameMix = usernameClean + "/" + fullnameFixed;

  const commandUsernameFullname = new PutCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: "search",
      sk: usernameFullnameMix,
    },
  });

  await ddbDocClient.send(commandUsernameFullname);

  //Para futuras busquedas por fullname --------------------------------------------------

  let fullnameUsernameMix = fullnameFixed + "#" + usernameClean; // para busquedas por fullname

  const commandFullnameUsername = new PutCommand({
    TableName: process.env.TABLE_NAME,
    Item: {
      pk: "search",
      sk: fullnameUsernameMix,
    },
  });

  await ddbDocClient.send(commandFullnameUsername);

  // Generación de token JWT ...............................................................

  let user = { username: usernameClean, fullname: fullnameClean, email };

  let jwt = await auth.signToken(user);

  return {
    statusCode: 200,
    body: JSON.stringify({ user, jwt }),
  };
}
