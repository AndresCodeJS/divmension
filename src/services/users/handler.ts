import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { JsonError, MissingFieldError } from "../shared/Validator";
import { addCorsHeader } from "../shared/utils";
import { createUser } from "./createUser";
/* import { postEmailCode } from "./PostEmailCode"; */
import { postUserLogin } from "./PostUserLogin";
import { getUserRefresh } from "./getUserRefresh";
import { getUsersBySearch } from "./GetUsersBySearch";

const client = new DynamoDBClient({});

const docClient = DynamoDBDocumentClient.from(client);

async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  let response: APIGatewayProxyResult;

  try {
    switch (event.httpMethod) {
      case "GET":
        if (event.path == "/users/refresh-page") {
          //Obtiene usuario al refrescar la página
          const getUserRefreshPage = await getUserRefresh(event);
          response = getUserRefreshPage;
        }
       
        if (event.path.startsWith("/users/search/")) {
          //Obtiene las coincidencias de usuarios escritos en la barra de busqueda
          const getUserRefreshPage = await getUsersBySearch(event, docClient);
          response = getUserRefreshPage;
        }
        break;

      case "POST":
        if (event.path == "/users/create") {
          //Registro de Usuario
          const postResponse = await createUser(event, docClient);
          response = postResponse;
        }
        /* if (event.path == "/users/emailcode") { */
        /*        const postEmailCodeResponse = await postEmailCode(event);
          response = postEmailCodeResponse; */
        /* } */
        if (event.path == "/users/login") {
          //Login de Usuario
          const postUserLoginResponse = await postUserLogin(event, docClient);
          response = postUserLoginResponse;
        }

        break;
      case "PUT":
        /*  const updateResponse = await updatePlaces(event, ddbClient)
                 response = updateResponse */
        break;
      case "DELETE":
        /* const deleteResponse = await deletePlaces(event, ddbClient)
                response = deleteResponse */
        break;

      default:
        break;
    }
  } catch (error) {
    /* console.log(error) */
    if (error instanceof MissingFieldError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: error.message }),
      };
    }
    if (error instanceof JsonError) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: error.message }),
      };
    }
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }

  addCorsHeader(response);
  return response;
}

export { handler };
