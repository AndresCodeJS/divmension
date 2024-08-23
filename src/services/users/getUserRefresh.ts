import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { AuthService } from "./AuthService";

const auth = new AuthService();

export async function getUserRefresh(
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> {

  let response = await auth.verifyToken(event);

  return response;
}
