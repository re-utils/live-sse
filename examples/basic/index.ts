import { heapStats } from 'bun:jsc';

import { sse } from 'live-sse';
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

setInterval(() => {
  const stats = heapStats();

  console.log('Heap size:', stats.heapSize);
  console.log('ReadableStream count:', stats.objectTypeCounts.ReadableStream ?? 0);
  console.log('Response count:', stats.objectTypeCounts.Response ?? 0);

  // Bun.gc(true)
  console.log();
}, 2000);
