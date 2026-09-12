---
title: "Let the agent press the buttons: client-side tools with AG-UI"
date: '2026-09-12T23:59:08.123Z'
description: "How the AG-UI protocol lets an AI agent operate your web app through tools that run in the browser."
tags: ["AI", "Agents", "TypeScript", "Frontend"]
duration: Lunch
slug: ag-ui-client-side-tools
---

Every app is getting a chat window right now. Let's be honest, the chat itself is the boring part. A text box, a streaming answer, maybe a spinner.  
The interesting part starts when the agent stops talking and actually does something inside the app: renders a couple of buttons, prefills a form, highlights the thing you were looking for. And ideally it does that without us handing it backend access to everything.

I worked on a project where AG-UI was involved, and the pattern that stuck with me is pretty simple: tools that live in the browser. The agent decides when to call them, the frontend decides what happens. This post is about that pattern. There is a second part about what to do when a tool has real consequences, but first the basics.

- [What AG-UI actually is](#what-ag-ui-actually-is)
- [Reading the stream](#reading-the-stream)
- [The core trick: tools that live in the browser](#the-core-trick-tools-that-live-in-the-browser)
- [One agent, a couple of frontends](#one-agent-a-couple-of-frontends)
- [Conclusion](#conclusion)

## What AG-UI actually is

[AG-UI](https://docs.ag-ui.com) is short for Agent-User Interaction Protocol. It is an open, event-based protocol between an agent backend and a frontend, and it does not care which agent framework runs on the other side. The docs list adapters for LangChain, CrewAI, Mastra, Pydantic AI, AWS Strands Agents and a couple of others, and if your framework of choice is not on the list, an adapter is not a lot of code.

If you have heard of MCP, the one-sentence version is this: MCP connects the agent to tools and data, AG-UI connects the agent to the user. Different sides of the agent, and they don't get in each other's way.

The unit of work is a run. The client starts a run by sending a `RunAgentInput`, and what comes back is a stream of events. Every run begins with `RUN_STARTED` and ends with exactly one `RUN_FINISHED` or `RUN_ERROR`. That is the whole lifecycle.

A minimal input looks like this (the last two fields exist, we just don't need them today):

```typescript
const input: RunAgentInput = {
  threadId: 'thread_7f3a',
  runId: 'run_0192',
  messages: [
    { id: 'msg_1', role: 'user', content: 'Something quick with leftover rice?' },
  ],
  tools: [], // we will fill this in a minute
  context: [],
  forwardedProps: {},
};
```

Notice that `messages` is the whole conversation, not just the newest message. The client owns the history. We will get back to why that is a really nice property.

## Reading the stream

Let's walk through one run. Our example app is a recipe assistant, the user asks for something quick with leftover rice, and what arrives over the wire (SSE in most implementations) is a sequence of events roughly like this:

```text
RUN_STARTED          { threadId: "thread_7f3a", runId: "run_0192" }
TEXT_MESSAGE_START   { messageId: "msg_2", role: "assistant" }
TEXT_MESSAGE_CONTENT { messageId: "msg_2", delta: "Leftover rice is " }
TEXT_MESSAGE_CONTENT { messageId: "msg_2", delta: "basically a free dinner. " }
TEXT_MESSAGE_CONTENT { messageId: "msg_2", delta: "A couple of ideas:" }
TEXT_MESSAGE_END     { messageId: "msg_2" }
TOOL_CALL_START      { toolCallId: "call_51", toolCallName: "offer_recipes" }
TOOL_CALL_ARGS       { toolCallId: "call_51", delta: "{\"recipes\":[{\"id\":\"r-" }
TOOL_CALL_ARGS       { toolCallId: "call_51", delta: "204\",\"title\":\"Egg fried" }
TOOL_CALL_ARGS       { toolCallId: "call_51", delta: " rice\",\"reason\":\"..." }
TOOL_CALL_END        { toolCallId: "call_51" }
RUN_FINISHED         { threadId: "thread_7f3a", runId: "run_0192" }
```

Text streams as a start event, a series of content deltas and an end event. Nothing surprising, that is how every chat UI works today.

The tool call is where it gets interesting. `TOOL_CALL_ARGS` also streams, and what it streams is *partial JSON*. Not a partial object, partial text.  
The fragments above split right in the middle of a string, and that is perfectly normal. The client concatenates every delta for that `toolCallId` and only parses once `TOOL_CALL_END` arrives. If you try to `JSON.parse` along the way, you will spend a fun afternoon debugging errors that only show up on long argument payloads. Not gonna lie, I did exactly that.

One more thing worth noticing: since the client sends the whole message history with every run, the server does not have to remember anything between runs. It can be completely stateless. A server restart in the middle of a conversation is invisible to the user, and scaling the agent horizontally is just scaling.  
The price is a slightly bigger request body, and for a chat that is a pretty cheap price.

## The core trick: tools that live in the browser

Now back to that empty `tools` array. `RunAgentInput.tools` is exclusively for tools the client provides. Tools that run on the backend (database lookups, calling some API) are defined in the agent framework and never show up here.  
So whatever we put into this array is a promise: if you call this, the frontend will handle it.

A tool is just a name, a description and a JSON schema for the parameters:

```typescript
const offerRecipes: Tool = {
  name: 'offer_recipes',
  description: [
    'Show the user a set of recipe suggestions as clickable cards.',
    'Call this whenever you recommend recipes instead of listing them in text.',
    'Offer at most three recipes per call and keep each reason to one short sentence.',
  ].join(' '),
  parameters: {
    type: 'object',
    properties: {
      recipes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Recipe id from earlier search results' },
            title: { type: 'string' },
            reason: { type: 'string', description: 'Why this recipe fits the request' },
          },
          required: ['id', 'title', 'reason'],
        },
      },
    },
    required: ['recipes'],
  },
};
```

We send this with every run. When the model decides to call it, the events from above arrive and the frontend does the work. Here is the handling, shortened to the interesting bits:

```typescript
type PendingCall = { name: string; args: string };
const pending = new Map<string, PendingCall>();

function onEvent(event: AgentEvent) {
  switch (event.type) {
    case 'TOOL_CALL_START':
      pending.set(event.toolCallId, { name: event.toolCallName, args: '' });
      break;
    case 'TOOL_CALL_ARGS':
      pending.get(event.toolCallId)!.args += event.delta;
      break;
    case 'TOOL_CALL_END': {
      const call = pending.get(event.toolCallId);
      pending.delete(event.toolCallId);
      if (call) runClientTool(call.name, JSON.parse(call.args), event.toolCallId);
      break;
    }
  }
}

function runClientTool(name: string, args: unknown, toolCallId: string) {
  switch (name) {
    case 'offer_recipes':
      recipeCards.set(toolCallId, (args as OfferRecipesArgs).recipes);
      break;
    case 'suggest_ingredient_swaps':
      swapChips.set(toolCallId, (args as SwapArgs).swaps);
      break;
  }
}
```

Nothing in here talks to a server. The agent decided that recipe cards are the right answer, the browser renders them. A second tool, `suggest_ingredient_swaps`, renders small chips ("no eggs? tofu works too") the same way.  
Afterwards we append a short tool message to the history (`role: 'tool'`, the `toolCallId` and a content string like `rendered 3 recipe cards`), so on the next run the agent knows the cards are actually on screen.

This split is the reason the pattern is worth a blog post. The agent orchestrates, the effect happens locally, and the backend never learns what a button is. The [docs on tools](https://docs.ag-ui.com/concepts/tools) put it in one sentence: "Sensitive operations are controlled by the application, not the agent." Everything the agent can do in the app is exactly the list of tools the frontend chose to hand over. No tool, no effect.

There is one lesson hiding in the snippet above that took me longer than it should have. Look at the `description`. The rule "at most three recipes" sits in there, not in a system prompt.  
The system prompt lives on the backend, the tool lives in the frontend. Whenever the UI changes (four cards fit now, or the reason moved into a tooltip), the rule changes with it, and if it lives in the prompt you are now touching two codebases for one UI tweak. Put the behavior rules into the description and they travel with the tool. **The description is the instruction channel.** The system prompt is for who the agent is, the description is for how this particular button should be used.

## One agent, a couple of frontends

There is a side effect of this setup that I did not appreciate at first: the tool list is part of the request, so every client can send a different one. Same agent, same backend, same system prompt, but the capabilities are decided by whoever is calling.

The obvious case is mobile. On a desktop screen three recipe cards next to each other look great. On a phone in the kitchen, with wet hands, they don't.  
So the mobile app sends the same `offer_recipes` tool with a different description ("offer exactly one recipe, the screen is small") and adds a tool the desktop never had:

```typescript
const mobileTools: Tool[] = [
  { ...offerRecipes, description: 'Show the user one recipe as a full-width card. Offer exactly one recipe per call.' },
  {
    name: 'start_step_timer',
    description: 'Start a countdown for the current cooking step when the recipe mentions a duration.',
    parameters: { type: 'object', properties: { seconds: { type: 'number' } }, required: ['seconds'] },
  },
];
```

The agent does not know it is talking to a phone. It just sees a tool called `start_step_timer` and a description that tells it when to use it, and it will happily start timers on mobile while never mentioning them on desktop. Nothing on the backend changed.

The second case is user groups. A guest browsing recipes gets `offer_recipes` and that is it. A logged-in user additionally gets `save_to_cookbook`. Someone who marked themselves as vegetarian in their profile gets `suggest_ingredient_swaps`, everyone else does not, so the agent does not even think about swaps for people who never asked for them.  
No role checks in the prompt, no "if the user is logged in, you may…" instructions that the model follows most of the time. The frontend knows who is logged in and what they are interested in, so the frontend hands over the matching tools. The agent works with what it gets.

## Conclusion

AG-UI is thin enough to understand in an afternoon. A run, a handful of event types, tools as JSON schema. The real win, for me, is not the streaming but the client-side tool pattern: the frontend decides which capabilities exist, the agent decides when to use them.

To be fair, I did not get it right at the start. I treated client tools like request-response functions: call comes in, do the thing, send a result back, done. It took a while to see that a client tool is really a UI instruction. The result message is bookkeeping for the agent, the actual output is on the screen.

But what happens when a tool actually *does* something? Rendering a card is harmless. Navigating away or ordering the ingredients is not. That is a human-in-the-loop question, and it gets its own post. Stay tuned.

Have you wired an agent into your frontend yet? Did you go with AG-UI or something hand-rolled? Let me know in the comments.
