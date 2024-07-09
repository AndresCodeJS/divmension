import { DynamoDBClient, GetItemCommand, ScanCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { parseJSON } from "../shared/utils";



export async function updatePlaces(event: APIGatewayProxyEvent, ddbClient: DynamoDBClient): Promise<APIGatewayProxyResult> {


    //Actualizar un registro
    if (event.queryStringParameters && ("id" in event.queryStringParameters) && event.body) {

        const parsedBody = parseJSON(event.body)

        const spaceId = event.queryStringParameters["id"]
        const requestBodyKey = Object.keys(parsedBody)[0]
        const requestBodyValue = parsedBody[requestBodyKey]

        const updateResult = await ddbClient.send(new UpdateItemCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
                "id": { S: spaceId }
            },
            UpdateExpression: 'set #zzzNew = :new',
            ExpressionAttributeValues: {
                ':new': {
                    S: requestBodyValue
                }
            },
            ExpressionAttributeNames: {
                '#zzzNew': requestBodyKey
            },
            ReturnValues: 'UPDATED_NEW'
        }))

        console.log(updateResult.Attributes)

        return {
            statusCode: 200,
            body: JSON.stringify(updateResult.Attributes)
        }

    } else {
        return {
            statusCode: 400,
            body: JSON.stringify("Parametros inconrrectos")
        }
    }


}