import { Stack, StackProps } from 'aws-cdk-lib'
import { Cors, LambdaIntegration, ResourceOptions, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { Construct } from 'constructs';


interface ApiStackProps extends StackProps {
    usersLambdaIntegration: LambdaIntegration,
  /*   usersLambdaIntegration: LambdaIntegration, */
    /* userPool: IUserPool */
}

export class ApiStack extends Stack {

    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props)

        const optionsWithCors: ResourceOptions = {
            defaultCorsPreflightOptions: {
                allowOrigins: Cors.ALL_ORIGINS,
                allowMethods: Cors.ALL_METHODS
            }
        }

        const api = new RestApi(this, 'DevmensionApi')

        /* const authorizer = new CognitoUserPoolsAuthorizer(this, 'PlacesApiAuthorizer', {
            cognitoUserPools: [props.userPool],
            identitySource: 'method.request.header.Authorization'
        }) */

        /* authorizer._attachToApi(api)

        const optionsWithAuth: MethodOptions = {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: authorizer.authorizerId
            }
        } */

        //RUTA DE USUARIOS
        const userResource = api.root.addResource('users', optionsWithCors)

        //Registro de Usuario
        const signUpResource = userResource.addResource('create', optionsWithCors)
        signUpResource.addMethod('POST', props.usersLambdaIntegration)

        //Login de Usuario
        const loginResource = userResource.addResource('login', optionsWithCors)
        loginResource.addMethod('POST', props.usersLambdaIntegration)

        //Obtiene información de usuario al refresacar la página
        const refreshPageResource = userResource.addResource('refresh-page', optionsWithCors)
        refreshPageResource.addMethod('GET', props.usersLambdaIntegration)

        //Obtiene los usuarios que coinciden con lo ingresado en la barra de búsqueda
        const searchBarResource = userResource.addResource('search', optionsWithCors)
        const searchParameterResource = searchBarResource.addResource('{userString}', optionsWithCors)
        searchParameterResource.addMethod('GET', props.usersLambdaIntegration)

        //Obtiene informacion del usuario a partir del username para cargar el perfil
        const userProfileResource = userResource.addResource('profile', optionsWithCors)
        const getUserProfileResource = userProfileResource.addResource('{username}', optionsWithCors)
        getUserProfileResource.addMethod('GET', props.usersLambdaIntegration)

        //Registra los seguidores y seguidos cuando un usuario sigue a otro usuario
        const followResource = userResource.addResource('follow', optionsWithCors)
        followResource.addMethod('POST', props.usersLambdaIntegration)

        //Elimina los registros de seguidores y seguidos cuando un usuario deja de seguir a otro usuario
        const unfollowResource = userResource.addResource('unfollow', optionsWithCors)
        unfollowResource.addMethod('POST', props.usersLambdaIntegration)

        //Obtiene credenciales temporales para poder cargar fotos a s3
        const s3CredentialsResource = userResource.addResource('s3-credentials', optionsWithCors)
        s3CredentialsResource.addMethod('GET', props.usersLambdaIntegration)

         //Actualiza la foto de perfil
         const updateProfilePhotoResource = userResource.addResource('profile-photo', optionsWithCors)
         updateProfilePhotoResource.addMethod('POST', props.usersLambdaIntegration)

        
        //RUTA DE POST --------------------------------------------------------

        const postResource = api.root.addResource('posts', optionsWithCors)
        
        //Registro de Usuario
        const createPostResource = postResource.addResource('create', optionsWithCors)
        createPostResource.addMethod('POST', props.usersLambdaIntegration)

        //Obtener los posts paginados de un usuario
        const postsByUserResource = postResource.addResource('user', optionsWithCors)
        const usernameParamResource = postsByUserResource.addResource('{pkParam}', optionsWithCors)
        const lastPostIdParamResource = usernameParamResource.addResource('{skParam}', optionsWithCors)
        lastPostIdParamResource.addMethod('GET', props.usersLambdaIntegration)

        //Obtiene los detalles de un post por el ID
        const postDetailsResource = postResource.addResource('details', optionsWithCors)
        const usernamePostResource = postDetailsResource.addResource('{username}', optionsWithCors)
        const postIdParamResource = usernamePostResource.addResource('{postId}', optionsWithCors)
        postIdParamResource.addMethod('GET', props.usersLambdaIntegration)

        //Dar me gusta a un post
        const postLikeResource = postResource.addResource('like', optionsWithCors)
        postLikeResource.addMethod('POST', props.usersLambdaIntegration)

        //Quitar me gusta a un post
        const postUnlikeResource = postResource.addResource('unlike', optionsWithCors)
        postUnlikeResource.addMethod('POST', props.usersLambdaIntegration)

        //Comentar un post
        const postCommentResource = postResource.addResource('comment', optionsWithCors)
        postCommentResource.addMethod('POST', props.usersLambdaIntegration)

        //Eliminar un comentario
        const deleteCommentResource = postResource.addResource('delete-comment', optionsWithCors)
        deleteCommentResource.addMethod('POST', props.usersLambdaIntegration)

        //Obtener los comentarios paginados de un post
        const commentsByPostResource = postResource.addResource('comments-list', optionsWithCors)
        const commentPostIdParamResource = commentsByPostResource.addResource('{pkParam}', optionsWithCors)
        const lastCommentIdParamResource = commentPostIdParamResource.addResource('{skParam}', optionsWithCors)
        lastCommentIdParamResource.addMethod('GET', props.usersLambdaIntegration)

        //Obtener todos los post para la vista home
        const allPostsResource = postResource.addResource('all', optionsWithCors)
        const pkParamResource = allPostsResource.addResource('{lastUsername}', optionsWithCors)// ->usado para paginado
        const skParamResource = pkParamResource.addResource('{lastPostId}', optionsWithCors)// ->usado para paginado
        skParamResource.addMethod('GET', props.usersLambdaIntegration)

    }

}