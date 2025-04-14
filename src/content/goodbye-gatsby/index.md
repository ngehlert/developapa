---
title: Goodbye Gatsby, Hello Angular SSG
date: '2025-04-14T08:19:08.123Z'
description: Exploring the reasons behind moving my personal blog from Gatsby to Angular.
tags: ['Angular', 'Gatsby']
duration: Snack
slug: gatsby-to-angular-migration
---

If you've been here in the past, you might notice things feel... familiar, yet different. 
That's because this blog has gotten a small redesign but a bigger refactoring / rewrite in the background.  
Previously powered by [Gatsby](https://www.gatsbyjs.com/), it now runs entirely on [Angular](https://angular.io/).

I liked Gatsby and I still do today. So, maybe before we dive into the "why Angular?", 
let's quickly look into why I decided to use Gatsby in the first place.  
I will split this post into 3 different parts.

- [What I Loved about Gatsby](#what-i-loved-about-gatsby)
- [Why the Move to Angular?](#why-the-move-to-angular)
- [Looking Ahead](#looking-ahead)

## What I Loved about Gatsby

My journey with Gatsby started because I was looking for a performant, modern and most important simple way to build static websites. 
And I wanted to get more familiar with react. This sounds exactly like what Gatsby is made for.  
There were several aspects that particular stood out to me:

*   **Static Site Generation (SSG):** At its core, Gatsby excels at pre-building pages into static HTML, CSS, and JavaScript. This results in incredibly fast load times, excellent SEO potential, and simple hosting
*   **The Unified Data Layer & GraphQL:** This was very new for me and a lot of fun to get into. The ability to source content from *anywhere* – Markdown files, CMSs (like Contentful, Wordpress or Sanity), APIs, databases – and query it all through a single GraphQL interface during the build process is incredibly powerful.
*   **Seamless Image Processing:** Plugins like `gatsby-plugin-image` are fantastic. Automatic image optimization, responsive image generation (different sizes for different devices), lazy loading, and blur-up effects were practically effortless.

Gatsby provided a robust, efficient platform, and I learned a lot using it.

## Why the Move to Angular?

If Gatsby was so great, why switch? The reasons are less about Gatsby's shortcomings
and more about my own development context and goals:

1.  **Familiarity and "Home Turf":** The primary driver is simple: Angular is the framework I work with most extensively in my professional life. It's where I feel most comfortable, productive, and knowledgeable.
2.  **A Modern Angular Playground:** Angular has evolved rapidly, introducing fantastic features like Signals, improved standalone components, the new `@if/@for` control flow syntax, and significant enhancements to Server-Side Rendering (SSR) and Static Site Generation (SSG) via the `@angular/ssr` package. I wanted a real-world project – this blog – to serve as a personal playground to explore and test these new features.
3.  **Angular is Fully SSG-Capable Now:** While Gatsby has long been a leader in SSG, Angular's capabilities in this area are now mature and robust. This very blog demonstrates it! The content is sourced from Markdown files with frontmatter, processed during the build, and pre-rendered into static HTML files. Angular's pre-rendering delivers the same core benefits of speed and SEO that drew me to static generation in the first place.

Essentially, I can achieve the static output I need while working within the ecosystem I know best and want to explore further.

## Looking Ahead

This migration allows me to keep the blog performant and maintainable while using it as a living laboratory for modern 
Angular development. It's exciting to have this space aligned so closely with my day-to-day work and learning objectives.

**How exactly does Angular pre-render this blog from Markdown files?**  
That's a great question! 
It involves a Node.js build script that uses libraries like `marked` and `gray-matter`, leveraging Angular's `HttpClient` to fetch 
processed data, and configuring the `@angular/ssr` package, including functions like `getPrerenderParams`.  
I plan to write a dedicated follow-up post diving into the technical nitty-gritty of this setup soon.

For now, welcome to the Angular-powered version of the blog! 
I'm looking forward to sharing more insights and experiments facilitated by this new foundation.
