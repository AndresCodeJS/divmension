import {Routes } from '@angular/router'

export default [
    {
        path: 'signup',
        loadComponent: () => import('../register-form/register-form.component')
    },
    {
        path: 'profile/:username',
        loadComponent: () => import('../profile/profile.component')  
    }
] as Routes