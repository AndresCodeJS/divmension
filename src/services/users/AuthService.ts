import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import jwt from "jsonwebtoken";

interface IUser {
  username: string;
  fullname: string;
  email: string;
}

export class AuthService {
  public async signToken(user: IUser): Promise<string> {
    const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "12h" });
    return token;
  }

  public async verifyToken(
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> {
    let token = "";

    if (event.headers) {
      token = event?.headers["Authorization"];
    }

    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Missing Token" }),
      };
    }

    try {
      let decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

      if (!decodedToken) {
        return {
          statusCode: 401,
          body: JSON.stringify("Invalid token"),
        };
      } else {
        let user = {
          username: decodedToken.username,
          fullname: decodedToken.fullname,
          email: decodedToken.email,
        };

        return {
          statusCode: 200,
          body: JSON.stringify(user),
        };
      }
    } catch (error) {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: error.message }),
      };
    }
  }
}
