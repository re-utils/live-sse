import { sse } from 'live-sse/bun';
import home from './index.html';

const chan = sse.channel();

Bun.serve({
  routes: {
    '/': home,
    '/events': sse.stream(chan),
  },
});

// Start update
const startUpdate = sse.startEvent('update');

setInterval(() => {
  // Queue chunks
  sse.send(chan, startUpdate);
  sse.send(chan, crypto.randomUUID());
  sse.send(chan, sse.endData);
}, 1000);
