import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { AuthService } from "./AuthService";
import { STSClient } from "@aws-sdk/client-sts";
import { AssumeRoleCommand } from "@aws-sdk/client-sts";

const auth = new AuthService();

export async function getS3Credentials(
  event: APIGatewayProxyEvent,
  sts: STSClient
): Promise<APIGatewayProxyResult> {
  let response = await auth.verifyToken(event);

  if (response.statusCode == 200) {

    let loggedUser = JSON.parse(response.body).username;

    const command = new AssumeRoleCommand({
      RoleArn: `arn:aws:iam::${process.env.ACCOUNT_ID}:role/${process.env.S3_ACCESS_ROLE_NAME}`,
      RoleSessionName: "UserSession",
      DurationSeconds: 3600, // 1 hora
    });

    try {
      const data = await sts.send(command);
      response = {
        statusCode: 200,
        body: JSON.stringify({
          AccessKeyId: data.Credentials.AccessKeyId,
          SecretAccessKey: data.Credentials.SecretAccessKey,
          SessionToken: data.Credentials.SessionToken,
          Expiration: data.Credentials.Expiration,
          user: loggedUser
        }),
      };
    } catch (error) {
      console.error("Error:", error);
      response = {
        statusCode: 500,
        body: JSON.stringify({ error: "Error generating credentials" }),
      };
    }
  }
  

  return response;
}
