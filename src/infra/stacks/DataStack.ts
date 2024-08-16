import { Duration, RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import {
  AttributeType,
  Billing,
  BillingMode,
  Capacity,
  Table as DynamoTable,
  ITable,
} from "aws-cdk-lib/aws-dynamodb";
import * as appScaling from "aws-cdk-lib/aws-applicationautoscaling";
import { Construct } from "constructs";
import { getSuffixFromStack } from "../utils/SuffixMaker";

export class DataStack extends Stack {
  public readonly devmensionTable: any;
  public readonly gsi1Name: string;

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const suffix = getSuffixFromStack(this);

    this.gsi1Name = 'gsi1'

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

    // Enable auto-scaling for write capacity
    const writeScaling = this.devmensionTable.autoScaleWriteCapacity({
      minCapacity: 4, // Minimum write capacity units
      maxCapacity: 8, // Maximum write capacity units
    });

    // Define how the write capacity should scale
    writeScaling.scaleOnUtilization({
      targetUtilizationPercent: 70, // Target utilization percentage
      scaleInCooldown: Duration.minutes(2), // Cooldown period after scaling in
      scaleOutCooldown: Duration.minutes(2), // Cooldown period after scaling out
    });

    // Optionally, you can also enable auto-scaling for read capacity similarly
    const readScaling = this.devmensionTable.autoScaleReadCapacity({
      minCapacity: 4,
      maxCapacity: 8,
    });

    readScaling.scaleOnUtilization({
      targetUtilizationPercent: 70,
      scaleInCooldown: Duration.minutes(2),
      scaleOutCooldown: Duration.minutes(2),
    });
  }
}
