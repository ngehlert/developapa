---
title: 'Monthly update: July 2020'
date: '2020-07-28T22:12:03.123Z'
description: 'Some good news, struggle with my webserver and a podcast recommendation'
tags: ['Monthly Update']
duration: Snack
---

- [Good news](#good-news)
- [The cost of being lazy](#the-cost-of-being-lazy)
- [Podcast recommendation](#podcast-recommendation)

## Good news

Well, maybe we start off with some good news. We (my wife and I) are expecting our next child.  
We are really happy and grateful and even though it will be our third child it took some time to adjust to the new situation.  
We learned about the pregnancy within the first two weeks (mid march) of the global pandemic shutdown in germany.
Basic things like announcing that you'll have a child suddenly became quite weird since there is/was close to zero personal contact
(no big family events, nearly zero contact to friends / colleagues, …) and I like doing things like this in person.  
During a lockdown there are a whole lot of new concerns and rules. For example I was not allowed to join the regular visits to the
gynecologist - and pictures / videos of an ultrasound scan just don't provide the same feeling and connection as being there in person.
In various clinics husbands / fathers weren't even allowed to be in the delivery room during child birth. But currently it looks
like at least this will be possible.  
I'm excited what this new chapter will bring and can't wait to meet this little person in person.

## The cost of being lazy

Last month I got my biannual invoice from my webserver where all my APIs and databases run and discovered I'm still paying
6€ / month for a SSL-Wildcard certificate. I'm speechless that [Strato](https://www.strato.de) still does not support
[Let's Encrypt](https://letsencrypt.org/de/) for webservers.  
Then why choose a webserver over a V-server in the first place? Well I have this server more than 10 years and it's basically still my
first server. And the motivation was never big enough to move to a different solution. The server itself is also quite cheap
and handles a lot of the _not-so-fun-parts_ like PHP versions, configuring MySQL, configuring DNS and Domain settings,
configuring Apache/nginx, etc.

Maybe it's time to move on. I'm currently looking into alternatives. For pure frontend projects like this blog I already
moved to [Netlify](https://www.netlify.com/) and I'm definitely not looking back. For backends and databases I'm still evaluating.
I already tried Amazon AWS but the interface looks horrible and it is way to painful to configure. If you have any ideas
or suggestions just leave comment.

## Podcast recommendation

Two good friends of mine recently started a new podcast called [Denkversuche](https://denkversuche.letscast.fm/). If you
understand german I recommend you check it out and give it a listen.  
They discuss whatever pops into their heads like the power of habits or thoughts on education and learning resources.  
I already volunteered to join as a guest in one of the future episodes - I'll keep you updated.
