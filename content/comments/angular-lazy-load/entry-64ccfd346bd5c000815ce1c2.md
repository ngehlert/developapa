---
name: "Nico"
slug: "/angular-lazy-load/"
date: "2023-08-04T13:29:24.899Z"
---
Hi Yevhen,
thanks for your comment. I&#x27;m not aware of any setting that can cause this, as it would break the angular router syntax/behavior. If you use the source-map-explorer or any other bundle analyzer you can check where the grid library is actually imported.
Unfortunately a single module import somewhere down the line is enough to include everything in the main bundle.
Best
Nico
