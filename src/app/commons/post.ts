import { Comment } from './comment';

export interface PostMetadata {
    title: string;
    date: string;
    description: string;
    slug: string;
}

export interface Post extends PostMetadata {
    markdownContent?: string;
    htmlContent: string;
    comments?: Comment[];
}
