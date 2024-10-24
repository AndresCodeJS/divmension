import {
  aws_apigatewayv2 as apigatewayv2,
  CfnOutput,
  Duration,
} from 'aws-cdk-lib';
import { aws_iam as iam } from 'aws-cdk-lib';
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import { Construct } from 'constructs';
import { Stack, StackProps } from 'aws-cdk-lib';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { join } from 'node:path';
import { ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';

interface ApiStackProps extends StackProps {
  /* lambdaChatIntegration:  WebSocketLambdaIntegration, */
  /*   usersLambdaIntegration: LambdaIntegration, */
  /* userPool: IUserPool */
  gsi1Name: string;
  divmensionChatTable: ITable;
  gsi2Name: string;
}

export class ApiChatStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const account = '339712893600';
    const region = 'us-east-1';

    //FUNCION LAMBDA A SER EJECUTADA POR EL WEBSOCKET
    const lambdaChat = new NodejsFunction(this, 'lambdaChat', {
      runtime: Runtime.NODEJS_18_X,
      handler: 'handler',
      entry: join(__dirname, '..', '..', 'services', 'chat', 'handler.ts'),
      environment: {
        CHAT_TABLE_NAME: props.divmensionChatTable.tableName,
        /* TABLE_NAME: props.devmensionTable.tableName, */
        TABLE_GSI1_NAME: props.gsi1Name,
        TABLE_GSI2_NAME: props.gsi2Name,
        /* SECRET_KEY: "DIVMENSION_SECRET_PW_KEY", */
        JWT_SECRET: 'JWT_SECRET_CODE', //EL MISMO QUE USA USER_LAMBDA
        /* S3_ACCESS_ROLE_NAME: props.s3AccessRole.roleName, */
        ACCOUNT_ID: account,
        REGION: region,
      },
           bundling: {
                  nodeModules: ["jsonwebtoken"],
                },
      timeout: Duration.seconds(6),
    });

    //OTORGAR PERMISOS A LA FUNCION LAMBDA PARA ACCEDER A LA TABLA DE MANEJO DE CHAT
    lambdaChat.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          'dynamodb:PutItem',
          'dynamodb:DeleteItem',
          'dynamodb:GetItem',
          'dynamodb:UpdateItem',
          'dynamodb:Scan',
          'dynamodb:Query',
        ],
        resources: [
          props.divmensionChatTable.tableArn,
          `${props.divmensionChatTable.tableArn}/index/${props.gsi1Name}`,
        ],
      })
    );

    //EJECUCIONES DE LAMBDA CUANDO OCURRE UNA CONEXION O DESCONEXION
    const webSocketApi = new apigatewayv2.WebSocketApi(
      this,
      'DivmensionChatApi',
      {
        connectRouteOptions: {
          integration: new WebSocketLambdaIntegration(
            'ConnectIntegration',
            lambdaChat
          ),
        },
        disconnectRouteOptions: {
          integration: new WebSocketLambdaIntegration(
            'DisconnectIntegration',
            lambdaChat
          ),
        },
        defaultRouteOptions: {
          integration: new WebSocketLambdaIntegration(
            'DefaultIntegration',
            lambdaChat
          ),
        },
        routeSelectionExpression: '$request.body.action',
      }
    );

    const stage = new apigatewayv2.WebSocketStage(this, 'chatStage', {
      webSocketApi,
      stageName: 'prod',
      autoDeploy: true,
    });

    //RUTA EJECUTADA CUANDO EL CLIENTE ENVIA UN MENSAJE
    webSocketApi.addRoute('sendMessage', {
      integration: new WebSocketLambdaIntegration(
        'SendMessageIntegration',
        lambdaChat
      ),
    });

    //SE CREAN PERMISOS PARA QUE LA FUNCION LAMBDA PUEDA MANEJAR LAS CONEXIONES
    /*  const policy = new iam.PolicyStatement({
                effect: iam.Effect.ALLOW,
                actions: ['execute-api:ManageConnections'],
                resources: [
                    //REGION
                    //ACCOUNT
                  `arn:aws:execute-api:"us-east-1":"339712893600":${webSocketApi.apiId}/${stage.stageName}/*`
                ],
              }); */

    const policy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['execute-api:ManageConnections'],
      resources: [
        `arn:aws:execute-api:${region}:${account}:${webSocketApi.apiId}/${stage.stageName}/POST/@connections/*`,
        `arn:aws:execute-api:${region}:${account}:${webSocketApi.apiId}/${stage.stageName}/GET/@connections/*`,
        `arn:aws:execute-api:${region}:${account}:${webSocketApi.apiId}/${stage.stageName}/DELETE/@connections/*`,
      ],
    });

    lambdaChat.addToRolePolicy(policy);

    // Otorgar permisos adicionales a la función Lambda para manejar conexiones
    webSocketApi.grantManageConnections(lambdaChat);

    // Crear y aplicar la política de recursos para permitir conexiones desde cualquier origen
    /*  const resourcePolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      principals: [new iam.AnyPrincipal()],
      actions: ['execute-api:Invoke'],
      resources: ['*'],
    }); */

    // Mostrar la URL del WebSocket en la salida
    new CfnOutput(this, 'WebSocketURL', {
      value: stage.url,
      description: 'URL del WebSocket',
    });
  }
}
