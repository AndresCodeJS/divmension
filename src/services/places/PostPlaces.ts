import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { Result } from "aws-cdk-lib/aws-stepfunctions";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { v4 } from "uuid";
import { validateAsPlaceEntry } from "../shared/Validator";
import { parseJSON } from "../shared/utils";


export async function postPlaces(event: APIGatewayProxyEvent, ddbClient: DynamoDBClient): Promise<APIGatewayProxyResult> {



    if (event.body) {

        const randomId = v4();
        const item = parseJSON(event.body)
        item.id = randomId

        //Valida si la entrada tiene la estructura requerida
        validateAsPlaceEntry(item)

        //Guardar registros
        const result = await ddbClient.send(new PutItemCommand({
            TableName: process.env.TABLE_NAME,
            Item: marshall(item) // se usa para evitar la forma de abajo
            /*   Item: {
                  id: {
                      S: randomId
                  },
                  location: {
                      S: item.location
                  }
              } */

        }))

        console.log(result)

        const response: APIGatewayProxyResult = {
            statusCode: 201,
            body: JSON.stringify({ id: randomId })
        }

        return response

    }else{
        return{
            statusCode: 400,
            body: JSON.stringify('Error en los parámetros enviados')
        }
    }

}