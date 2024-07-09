import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { AuthService } from "./AuthService";

const Auth = new AuthService();

export async function postUser(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {

    const { username, name, email, password } = JSON.parse(event.body)

    const response: APIGatewayProxyResult = await Auth.createUser(username, name, password, email)

    return response

}