import { serve } from 'srvx';
import { sse } from 'live-sse';

import { readFileSync } from 'fs';

const home = new Response(readFileSync('./index.html'));
const notFound = new Response(null, { status: 404 });

const chan = sse.channel();
const createStream = sse.stream(chan);

serve({
  fetch: (req) => {
    const url = req.url,
      pstart = url.indexOf('/', 12) + 1,
      pend = url.indexOf('?', pstart),
      path = pend === -1 ? url.slice(pstart) : url.slice(pstart, pend);

    return path === ''
      ? home.clone()
      : path === 'events'
        ? createStream(req)
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
