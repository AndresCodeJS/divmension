import { App } from 'aws-cdk-lib';
import { DataStack } from './stacks/DataStack';
import { LambdaStack } from './stacks/LambdaStack';
import { ApiStack } from './stacks/ApiStack';
import { AuthStack } from './stacks/AuthStack';
import { UserLambdaStack } from './stacks/UserLambdaStack';
import { UiDeploymentStack } from './stacks/UiDeploymentStack';
import { ApiChatStack } from './stacks/ApiChatStack';
import { DataChatStack } from './stacks/DataChatStack';

const app = new App();
const dataStack = new DataStack(app, 'DataStack');

//STACK PARA CREACION DE TABLA DE REGISTRO DE CHAT
const dataChatStack = new DataChatStack(app, 'DataChatStack');

const lambdaStack = new LambdaStack(app, 'LambdaStack', {
  devmensionTable: dataStack.devmensionTable,
  divmensionChatTable: dataChatStack.divmensionChatTable,
  gsi1Name: dataStack.gsi1Name,
  gsi2Name:dataChatStack.gsi2Name,
  s3AccessRole: dataStack.s3AccessRole,
  photosBucket: dataStack.photosBucket,
});
/* const authStack = new AuthStack(app, 'AuthStack') */

/* const userLambdaStack = new UserLambdaStack(app, 'UserLambdaStack') */

new ApiStack(app, 'ApiStack', {
  usersLambdaIntegration: lambdaStack.usersLambdaIntegration,
  /*     usersLambdaIntegration: userLambdaStack.usersLambdaIntegration, */
  /* userPool: authStack.userPool */
});

//STACK USADO PARA LA CREACION DEL CHAT
new ApiChatStack(app, 'ApiChatStack', {
  divmensionChatTable: dataChatStack.divmensionChatTable,
  gsi1Name: dataChatStack.gsi1Name,
  gsi2Name:dataChatStack.gsi2Name,
});

//DEPLOY DEL FRONT
new UiDeploymentStack(app, 'UiDeploymentStack');
