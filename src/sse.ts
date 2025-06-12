type Emitter = [p: Promise<void>, res: () => void, fn: (res: () => void) => void, ...chunks: any[]];

const resolvedPromise = Promise.resolve();

/**
 * Create an event emitter
 */
export const emitter = (): Emitter => {
  const chunks: any[] = [null, null, null];
  chunks[0] = new Promise(chunks[2] = (res: any) => {
    chunks[1] = res;
  });
  return chunks as Emitter;
}

const options = {
  headers: [
    ['Content-Type', 'text/event-stream'],
    ['Cache-Control', 'no-cache']
  ]
} satisfies ResponseInit;

/**
 * Event start
 * @param name
 */
export const startEvent = (name: string): string => 'event: ' + name + '\ndata: ';

/**
 * Create an event stream
 * @param signal
 * @param emitter - The event emitter
 */
export const stream = (signal: AbortSignal, emitter: Emitter): ReadableStream => {
  const st = async (c: ReadableStreamDefaultController<any>): Promise<any> => {
    if (!signal.aborted) {
      await emitter[0];
      emitter[0] = new Promise(emitter[2]);

      for (let i = 3; i < emitter.length; i++)
        c.enqueue(emitter[i]);
      emitter.length = 3;

      return st(c);
    }

    c.close();
  }

  return new ReadableStream({
    start: st
  });
}

/**
 * Create an event stream for Bun
 * @param signal
 * @param emitter - The event emitter
 */
export const bunStream = (signal: AbortSignal, emitter: Emitter): ReadableStream => {
  const st = async (c: ReadableStreamDirectController): Promise<any> => {
    if (!signal.aborted) {
      await emitter[0];
      emitter[0] = new Promise(emitter[2]);

      for (let i = 3; i < emitter.length; i++)
        c.write(emitter[i]);
      emitter.length = 3;

      return st(c);
    }

    c.close();
  }

  // @ts-ignore
  return new ReadableStream({
    type: 'direct',
    pull: st
  });
}

/**
 * Create a fetch handler
 * @param emitter
 */
export const handler = (emitter: Emitter): (req: Request) => Response => globalThis.Bun != null
  ? (req) => new Response(bunStream(req.signal, emitter), options)
  : (req) => new Response(stream(req.signal, emitter), options);

/**
 * @param emitter
 */
export const flush = (emitter: Emitter): Promise<void> => {
  emitter[1]();
  return resolvedPromise;
}

/**
 * Send to end the data
 */
export const endData = '\n\n';
