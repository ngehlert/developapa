import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes } from '@angular/router';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogPostComponent } from './blog-post/blog-post.component';
import { inject, Type } from '@angular/core';
import { PortfolioComponent } from './portfolio/portfolio.component';
import { KurveComponent } from './portfolio/kurve.component';
import { PrivacyPolicyComponent } from './privacy-policy.component';
import { TermsOfUseComponent } from './terms.component';
import { ImpressumComponent } from './impressum.component';

export const routes: Routes = [
    {
        path: 'privacy-policy',
        component: PrivacyPolicyComponent,
    },
    {
        path: 'terms',
        component: TermsOfUseComponent,
    },
    {
        path: 'impressum',
        component: ImpressumComponent,
    },
    {
        path: 'blog',
        component: BlogListComponent,
    },
    {
        path: 'portfolio',
        component: PortfolioComponent,
    },
    {
        path: 'kurve',
        component: KurveComponent,
    },
    {
        path: 'boardgame-tracker',
        children: [
            {
                path: 'stats',
                loadComponent: () => import('./boardgame-tracker/stats/stats.component')
                    .then((module: {StatsComponent: Type<unknown>}) => module.StatsComponent),
            },
            {
                path: 'main',
                loadComponent: () => import('./boardgame-tracker/main/main.component')
                    .then((module: {MainComponent: Type<unknown>}) => module.MainComponent),
            },
            {
                path: 'admin',
                loadComponent: () => import('./boardgame-tracker/admin/admin.component')
                    .then((module: {AdminComponent: Type<unknown>}) => module.AdminComponent),
            },
        ],
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
