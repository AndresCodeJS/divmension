import { Duration, Stack, StackProps } from "aws-cdk-lib";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import { ITable } from "aws-cdk-lib/aws-dynamodb";
import { Effect, PolicyStatement, Role } from "aws-cdk-lib/aws-iam";
import { Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { IBucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { join } from "node:path";

interface LambdaStackProps extends StackProps {
  devmensionTable: ITable;
  gsi1Name: string;
  s3AccessRole: Role;
  photosBucket: IBucket;
}

export class LambdaStack extends Stack {
  public readonly usersLambdaIntegration: LambdaIntegration;

  constructor(scope: Construct, id: string, props: LambdaStackProps) {
    super(scope, id, props);

    const usersLambda = new NodejsFunction(this, "usersLambda", {
      runtime: Runtime.NODEJS_18_X,
      handler: "handler",
      entry: join(__dirname, "..", "..", "services", "users", "handler.ts"),
      environment: {
        TABLE_NAME: props.devmensionTable.tableName,
        TABLE_GSI1_NAME: props.gsi1Name,
        SECRET_KEY: "DIVMENSION_SECRET_PW_KEY",
        JWT_SECRET: "JWT_SECRET_CODE",
        S3_ACCESS_ROLE_NAME: props.s3AccessRole.roleName,
        ACCOUNT_ID:'339712893600',
        REGION:'us-east-1'
      },
      role: props.s3AccessRole,
      bundling: {
        nodeModules: ["bcryptjs", "jsonwebtoken"],
      },
      timeout: Duration.seconds(6),
    });

    usersLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: [
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:Scan",
          "dynamodb:Query",
        ],
        resources: [
          props.devmensionTable.tableArn,
          `${props.devmensionTable.tableArn}/index/${props.gsi1Name}`,
        ],
      },
    ),
      
    );

   /*  usersLambda.addToRolePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["sts:AssumeRole"],
        resources: [
          `arn:aws:iam::339712893600:role/${props.s3AccessRole.roleName}`
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

    this.usersLambdaIntegration = new LambdaIntegration(usersLambda);
  }
}
