import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { JsonError, MissingFieldError } from "../shared/Validator";
import { addCorsHeader } from "../shared/utils";
import { createUser } from "./CreateUser";
import { postUserLogin } from "./PostUserLogin";
import { getUserRefresh } from "./getUserRefresh";
import { getUsersBySearch } from "./GetUsersBySearch";
import { getProfile } from "./GetProfile";
import { followUser } from "./FollowUser";
import { unfollowUser } from "./UnfollowUser";
import { getS3Credentials } from "./GetS3Credentials";
import { STSClient } from "@aws-sdk/client-sts";


const client = new DynamoDBClient({});

const docClient = DynamoDBDocumentClient.from(client);

export const sts = new STSClient({ region: process.env.REGION });

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
        if (event.path.startsWith("/users/s3-credentials")) {
          //Obtiene los datos del usuario usando el username
          const s3Credentials = await getS3Credentials(event,sts)
          response = s3Credentials;
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
          //Seguir a un usuario
          const followUserResponse = await followUser(event, docClient);
          response = followUserResponse;
        }
        if (event.path == "/users/unfollow") {
          //Dejar de seguir a un usuario
          const followUserResponse = await unfollowUser(event, docClient);
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
