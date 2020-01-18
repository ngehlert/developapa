---
title: "Open source is for everyone"
date: "2019-12-20T19:12:03.123Z"
description: "Short story about my first real library on npm and my take on open source"
tags: ["Open Source"]
duration: Snack
---

Do you know the feeling of copying some of your helper classes or methods across different 
projects and repositories?  
Well, I certainly do! But I really don't like copy paste.

So I thought to myself, why not just create a real npm package, so I can simply `npm install` 
my helper stuff in my own projects. And a sweet little side effect is, that maybe someone else 
needs this as well.  
I did some polishing first and here it is: 
[@ngehlert/event-helper](https://www.npmjs.com/package/@ngehlert/event-helper)

## What does it do

For some of my games I needed a lot of `eventListeners` (e.g. for keyboard inputs & game 
interaction). I think the registering part is actually quite decent in JavaScript, but 
I had a lot of cases where I needed to remove old `eventListeners` or have `eventListeners` 
that are just executed once - and the unregistering is kind of annoying.

The `EventHelper` lets you register events based on a name of your choice. And the event handling 
with dedicated names is way simpler.  
It also allows you to register `oneTimeEventListener` that are just executed once and automatically 
unregister themselves after the first execution.

## Conclusion
I know this is just a small library and covers probably only some edge cases for very few people. 
But I wanted to have something small to get started and to play around with actually **publishing** 
a npm library.  
I plan to have more packages in the future, maybe with more complex or refined stuff.

And last but not least I strongly believe that *"sharing is caring!"*. I think way to many libraries or 
plugins don't get published because people feel the code is not good enough or nobody needs it anyway. 
The great thing about open source is, that there is not some validation or code review that you need to 
pass, that allows you to publish your library.  
If **you** think it is worth sharing then go for it!

Let me know in the comments if you have ever published a library or what is stopping you from doing it ;)
