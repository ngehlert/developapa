import { RenderMode, ServerRoute } from '@angular/ssr';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PostMetadata } from './commons/post';

export const serverRoutes: ServerRoute[] = [
    {
        path: 'privacy-policy',
        renderMode: RenderMode.Prerender,
    },
    {
        path: 'terms',
        renderMode: RenderMode.Prerender,
    },
    {
        path: 'impressum',
        renderMode: RenderMode.Prerender,
    },
    {
        path: 'blog',
        renderMode: RenderMode.Prerender,
    },
    {
        path: 'portfolio',
        renderMode: RenderMode.Prerender,
    },
    {
        path: 'kurve',
        renderMode: RenderMode.Client,
    },
    {
        path: 'boardgame-tracker/stats',
        renderMode: RenderMode.Client,
    },
    {
        path: 'boardgame-tracker/main',
        renderMode: RenderMode.Client,
    },
    {
        path: 'boardgame-tracker/admin',
        renderMode: RenderMode.Client,
    },
    {
        path: 'blog/:slug',
        renderMode: RenderMode.Prerender,
        async getPrerenderParams(): Promise<Array<Record<string, string>>> {
            const postsJsonRelativePath = 'assets/blog-data/posts.json';
            const postsJson = await firstValueFrom(
                inject(HttpClient).get<Array<PostMetadata>>(postsJsonRelativePath),
            );

            return postsJson.map((post: PostMetadata) => {
                return { slug: post.slug };
            });
        },
    },
    {
        path: ':slug',
        renderMode: RenderMode.Client,
    },
    {
        path: '**',
        renderMode: RenderMode.Prerender,
    },
];
