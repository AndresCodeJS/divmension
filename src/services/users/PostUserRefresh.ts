import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { AuthService } from "./AuthService";

const Auth = new AuthService();

export async function postUserRefresh(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {

    const response: APIGatewayProxyResult = await Auth.postUserRefresh()

    return response

}