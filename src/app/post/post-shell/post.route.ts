import {Routes } from '@angular/router'

export default [
    {
        path: 'new-post',
        loadComponent: () => import('../new-post-form/new-post-form.component')  
    },
    {
        path: ':username/:postId',
        loadComponent: () => import('../post-view/post-view.component')  
    },

] as Routes