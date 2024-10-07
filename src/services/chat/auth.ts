import jwt from 'jsonwebtoken';

export class AuthChatService {
  public async verifyToken(token: String | null) {
    //SI NO SE ENVIO TOKEN
    if (!token) return null;

    try {
      let decodedToken = await jwt.verify(token, process.env.JWT_SECRET);

      //SI EL TOKEN ES INVALIDO
      if (!decodedToken) return null;

      let username = decodedToken.username;

      return username;
    } catch (error) {
      return null;
    }
  }
}
