import { CfnOutput, Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs/lib/construct";
import { getSuffixFromStack } from "../utils/SuffixMaker";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { join } from "path";
import { existsSync } from "fs";
import { BucketDeployment, Source } from "aws-cdk-lib/aws-s3-deployment";
import { Distribution, OriginAccessIdentity } from "aws-cdk-lib/aws-cloudfront";
import { S3Origin } from "aws-cdk-lib/aws-cloudfront-origins";

export class UiDeploymentStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const suffix = getSuffixFromStack(this);

    const deploymentBucket = new Bucket(this, "uiDeploymentBucket", {
      bucketName: `divmension-delpoyment-bucket-${suffix}`,
    });

   /*  const uiDir = join(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "devmension-frontend-example",
      "dist"
    ); */

    const uiDir = join(
      __dirname,
      "..",
      "..",
      "..",
      "..",
      "divmension-frontend",
      "devmension",
      "dist",
      "devmension",
      "browser"
    );

    if (!existsSync(uiDir)) {
      console.warn("UI Dir is not found", uiDir);
      return;
    }

    new BucketDeployment(this, "DivmensionDeployment", {
      destinationBucket: deploymentBucket,
      sources: [Source.asset(uiDir)],
    });

    const originIdentity = new OriginAccessIdentity(
      this,
      "OriginAccessIdentity"
    );
    deploymentBucket.grantRead(originIdentity);

    const distribution = new Distribution(this, "DivmensionDistribution", {
      defaultRootObject: "index.html",
      defaultBehavior: {
        origin: new S3Origin(deploymentBucket, {
          originAccessIdentity: originIdentity,
        }),
      },
    });

    new CfnOutput(this, "DivmensionUrl", {
      value: distribution.distributionDomainName,
    });
  }
}
