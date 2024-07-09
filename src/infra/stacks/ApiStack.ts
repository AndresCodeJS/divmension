import { Stack, StackProps } from 'aws-cdk-lib'
import { AuthorizationType, CognitoUserPoolsAuthorizer, Cors, LambdaIntegration, MethodOptions, ResourceOptions, RestApi } from 'aws-cdk-lib/aws-apigateway';
import { IUserPool } from 'aws-cdk-lib/aws-cognito';
import { Code, Function as LambdaFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { join } from 'node:path';

interface ApiStackProps extends StackProps {
    placesLambdaIntegration: LambdaIntegration,
  /*   usersLambdaIntegration: LambdaIntegration, */
    userPool: IUserPool
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

        const api = new RestApi(this, 'PlacesApi')

        const authorizer = new CognitoUserPoolsAuthorizer(this, 'PlacesApiAuthorizer', {
            cognitoUserPools: [props.userPool],
            identitySource: 'method.request.header.Authorization'
        })

        authorizer._attachToApi(api)

        const optionsWithAuth: MethodOptions = {
            authorizationType: AuthorizationType.COGNITO,
            authorizer: {
                authorizerId: authorizer.authorizerId
            }
        }

        const placesResource = api.root.addResource('places', optionsWithCors)
        placesResource.addMethod('GET', props.placesLambdaIntegration, optionsWithAuth)
        placesResource.addMethod('POST', props.placesLambdaIntegration, optionsWithAuth )
        placesResource.addMethod('DELETE', props.placesLambdaIntegration, optionsWithAuth)
        placesResource.addMethod('PUT', props.placesLambdaIntegration, optionsWithAuth)

       /*  const usersResource = api.root.addResource('users',optionsWithCors)
        const refreshResource = usersResource.addResource('refresh',optionsWithCors)
        refreshResource.addMethod('POST', props.usersLambdaIntegration, optionsWithAuth) */
    }

}