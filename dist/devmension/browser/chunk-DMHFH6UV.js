import{a as S,b as k}from"./chunk-7ZP25VSS.js";import{g as y}from"./chunk-OARA3AYC.js";import{Ja as C,La as c,Na as x,Pa as h,Sa as n,Ta as r,Ua as l,X as m,ab as s,bb as p,cb as w,fa as d,ga as g,hb as f,ua as v,xa as o}from"./chunk-BMN75HSZ.js";function b(e,u){let t=e.slice(0,u),a=t.lastIndexOf(" ");a>0&&(t=t.slice(0,a)),t=t.trim(),t=t.replace(/^\s+/gm,""),t=t.replace(/(\n){3,}/g,`

`);let i=t.split(`
`);return i.length-1>2&&(t=i[0]+`
`+i[1]+`
`+i[2]),t+"..."}function I(e,u){e&1&&l(0,"app-like-heart",5),e&2&&c("isFilled",!0)("color","text-orange")("size","size-6")}function T(e,u){e&1&&l(0,"app-like-heart",5),e&2&&c("isFilled",!1)("color","text-gray-heavy")("size","size-6")}var V=(()=>{class e{truncateDescription=b;postDate=S;post={username:"",postId:"",description:"",timeStamp:0,likesQuantity:0,commentsQuantity:0,imageUrl:""};isProfileView=!1;static \u0275fac=function(a){return new(a||e)};static \u0275cmp=m({type:e,selectors:[["app-post-card"]],inputs:{post:"post",isProfileView:"isProfileView"},standalone:!0,features:[f],decls:23,vars:10,consts:[[1,"flex","flex-col","items-center","w-full","p-2"],[1,"flex","flex-col","border","border-white","hover:border-gray-dark","bg-gray-medium","w-72","h-[30rem]","p-2","rounded-lg","shadow-lg","transition","ease-in-out","duration-300"],["alt","Logo",1,"w-72","h-72","object-cover","shadow-lg","rounded-lg",3,"src"],[1,"flex","mt-3","ml-2"],[1,"flex","gap-1"],[3,"isFilled","color","size"],[1,"text-gray-heavy"],[1,"flex","gap-1","ml-3"],["xmlns","http://www.w3.org/2000/svg","fill","none","viewBox","0 0 24 24","stroke-width","1","stroke","currentColor",1,"size-6","text-gray-hover"],["stroke-linecap","round","stroke-linejoin","round","d","M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"],[1,"flex","text-gray-heavy","pt-3","ml-2","max-w-64","h-24"],[1,"text-start","whitespace-pre-wrap","break-words","text-sm","font-normal","font-sans","max-w-60"],[1,"flex","justify-end","pr-5","w-full","pt-2"],[1,"text-sm","font-semibold","text-gray-hover"]],template:function(a,i){a&1&&(n(0,"div",0)(1,"div",1)(2,"div"),l(3,"img",2),r(),n(4,"div",3)(5,"div",4),C(6,I,1,3,"app-like-heart",5)(7,T,1,3,"app-like-heart",5),n(8,"p",6),s(9),r()(),n(10,"div",7),d(),n(11,"svg",8),l(12,"path",9),r(),g(),n(13,"p",6),s(14),r()()(),n(15,"div",10)(16,"pre",11)(17,"span"),s(18),r(),s(19),r()(),n(20,"div",12)(21,"p",13),s(22),r()()()()),a&2&&(o(3),c("src",i.post.imageUrl||"/sin-perfil.jpg",v),o(3),h(i.post.isLiked?6:7),o(3),p(i.post.likesQuantity),o(5),p(i.post.commentsQuantity),o(3),x("mr-2 font-semibold text-base text-gray-hover ",i.isProfileView?"hidden":"",""),o(),p(i.post.username),o(),p(i.truncateDescription(i.post.description,75)),o(3),w(" ",i.postDate(i.post.timeStamp)," Ago "))},dependencies:[y,k]})}return e})();var j=(()=>{class e{static \u0275fac=function(a){return new(a||e)};static \u0275cmp=m({type:e,selectors:[["app-loading-screen"]],standalone:!0,features:[f],decls:4,vars:0,consts:[[1,"fixed","flex","justify-center","pt-52","bg-black","h-dvh","w-full","transition","ease-in-out","duration-500","opacity-20"],["aria-hidden","true","viewBox","0 0 100 101","fill","none","xmlns","http://www.w3.org/2000/svg",1,"inline","w-10","h-10","text-gray-dark","animate-spin","dark:text-gray-600","fill-gray-heavy"],["d","M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z","fill","currentColor"],["d","M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z","fill","currentFill"]],template:function(a,i){a&1&&(n(0,"div",0),d(),n(1,"svg",1),l(2,"path",2)(3,"path",3),r()())}})}return e})();export{b as a,V as b,j as c};