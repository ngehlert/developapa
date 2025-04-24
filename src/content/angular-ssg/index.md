---
title: Angular SSG (and SSR)
date: '2025-04-22T08:19:08.123Z'
description: Tutorial on how to setup an Angular project from scratch with a fully static site as output. This site will also be able to be delivered via server side rendering (SSR).
tags: ['Angular', 'Static Site Generators']
duration: Dinner
---

I've teased this in the last post already. Static Site Generation (SSG) and Server Side Rendering (SSR) has come to Angular. 
Well, it has been there for a while, but it was not as easy to set up as it is now.  
I won't go into the details of benefits of SSR and just assume you are familiar with it. Instead, I want to focus on the project setup itself.

In the end we will have an Angular (v19) project that can switch between SSG and SSR depending on your needs, and then you can build the logic 
you need on top of it.  
And as a small nugget in the end, I will show you how I convert the Markdown files of this blog post to a format that Angular can use to
generate the content for this blog.

- [Base application](#base-application)
- [Fill SSG with life](#fill-ssg-with-life)
- [Make SSR working again](#make-ssr-working-again)
- [Convert markdown with frontmatter to JSON](#convert-markdown-with-frontmatter-to-json)
- [Summary](#summary)

## Base application
To create a new Angular project with SSR enabled run
```bash
# if you don't yet have the angular cli installed run this command first
#  npm install --global @angular/cli

ng new --ssr
```
Choose your project name and just follow the installation steps with your preferences.  
Answer the question `Would you like to use the Server Routing and App Engine APIs` with Yes.

For real life example you can check out the repository for this blog at [github/developapa](https://github.com/ngehlert/developapa). But I also 
created an empty sample application to see everything standalone at [github/angular-ssg-example](https://github.com/ngehlert/angular-ssg-example).

Now we want to adjust the `angular.json` file. Currently, it's only supporting SSR but we want to modify it so you can switch
between SSG and SSR based on your needs.  
Remove the `projects.PROJECT_NAME.architect.build.outputMode` and `projects.PROJECT_NAME.architect.build.ssr` entries.  
Add the following two sections to the `projects.PROJECT_NAME.architect.build.configurations` section
```json
"prerender": {
  "prerender": {
    "discoverRoutes": false,
    "routesFile": "routes.txt"
  }
},
"ssr": {
  "outputMode": "server",
  "ssr": {
    "entry": "src/server.ts"
  }
},
```
Create an empty `routes.txt` file in your project folder. For now leave this file empty, we will come back to it later.

Adapt the `projects.PROJECT_NAME.architect.serve.configurations` section to fall back to the `ssr` config we just
created (for both development and production).
```json
"buildTarget": "angular-ssg-example:build:ssr,development"
```


To create the static HTML files add the following command to the `package.json` in the `scripts` section. 
```json
"prerender": "ng run angular-ssg-example:build:prerender,production && mv dist/angular-ssg-example/browser/index.csr.html dist/angular-ssg-example/browser/index.html"
```
By default Angular only creates an `index.csr.html` file. This is the file that will be used for client side rendering and 
to be honest I'm not quite sure why they add the suffix. It looks like they still expect to serve everything with a server.  
In the command we will just rename this to `index.html` so we can serve it statically without the need for a server.

To run things locally I like to use the `http-server` npm package to serve the static files.
```bash
# to install the package you can run npm install --save-dev http-server
"serve:prerender": "http-server dist/angular-ssg-example/browser -p 8080",
```

We should now be able to run `npm run prerender` and `npm run serve:prerender` to create the static files and serve them with the
default Angular application.

## Fill SSG with life
At the moment we are just building one static HTML site. Let's add some more. We generate two components with the `angular-cli`
named page-one and page-two.
```bash
# I just use the options to create as little boilerplate as needed. Adjust to your preferences
ng g component page-one --inline-template --inline-style --standalone --skip-tests --flat
ng g component page-two --inline-template --inline-style --standalone --skip-tests --flat
```

Now wire them up in the `app.routes.ts` file
```typescript
export const routes: Routes = [
    {
        path: 'page-one',
        component: PageOneComponent,
    },
    {
        path: 'page-two/:id',
        component: PageTwoComponent,
    },
    {
        path: '',
        redirectTo: 'page-one',
        pathMatch: 'full',
    }
];
```
If we now run `npm run prerender` we will see that just one page was statically rendered: `Prerendered 1 static route.`  
We can set the `"discoverRoutes": true,` in the `angular.json` file to automatically discover all routes and run the command again.  
`Prerendered 2 static routes.`… Hm this seems weird. If we check the `dist/angular-ssg-example/browser` folder we will see that we have the 
`index.html` file and the `page-one/index.html` file, but no `page-two/` files.  
This is because our `page-two` route does use a parameter and the prerender process does not know what to do with it.  
Remember the `routes.txt` file we created earlier? That's the place where we specify our parameters. For example we can add the following
```text
/page-one
/page-two/param1
/page-two/param2
```
Run the command again and we will see `Prerendered 4 static routes.`

In this blog I use a node script to generate this `routes.txt` file so I don't have to maintain it manually.  
Now we know everything we need to generate our static HTML files and how we have routes with parameters. In order to deploy 
our application, you just need to publish the `dist/angular-ssg-example/browser` folder - in my case [Netlify](https://netlify.com), but 
any other static hosting provider will work as well.

## Make SSR working again
Ok now we've got the SSG part figured out and running. Let's run `ng serve` and we will see that everything works as with our 
static generated ones. We can use `page-one` and `page-two` with parameters.  
However, if we try to run `ng build` in order to deploy we hit an error: 
```text
✘ [ERROR] The 'page-two/:id' route uses prerendering and includes parameters, but 'getPrerenderParams' is missing. Please define 'getPrerenderParams' function for this route in your server routing configuration or specify a different 'renderMode'.
```

Coming back to our automatically generated project files we notice that there is a `app.routes.server.ts`.
We need to tell Angular which routes to run in the server. Let's change it to the following
```typescript
export const serverRoutes: ServerRoute[] = [
    {
        path: 'page-one',
        renderMode: RenderMode.Prerender
    },
    {
        path: 'page-two/:id',
        renderMode: RenderMode.Prerender,
        async getPrerenderParams(): Promise<Array<Record<string, string>>> {
            return [
                { id: '1' },
                { id: '2' },
                { id: '3' }
            ];
        }
    },
    {
        path: '**',
        renderMode: RenderMode.Prerender
    }
];
```
With the `RenderMode` we specify whether we want the page be rendered on the server, on the client or prerendered.
If we use `RenderMode.Prerender` we need to specify the `getPrerenderParams` function. In this simple example I just provide
a static list with the parameters. But you also have access to the `inject()` from Angular and call any service you want.

In this blog for example I generate a file with all the needed information and just load it in the `getPrerenderParams` function.
```typescript
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
```

I would just advise to keep both the `app.routes.server.ts` and the `routes.txt` in sync. Because this allows us to be in a state where we
can freely choose between SSG or SSR. If you know up front what you want, you can also just remove the one logic that you don't need.  
And as a last note, the SSR way also allows us to prerender specific pages while rendering other pages on the client or server. Just the 
deployment is different, because you need a node server to run the SSR part (e.g. `npm run serve:ssr:angular-ssg-example`).

## Convert markdown with frontmatter to JSON
You can find the entire file here [process-markdown.js](https://github.com/ngehlert/developapa/blob/master/scripts/process-markdown.js).   
In this section I will just copy paste specific parts of the code and explain them.  
The goal is to read a markdown file with a frontmatter header and convert it to a JSON file. This file then 
can be imported from our Angular application and used to generate the content. It will contain HTML that we render
with the `innerHTML` directive.

```javascript
const matter = require('gray-matter');

function getFrontmatterContent(file) {
    const fileContent = fs.readFileSync(file, 'utf8');
    return matter(fileContent);
}

const { data, content } = getFrontmatterContent(file);
```

The first part is very straightforward. We read the file and use the `gray-matter` package to parse the frontmatter.  
The `data` object contains our meta information that we set like title, date, description, etc. 
And the `content` contains the actual content of the markdown file.

Next step is converting the markdown content to HTML.
```javascript
const { marked } = require('marked');

const htmlContent = marked(content);
```
And that's already it. I extend it a little bit with a custom renderer, to look like this
```javascript
function getCustomRenderer(slug) {
    const renderer = new marked.Renderer();
    const originalImageRenderer = renderer.image;

    renderer.image = ({ href, title, text }) => {
        // Check if the href is an absolute URL (starts with http, https, //)
        // Or if it's already an absolute path within the site (starts with /)
        if (/^(https?:)?\/\//.test(href) || href.startsWith('/')) {
            return originalImageRenderer.call(renderer, href, title, text);
        }

        const newHref = `/assets/content/${slug}/${href}`;

        // Construct the image tag with the new path
        return `<img src="${newHref}" alt="${text}"${title ? ` title="${title}"` : ''}>`;
    };

    return renderer;
}

const htmlContent = marked(content, {renderer: getCustomRenderer(slug)});
```
This might not be suitable for your use case, but I wanted to show you how you can extend the renderer.
In my case I copy the image files I use in blog posts to the assets directory. But in my Markdown
files I like to reference them locally and have the right next to it. With this step I'm modifying 
the `src` attribute of the image tag to point to the right location.

## Summary
This was fun! It was nice discovering all those new features in Angular and how easy in general the setup is. I left out
the comparison against the older Angular Universal approach.  
I think both approaches - SSR and SSG - have their reason for existence. In general the SSR approach is more flexible and powerful. 
In complex or production environments I would almost always reach for this one.   
But especially if you serve static content and look for a real simple setup and deployment (like this blog 😉) the SSG
part is very nice and easy to set up.

Let me know if you could follow the steps and if you have any open questions.
