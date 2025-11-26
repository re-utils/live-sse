export { startEvent, endData } from '../sse.js';

/**
 * Describe an item in a stream channel
 */
export interface ChannelItem {
  type: 'direct',
  c?: ReadableStreamDirectController;

  // Must be initialized
  p: Channel;
  i: number;

  pull: (c: ReadableStreamDirectController) => void;
  cancel: () => void;
};

/**
 * Describe a stream channel
 */
export type Channel = ChannelItem[];

/**
 * Create an event channel
 */
export const channel = (): Channel => [];

const blockingPromise = new Promise<void>(() => {});
function pull(
  /**
   * p and i should be initialized first
   */
  this: ChannelItem,
  c: ReadableStreamDirectController,
) {
  this.c = c;
  this.p.push(this);
  return blockingPromise;
}

function cancel(
  this: ChannelItem
) {
  const chan = this.p;
  const last = chan.pop();

  // Replace current item in the position
  if (chan.length > 0) chan[last!.i = this.i] = last!;
}

/**
 * Create an event stream
 * @param signal
 * @param emitter - The event emitter
 */
export const toWebStream = (chan: Channel): ReadableStream =>
  // @ts-ignore
  new ReadableStream({
    type: 'direct',
    p: chan,
    i: chan.length,
    pull,
    cancel
  } satisfies ChannelItem);

/**
 * Send a chunk to the channel
 */
export const send = (chan: Channel, chunk: any): void => {
  for (let i = 0; i < chan.length; i++) chan[i].c!.write(chunk);
};
