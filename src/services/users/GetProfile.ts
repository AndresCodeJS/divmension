import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { AuthService } from "./AuthService";

const auth = new AuthService();

interface IPost {
  username: string,
  postId: string,
  description: string,
  timeStamp: number
  likesQuantity: number,
  commentsQuantity: number ,
}

interface IUser {
      username: string,
      fullname: string,
      photoUrl: string,
      followers: number,
      following: number,
      postCounter: number,
      posts: IPost[],
      lastPostKey: any
}

export async function getProfile(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const usernameParam = event.pathParameters?.username;
  let isFollowing = false;

  const getUserCommand = new GetCommand({
    TableName: process.env.TABLE_NAME,
    Key: {
      pk: usernameParam.toLowerCase(),
      sk: "profile",
    },
  });

  const getUserProfile = await ddbDocClient.send(getUserCommand);

  if (getUserProfile.Item) {
    //Extrae el usuario logueado para verificar si sigue al usuario actual
    let response = await auth.verifyToken(event);

    let loggedUser = JSON.parse(response.body).username;

    // Verifica si sigue al usuario -----------------------------------
    if (response.statusCode == 200) {
      // entra si el token es valido
      const command = new GetCommand({
        TableName: process.env.TABLE_NAME,
        Key: {
          pk: `${loggedUser}#following`,
          sk: usernameParam.toLowerCase(),
        },
      });

      const getFollowing = await ddbDocClient.send(command);

      if (getFollowing.Item) {
        isFollowing = true;
      }
    }

    //Recupera el numero de seguidores, seguidos y posts .....................

    const getCounterCommand = new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        pk: usernameParam.toLowerCase(),
        sk: "count",
      },
    });

    const getCounter = await ddbDocClient.send(getCounterCommand);

    //Recupera todos los posts publicados por el usuario (TODO realizar paginación)

    const getPostsCommand = new QueryCommand({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk": `${usernameParam}#post`,
      },
      Limit: 9,
      ScanIndexForward: false, // para obtener de los registros mas nuevos a los mas viejos
      /* ExclusiveStartKey : */ 
    });

    const getPosts = await ddbDocClient.send(getPostsCommand);

    //Obtiene la cantidad de likes y comentarios por post

    let posts: IPost[] = [];

    if (getPosts.Items.length) {
      let postQueries = getPosts.Items.map((post) => {
        let getPostInfo = async () => {
          //Obtiene cantidad de likes
          const getLikeQuantityCommand = new GetCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
              pk: `${post.sk}#likecount`,
              sk: "count",
            },
          });

          const likesQuantity = await ddbDocClient.send(getLikeQuantityCommand);

          //Obtiene cantidad de comentarios
          const getCommentQuantityCommand = new GetCommand({
            TableName: process.env.TABLE_NAME,
            Key: {
              pk: `${post.sk}#commentcount`,
              sk: "count",
            },
          });

          const commentsQuantity = await ddbDocClient.send(
            getCommentQuantityCommand
          );

          return {
            username: post.pk.split("#")[0],
            postId: post.sk,
            description: post.description,
            timeStamp: post.timeStamp,
            imageUrl: post.imageUrl,
            likesQuantity: likesQuantity.Item.quantity,
            commentsQuantity: commentsQuantity.Item.quantity ,
          };
        };

        return getPostInfo();
      });

      posts = await Promise.all(postQueries);

    }

    const { followers, following, posts: postCounter } = getCounter.Item;

    const { pk: username, fullname, photoUrl } = getUserProfile.Item;

    let user: IUser = {
      username,
      fullname: fullname.replace(/\b\w/g, (char) => char.toUpperCase()), //Transforma a mayusculas las primeras letras del nombre
      photoUrl,
      followers,
      following,
      postCounter,
      posts,
      lastPostKey: getPosts.LastEvaluatedKey || ''
    };

    return {
      statusCode: 200,
      body: JSON.stringify({ user, isFollowing }),
    };
  } else {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "user not found" }),
    };
  }
}
