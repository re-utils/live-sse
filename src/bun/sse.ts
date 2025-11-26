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
  (chan: Channel): ((req: Request) => Response) => {
    function pull(this: { _: Channel[number] }, c: ReadableStreamDirectController) {
      chan.push(this._ = [chan.length, c]);
      return blockingPromise;
    }

    function cancel(this: { _: Channel[number] }) {
      const last = chan.pop()!;

      // Replace current item in the position
      if (chan.length > 0) chan[(last[0] = this._[0])] = last;
    }

    return () => new Response(
      // @ts-ignore
      new ReadableStream({
        type: 'direct',
        _: null,
        pull,
        cancel
      }),
      options
    )
  }

/**
 * Send a chunk to the channel
 */
export const send = (chan: Channel, chunk: any): void => {
  for (let i = 0; i < chan.length; i++) chan[i][1].write(chunk);
};
