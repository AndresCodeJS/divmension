import {
  CfnOutput,
  Duration,
  RemovalPolicy,
  Stack,
  StackProps,
} from "aws-cdk-lib";
import {
  AttributeType,
  BillingMode,
  Table as DynamoTable,
} from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";
import { getSuffixFromStack } from "../utils/SuffixMaker";
import {
  Bucket,
  HttpMethods,
  IBucket,
  ObjectOwnership,
} from "aws-cdk-lib/aws-s3";
import {
  Role,
  ServicePrincipal,
  PolicyStatement,
  Effect,
  ArnPrincipal,
  CompositePrincipal,
  ManagedPolicy,
} from "aws-cdk-lib/aws-iam";

export class DataStack extends Stack {
  public readonly devmensionTable: any;
  public readonly gsi1Name: string;
  public readonly photosBucket: IBucket;
  public readonly s3AccessRole: Role;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const suffix = getSuffixFromStack(this);

    //Creación de bucket para cargar fotos de perfil de usuarios --------------------------------
    this.photosBucket = new Bucket(this, "DivmensionPhotos", {
      bucketName: `divmension-${suffix}`,
      cors: [
        {
          allowedMethods: [HttpMethods.HEAD, HttpMethods.GET, HttpMethods.PUT, HttpMethods.DELETE, HttpMethods.POST],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
        },
      ],
      blockPublicAccess: {
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      },
      objectOwnership: ObjectOwnership.OBJECT_WRITER,
    });

    new CfnOutput(this, "DivmensionPhotosBucketName", {
      value: this.photosBucket.bucketName,
    });

    // Creacion del rol para poder acceder al bucket ---------------------------------------------
    this.s3AccessRole = this.createS3AccessRole();

    //Agregarmos politica al bucket para que acepte al rol -----------------------------------

    const bucketPolicy = new PolicyStatement({
      actions: ["s3:PutObject", "s3:PutObjectAcl", "s3:GetObject", "s3:DeleteObject"],
      resources: [this.photosBucket.bucketArn + "/*"],
      principals: [
        /* new ServicePrincipal('lambda.amazonaws.com'), */
        new ArnPrincipal(this.s3AccessRole.roleArn),
      ],
    });

    /*  bucketPolicy.addCondition("StringLike", {
      's3:x-amz-content-type': ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    }); */

    this.photosBucket.addToResourcePolicy(bucketPolicy);

    // Exportar el ARN del rol como un output del stack
    new CfnOutput(this, "S3AccessRoleArn", {
      value: this.s3AccessRole.roleArn,
      description: "ARN of the IAM role for S3 access",
      exportName: "S3AccessRoleArn",
    });

    // ---------------------------------------------------------------------------

    this.gsi1Name = "gsi1";

    //CREACION DE TABLA PARA MANEJO DE USUARIOS Y POSTS
    this.devmensionTable = new DynamoTable(this, "DevmensionTable", {
      partitionKey: {
        name: "pk",
        type: AttributeType.STRING,
      },
      sortKey: {
        name: "sk",
        type: AttributeType.STRING,
      },

      tableName: `Devmension-${suffix}`,
      billingMode: BillingMode.PROVISIONED,
      removalPolicy: RemovalPolicy.DESTROY,
    });

    this.devmensionTable.addGlobalSecondaryIndex({
      indexName: this.gsi1Name,
      partitionKey: { name: "email", type: AttributeType.STRING },
      writeCapacity: 1,
      readCapacity: 1,
      billingMode: BillingMode.PROVISIONED,
    });

    // ESCALADO DE UNIDAD DE CAPACIDAD DE ESCRITURA
    const writeScaling = this.devmensionTable.autoScaleWriteCapacity({
      minCapacity: 4, // Minimum write capacity units
      maxCapacity: 8, // Maximum write capacity units
    });

    // PROPIEDADES DE ESCALADO DE ESCRITURA
    writeScaling.scaleOnUtilization({
      targetUtilizationPercent: 70, // Target utilization percentage
      scaleInCooldown: Duration.minutes(2), // Cooldown period after scaling in
      scaleOutCooldown: Duration.minutes(2), // Cooldown period after scaling out
    });

    // ESCALADO DE UNIDAD DE CAPACIDAD DE LECTURA
    const readScaling = this.devmensionTable.autoScaleReadCapacity({
      minCapacity: 4,
      maxCapacity: 8,
    });

    // PROPIEDADES DE ESCALADO DE LECTURA
    readScaling.scaleOnUtilization({
      targetUtilizationPercent: 70,
      scaleInCooldown: Duration.minutes(2),
      scaleOutCooldown: Duration.minutes(2),
    });
  }

  //Funcion creacion de rol para poder acceder al bucket de fotos (Modificar cada vez que s ecambie de cuenta)
  // Se debe ir a las politicas de este rol en aws console y en relaciones de confianza en "Principal" -> agregar "AWS":ARN del ROL de la funcion lambda
  private createS3AccessRole(): Role {
    const role = new Role(this, "S3AccessRole", {
      //Modificar cada vez que se cambie de usuario o de funcion lambda (y tanto al usuario como funcion lamba otorgar politicas de "Action": "sts:AssumeRole")
      assumedBy: new CompositePrincipal(
        new ServicePrincipal("lambda.amazonaws.com"),
        new ArnPrincipal("arn:aws:iam::339712893600:user/Andres")
        /* new ArnPrincipal('arn:aws:lambda:us-east-1:339712893600:function:LambdaStack-usersLambdaB774E0F9-GAjf5O7OhHQe') */
      ),
      roleName: `s3-access-role-${this.stackName}`,
    });

    // Añadir política para acceso a S3
    // Dar permiso en la consola
    role.addToPolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ["s3:PutObject", "s3:GetObject", "s3:ListBucket", "s3:DeleteObject"],
        resources: [
          this.photosBucket.bucketArn,
          `${this.photosBucket.bucketArn}/*`,
        ],
      })
    );

    // Agregar permisos básicos para que Lambda pueda ejecutarse y escribir logs
    /* role.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')); */

    // Si necesitas que el rol pueda ser asumido por otros servicios AWS, añade esto:
    /*  role.assumeRolePolicy?.addStatements(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['sts:AssumeRole'],
        principals: [new ServicePrincipal('YOUR_SERVICE.amazonaws.com')],
      })
    ); */

    return role;
  }
}
