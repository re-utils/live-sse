// A list of readable stream controller
export type Channel = [number, ReadableStreamDefaultController<any>][];

/**
 * Create an event channel
 */
export const channel = (): Channel => [];

const options = {
  headers: [
    ['Content-Type', 'text/event-stream'],
    ['Cache-Control', 'no-cache'],
  ],
} satisfies ResponseInit;

/**
 * Event start
 * @param name
 */
export const startEvent = (name: string): string =>
  'event: ' + name + '\ndata: ';

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
        start: (c) => {
          const tmp: Channel[number] = [chan.length, c];
          chan.push(tmp);

          req.signal.addEventListener('abort', () => {
            const last = chan.pop()!;

            // Replace current item in the position
            if (chan.length > 0) chan[(last[0] = tmp[0])] = last;
          });
        },
      }),
      options,
    );

/**
 * Send a chunk to the channel
 */
export const send = (chan: Channel, chunk: any): void => {
  for (let i = 0; i < chan.length; i++) chan[i][1].enqueue(chunk);
};

/**
 * Send to end the data
 */
export const endData = '\n\n';
