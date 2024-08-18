import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { AuthService } from "./AuthService";

const auth = new AuthService();

export async function getUserRefresh(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {

    let token = ''

    if(event.headers){
        token = event?.headers["authorization"];
    }
  
  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "Missing Token" }),
    };
  }

  let response = await auth.verifyToken(token);

  return response;
}
