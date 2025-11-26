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
  (chan: Channel): (() => Response) => {
    function start(this: { _: Channel[number] }, c: ReadableStreamDefaultController) {
      chan.push(this._ = [chan.length, c]);
    }

    function cancel(this: { _: Channel[number] }) {
      const last = chan.pop()!;

      // Replace current item in the position
      if (chan.length > 0) chan[(last[0] = this._[0])] = last;
    }

    return () =>
      new Response(
        new ReadableStream({
          // @ts-ignore
          _: null,
          start,
          cancel
        }),
        options
      )
  }

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
