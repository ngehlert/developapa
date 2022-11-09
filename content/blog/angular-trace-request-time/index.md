---
title: "Log Request times with an Angular Interceptor"
date: "2022-04-27T23:59:08.123Z"
description: "Example of how to use an Interceptor to track request times"
tags: ["Angular", "Tutorial"]
duration: Snack
---
Interceptors are powerful tools in the Angular world. An interceptor is a service that allows you to react/modify any http request.  
In this post I'll show an example of an interceptor that tracks request times. It can be a very great help in performance 
optimizing your application.

If you are already familiar with interceptors and looking for a TL:DR go straight to the example [Stackblitz](https://stackblitz.com/edit/angular-ivy-tvl8gp?file=src%2Fapp%2Finterceptor.service.ts)

- [Basics](#basics)
- [Time tracking](#time-tracking)
- [Limit tracking to specific domains](#limit-tracking-to-specific-domains)
- [Track more data](#track-more-data)
- [Full example](#full-example)

## Basics
An interceptor is just a regular Angular service that implements the `HttpInterceptor` interface.
```typescript
import { HttpInterceptor } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Injectable()
export class InterceptorService implements HttpInterceptor {
}
```

The interface forces us to implement a `intercept` method. 
```typescript
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';
import { Injectable } from '@angular/core';
@Injectable()
export class InterceptorService implements HttpInterceptor {
  public intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
  }
}
```

The `req` param contains all the information of the incoming request. This is a great place to modify the current request, for 
example adding headers for authentication. (This approach can even be used to mock entire APIs. Will cover this topic in a 
separate post).

And the `next` handler will usually be your return statement and has a `handle` method, that accepts any `HttpRequest` object.

A very basic interceptor that is not doing anything at all would look like this
```typescript
public intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(req);
  }
```

## Time tracking
The `handle` method will just return an `Observable<HttpEvent<any>>`. This is very neat because we can just use our regular
rxjs operators that we already know to extend the logic.
```typescript
@Injectable()
export class InterceptorService implements HttpInterceptor {
  public intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const startTime: Date = new Date();
    return next.handle(req).pipe(
      tap((response: HttpResponse<any>): void => {
        console.log((new Date().valueOf() - startTime.valueOf()) / 1000)
      }),
    );
  }
}
```
In this case we are using `tap` ([Docs](https://www.learnrxjs.io/learn-rxjs/operators/utility/do)) which is a great tool of just 
adding things in an observable chain without changing the value.

Before we pass the `req` param to the `next.handle()` method we create a constant for the start time. In the `tap` we then 
can create another timestamp. The difference between those two timestamps is the duration of request.  
I usually divide by 1.000 in order to get seconds instead of milliseconds.

## Limit tracking to specific domains
Usually you don't want to track the request time of **all** the requests but rather your API requests, important scripts or 
whatever you need.  
Let's create an array that hold all our domains we'd like to track.  
`private apisToTraceRequestTime: Array<string> = ['https://my.api.com'];`

Now we extend our `tap` function from above with an `if` condition and check for the url. This could look something like this
```typescript
tap((response: HttpResponse<any>): void => {
  if (!(response instanceof HttpResponse) || !response.url) {
    return;
  }

  const isUrlIncludedinWhitelist = this.apisToTraceRequestTime.some(
    (current) => response.url.startsWith(current)
  );
  if (!isUrlIncludedinWhitelist) {
    return;
  }

  console.log((new Date().valueOf() - startTime.valueOf()) / 1000)
}),
```

**Important:** We are using the respons url here and not the request url. 
The response url does not have to be the same as the request url. In case of a redirect for example those 
two urls would be different.

## Track more data
Let's create a method called `logRequestTime` with the parameters `request`, `response` and `startTime` and replace the `console.log`
in our `tap` block.

```typescript
  private logRequestTime(
    request: HttpRequest<any>,
    response: HttpResponse<any>,
    startTime: Date
  ): void {
    if (!request || !request.url) {
      return;
    }
    const endTime: Date = new Date();
    const duration: number = (endTime.valueOf() - startTime.valueOf()) / 1000;

    /**
     * If you want you can add a threshold here to only log requests if they are slower than X seconds
     *
     * if (duration < 1) {
     *  return;
     * }
     */

    /**
     * This is just an example, feel free to add/replace any meta information you need
     */
    const dataToLog: Record<string, number | string> = {
      duration,
      params: request.params.toString(),
      method: request.method,
      requestUrl: request.url,
      // this is useful in cases of redirects
      responseUrl: response.url,
    };

    console.log(dataToLog);
  }
```
In my example we added now request url params, the request method and also the request url in case of redirects. We even 
added (as comment) a simple if check to only log requests that take longer than 1 second.  
There are a lot more useful properties available on those two objects. Just evaluate for yourself what information you are interested in.

## Full example
In this [Stackblitz](https://stackblitz.com/edit/angular-ivy-tvl8gp?file=src%2Fapp%2Finterceptor.service.ts) you will the entire example 
we just build together and you can just start playing around.  
So far we only logged the durations to the console but of course for production you could add some sort of API to persist 
this information.  
This interceptor is very helpful in finding slow requests. With a threshold you only log requests that take longer 
than X seconds - this makes it easier for you to detect slow request.  
You can enrich the data with some geo information, browser language, browser type (Chrome/Safari/Firefox/etc.), device 
information (Desktop/Mobile/etc), etc. and see if your page has the same speed across the globe under all circumstances. 
There are literally hundreds of use cases.  
I hope this was helpful. Let me now what you think.

I'm trying to use another channel to communicate and receive feedback, feel free to reach me over at twitter at 
[@ngDevelopapa](https://twitter.com/ngDevelopapa).

