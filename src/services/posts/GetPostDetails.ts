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
  imageUrl: string;
}

export async function getPostsByUser(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const username = event.pathParameters?.pkParam;
  const postId = event.pathParameters?.skParam;

  if (!username || !postId) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "missing parameters" }),
    };
  }

  try {
    //Recupera los detalles del post
    const getPostCommand = new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        pk: `${username}#post`,
        sk: postId,
      },
    });

    const getPost = await ddbDocClient.send(getPostCommand);

    //Obtiene cantidad de likes del post
    const getLikeQuantityCommand = new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        pk: `${postId}#likecount`,
        sk: "count",
      },
    });

    const likesQuantity = await ddbDocClient.send(getLikeQuantityCommand);

    //Obtiene la cantidad de comentarios del post
    const getCommentQuantityCommand = new GetCommand({
      TableName: process.env.TABLE_NAME,
      Key: {
        pk: `${postId}#commentcount`,
        sk: "count",
      },
    });

    const commentsQuantity = await ddbDocClient.send(getCommentQuantityCommand);

    const { description, timeStamp, imageUrl } = getPost.Item;

    //TODO

    //recuperar 1 comentario

    let post: IPost = {
      username,
      postId,
      imageUrl,
      description,
      timeStamp,
      likesQuantity: likesQuantity.Item.quantity,
      commentsQuantity: commentsQuantity.Item.quantity,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(post),
    };
  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify(err),
    };
  }
}
