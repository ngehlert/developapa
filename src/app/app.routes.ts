import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes } from '@angular/router';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogPostComponent } from './blog-post/blog-post.component';
import { inject } from '@angular/core';

export const routes: Routes = [
    {
        path: 'blog',
        component: BlogListComponent,
    },
    {
        path: 'blog/:slug',
        component: BlogPostComponent,
    },
    {
        path: '',
        redirectTo: '/blog',
        pathMatch: 'full',
    },
    {
        path: ':slug',
        children: [],
        canActivate: [
            (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
                void inject(Router).navigate([`/blog/${route.params['slug']}`]);
                return false;
            },
        ]
    },
];
