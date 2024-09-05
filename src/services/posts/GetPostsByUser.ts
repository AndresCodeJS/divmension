import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
/* import { AuthService } from "./AuthService";

const auth = new AuthService(); */

interface IPost {
  username: string;
  postId: string;
  description: string;
  timeStamp: number;
  likesQuantity: number;
  commentsQuantity: number;
}

export async function getPostsByUser(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
    
  const usernameParam = event.pathParameters?.username;
  const lastPostIdParam = event.pathParameters?.lastPostId;

  //Recupera todos los posts publicados por el usuario a partir del ultimo post consultado (Paginacion)

  const getPostsCommand = new QueryCommand({
    TableName: process.env.TABLE_NAME,
    KeyConditionExpression: "pk = :pk",
    ExpressionAttributeValues: {
      ":pk": `${usernameParam}#post`,
    },
    Limit: 9,
    ScanIndexForward: false, // para obtener de los registros mas nuevos a los mas viejos
    ExclusiveStartKey: {
      pk: `${usernameParam}#post`,
      sk: lastPostIdParam,
    },
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
          commentsQuantity: commentsQuantity.Item.quantity,
        };
      };

      return getPostInfo();
    });

    posts = await Promise.all(postQueries);
  }

  let lastEvaluatedKey = getPosts.LastEvaluatedKey;

  return {
    statusCode: 200,
    body: JSON.stringify({ posts, lastEvaluatedKey }),
  };
}
