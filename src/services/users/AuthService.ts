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
}
