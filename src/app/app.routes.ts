import { Routes } from '@angular/router';
import { BlogListComponent } from './blog-list/blog-list.component';
import { BlogPostComponent } from './blog-post/blog-post.component';

export const routes: Routes = [
    {
        path: 'blog',
        component: BlogListComponent,
        // Title set in component for consistency
    },
    {
        path: 'blog/:slug',
        component: BlogPostComponent,
        // Title and Meta set dynamically in component
    },
    {
        path: '',
        redirectTo: '/blog', // Redirect base path to the blog list
        pathMatch: 'full',
    },
    {
        path: '**', // Wildcard route for a 404 page or redirect
        redirectTo: '/blog', // Or create a dedicated NotFoundComponent
        // component: NotFoundComponent
    },
];
