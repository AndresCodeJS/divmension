import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { AuthService } from "./AuthService";

const Auth = new AuthService();

export async function postUserLogin(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {

    const { username, password} = JSON.parse(event.body)

    const response: APIGatewayProxyResult = await Auth.userLogin(username, password)

    return response

}