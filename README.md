# `live-sse`
Emit events to SSE streams.

Usage:
```ts
// server.ts
import { sse } from 'live-sse';

const chan = sse.channel();

setInterval(() => {
  // Shorthand for sse.send(c, 'event: update\ndata: ');
  sse.send(chan, sse.startEvent('update'));

  // Update event data
  sse.send(chan, 'Hello world');

  // Mark the end of the data section
  sse.send(chan, sse.dataEnd);
}, 1000);

export default {
  fetch: () => new Response(
    sse.toWebStream(chan),
    {
      headers: {
        'content-type': 'text/event-stream',
        'cache-control': 'no-cache'
      }
    }
  )
}

// client.ts
const events = new EventSource(serverUrl);

events.addEventListener('update', (event) => {
  // Print 'Hello world' every 1s
  console.log(event.data);
});
```

`live-sse` also provides an API optimized for `bun`:
```ts
import { sse } from 'live-sse/bun';
```
