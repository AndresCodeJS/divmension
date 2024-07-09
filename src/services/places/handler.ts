
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from "aws-lambda"
import { postPlaces } from "./PostPlaces";
import { getPlaces } from "./GetPlaces";
import { updatePlaces } from "./updatePlaces";
import { deletePlaces } from "./deletePlaces";
import { JsonError, MissingFieldError } from "../shared/Validator";
import { addCorsHeader } from "../shared/utils";


const ddbClient = new DynamoDBClient({})


async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    let response: APIGatewayProxyResult

    try {
        switch (event.httpMethod) {

            case "GET":
                const getResponse = await getPlaces(event, ddbClient)
                response = getResponse
                break;

            case "POST":
                const postResponse = await postPlaces(event, ddbClient)
                response = postResponse
                break;
            case "PUT":
                const updateResponse = await updatePlaces(event, ddbClient)
                response = updateResponse
                break;
            case "DELETE":
                const deleteResponse = await deletePlaces(event, ddbClient)
                response = deleteResponse
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
