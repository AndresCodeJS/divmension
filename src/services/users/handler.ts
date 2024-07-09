
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { JsonError, MissingFieldError } from "../shared/Validator";
import { addCorsHeader } from "../shared/utils";
import { postUser } from "./PostUser";
import { postEmailCode } from "./PostEmailCode";
import { postUserLogin } from "./PostUserLogin";
import { postUserRefresh } from "./PostUserRefresh";


/* const ddbClient = new DynamoDBClient({}) */


async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    let response: APIGatewayProxyResult

    try {
        switch (event.httpMethod) {

            case "GET":
                /*                 const getResponse = await getPlaces(event, ddbClient)
                                response = getResponse */
                break;

            case "POST":
                if (event.path == '/users/create') {
                    const postResponse = await postUser(event)
                    response = postResponse
                }
                if (event.path == '/users/emailcode') {
                    const postEmailCodeResponse = await postEmailCode(event)
                    response = postEmailCodeResponse
                }
                if (event.path == '/users/login') {
                    const postUserLoginResponse = await postUserLogin(event)
                    response = postUserLoginResponse
                }
                if (event.path == '/users/refresh') {
                    const postUserLoginResponse = await postUserRefresh(event)
                    response = postUserLoginResponse
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
                body: JSON.stringify({ message: error.message })
            }
        }
        if (error instanceof JsonError) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: error.message })
            }
        }
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message })
        }
    }

    addCorsHeader(response);
    return response
}


export { handler }
