import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { AuthService } from "./AuthService";

const Auth = new AuthService();

export async function postEmailCode(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {

    const { username, emailCode} = JSON.parse(event.body)

    const response: APIGatewayProxyResult = await Auth.confirmUser(username, emailCode)

    return response

}