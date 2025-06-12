import { sse } from "../../src/index.js";
import home from './index.html';

const emitter = sse.emitter();

Bun.serve({
  routes: {
    '/': home,
    '/events': sse.handler(emitter)
  }
});

// Start update
const startUpdate = sse.startEvent('update');

setInterval(async () => {
  // Queue chunks
  emitter.push(startUpdate);
  emitter.push(crypto.randomUUID());
  emitter.push(sse.endData);

  // Send all queued chunks
  await sse.flush(emitter);
}, 1000);
