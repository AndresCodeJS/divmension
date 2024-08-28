import { Authorization } from "aws-cdk-lib/aws-events";
import { handler as userHandler } from "../src/services/users/handler";
import { unfollowUser } from "../src/services/users/UnfollowUser";

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
/* userHandler({
    httpMethod: 'POST',
    path:'/users/create',
    body: JSON.stringify({
        username: "david",
        email: "david@gmail.com",
        fullname: "David Sanchez",
        password: "1234567*"
    })
} as any,{} as any).then(result=>{
    console.log(result)
})
 */

//Login de usuario divmension
/* userHandler({
    httpMethod: 'POST',
    path:'/users/login',
    body: JSON.stringify({
        username: "gomez12",
        password: "1234567*"
    })
} as any,{} as any).then(result=>{
    console.log(result)
}) */



//Refrescar pagina
/* userHandler({
    httpMethod: 'GET',
    path:'/users/refresh-page',
    headers: {Authorization:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImdvbWV6MTIiLCJmdWxsbmFtZSI6ImFuZHJlcyBnb21leiIsImVtYWlsIjoiZ29tZTMzekBnbWFpbC5jb20iLCJpYXQiOjE3MjQwMzE3NjcsImV4cCI6MTcyNDA3NDk2N30.z1FmRU9p6-mrGvfDImy2qkHP0e7E-K2oK6WNcURzYUQ"}
} as any,{} as any).then(result=>{
    console.log(result)
}) */

//Busqueda de usuarios
/* userHandler({
    httpMethod: 'GET',
    path:'/users/search/mistring',
    pathParameters:{userString:'andres gomez'}
} as any,{} as any).then(result=>{
    console.log(result)
}) */

// Obtener informacion de un usuario
/* userHandler({
    httpMethod: 'GET',
    path:'/users/profile/',
    headers: {Authorization:null},
    pathParameters:{username: 'juan'}
} as any,{} as any).then(result=>{
    console.log(result)
}) */

//Seguir a un usuario
/* userHandler({
    httpMethod: 'POST',
    path:'/users/follow',
    headers: {Authorization:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFuZHJlcyIsImZ1bGxuYW1lIjoiYW5kcmVzIGdvbWV6IiwiZW1haWwiOiJhbmRyZXMxQGdtYWlsLmNvbSIsImlhdCI6MTcyNDUyOTM0OSwiZXhwIjoxNzI0NTcyNTQ5fQ.n-auQGS7tnDUXVIMnZwdYoH3WndVjBctIdmOiplfNSs"},
    body: JSON.stringify({
        followingUser: 'andres'
    })

} as any,{} as any).then(result=>{
    console.log(result)
}) */


//Dejar de seguir a un usuario
/* userHandler({
    httpMethod: 'POST',
    path:'/users/unfollow',
    headers: {Authorization:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFuZHJlcyIsImZ1bGxuYW1lIjoiYW5kcmVzIGdvbWV6IiwiZW1haWwiOiJhbmRyZXMxQGdtYWlsLmNvbSIsImlhdCI6MTcyNDUyOTM0OSwiZXhwIjoxNzI0NTcyNTQ5fQ.n-auQGS7tnDUXVIMnZwdYoH3WndVjBctIdmOiplfNSs"},
    body: JSON.stringify({
        unfollowUser: 'david'
    })

} as any,{} as any).then(result=>{
    console.log(result)
}) */

//Obtener credenciales 
/* userHandler({
httpMethod: 'GET',
path:'/users/s3-credentials',
headers: {Authorization:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFuZHJlcyIsImZ1bGxuYW1lIjoiYW5kcmVzIGdvbWV6IiwiZW1haWwiOiJhbmRyZXMxQGdtYWlsLmNvbSIsImlhdCI6MTcyNDc3MDc0MSwiZXhwIjoxNzI0ODEzOTQxfQ.2M3FvyCGi6kAwgrEJR-DWOtt6DfsQ4qbpCCbLDhB4OQ"},
} as any,{} as any).then(result=>{
console.log(result)
}) 
 */

//Actualizar foto de perfil

userHandler({
    httpMethod: 'POST',
    path:'/users/profile-photo',
    headers: {Authorization:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFuZHJlcyIsImZ1bGxuYW1lIjoiYW5kcmVzIGdvbWV6IiwiZW1haWwiOiJhbmRyZXNAZ21haWwuY29tIiwiaWF0IjoxNzI0ODY5MTc0LCJleHAiOjE3MjQ5MTIzNzR9.LnFwU9fx9HLjBYWvfix5m8VjVpG8wJIUi05iwCiJ8o0"},
    body: JSON.stringify({
        photoUrl: 'https://divmension-12e561930bc7.s3.amazonaws.com/juan/profile/1724863730074-wire_side.PNG'
    })

} as any,{} as any).then(result=>{
    console.log(result)
})
