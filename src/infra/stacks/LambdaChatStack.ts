import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import {
  Effect,
  PolicyStatement,
  Role
} from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { join } from "node:path";

interface LambdaStackProps extends StackProps {
/*   devmensionTable: ITable;
  gsi1Name: string;
  s3AccessRole: Role;
  photosBucket: IBucket; */
}

export class LambdaChatStack extends Stack {
  public readonly lambdaChatIntegration: LambdaIntegration;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

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

  /*   lambdaChat.addToRolePolicy( 
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "execute-api:ManageConnections"
        ],
        resources: [
          props.devmensionTable.tableArn,
          `${props.devmensionTable.tableArn}/index/${props.gsi1Name}`,
        ],
      })
    ); */

   /*  usersLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["sts:AssumeRole"],
        resources: [
          `arn:aws:iam::339712893600:role/${props.s3AccessRole.roleName}`,
        ],
      })
    ); */

    /*   placesLambda.addToRolePolicy(new PolicyStatement({
              effect: Effect.ALLOW,
              actions: [
                  's3:ListAllMyBuckets',
                  's3:ListBucket'
              ],
              resources: ['*'] //bad practice
          })) */

    this.lambdaChatIntegration = new LambdaIntegration(lambdaChat);
  }
}
