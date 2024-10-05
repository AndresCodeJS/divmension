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
  
  export class DataChatStack extends Stack {
    public readonly divmensionChatTable: any;
    public readonly gsi1Name: string;
  
    constructor(scope: Construct, id: string, props?: StackProps) {
      super(scope, id, props);
  
      const suffix = getSuffixFromStack(this);
  
      // ---------------------------------------------------------------------------
  
      this.gsi1Name = "gsi1";
  
      //CREACION DE TABLA PARA MANEJO DEL CHAT
      this.divmensionChatTable = new DynamoTable(this, "DivmensionChatTable", {
        partitionKey: {
          name: "pk",
          type: AttributeType.STRING,
        },
        sortKey: {
          name: "sk",
          type: AttributeType.STRING,
        },
  
        tableName: `Divmension-Chat-${suffix}`,
        billingMode: BillingMode.PROVISIONED,
        removalPolicy: RemovalPolicy.DESTROY,
      });
  
      //CREACION DE INDICE PARA BUSQUEDA POR ID DE CONEXION Y CAMBIAR EL STATUS DEL USUARIO A OFFLINE
      this.divmensionChatTable.addGlobalSecondaryIndex({
        indexName: this.gsi1Name,
        partitionKey: { name: "connId", type: AttributeType.STRING },
        writeCapacity: 1,
        readCapacity: 1,
        billingMode: BillingMode.PROVISIONED,
      });
  
      // ESCALADO DE UNIDAD DE CAPACIDAD DE ESCRITURA
      const writeScaling = this.divmensionChatTable.autoScaleWriteCapacity({
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
      const readScaling = this.divmensionChatTable.autoScaleReadCapacity({
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
  }
  