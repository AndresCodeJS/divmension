import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { AuthService } from "./AuthService";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { IUser } from "../model/model";

const auth = new AuthService();

export async function getUsersBySearch(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  try {
    const userString = event.pathParameters?.userString;

    // Elimina espacios al inicio y al final, y cuando existen 2 o mas espacios intermedios
    let cleanString = userString.trim().replace(/\s+/g, " ").toLowerCase();

    let fixedString = cleanString.trim().replace(/\s+/g, "."); //reemplaza espacios por puntos

    //Si el string es un espacio en blanco no devuelve nada
    if (fixedString) {
      const params = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: "pk = :pk and begins_with(sk, :sk)",
        ExpressionAttributeValues: {
          ":pk": "search",
          ":sk": fixedString,
        },
      };

      const getUsers = await ddbDocClient.send(new QueryCommand(params));

      const uniqueUsernames = new Set<string>();

      if (getUsers.Items.length) {
        // Constructor de usuarios en base a los datos obtenidos del atributo SK de la tabla
        let users = getUsers.Items.map((item) => {
          let sk = item.sk;

          let user: IUser = {
            username: "",
            fullname: "",
            photoUrl: "",
          };

          if (sk.includes("#")) {
            // Si existe # -> fullname va primero

            let substrings = sk.split("#");
            user.fullname = substrings[0];
            user.username = substrings[1];
            user.photoUrl = item.photoUrl || "";
          } else if (sk.includes("/")) {
            //si existe / -> username va primero

            let substrings = sk.split("/");
            user.fullname = substrings[1];
            user.username = substrings[0];
            user.photoUrl = item.photoUrl || "";
          }

          //logica para evitar objetos duplicados con igual username (continua con un filter mas abajo)------
          if (uniqueUsernames.has(user.username)) {
            // Ya existe, así que no lo incluimos en el nuevo array
            return null;
          }

          // Añadir username al Set
          uniqueUsernames.add(user.username);

          // -------------------------------------------------------------------------------------------

          //Sustituye los puntos por espacios y convierte a mayuscula la primera letra de cada palabra
          let fixedFullname = user.fullname
            .replace(/\./g, " ")
            .replace(/\b\w/g, function (char) {
              return char.toUpperCase();
            });

          user.fullname = fixedFullname;

          return user;
        }).filter((user) => user !== null); // Filtrar los valores null

        return {
          statusCode: 200,
          body: JSON.stringify({
            users,
          }),
        };
      } else {
        return {
          statusCode: 200,
          body: JSON.stringify({
            users: [],
          }),
        };
      }
    } else {
      return {
        statusCode: 200,
        body: JSON.stringify({
          users: [],
        }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
}
