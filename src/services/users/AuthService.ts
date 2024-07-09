import { SignInOutput, signIn, signUp, confirmSignUp, fetchAuthSession, getCurrentUser } from '@aws-amplify/auth';
import { Amplify } from 'aws-amplify';
import { APIGatewayProxyResult } from 'aws-lambda';



const awsRegion = 'us-east-1';

Amplify.configure({
    Auth: {

        Cognito: {
            /* identityPoolId: AuthStack.SpacesIdentityPoolRef, */
            userPoolId: 'us-east-1_mpg0eLEJv',
            userPoolClientId: '57mevbeo39m34fma4fvsj4tg9m',
        },
    },
});


export class AuthService {

    private user: SignInOutput | undefined;

    public async createUser(username: string, name: string, password: string, email: string): Promise<APIGatewayProxyResult> {

        try {

            const { isSignUpComplete, userId, nextStep } = await signUp({
                username: username,
                password: password,
                options: {
                    userAttributes: {
                        email: email,
                        name: name
                    },
                }
            });


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

            const { isSignUpComplete, nextStep } = await confirmSignUp({
                username,
                confirmationCode
            });
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

        let session;

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

            const { idToken } = (await fetchAuthSession()).tokens ?? {};
 
            console.log(idToken?.toString());

        } catch (error) {
            console.error(error);
            return {
                statusCode: 400,
                body: JSON.stringify(error.message)
            }
        }

        return {
            statusCode: 200,
            body: JSON.stringify('token generado')
        }

    }

    public async postUserRefresh(): Promise<APIGatewayProxyResult> {



        const { username, userId, signInDetails } = await getCurrentUser();

        console.log("username", username);
        console.log("user id", userId);
        console.log("sign-in details", signInDetails);



        return {
            statusCode: 200,
            body: JSON.stringify('Pagina refrescada')
        }

    }

}