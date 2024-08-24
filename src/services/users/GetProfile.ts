import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { AuthService } from "./AuthService";

const auth = new AuthService()

export async function getProfile(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const usernameParam = event.pathParameters?.username;
  let isFollowing = false

  const getUserCommand = new GetCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      pk: usernameParam.toLowerCase(),
      sk: "profile",
    },
  });

  const getUserProfile = await ddbDocClient.send(getUserCommand);

  if(getUserProfile.Item){

      //Extrae el usuario logueado para verificar si sigue al usuario actual
      let response = await auth.verifyToken(event)

      let loggedUser = JSON.parse(response.body).username;

      if(response.statusCode == 200){ // entra si el token es valido
        const command = new GetCommand({ //Verifica si sigue al usuario
          TableName: process.env.TABLE_NAME,
          Key: {
            pk: `${loggedUser}#following`,
            sk: usernameParam.toLowerCase(),
          },
        });
      
        const getFollowing = await ddbDocClient.send(command);

        if (getFollowing.Item){
          isFollowing = true
        }

      }

      const {pk:username, fullname , photoUrl} = getUserProfile.Item
    
      let user = {
        username,
        fullname: fullname.replace(/\b\w/g, char => char.toUpperCase()), //Transforma a mayusculas las primeras letras del nombre
        photoUrl
      }
    
    
      return {
        statusCode: 200,
        body: JSON.stringify({user, isFollowing}),
      };
  }else{
    return {
        statusCode: 401,
        body: JSON.stringify({message:'user not found'}),
      };
  }
}
