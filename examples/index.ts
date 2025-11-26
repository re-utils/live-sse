import { serve } from 'srvx';
import { sse } from 'live-sse';

import { readFileSync } from 'fs';

const home = new Response(readFileSync('./index.html'), {
  headers: {
    'content-type': 'text/html'
  }
});
const notFound = new Response(null, { status: 404 });

const chan = sse.channel();

serve({
  fetch: (req) => {
    const url = req.url,
      pstart = url.indexOf('/', 12) + 1,
      pend = url.indexOf('?', pstart),
      path = pend === -1 ? url.slice(pstart) : url.slice(pstart, pend);

    return path === ''
      ? home.clone()
      : path === 'events'
        ? new Response(
          sse.toWebStream(chan),
          {
            headers: {
              'content-type': 'text/event-stream',
              'cache-control': 'no-cache'
            }
          }
        )
        : notFound;
  }
})

// Start update
const startUpdate = sse.startEvent('update');

setInterval(() => {
  // Queue chunks
  sse.send(chan, startUpdate);
  sse.send(chan, crypto.randomUUID());
  sse.send(chan, sse.endData);
}, 1000);
