import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";
import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { IPost } from "../shared/models";
import { AuthService } from "../users/AuthService";


const auth = new AuthService();

export async function getPostsByUser(
  event: APIGatewayProxyEvent,
  ddbDocClient: DynamoDBClient
): Promise<APIGatewayProxyResult> {
  const pkParam = event.pathParameters?.pkParam;
  const skParam = event.pathParameters?.skParam;

  if (!pkParam || !skParam) {
    return {
      statusCode: 401,
      body: JSON.stringify({ message: "missing parameters" }),
    };
  }

  try {
    //Recupera todos los posts publicados por el usuario a partir del ultimo post consultado (Paginacion)

    const getPostsCommand = new QueryCommand({
      TableName: process.env.TABLE_NAME,
      KeyConditionExpression: "pk = :pk",
      ExpressionAttributeValues: {
        ":pk":`${pkParam}#post`,
      },
      Limit: 9,
      ScanIndexForward: false, // para obtener de los registros mas nuevos a los mas viejos
      ExclusiveStartKey: {
        pk: `${pkParam}#post`,
        sk: skParam,
      },
    });

    const getPosts = await ddbDocClient.send(getPostsCommand);

    //Verifica si hay un user logueado
    let response = await auth.verifyToken(event);

    let loggedUser = ''

    if (response.statusCode == 200) {
      //Extrae el usuario para verificar si le ha dado me gusta a los posts obtenidos
      loggedUser = JSON.parse(response.body).username;
    }

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

           //VERIFICA SI EL POST TIENE ME GUSTA DEL USUARIO LOGUEADO

           let isLiked =false

           if(loggedUser){
 
             const likeCommand = new GetCommand({
               TableName: process.env.TABLE_NAME,
               Key: {
                 pk: `${post.sk}#likelist`,
                 sk: loggedUser,
               },
             });
   
             const getLike = await ddbDocClient.send(
               likeCommand
             );
 
             if(getLike.Item){
               isLiked = true
             }
           }

          return {
            username: post.pk.split("#")[0],
            postId: post.sk,
            description: post.description,
            timeStamp: post.timeStamp,
            imageUrl: post.imageUrl,
            likesQuantity: likesQuantity.Item.quantity,
            commentsQuantity: commentsQuantity.Item.quantity,
            isLiked
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
  } catch (err) {
    return {
      statusCode: 401,
      body: JSON.stringify(err),
    };
  }
}
