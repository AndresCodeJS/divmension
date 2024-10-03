import { aws_apigatewayv2 as apigatewayv2, CfnOutput, Duration } from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib'
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { join } from "node:path";

    interface ApiStackProps extends StackProps {
        lambdaChatIntegration:  WebSocketLambdaIntegration,
      /*   usersLambdaIntegration: LambdaIntegration, */
        /* userPool: IUserPool */
    }
    
    export class ApiStack extends Stack {
    
        constructor(scope: Construct, id: string, props: ApiStackProps) {
            super(scope, id, props)

            //FUNCION LAMBDA A SER EJECUTADA POR EL WEBSOCKET
            const lambdaChat = new NodejsFunction(this, "lambdaChat", {
                runtime: Runtime.NODEJS_18_X,
                handler: "handler",
                entry: join(__dirname, "..", "..", "services", "chat", "handler.ts"), 
                environment: {
            /*       TABLE_NAME: props.devmensionTable.tableName,
                  TABLE_GSI1_NAME: props.gsi1Name,
                  SECRET_KEY: "DIVMENSION_SECRET_PW_KEY",
                  JWT_SECRET: "JWT_SECRET_CODE",
                  S3_ACCESS_ROLE_NAME: props.s3AccessRole.roleName, */
                  ACCOUNT_ID: "339712893600",
                  REGION: "us-east-1",
                },
           /*      bundling: {
                  nodeModules: ["bcryptjs", "jsonwebtoken", "ulid"],
                }, */
                timeout: Duration.seconds(6),
              });

              //EJECUCIONES DE LAMBDA CUANDO OCURRE UNA CONEXION O DESCONEXION
              const webSocketApi = new apigatewayv2.WebSocketApi(this, 'DivmensionChatApi',{
                connectRouteOptions: {
                  integration: new WebSocketLambdaIntegration('ConnectIntegration', lambdaChat),
                },
                disconnectRouteOptions: {
                  integration: new WebSocketLambdaIntegration('DisconnectIntegration', lambdaChat),
                },
                defaultRouteOptions: {
                  integration: new WebSocketLambdaIntegration('DefaultIntegration', lambdaChat),
                },
              });

              const stage = new apigatewayv2.WebSocketStage(this, 'chatStage', {
                webSocketApi,
                stageName: 'prod',
                autoDeploy: true,
              });

              //RUTA EJECUTADA CUANDO EL CLIENTE ENVIA UN MENSAJE
              webSocketApi.addRoute('sendMessage', {
                integration: new WebSocketLambdaIntegration('SendMessageIntegration', lambdaChat),
              });

              //SE CREAN PERMISOS PARA QUE LA FUNCION LAMBDA PUEDA MANEJAR LAS CONEXIONES
              const policy = new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['execute-api:ManageConnections'],
                resources: [
                    //REGION
                    //ACCOUNT
                  `arn:aws:execute-api:"us-east-1":"339712893600":${webSocketApi.apiId}/${stage.stageName}/*`
                ],
              });

              lambdaChat.addToRolePolicy(policy);

              // Mostrar la URL del WebSocket en la salida
              new CfnOutput(this, 'WebSocketURL', {
                value: stage.url,
                description: 'URL del WebSocket',
              });


        }

    }