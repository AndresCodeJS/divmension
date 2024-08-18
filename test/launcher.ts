import { Authorization } from "aws-cdk-lib/aws-events";
import { handler } from "../src/services/places/handler";
import { handler as userHandler } from "../src/services/users/handler";

// Post Test
/* handler({
    httpMethod: 'POST',
    body: JSON.stringify({
        locationz:'Costa Rica'
    })
} as any,{} as any).then(result => {
    console.log(result)
})  */

//Obtener todos los registros 
/* handler({
    httpMethod: 'GET',
} as any,{} as any)
 */
//Obtener registro por ID
/* handler({
    httpMethod: 'GET',
    queryStringParameters : {
        id: "1f6468a6-d05d-415f-8453-9abccd0b1b80"
    }
} as any,{} as any) */

//1f6468a6-d05d-415f-8453-9abccd0b1b80

//Actualizar un registro
/* handler({
    httpMethod: 'PUT',
    queryStringParameters : {
        id: "1f6468a6-d05d-415f-8453-9abccd0b1b80"
    },
    body: JSON.stringify({
        location:'Costa Rica 3',
    })
} as any,{} as any).then(result=>{
    console.log(result)
}) */

//Borrar un registro
/* handler({
    httpMethod: 'DELETE',
    queryStringParameters: {
        id: "48100a6e-33cf-4a14-99fe-a30a724075c5"
    }
} as any, {} as any).then(result => {
    console.log(result)
}) */


//###############################################################

//Crear un usuario
/* userHandler({
    httpMethod: 'POST',
    path:'/users/create',
    body: JSON.stringify({
        name: 'Andres',
        email:'aagm2661991@gmail.com',
        username: 'shotsand6',
        password: '1234567'
    })
} as any,{} as any).then(result=>{
    console.log(result)
}) */

//Confirmar usuario
/* userHandler({
    httpMethod: 'POST',
    path:'/users/emailcode',
    body: JSON.stringify({
        username: 'shotsand6',
        emailCode: '046887'
    })
} as any,{} as any).then(result=>{
    console.log(result)
}) */


//Creacion de Usuario Divmension
userHandler({
    httpMethod: 'POST',
    path:'/users/create',
    body: JSON.stringify({
        username: "Juan",
        email: "Juan91@gmail.com",
        fullname: "Carlos Arevalo",
        password: "1234567*"
    })
} as any,{} as any).then(result=>{
    console.log(result)
})


//Login de usuario divmension
/* userHandler({
    httpMethod: 'POST',
    path:'/users/login',
    body: JSON.stringify({
        username: "Carlos",
        password: "1234567*"
    })
} as any,{} as any).then(result=>{
    console.log(result)
}) */



//Refrescar pagina
/* userHandler({
    httpMethod: 'GET',
    path:'/users/refresh-page',
    headers: {authorization:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImNhcmxvcyIsImZ1bGxuYW1lIjoiY2FybG9zIGFyZXZhbG8iLCJlbWFpbCI6ImNhcmxvczkxQGdtYWlsLmNvbSIsImlhdCI6MTcyMzkyODIyMSwiZXhwIjoxNzIzOTcxNDIxfQ.F5IVpRT1gJmRoEMUw9EEi7zx9YlOD5sgD_r1q5D7Pt4"}
} as any,{} as any).then(result=>{
    console.log(result)
}) */
