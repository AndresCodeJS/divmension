import {Routes } from '@angular/router'

export default [
    {
        path: '',
        loadComponent: () => import('../home-view/home-view.component')  
    }
] as Routes