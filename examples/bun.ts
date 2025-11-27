import { sse } from 'live-sse';
import home from './index.html';

const chan = sse.channel();

Bun.serve({
  routes: {
    '/': home,
    '/events': () => new Response(
      sse.toWebStream(chan),
      {
        headers: {
          'content-type': 'text/event-stream',
          'cache-control': 'no-cache'
        }
      }
    ),
  },
});

setInterval(() => {
  // Queue chunks
  sse.send(chan, sse.startEvent('update'));
  sse.send(chan, crypto.randomUUID());
  sse.send(chan, sse.endData);
}, 1000);
