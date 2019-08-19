---
title: "What is: Static Site Generators"
date: "2019-08-18T12:42:13.123Z"
description: "Everything you want to know about static site generators. What are they? How do they work? What does static mean?"
tags: "What is, Static Site Generators, Architecture, Technology"
duration: Full Meal
---

This is going to be the first article in my series "What is" where I try to explain *current trendy topics* from the 
tech world. If you are interested in a specific topic just leave a comment.

- [What is a static site generator](#what-is-a-static-site-generator)
- [How is the content added to the page](#how-is-the-content-added-to-the-page)
- [Main advantages](#main-advantages)
- [Drawbacks](#drawbacks)
- [Conclusion](#conclusion)

## What is a static site generator
Static site generators generate static sites! So far so good, but what does that mean? Let's have a look at our regular
webpage that we find while surfing the internet, e.g. Blogs, Newspapers, Home- & Company-pages, etc.  
Most of them have some kind of backend that is usally connected to a database and when a user tries to access a certain page, 
the browser requests from the backend what information should be displayed. Depending on the page and content that might 
be texts, pictures or even other content. So the content is *dynamic*.

A *static site* however has no connection to a backend and is just plain HTML, CSS & JavaScript.  
Take your regular blog for example. Usually there is not a new article every couple of minutes but rather one or two a day.
So it does logically not really make sense for every user to request the articles every time from the backend since
they aren't changing.  
That is exactly the case were static site generators come into play. Instead the articles could just be the content of a static site. 
And if there is a new article our generator will just create a new static site with our new article.

## How is the content added to the page
Now you might wonder how content is added to those static pages. Because not even developers are crazy enough to add blog articles 
directly into their source code.  
In the build process our static site generator generates the static sites and during this process the 
generator requests the content from a different resource and adds it into the page.  
There are countless possibilities how the content can be requested in this step. I quickly want to describe three pretty commons ways.

#### File based
One of the easiest approaches is to have your content in separate files in your project, for example in Markdown files 
(or any other markup language).  
I usually think of this as the 'developer approach', because chances are you won't have any customer that writes Markdown
files let alone edit anything inside the source code directly. For developers this has the big advantage that you have your
**entire page** (including content!) in one directory and can just add everything to your VCS of choice, e.g. Git.

#### Headless CMS
A headless CMS is just a backend for your posts but the CMS itself has now view. With this approach you have your regular
CMS interface to create and edit articles and during the generation process all content is downloaded from the headless CMS
and static pages are created with that content.  
This is really handy if you already have a current blog/page in place. Most of the common CMS's provide a headless mode.
So the transition from a regular blog/page to one that is generated can be really smooth because you don't have to touch your
content at all.

#### Contentful
While most of the common CMS's like Wordpress support a headless mode, that is not their original purpose so there are
some features missing, for example preview of your generated content.  
However [Contentful](https://www.contentful.com/) is a system that is specialized in providing a connection between developers
and content editors. Sadly I haven't had the time yet to try it out myself but it looks like it is one of **the best ways**
to get content into static sites.  
I think this is a pretty great solution if you are starting a new project for a customer and need a backend where 
the customer can freely create the content.


## Main advantages

#### Page speed
Dynamic sites do not only load data during page load, but this entire data also needs to be processed. All of this takes
(compare to static sites) a lot of time. However for static sites everything is already done during build time so they 
are **incredibly** fast.

#### Security
No connection to any backend or data base means there are way less possibilities for attackers to cause damage on your 
page. In most cases there is not even an admin interface anymore (directly on the page), so there is literally no way someone 
unwanted can login.  
Let's just have a look at Wordpress since half the internet is powered by wordpress pages. There are a lot of known
vulnerabilities and **a lot of people just do not update** their version ([Source](https://www.wpwhitesecurity.com/statistics-70-percent-wordpress-installations-vulnerable/)).  
But sometimes it is even simpler than that. If you ever had a webserver by yourself, just check the request log for resources that 
get requested and occasionally you'll find requests to ``/wp-admin`` (Link to the admin interface for Wordpress Pages). 
And if I have learned anything from [haveibeenpwned](https://haveibeenpwned.com/Passwords),
people are lazy and use weak passwords.

#### Development & Deployment
For this case I want to compare static sites with Wordpress - it is the only classic CMS I have experience with and also the biggest
out there. But the pros/cons should be fairly similar for other CMS's.  
If you have ever worked with a Wordpress page (self-hosted), you know that there is an entire list with things
you need to get it running. First of all it runs on PHP so you need some kind of webserver running, for example Xamp, Mamp,
directly Apache/Nginx or inside a Docker... and you also need a MySQL data base where the entire content and layout is stored.  
After the Wordpress installation you
might want to add some themes or plugins. And it just takes a long time before you can even start with what you really wanted
to do. Same goes for deployment, if you develop locally your webserver also needs PHP and a MySQL data base. Then it is not
enough to just put your local files to your webserver but you also need to synchronize the server data base.

Now lets look at static site generators. A static site runs **everywhere**. You can just open it in your browser, no webserver
or data base required. Same goes for deployment, just put everything to your webserver and you are done.  
There is even a difference in pricing. A plain webserver without PHP, MySQL, etc. is way cheaper. For static sites there
are a couple of great hosting services like [GitHub Pages]() or [Netlify](htts://netlify.com) that can directly build and 
publish from your repository.

I know there are a lot of tools that make developing and deploying for Wordpress and syncing and deploying easier - for 
static sites it is just nice that you don't need anything.  
Before knowing about static site generators I used different Flat File CMS's. They work just like your regular Wordpress but 
the entire content is stored in files so you don't  have to do anything content related with a data base.

## Drawbacks
If you stop reading this post here, you might think "Why isn't every page a static site?" - and that's actually a fair 
question. If you added a new post to your Wordpress page, this post is immediately visible. For static sites however you
need to regenerate everything and publish it first. This takes depending on the page size couple of seconds to couple of 
minutes. But in my use cases so far waiting for 30 seconds until a change is published is still quite fine. If you use a 
hosting service like I mentioned earlier there are even deploy hooks that are called automatically once you changed anything
in your repository - so there is no manual interaction involved in deploying a updated version; just those 30 seconds
wait time.

Through dynamic pages the entire web developed to the Web 2.0 we all know today. There are certain scenarios where a 
static site is just not feasible. Imagine an online banking site. They can't generate all the pages for every customer with
their balance. Also there should be some Authentication before so not everybody can access every bank account.  
Even for those scenarios there are better/more secure solutions like server side rendering, but this is a topic I might cover 
in a later post in this series.

## Conclusion
Static site generators are a really big topic and I just focused on the (in my eyes) most important parts in this post.
So if you think I missed out on a really important part just leave a comment below.

I'm pretty new to static site generators myself. In fact this page is the first page I build with one. But let me tell you 
it was a blast. It was so much fun and so easy compared to everything I used before.  
Even stuff like comments is fully static on this page. Adding a comment creates a pull request in my repository. If I accept 
a pull request [Netlify](htts://netlify.com) automatically builds all pages and deploys everything. And with this way I 
have **everything** in my [Git repository](https://github.com/ngehlert/developapa).

There are dozens of different static site generators for nearly every programming language, but the concept stays the same 
for all of them. At [staticgen.com](https://www.staticgen.com/) there is a great list based on language and templating 
system.

#### My stack for this blog
* Build with [Gatsby](https://www.gatsbyjs.org)
* Templates in [React](http://reactjs.org)
* Posts in Markdown
* Deployed and hosted with [Netlify](htts://netlify.com)
* Current build time 21 seconds
