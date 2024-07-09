import { Stack, StackProps } from 'aws-cdk-lib'
import { AttributeType, Table as DynamoTable, ITable } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { getSuffixFromStack } from '../utils/SuffixMaker';



export class DataStack extends Stack {

    public readonly placesTable : ITable

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props)

        const suffix = getSuffixFromStack(this)

        this.placesTable = new DynamoTable(this, 'PlacesTable', {
            partitionKey: {
                name: 'id',
                type: AttributeType.STRING
            },
            tableName: `PlacesTable-${suffix}`
        })
    }

}