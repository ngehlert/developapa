---
title: 'Made my day: New Small Update'
date: '2022-04-21T23:59:08.123Z'
description: "There's a new update for Made my day available. "
tags: ['Projects', 'Made my day']
duration: Snack
---

#### Click [here](https://apps.apple.com/us/app/made-my-day/id1481700999?l=de&ls=1&mt=12) to get it from the App Store

If you don't know _Made my day_ yet, head over to [my first Blog Post](/made-my-day) for more information.

There's a new update available

- [Links](#links)
- [Performance](#performance)
- [Outlook](#outlook)
- [Conclusion](#conclusion)

## Links

Couple of months ago, I received feedback that links would not properly open in browser and instead crash the application.
I noticed this the next day as well and immediately started trying to fix it. However it took very long to figure out where
exactly the problem was. At first, it looked like a permission problem in macOS so I started to dig very deep into the Apple
Developer documentation.  
But in the end it turned out to be a problem with electron itself and was solved with like 10 lines of code... but that's
development in a nutshell :D Sometimes it takes a while to find the proper solution.

But even at the end of a very hard road, you can now click on links in your posts and it should properly open your default
browser.

## Performance

I also made a couple of changes in the background which should increase the overall performance and reduce the amount of needed
memory and resources of your Mac.

## Outlook

I also started working on a much requested feature of exporting your entries. Even though you technically wouldn't need
an export since it's all static Markdown anyway, I agree that sometimes it's nice to just have one big PDF file that contains
everything.  
Stay tuned for more information in the next weeks.

## Conclusion

I really wanted to fix the bug with the links and it was very frustrating looking and debugging for hours without making any
progress at all. I hope everything works fine now.

If you have any suggestions or feedback, feel free to leave a comment below.

I'm trying to use another channel to communicate and receive feedback, feel free to reach me over at twitter at
[@ngDevelopapa](https://twitter.com/ngDevelopapa). It's easier for me to share regular updates and answer direct questions.
