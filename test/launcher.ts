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
        username: 'shotsand6',placeEn
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
        username: "andres",
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

// OBTENER PERFIL USUARIO
/* userHandler({
    httpMethod: 'GET',
    path:'/users/profile/',
    headers: {Authorization:'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFuZHJlcyIsImZ1bGxuYW1lIjoiYW5kcmVzIGdvbWV6IiwiZW1haWwiOiJhbmRyZXNAZ21haWwuY29tIiwiaWF0IjoxNzI1ODkxNzYxLCJleHAiOjE3MjU5MzQ5NjF9.Ps_dj7W3Pp8a_FgQadeuNteJLmWUiFXAJTdWzU5Mx14'},
    pathParameters:{username: 'andres'}
} as any,{} as any).then(result=>{
    console.log(result)
}) */

// OBTERNER LOS POSTS DE UN USUARIO USANDO PAGINACION
/* userHandler({
    httpMethod: 'GET',
    path:'/posts/user/',
    headers: {Authorization:null},
    pathParameters:{pkParam: 'andres', skParam: '01J6QXK2D1YK68VNRHV2G3T38M'}
} as any,{} as any).then(result=>{
    console.log(result)
})*/

//OBTENER UN POST POR ID
/* userHandler({
    httpMethod: 'GET',
    path:'/posts/details/',
    headers: {Authorization:null},
    pathParameters:{username: 'andres', postId: '01J6QXK2D1YK68VNRHV2G3T38M'}
} as any,{} as any).then(result=>{
    console.log(result)
}) */

    //OBTENER COMENTARIOS POR POST
    userHandler({
    httpMethod: 'GET',
    path:'/posts/comments-list/',
    headers: {Authorization:null},
    pathParameters:{pkParam: '01J774YBJ3XPXM2WCKKBEDC1VJ', skParam: '01J7EN05BH4RAJ7F3JV7QQT8GF'}
} as any,{} as any).then(result=>{
    console.log(result)
})

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

//DAR LIKE A UN POST
/* userHandler(
  {
    httpMethod: "POST",
    path: "/posts/like",
    headers: {
      Authorization:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFuZHJlcyIsImZ1bGxuYW1lIjoiYW5kcmVzIGdvbWV6IiwiZW1haWwiOiJhbmRyZXNAZ21haWwuY29tIiwiaWF0IjoxNzI1ODkxNzYxLCJleHAiOjE3MjU5MzQ5NjF9.Ps_dj7W3Pp8a_FgQadeuNteJLmWUiFXAJTdWzU5Mx14",
    },
    body: JSON.stringify({
      postId: "01J774YBJ3XPXM2WCKKBEDC1VJ",
    }),
  } as any,
  {} as any
).then((result) => {
  console.log(result);
}); */

//QUITAR LIKE A UN POST
/* userHandler(
    {
      httpMethod: "POST",
      path: "/posts/unlike",
      headers: {
        Authorization:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFuZHJlcyIsImZ1bGxuYW1lIjoiYW5kcmVzIGdvbWV6IiwiZW1haWwiOiJhbmRyZXNAZ21haWwuY29tIiwiaWF0IjoxNzI1OTA2OTE4LCJleHAiOjE3MjU5NTAxMTh9.WgnsMRdj_agaHxHv4x5XkFf1csTIfppht3p9WNfPZBQ",
      },
      body: JSON.stringify({
        postId: "01J774YBJ3XPXM2WCKKBEDC1VJ",
      }),
    } as any,
    {} as any
  ).then((result) => {
    console.log(result);
  });
 */
  //REALIZAR COMENTARIO A POST
 /*  userHandler(
    {
      httpMethod: "POST",
      path: "/posts/comment",
      headers: {
        Authorization:
          "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImRhdmlkIiwiZnVsbG5hbWUiOiJkYXZpZCBzbmFjaGV6IiwiZW1haWwiOiJkYXZpZEBnbWFpbC5jb20iLCJpYXQiOjE3MjU5ODUzMDAsImV4cCI6MTcyNjAyODUwMH0.hlKDk6brcCmCe5d7P4Ul5A8ptAU3MGOik1F5aa2CGpw",
      },
      body: JSON.stringify({
        postId: "01J774YBJ3XPXM2WCKKBEDC1VJ",
        content: "Que buena foto de perfil"
      }),
    } as any,
    {} as any
  ).then((result) => {
    console.log(result);
  }); */



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

/* userHandler({
    httpMethod: 'POST',
    path:'/users/profile-photo',
    headers: {Authorization:"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFuZHJlcyIsImZ1bGxuYW1lIjoiYW5kcmVzIGdvbWV6IiwiZW1haWwiOiJhbmRyZXMxQGdtYWlsLmNvbSIsImlhdCI6MTcyNDU1NDU1MiwiZXhwIjoxNzI0NTk3NzUyfQ.U__kqE8dvKgYAAzzyyw9NUZx3E-IVcEOvyJnNEjpfXs"},
    body: JSON.stringify({
        photoUrl: 'https://divmension-12e561930bc7.s3.amazonaws.com/juan/profile/1724863730074-wire_side.PNG'
    })

} as any,{} as any).then(result=>{
    console.log(result)
})
 */

// CREACON POSTS
/* userHandler({
    httpMethod: 'POST',
    path:'/posts/create',
    headers: {Authorization:"eJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFuZHJlcyIsImZ1bGxuYW1lIjoiYW5kcmVzIGdvbWV6IiwiZW1haWwiOiJhbmRyZXNAZ21haWwuY29tIiwiaWF0IjoxNzI1MjE4NzIyLCJleHAiOjE3MjUyNjE5MjJ9.yNKOcgAbRk_9_lyH1Q5Zd790qo2V-Tc8dHFwEeGIRn4"},
    body: JSON.stringify({
        
        description: ' esta es la desc 3',
        imageUrl: 'https://divmension-12e561930bc7.s3.amazonaws.com/juan/profile/1724863730074-wire_side.PNG',
    })

} as any,{} as any).then(result=>{
    console.log(result)
})
 */
