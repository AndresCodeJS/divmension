import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs/lib/construct";
import { getSuffixFromStack } from "../utils/SuffixMaker";
import { Bucket } from "aws-cdk-lib/aws-s3";


export class UiDeploymentStack extends Stack{

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        
    const suffix = getSuffixFromStack(this);

    
    const deploymentBucket = new Bucket(this, "uiDeploymentBucket", {
      bucketName: `divmension-delpoyment-bucket-${suffix}`,
    });

    }


}