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

        //Obtiene informacion del usuario a partir del username
        const userProfileResource = userResource.addResource('profile', optionsWithCors)
        const getUserProfileResource = userProfileResource.addResource('{username}', optionsWithCors)
        getUserProfileResource.addMethod('GET', props.usersLambdaIntegration)
    }

}