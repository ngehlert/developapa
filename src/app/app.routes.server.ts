import { RenderMode, ServerRoute } from '@angular/ssr';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

export const serverRoutes: ServerRoute[] = [
    {
        path: 'blog/:slug',
        renderMode: RenderMode.Prerender,
        async getPrerenderParams(): Promise<Array<Record<string, string>>> {
            const postsJsonRelativePath = 'assets/blog-data/posts.json';
            const postsJson: Array<IPost> = (await firstValueFrom(
                inject(HttpClient).get(postsJsonRelativePath),
            )) as any as Array<IPost>;

            return postsJson.map((post: IPost) => {
                return { slug: post.slug };
            });
        },
    },
    {
        path: '**',
        renderMode: RenderMode.Prerender,
    },
];

interface IPost {
    slug: string;
    title: string;
    description: string;
    date: string;
}
