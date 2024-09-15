import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand, QueryCommandOutput } from "@aws-sdk/lib-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { IPost } from "../shared/models";
import { AuthService } from "../users/AuthService";

const auth = new AuthService();

/* export interface IComment {
  user: string;
  imageUrl: string;
  content: string;
  timeStamp: number;
} */

export async function getAllPosts(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const lastUsername = event.pathParameters?.lastUsername;
  const lastPostId = event.pathParameters?.lastPostId;

  if (!lastUsername || !lastPostId) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "missing parameters" }),
    };
  }

  try {
    let getAllPosts: QueryCommandOutput;

    //RECUPERA TODOS LOS POSTS

    if (lastUsername == "none" || lastPostId == "none") {
      // Significa que es primera vez que se consulta por los posts
      let params = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: {
          ":pk": "feed",
        },
        Limit: 9,
        ScanIndexForward: false, // para obtener de los registros mas nuevos a los mas viejos
      };

      const getAllPostsCommand = new QueryCommand(params);
      getAllPosts = await ddbDocClient.send(getAllPostsCommand);
    } else {
      // Ya se consultó anteriormente, y se realiza paginación
      let params = {
        TableName: process.env.TABLE_NAME,
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: {
          ":pk": "feed",
        },
        Limit: 9,
        ScanIndexForward: false, // para obtener de los registros mas nuevos a los mas viejos
        ExclusiveStartKey: {
          pk: "feed",
          sk: `${lastPostId}#${lastUsername}`,
        },
      };

      const getAllPostsCommand = new QueryCommand(params);
      getAllPosts = await ddbDocClient.send(getAllPostsCommand);
    }

    if (getAllPosts) {
      //Verifica si hay un user logueado
      let response = await auth.verifyToken(event);

      let loggedUser = "";

      if (response.statusCode == 200) {
        //Extrae el usuario para verificar si le ha dado me gusta a los posts obtenidos
        loggedUser = JSON.parse(response.body).username;
      }

      //EXTRAE LOS DATOS DE CADA POST

      let posts: IPost[] = [];

      if (getAllPosts.Items.length) {
        let postQueries = getAllPosts.Items.map((item) => {
          let getPostInfo = async () => {
            let data = item.sk.split("#");
            let postId = data[0];
            let username = data[1];

            //OBTIENE EL POST POR POST ID
            const getPostCommand = new GetCommand({
              TableName: process.env.TABLE_NAME,
              Key: {
                pk: `${username}#post`,
                sk: postId,
              },
            });

            const getPost = await ddbDocClient.send(getPostCommand);

            //Obtiene cantidad de likes
            const getLikeQuantityCommand = new GetCommand({
              TableName: process.env.TABLE_NAME,
              Key: {
                pk: `${postId}#likecount`,
                sk: "count",
              },
            });

            const likesQuantity = await ddbDocClient.send(
              getLikeQuantityCommand
            );

            //Obtiene cantidad de comentarios
            const getCommentQuantityCommand = new GetCommand({
              TableName: process.env.TABLE_NAME,
              Key: {
                pk: `${postId}#commentcount`,
                sk: "count",
              },
            });

            const commentsQuantity = await ddbDocClient.send(
              getCommentQuantityCommand
            );

            //VERIFICA SI EL POST TIENE ME GUSTA DEL USUARIO LOGUEADO

            let isLiked = false;

            if (loggedUser) {
              const likeCommand = new GetCommand({
                TableName: process.env.TABLE_NAME,
                Key: {
                  pk: `${postId}#likelist`,
                  sk: loggedUser,
                },
              });

              const getLike = await ddbDocClient.send(likeCommand);

              if (getLike.Item) {
                isLiked = true;
              }
            }

            return {
              username,
              postId,
              description: getPost.Item.description,
              timeStamp: getPost.Item.timeStamp,
              imageUrl: getPost.Item.imageUrl,
              likesQuantity: likesQuantity.Item.quantity,
              commentsQuantity: commentsQuantity.Item.quantity,
              isLiked,
            };
          };

          return getPostInfo();
        });

        posts = await Promise.all(postQueries);

        let lastEvaluatedKey = getAllPosts.LastEvaluatedKey;

        return {
          statusCode: 200,
          body: JSON.stringify({ posts, lastEvaluatedKey }),
        };
      } else {
        return {
          statusCode: 401,
          body: JSON.stringify({ message: "No posts found" }),
        };
      }
    } else {
      return {
        statusCode: 401,
        body: JSON.stringify({ message: "Unable to get posts" }),
      };
    }
  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify(err),
    };
  }
}
