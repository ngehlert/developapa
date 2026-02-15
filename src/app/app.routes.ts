import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, Routes } from '@angular/router';
import { inject } from '@angular/core';

export const routes: Routes = [
    {
        path: 'privacy-policy',
        loadComponent: () => import('./privacy-policy.component').then(m => m.PrivacyPolicyComponent),
    },
    {
        path: 'terms',
        loadComponent: () => import('./terms.component').then(m => m.TermsOfUseComponent),
    },
    {
        path: 'impressum',
        loadComponent: () => import('./impressum.component').then(m => m.ImpressumComponent),
    },
    {
        path: 'blog',
        loadComponent: () => import('./blog-list/blog-list.component').then(m => m.BlogListComponent),
    },
    {
        path: 'portfolio',
        loadComponent: () => import('./portfolio/portfolio.component').then(m => m.PortfolioComponent),
    },
    {
        path: 'kurve',
        loadComponent: () => import('./portfolio/kurve.component').then(m => m.KurveComponent),
    },
    {
        path: 'boardgame-tracker',
        loadComponent: () => import('./boardgame-tracker/layout.component').then(m => m.BoardgameLayoutComponent),
        children: [
            {
                path: 'stats',
                loadComponent: () => import('./boardgame-tracker/stats/stats.component').then(m => m.StatsComponent),
            },
            {
                path: 'main',
                loadComponent: () => import('./boardgame-tracker/main/main.component').then(m => m.MainComponent),
            },
            {
                path: 'admin',
                loadComponent: () => import('./boardgame-tracker/admin/admin.component').then(m => m.AdminComponent),
            },
        ],
    },
    {
        path: 'blog/:slug',
        loadComponent: () => import('./blog-post/blog-post.component').then(m => m.BlogPostComponent),
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
        ],
    },
];
