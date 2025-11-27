export interface ChannelItem {
  c: ReadableStreamDefaultController;

  // Must be initialized
  p: Channel;
  i: number;

  start: (c: ReadableStreamDefaultController) => void;
  cancel: () => void;
}

// A list of readable stream controller
export type Channel = ChannelItem[];

/**
 * Create an event channel
 */
export const channel = (): Channel => [];

/**
 * Event start
 * @param name
 */
export const startEvent = (name: string): string =>
  'event: ' + name + '\ndata: ';

function start(
  /**
   * p and i should be initialized first
   */
  this: ChannelItem,
  c: ReadableStreamDefaultController,
) {
  this.c = c;
  this.p.push(this);
}

function cancel(this: ChannelItem) {
  const chan = this.p;
  const last = chan.pop();

  // Replace current item in the position
  if (chan.length > 0) chan[(last!.i = this.i)] = last!;
}

/**
 * Create an event stream
 * @param chan
 */
export const toWebStream = (chan: Channel): ReadableStream =>
  new ReadableStream({
    // @ts-ignore
    p: chan,
    i: chan.length,
    start,
    cancel,
    c: null as any
  } satisfies ChannelItem);

/**
 * Send a chunk to the channel
 */
export const send = (chan: Channel, chunk: any): void => {
  for (let i = 0; i < chan.length; i++) chan[i].c!.enqueue(chunk);
};

/**
 * Send to end the data
 */
export const endData = '\n\n';
