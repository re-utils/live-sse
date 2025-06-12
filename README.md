# `live-sse`
Emit events to SSE streams.

Usage:
```ts
// server.ts
import { sse } from 'live-sse';

const c = sse.channel();

setInterval(() => {
  // Shorthand for sse.send(c, 'event: update\ndata: ');
  sse.send(c, sse.startEvent('update'));

  // Update event data
  sse.send(c, 'Hello world');

  // Mark the end of the data section
  sse.send(c, sse.dataEnd);
}, 1000);

export default {
  // Create a Request => Response handler that streams the content
  fetch: sse.stream(c)
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
