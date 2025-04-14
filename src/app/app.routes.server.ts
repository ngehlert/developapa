import { RenderMode, ServerRoute } from '@angular/ssr';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PostMetadata } from './commons/post';

export const serverRoutes: ServerRoute[] = [
    {
        path: 'blog',
        renderMode: RenderMode.Prerender,
    },
    {
        path: 'blog/:slug',
        renderMode: RenderMode.Prerender,
        async getPrerenderParams(): Promise<Array<Record<string, string>>> {
            const postsJsonRelativePath = 'assets/blog-data/posts.json';
            const postsJson: Array<PostMetadata> = (await firstValueFrom(
                inject(HttpClient).get(postsJsonRelativePath),
            )) as any as Array<PostMetadata>;

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
