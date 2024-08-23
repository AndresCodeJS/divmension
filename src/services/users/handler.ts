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
import { postUserLogin } from "./PostUserLogin";
import { getUserRefresh } from "./getUserRefresh";
import { getUsersBySearch } from "./GetUsersBySearch";
import { getProfile } from "./GetProfile";
import { followUser } from "./FollowUser";


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
          //Obtiene usuario logueado al refrescar la página
          const getUserRefreshPage = await getUserRefresh(event);
          response = getUserRefreshPage;
        }
       
        if (event.path.startsWith("/users/search/")) {
          //Obtiene las coincidencias de usuarios escritos en la barra de busqueda
          const getUserRefreshPage = await getUsersBySearch(event, docClient);
          response = getUserRefreshPage;
        }
        if (event.path.startsWith("/users/profile/")) {
          //Obtiene los datos del usuario usando el username
          const getUserProfile = await getProfile(event,docClient)
          response = getUserProfile;
        }
        break;

      case "POST":
        if (event.path == "/users/create") {
          //Registro de Usuario
          const postResponse = await createUser(event, docClient);
          response = postResponse;
        }
        if (event.path == "/users/login") {
          //Login de Usuario
          const postUserLoginResponse = await postUserLogin(event, docClient);
          response = postUserLoginResponse;
        }
        if (event.path == "/users/follow") {
          //Login de Usuario
          const followUserResponse = await followUser(event, docClient);
          response = followUserResponse;
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
