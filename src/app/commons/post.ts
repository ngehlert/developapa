import { Comment } from './comment/comment';

export interface PostMetadata {
    title: string;
    date: string;
    description: string;
    slug: string;
    tags: string[];
}

export interface Post extends PostMetadata {
    markdownContent?: string;
    htmlContent: string;
    comments?: Comment[];
}
