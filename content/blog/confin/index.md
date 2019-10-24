---
title: "Confin"
date: "2019-10-22T21:19:08.123Z"
description: "Control your finances - Keep track of your spendings and discover places where you can save money"
tags: "Projects, Confin, Finance"
duration: Big Snack
---

![Confin](./confin.png)

With this blog post I want to present finance app for iOS and Android.  
You might ask if another finance app ist really necessary so I try to quickly explain the benefits of *Confin* 
and differences to other common apps.  
Confin is basically my first *real* (published) side project and went through multiple iterations and reworks.

- [Manual interaction](#manual-interaction)
- [Custom accounts](#custom-accounts)
- [Statistics](#statistics)
- [Private budget](#private-budget)
- [FAQ](#faq)
- [GDPR](#gdpr)
- [Conclusion](#conclusion)

## Manual interaction
This point may seem unintuitive on first sight, let me quickly explain. Most/all other apps are directly linked to 
your bank account and automatically assign every booking a proper category.  
I don't like this for two reasons:
1. Call me old-fashioned but I don't like the idea of having a direct connection between my bank accounts and mobile phone
2. I want to use a finance app to have a better feeling and understanding for my financial situation. However if everything 
happens automatically it's more likely to *lose control*

## Custom accounts
Custom accounts are accounts that don't represent a direct bank account, for example cash or carsharing.
I have to pay for carsharing once a month, but after each drive, I get a notification how much this just cost. 
But with a separate account those costs are always visible and represented in my overview. And when the payment is due, 
I can just do a transfer from my bank account to the carsharing account to balance everything out. Same principle goes 
for cash.

## Statistics

Not much to say to this topic. There are different kind of statistics, for example monthly distribution or evolution over 
time.

## Private budget
This one is one of my favorite features. It is a planning tool for periodic fix costs to help you better understand 
how much money is available monthly. You can enter your monthly/quarterly/... incomes/costs and it calculates your day to 
day budget. It even lets you know how much money you should save monthly for the costs that happen in bigger time ranges.

## FAQ

### Why do I have to create an user account
I get this question pretty often. Two reasons
* I wanted to have a shared account with my wife and storing everything online seemed like the easiest solution
* Initially I planned on also having an online version for more and even deeper statistics. However I just didn't have 
the time so far to build it

### Why did you publish Confin
For a long time Confin was just a private project and only used by myself and my wife. However couple of other people asked 
me I they can use it as well. At first I distributed Confin by sending the packaged app via E-Mail. But as the audience grows 
this approach was to obnoxious… And at that point I decided to publish it in the app store

## GDPR
Confin stores following user specific data:
* User name: Needed for login
* E-Mail: Needed if you forget your password
* Password: Is hashed with a strong one-way hashing algorithm (no way to decrypt it to the real password)

Every data is stored on servers in Germany.

You can find the full gdpr text here: [Full GDPR Text](gdpr)



## Conclusion
There are a lot of finance apps out there, and by now they are all pretty great (was a bit different when I started developing 
Confin 😉). I just like it when everything is exactly how I want it to be and how I need it.

If you use another finance app let me know which and why. I'm always interested in other peoples approaches.

If you have any ideas of cool features or feedback just leave a comment.
