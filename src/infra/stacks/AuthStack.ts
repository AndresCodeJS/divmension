import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib'
import { CfnUserPool, UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export class AuthStack extends Stack {

    public userPool: UserPool
    private userPoolClient: UserPoolClient

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props)

        this.createUserPool()
        this.createUserPoolClient()


    }

    private createUserPool() {

        this.userPool = new UserPool(this, 'PlaceUserPool', {
            selfSignUpEnabled: true,
            signInAliases: {
                username: true,
                email: true
            },
            passwordPolicy: {
                minLength: 6,             // Longitud mínima de la contraseña
                requireLowercase: false,   // Requiere al menos una letra minúscula
                requireUppercase: false,   // Requiere al menos una letra mayúscula
                requireDigits: true,      // Requiere al menos un dígito
                requireSymbols: false,     // Requiere al menos un símbolo
                tempPasswordValidity: Duration.days(7), // Validez de la contraseña temporal
            },
        })

        //Para agregar mas campos en un User Pool ---------------------------------------------------------

     /*    const cfnUserPool = this.userPool.node.defaultChild as CfnUserPool;

        cfnUserPool.schema = [
            {
                name: 'name',
                attributeDataType: 'String',
                required: false,
                mutable: true,
            },

        ] */

        // ------------------------------------------------------------------------------------------------------------------

        new CfnOutput(this, 'PlaceUserPoolId', {
            value: this.userPool.userPoolId
        })

    }

    private createUserPoolClient() {

        this.userPoolClient = this.userPool.addClient('SpaceUserPoolClient', {
            authFlows: {
                adminUserPassword: true,
                custom: true,
                userPassword: true,
                userSrp: true
            }
        })
        new CfnOutput(this, 'SpaceUserPoolClientId', {
            value: this.userPoolClient.userPoolClientId
        })
    }
}
