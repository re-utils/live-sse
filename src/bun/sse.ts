export { startEvent, endData } from '../sse.js';

// A list of readable stream controller
export type Channel = [number, ReadableStreamDirectController][];

/**
 * Create an event channel
 */
export const channel = (): Channel => [];

const options = {
  headers: [
    ['content-type', 'text/event-stream'],
    ['cache-control', 'no-cache'],
  ],
} satisfies ResponseInit;

const blockingPromise = new Promise<void>(() => { });

/**
 * Create an event stream
 * @param signal
 * @param emitter - The event emitter
 */
export const stream =
  (chan: Channel): ((req: Request) => Response) =>
  (req) =>
    new Response(
      new ReadableStream({
        // @ts-ignore
        type: 'direct',

        pull: (c) => {
          (c as any as ReadableStreamDirectController).start();
          // @ts-ignore
          const tmp: Channel[number] = [chan.length, c];
          chan.push(tmp);

          req.signal.addEventListener('abort', () => {
            const last = chan.pop()!;

            // Replace current item in the position
            if (chan.length > 0) chan[(last[0] = tmp[0])] = last;
          });

          // Keep the stream alive
          return blockingPromise;
        },
      }),
      options,
    );

/**
 * Send a chunk to the channel
 */
export const send = (chan: Channel, chunk: any): void => {
  for (let i = 0; i < chan.length; i++) chan[i][1].write(chunk);
};
