import{a as ve}from"./chunk-SQDG4CWQ.js";import"./chunk-U2MVLE3G.js";import{a as G,b as X,c as A,d as Z,e as de,f as pe,g as K,h as ue,i as fe,j as ge,k as he,l as _e,m as Ce}from"./chunk-NQ4WZF53.js";import{a as R}from"./chunk-YMVYKCWO.js";import{a as V}from"./chunk-UU4EZ7QN.js";import{a as ae,c as me,d as T,e as E,f as ce,g as I}from"./chunk-OARA3AYC.js";import{Ba as M,Ib as re,Ja as f,La as u,Ma as j,Na as k,Ob as le,Pa as g,Pb as se,Qa as Q,Ra as Y,Rb as we,Sa as o,T as h,Ta as r,Tb as z,Ua as d,Ub as b,Va as y,Wa as s,X as w,Xa as p,ab as m,bb as O,cb as ee,da as _,db as te,ea as C,eb as ne,fa as S,fb as oe,ga as J,gb as H,hb as x,ib as U,jb as P,la as L,m as W,ma as q,oa as D,qb as ie,ua as B,x as $,xa as l,ya as v}from"./chunk-BMN75HSZ.js";import"./chunk-KAWQVD33.js";var xe=[{path:"user",loadChildren:()=>import("./chunk-S3XTDD5O.js")},{path:"post",loadChildren:()=>import("./chunk-BRUAVA2C.js")},{path:"",loadChildren:()=>import("./chunk-SYYJYCDR.js")}];var Se=(t,c)=>{let e=h(T);return c(t).pipe($(i=>Te(i,e)))};function Te(t,c){console.log(t.error);let e=t.error.type;return e=="EXPIRED_TOKEN"||e=="MISSING_TOKEN"||e=="INVALID_TOKEN"?(z(),window.location.reload(),W(()=>t.error.message)):W(()=>t)}var ye={providers:[ie({eventCoalescing:!0}),ce(xe),le(se([Se])),{provide:q,useFactory:()=>new q({shouldCoalesceEventChangeDetection:!0,shouldCoalesceRunChangeDetection:!0})}]};var Ie=(t,c)=>c.username,Ve=t=>["/user/profile",t];function Re(t,c){if(t&1){let e=y();o(0,"li")(1,"button",2),s("click",function(){_(e);let n=p(3);return C(n.onClickSearchResult())}),o(2,"div",3),d(3,"img",4),r(),o(4,"div",5)(5,"p",6),m(6),r(),o(7,"p",7),m(8),r()()()()}if(t&2){let e=p().$implicit;l(),u("routerLink",P(4,Ve,e.username)),l(2),u("src",e.photoUrl||"/sin-perfil.jpg",B),l(3),ee(" ",e.username," "),l(2),O(e.fullname)}}function je(t,c){if(t&1&&f(0,Re,9,6,"li"),t&2){let e=c.$implicit;g(e.username?0:-1)}}function Ue(t,c){if(t&1&&(o(0,"ul",0),Q(1,je,1,1,null,null,Ie),r()),t&2){let e=p();l(),Y(e.userList)}}function Ne(t,c){t&1&&(o(0,"small",1),m(1,"Not found"),r())}var Ee=(()=>{class t{renderer;el;router;constructor(e,i,n){this.renderer=e,this.el=i,this.router=n,this.renderer.listen("document","click",a=>{this.onDocumentClick(a)})}closeSearchList=!0;notFound=!1;closeSearchBarEmitter=new L;userList=[{username:"",fullname:"",photoUrl:""}];onClickSearchResult(){this.closeSearchBarEmitter.emit(!0)}onDocumentClick(e){this.el.nativeElement.contains(e.target)||this.closeSearchBarEmitter.emit(!1)}static \u0275fac=function(i){return new(i||t)(v(M),v(D),v(T))};static \u0275cmp=w({type:t,selectors:[["app-search-bar-drop-down"]],inputs:{closeSearchList:"closeSearchList",notFound:"notFound",userList:"userList"},outputs:{closeSearchBarEmitter:"closeSearchBarEmitter"},standalone:!0,features:[x],decls:2,vars:1,consts:[["id","results-list",1,"flex","flex-col","gap-3"],[1,"flex","w-full","justify-center","items-center","text-gray-heavy","h-14"],[1,"flex","w-full","shadow-md","pl-2","rounded-md","border-gray-medium","py-2","gap-1","md:gap-2",3,"click","routerLink"],[1,"flex","justify-center","items-center"],["alt","Logo",1,"w-10","h-10","md:w-14","md:h-14","rounded-full","object-cover","shadow-lg",3,"src"],[1,"flex","flex-col","items-start","pl-2","gap-0.5"],[1,"text-base","font-semibold","text-gray-heavy"],[1,"text-sm","text-gray-heavy"]],template:function(i,n){i&1&&f(0,Ue,3,0,"ul",0)(1,Ne,2,0,"small",1),i&2&&g(n.userList[0].username?0:n.notFound?1:-1)},dependencies:[I,E]})}return t})();var Be=()=>["/post/new-post"],be=(()=>{class t{route;constructor(e){this.route=e}static \u0275fac=function(i){return new(i||t)(v(T))};static \u0275cmp=w({type:t,selectors:[["app-floating-button"]],standalone:!0,features:[x],decls:4,vars:2,consts:[[1,"flex","w-6","h-6","mt-1","mr-1","sm:mt-1.5","lg:mt-2","lg:mr-10","sm:mr-4","sm:h-7","sm:w-7","lg:h-8","lg:w-8","justify-center","items-center","shadow-2xl","rounded-full"],[1,"flex","w-full","h-full","rounded-full","justify-center","items-center","border","text-4xl","transition","ease-in-out","duration-300","bg-gray-heavy","text-white","hover:bg-gray-light","hover:text-black",3,"routerLink"],["xmlns","http://www.w3.org/2000/svg","fill","bg-gray-light","viewBox","0 0 24 24","stroke-width","1.5","stroke","currentColor",1,"size-5"],["stroke-linecap","round","stroke-linejoin","round","d","M12 4.5v15m7.5-7.5h-15"]],template:function(i,n){i&1&&(o(0,"div",0)(1,"button",1),S(),o(2,"svg",2),d(3,"path",3),r()()()),i&2&&(l(),u("routerLink",U(1,Be)))},dependencies:[I,E]})}return t})();var Oe=t=>["/user/profile",t];function He(t,c){t&1&&d(0,"app-floating-button")}function Pe(t,c){if(t&1){let e=y();o(0,"div",4)(1,"div",7)(2,"p",8),m(3),r()(),o(4,"button",9),s("click",function(){_(e);let n=p();return C(n.onClickMenu())}),o(5,"div",10),d(6,"img",11),r()()()}if(t&2){let e=p();l(3),O(e.store.user().username),l(3),u("src",e.store.user().photoUrl||"/sin-perfil.jpg",B)}}function Ge(t,c){if(t&1){let e=y();o(0,"div",12)(1,"ul",13)(2,"li")(3,"button",14),s("click",function(){_(e);let n=p();return C(n.onClickMenuOptions(n.login))}),m(4," Log In "),r()(),o(5,"li")(6,"button",15),s("click",function(){_(e);let n=p();return C(n.onClickMenuOptions(n.signup))}),m(7," Sign Up "),r()()()()}if(t&2){let e=p();j("hidden",e.closeDropDownMenu)}}function Ae(t,c){if(t&1){let e=y();o(0,"div",16)(1,"ul",13)(2,"li")(3,"button",17),s("click",function(){_(e);let n=p();return C(n.onClickMenuOptions("profile"))}),m(4," My Profile "),r()(),o(5,"li")(6,"button",15),s("click",function(){_(e);let n=p();return C(n.onClickLogOut())}),m(7," Log Out "),r()()()()}if(t&2){let e=p();j("hidden",e.closeDropDownMenu),l(3),u("routerLink",P(3,Oe,e.store.user().username))}}var Fe=(()=>{class t{renderer;el;constructor(e,i){this.renderer=e,this.el=i,this.renderer.listen("document","click",n=>{this.onDocumentClick(n)})}closeDropDownMenu=!0;login=R.LOGIN;signup=R.SIGNUP;onClickMenu(){this.closeDropDownMenu=!this.closeDropDownMenu}onClickMenuEmitter=new L;onClickMenuOptions(e){this.closeDropDownMenu=!0,this.onClickMenuEmitter.emit(e)}onClickLogOut(){z(),this.store.removeUser(),this.closeDropDownMenu=!0,window.location.reload()}store=h(b);onDocumentClick(e){this.el.nativeElement.contains(e.target)||(this.closeDropDownMenu=!0)}static \u0275fac=function(i){return new(i||t)(v(M),v(D))};static \u0275cmp=w({type:t,selectors:[["app-drop-down-menu"]],outputs:{onClickMenuEmitter:"onClickMenuEmitter"},standalone:!0,features:[x],decls:8,vars:3,consts:[[1,"flex","mt-3","md:mr-10","mr-3","rounded-xl","p-1","w-full","justify-end"],[1,"flex","lg:hidden","backgroundHover","p-1","rounded-lg",3,"click"],["xmlns","http://www.w3.org/2000/svg","fill","none","viewBox","0 0 24 24","stroke-width","1.5","stroke","currentColor",1,"size-6","sm:size-8"],["stroke-linecap","round","stroke-linejoin","round","d","M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"],[1,"hidden","lg:flex"],[1,"dropdownProfile","flex","shadow-md","lg:hidden","flex-col","absolute","top-24","right-1","w-36","p-4","rounded-lg","bg-white","border","border-gray-light",3,"hidden"],[1,"dropdownProfile","flex","shadow-md","flex-col","absolute","top-24","right-1","lg:right-10","lg:top-28","w-36","p-4","rounded-lg","bg-white","border","border-gray-light",3,"hidden"],[1,"mt-3"],[1,"font-medium","text-gray-heavy"],[1,"sm:ml-2",3,"click"],[1,"flex","justify-center","items-center","w-8","h-8","sm:w-12","sm:h-12"],["alt","Profile",1,"w-8","h-8","sm:w-12","sm:h-12","rounded-full","object-cover",3,"src"],[1,"dropdownProfile","flex","shadow-md","lg:hidden","flex-col","absolute","top-24","right-1","w-36","p-4","rounded-lg","bg-white","border","border-gray-light"],[1,"flex","flex-col","gap-3"],["id","login",1,"font-bold","text-gray-heavy","text-sm",3,"click"],[1,"font-bold","text-gray-heavy","text-sm",3,"click"],[1,"dropdownProfile","flex","shadow-md","flex-col","absolute","top-24","right-1","lg:right-10","lg:top-28","w-36","p-4","rounded-lg","bg-white","border","border-gray-light"],[1,"font-bold","text-gray-heavy","text-sm",3,"click","routerLink"]],template:function(i,n){i&1&&(o(0,"div",0),f(1,He,1,0,"app-floating-button"),o(2,"button",1),s("click",function(){return n.onClickMenu()}),S(),o(3,"svg",2),d(4,"path",3),r()(),f(5,Pe,7,2,"div",4),r(),f(6,Ge,8,2,"div",5)(7,Ae,8,5,"div",6)),i&2&&(l(),g(n.store.user().username?1:-1),l(4),g(n.store.user().username?5:-1),l(),g(n.store.user().username?7:6))},dependencies:[I,E,be]})}return t})();function Ke(t,c){t&1&&(o(0,"small"),m(1,"*Invalid username"),r())}function ze(t,c){t&1&&(o(0,"small"),m(1,"*Invalid password"),r())}function We(t,c){t&1&&(S(),o(0,"svg",12),d(1,"path",16)(2,"path",17),r())}function qe(t,c){t&1&&m(0," Login ")}var Le=(()=>{class t{renderer;el;constructor(e,i){this.renderer=e,this.el=i,this.renderer.listen("document","click",n=>{this.onDocumentClick(n)})}closeFormEventEmitter=new L;closeLoginForm=!0;onDocumentClick(e){this.el.nativeElement.contains(e.target)||this.closeLoginForm||(this.form.reset(),this.errors.password=!1,this.errors.username=!1,this.closeFormEventEmitter.emit(!0))}openSignUpFormEventEmitter=new L;openSignUpForm(){this.form.reset(),this.errors.password=!1,this.errors.username=!1,this.openSignUpFormEventEmitter.emit(!0),this.closeFormEventEmitter.emit(!0)}fb=h(he);form=this.fb.group({username:this.fb.control("",{validators:[X.required]}),password:this.fb.control("",{validators:[X.required]})});errors={username:!1,password:!1};onKeyDown(){this.errors.username=!1,this.errors.password=!1}get username(){return this.form.get("username")}get password(){return this.form.get("password")}usersService=h(V);store=h(b);isLoading=!1;onSubmit(){!this.form.invalid&&!this.errors.username&&!this.errors.password&&(this.isLoading=!0,this.usersService.setLoginUser(this.form.getRawValue()).subscribe({next:e=>{this.form.reset(),this.isLoading=!1,console.log(e),e.jwt&&we(e.jwt),console.log("se va a guardar",e.user),this.store.setUser(e.user),window.location.reload(),this.closeFormEventEmitter.emit(!0)},error:e=>{e.error.type=="INVALID_USERNAME"&&(console.log(e.error.message),this.errors.username=!0),e.error.type=="INVALID_PASSWORD"&&(console.log(e.error.message),this.errors.password=!0),this.isLoading=!1}}))}static \u0275fac=function(i){return new(i||t)(v(M),v(D))};static \u0275cmp=w({type:t,selectors:[["app-login-form"]],inputs:{closeLoginForm:"closeLoginForm"},outputs:{closeFormEventEmitter:"closeFormEventEmitter",openSignUpFormEventEmitter:"openSignUpFormEventEmitter"},standalone:!0,features:[H([V]),x],decls:28,vars:8,consts:[[1,"fixed","flex","flex-row","justify-center","items-center","rounded-3xl","modal-login"],[1,"flex","flex-col","items-center","bg-white","w-full","h-full","rounded-2xl","px-10","md:px-16","lg:px-10","py-8","lg:py-14"],[1,"flex","w-full","justify-center","mb-1","sm:mb-5"],[1,"font-bold","text-3xl"],[1,"flex","flex-col","w-3/4","items-center","rounded-lg","justify-between","h-full","gap-3",3,"ngSubmit","formGroup"],[1,"flex","flex-col","w-full","pt-5","gap-2","md:gap-5","md:mb-3","mt-5","sm:mt-2"],[1,"relative","flex","flex-col","w-full"],[1,"form-label"],["type","text","formControlName","username","placeholder","Username",1,"form-input","py-4",3,"keydown"],[1,"h-5","text-orange","mt-1"],["type","password","formControlName","password","placeholder","Passowrd",1,"form-input",3,"keydown"],["type","submit",1,"true",3,"disabled"],["aria-hidden","true","viewBox","0 0 100 101","fill","none","xmlns","http://www.w3.org/2000/svg",1,"inline","w-4","h-4","text-gray-dark","animate-spin","dark:text-gray-600","fill-gray-heavy"],[1,"text-xs","sm:text-sm","sm:flex","gap-2","mt-2","text-gray-heavy"],[1,"border-b","border-gray-medium","hover:border-gray-dark",3,"click"],[1,"font-semibold"],["d","M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z","fill","currentColor"],["d","M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z","fill","currentFill"]],template:function(i,n){i&1&&(o(0,"div",0)(1,"div",1)(2,"div",2)(3,"p",3),m(4,"Log In"),r()(),o(5,"form",4),s("ngSubmit",function(){return n.onSubmit()}),o(6,"div",5)(7,"div",6)(8,"label",7),m(9,"USERNAME"),r(),o(10,"input",8),s("keydown",function(){return n.onKeyDown()}),r(),o(11,"div",9),f(12,Ke,2,0,"small"),r()(),o(13,"div",6)(14,"label",7),m(15,"PASSWORD"),r(),o(16,"input",10),s("keydown",function(){return n.onKeyDown()}),r(),o(17,"div",9),f(18,ze,2,0,"small"),r()()(),o(19,"button",11),f(20,We,3,0,":svg:svg",12)(21,qe,1,0),r(),o(22,"div",13)(23,"p"),m(24,"Not a member yet?"),r(),o(25,"button",14),s("click",function(){return n.openSignUpForm()}),o(26,"p",15),m(27,"Register now"),r()()()()()()),i&2&&(l(5),u("formGroup",n.form),l(7),g(n.errors.username?12:-1),l(6),g(n.errors.password?18:-1),l(),k("button-full py-2 w-full ",n.form.invalid||n.isLoading||n.errors.password||n.errors.username?"hover:bg-black":"",""),u("disabled",n.form.invalid||n.isLoading||n.errors.password||n.errors.username),l(),g(n.isLoading?20:21))},dependencies:[Ce,K,G,A,Z,ue,fe,re]})}return t})();var Xe=()=>["/"],$e=()=>({standalone:!0});function Je(t,c){t&1&&(o(0,"div",9),S(),o(1,"svg",15),d(2,"path",16)(3,"path",17),r()())}function Qe(t,c){if(t&1){let e=y();o(0,"div",18)(1,"button",19),s("click",function(){_(e);let n=p(2);return C(n.openLoginForm())}),m(2," Log In "),r(),o(3,"button",19),s("click",function(){_(e);let n=p(2);return C(n.openSignForm())}),m(4," Sign Up "),r()(),o(5,"app-drop-down-menu",20),s("onClickMenuEmitter",function(n){_(e);let a=p(2);return C(a.onClickMenu(n))}),r()}}function Ye(t,c){if(t&1){let e=y();o(0,"app-drop-down-menu",21),s("onClickMenuEmitter",function(n){_(e);let a=p(2);return C(a.onClickMenu(n))}),r()}}function et(t,c){if(t&1&&f(0,Qe,6,0)(1,Ye,1,0,"app-drop-down-menu"),t&2){let e=p();g(e.store.user().username?1:0)}}var De=(()=>{class t{closeSignForm=!0;openSignForm(){this.closeSignForm=!1}onClickOut(){this.closeSignForm=!0}closeLoginForm=!0;openLoginForm(){this.closeLoginForm=!1}onClickOutLoginForm(){this.closeLoginForm=!0}login=R.LOGIN;signup=R.SIGNUP;onClickMenu(e){e==this.login&&(this.closeLoginForm=!1),e==this.signup&&(this.closeSignForm=!1)}store=h(b);closeSearchList=!0;onSearchList(e){e.type=="keydown"&&(e.key=="Escape"?this.closeSearchList=!0:this.closeSearchList=!1)}onClickSearchList(e){e&&(this.searchTerm=""),this.closeSearchList=!0,this.notFound=!1}searchTerm="";timeoutId;notFound=!1;isLoading=!1;usersService=h(V);userList=[{username:"",fullname:"",photoUrl:""}];onSearchInput(){clearTimeout(this.timeoutId),this.timeoutId=setTimeout(()=>{this.userList=[{username:"",fullname:"",photoUrl:""}],this.notFound=!1;let e=/[^\w\s.]/,n=this.searchTerm.trim().replace(/\s+/g," ").toLowerCase().trim().replace(/\s+/g,".");n?e.test(n)?this.notFound=!0:(this.isLoading=!0,this.usersService.getUserList(n).subscribe({next:a=>{a.users.length?this.userList=a.users:this.notFound=!0,this.isLoading=!1},error:a=>{this.notFound=!0,this.isLoading=!1}})):this.closeSearchList=!0},500)}static \u0275fac=function(i){return new(i||t)};static \u0275cmp=w({type:t,selectors:[["app-header"]],standalone:!0,features:[H([V]),x],decls:19,vars:29,consts:[[1,"fixed","flex","flex-row","h-28","w-full","rounded-md","items-center","justify-between"],[1,"sm:ml-5","mt-3","ml-3","cursor-pointer",3,"routerLink"],["src","/divmension_logo.png","alt","Logo",1,"w-28","sm:w-40","h-auto"],[1,"w-3/4","mx-3","mt-3"],[1,"max-w-md","mx-auto"],[1,"relative"],[1,"absolute","inset-y-0","start-0","flex","items-center","ps-3","pointer-events-none"],["aria-hidden","true","xmlns","http://www.w3.org/2000/svg","fill","none","viewBox","0 0 20 20",1,"w-4","h-4","text-gray-heavy","dark:text-gray-400"],["stroke","currentColor","stroke-linecap","round","stroke-linejoin","round","stroke-width","2","d","m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"],[1,"absolute","inset-y-0","end-3","flex","items-center","pointer-events-none"],["type","text","id","default-search","placeholder","Search friends ...","required","",1,"transition","ease-in-out","duration-300","block","w-full","min-w-40","h-9","sm:h-10","p-3","ps-10","pe-10","shadow-sm","text-sm","sm:text-md","text-gray-heavy","outline-none","border-gray-medium","rounded-lg","searchbar-input","placeholder-gray-heavy","ring-gray-light","focus:placeholder-gray-medium","bg-gray-medium","focus:ring-gray-light","focus:border-gray-light","focus:bg-white","dark:bg-gray-light","dark:border-gray-medium","dark:placeholder-gray-medium","dark:text-white","dark:focus:ring-blue-500","dark:focus:border-blue-500",3,"keydown","input","ngModelChange","ngModelOptions","ngModel"],[1,"flex","flex-col","text-md","absolute","w-full","mt-1","bg-white","rounded-lg","shadow-lg","min-h-28","max-h-48","overflow-y-auto","p-4"],[3,"closeSearchBarEmitter","closeSearchList","notFound","userList"],[3,"closeSignUpFormEventEmitter","openLoginFormEventEmitter","closeSignForm"],[3,"closeFormEventEmitter","openSignUpFormEventEmitter","closeLoginForm"],["aria-hidden","true","viewBox","0 0 100 101","fill","none","xmlns","http://www.w3.org/2000/svg",1,"inline","w-4","h-4","text-gray-dark","animate-spin","dark:text-gray-600","fill-gray-heavy"],["d","M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z","fill","currentColor"],["d","M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z","fill","currentFill"],[1,"hidden","lg:flex","gap-4"],[1,"font-bold","text-black","hidden","sm:block","hover:text-gray-heavy",3,"click"],[1,"lg:hidden",3,"onClickMenuEmitter"],[3,"onClickMenuEmitter"]],template:function(i,n){i&1&&(o(0,"div",0)(1,"div",1),d(2,"img",2),r(),o(3,"div",3)(4,"form",4)(5,"div",5)(6,"div",6),S(),o(7,"svg",7),d(8,"path",8),r()(),f(9,Je,4,0,"div",9),J(),o(10,"input",10),s("keydown",function(F){return n.onSearchList(F)})("input",function(){return n.onSearchInput()}),oe("ngModelChange",function(F){return ne(n.searchTerm,F)||(n.searchTerm=F),F}),r(),o(11,"div",11)(12,"app-search-bar-drop-down",12),s("closeSearchBarEmitter",function(F){return n.onClickSearchList(F)}),r()()()()(),o(13,"div"),f(14,et,2,1),r()(),d(15,"div"),o(16,"app-register-form",13),s("closeSignUpFormEventEmitter",function(){return n.onClickOut()})("openLoginFormEventEmitter",function(){return n.openLoginForm()}),r(),d(17,"div"),o(18,"app-login-form",14),s("closeFormEventEmitter",function(){return n.onClickOutLoginForm()})("openSignUpFormEventEmitter",function(){return n.openSignForm()}),r()),i&2&&(l(),u("routerLink",U(27,Xe)),l(8),g(n.isLoading?9:-1),l(),u("ngModelOptions",U(28,$e)),te("ngModel",n.searchTerm),l(),j("hidden",n.closeSearchList),l(),u("closeSearchList",n.closeSearchList)("notFound",n.notFound)("userList",n.userList),l(),k("flex justify-end gap-4 mr-2 md:mr-10 ",n.store.user().username?"w-2/12":"w-1/12"," lg:w-2/12"),l(),g(n.store.isLoading()?-1:14),l(),k("fixed bg-black h-dvh w-full transition ease-in-out duration-500 ",n.closeSignForm?"opacity-0 invisible":"opacity-50 visible",""),l(),k("transition ease-in-out duration-1000 ",n.closeSignForm?"opacity-0 invisible":"opacity-100 visible",""),u("closeSignForm",n.closeSignForm),l(),k("fixed bg-black h-dvh w-full transition ease-in-out duration-500 ",n.closeLoginForm?"opacity-0 invisible":"opacity-50 visible",""),l(),k("transition ease-in-out duration-1000 ",n.closeLoginForm?"opacity-0 invisible":"opacity-100 visible",""),u("closeLoginForm",n.closeLoginForm))},dependencies:[_e,K,G,A,Z,ge,pe,de,E,Ee,Fe,ve,Le]})}return t})();var Me=(()=>{class t{store=h(b);static \u0275fac=function(i){return new(i||t)};static \u0275cmp=w({type:t,selectors:[["app-root"]],standalone:!0,features:[x],decls:4,vars:0,consts:[[1,"fixed","flex","flex-col","bg-gray-light","w-full"],[1,"flex","w-full"],[1,"pt-28"]],template:function(i,n){i&1&&(o(0,"div",0),d(1,"app-header",1),o(2,"main",2),d(3,"router-outlet"),r()())},dependencies:[me,De]})}return t})();ae(Me,ye).catch(t=>console.error(t));