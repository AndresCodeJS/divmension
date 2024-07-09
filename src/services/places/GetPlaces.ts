import { DynamoDBClient, GetItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";



export async function getPlaces(event: APIGatewayProxyEvent, ddbClient: DynamoDBClient): Promise<APIGatewayProxyResult> {


    //Obtener registro por ID
    if (event.queryStringParameters) {

        if ('id' in event.queryStringParameters) {

            const placeId = event.queryStringParameters["id"]

            const getItemResponse = await ddbClient.send(new GetItemCommand({
                TableName: process.env.TABLE_NAME,
                Key: {
                    id: {
                        S: placeId
                    }
                }
            }))

            if (getItemResponse.Item) {

                //Quitamos el formato { s: item} de los datos obtenidos
                const unmarshalledItem = unmarshall(getItemResponse.Item)

                return {
                    statusCode: 200,
                    body: JSON.stringify(unmarshalledItem)
                }
            } else {
                return {
                    statusCode: 400,
                    body: JSON.stringify(`El id ${placeId} no existe`)
                }
            }


        } else {
            return {
                statusCode: 400,
                body: JSON.stringify("El id del item es requerido")
            }
        }

    }

    //Obtener todos los registros
    const result = await ddbClient.send(new ScanCommand({
        TableName: process.env.TABLE_NAME,
    }))

    //Quitamos el formato { s: item} de los datos obtenidos
    const unmarshalledItems = result.Items?.map(item => unmarshall(item))

    const response: APIGatewayProxyResult = {
        statusCode: 200,
        body: JSON.stringify(unmarshalledItems)
    }

    return response

}