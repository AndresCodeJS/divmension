/* import { SignInOutput, signIn, signUp, confirmSignUp, fetchAuthSession, getCurrentUser } from '@aws-amplify/auth'; */
/* import { Amplify } from 'aws-amplify'; */
import { APIGatewayProxyResult } from 'aws-lambda';




const awsRegion = 'us-east-1';

/* Amplify.configure({
    Auth: {

        Cognito: {
            
            userPoolId: 'us-east-2_Yx0GslV7g',
            userPoolClientId: 'splcinvf9svh4d02av23uofl0',
            
        },
    },
});
 */
/* const verifier = CognitoJwtVerifier.create({
    userPoolId: "us-east-1_0cFXtGnjw",
    tokenUse: "access",
    clientId: "39jlochs8namkbn2sskca6l7sm",
  }); */


export class AuthService {

   /*  private user: SignInOutput | undefined; */

    public async createUser(username: string, name: string, password: string, email: string): Promise<APIGatewayProxyResult> {

        try {

          /*   const { isSignUpComplete, userId, nextStep } = await signUp({
                username: username,
                password: password,
                options: {
                    userAttributes: {
                        email: email,
                        name: name
                    },
                }
            }); */


        } catch (error) {

            if (error.name === 'UsernameExistsException') {
                return {
                    statusCode: 400,
                    body: JSON.stringify('User already exists')
                }
            }

        }

        return {
            statusCode: 201,
            body: JSON.stringify('Usuario creado')
        }

    }

    public async confirmUser(username: string, confirmationCode: string): Promise<APIGatewayProxyResult> {

        try {

         /*    const { isSignUpComplete, nextStep } = await confirmSignUp({
                username,
                confirmationCode
            }); */
        } catch (error) {
            if (error.name == "CodeMismatchException") {
                return {
                    statusCode: 400,
                    body: JSON.stringify('Invalid Code')
                }
            }
            //Una cuenta ya ha sido creada con este email
            if (error.name == "AliasExistsException") {
                return {
                    statusCode: 400,
                    body: JSON.stringify(error.message)
                }
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify('Email Confirmado')
        }

    }

    public async userLogin(username: string, password: string): Promise<APIGatewayProxyResult> {

        
/* 
        try {
            this.user = (await signIn({
                username,
                password,
                options: {
                    authFlowType: 'USER_PASSWORD_AUTH', 
                },
            })) as SignInOutput;

            if (this.user.nextStep.signInStep == 'CONFIRM_SIGN_UP') {
                return {
                    statusCode: 400,
                    body: JSON.stringify('Emails must be confirmed')
                }
            }

            const {idToken} = (await fetchAuthSession()).tokens ?? {};


            const {accessToken} = (await fetchAuthSession()).tokens ?? {};

            console.log('accesstoke: '+accessToken)
            const fetchResult = await fetchAuthSession();

            console.log(fetchAuthSession)
            

            const session = await getCurrentUser();

            console.log("idTOKEN" + idToken?.toString());
 */
          /*   try {
                const payload = await verifier.verify(
                    accessToken?.toString() // the JWT as string
                );
                console.log("Token is valid. Payload:", payload);
                console.log("Token is valid. Payload:", payload);
              } catch {
                console.log("Token not valid!");
              } */
            

  /*       } catch (error) {
            console.error(error);
            return {
                statusCode: 400,
                body: JSON.stringify(error.message)
            }
        } */

        return {
            statusCode: 200,
            body: JSON.stringify('token generado')
        }

    }

    public async postUserRefresh(): Promise<APIGatewayProxyResult> {



 /*        const { username, userId, signInDetails } = await getCurrentUser();

        console.log("username", username);
        console.log("user id", userId);
        console.log("sign-in details", signInDetails);

 */

        return {
            statusCode: 200,
            body: JSON.stringify('Pagina refrescada')
        }

    }

}