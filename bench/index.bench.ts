import { summary, run, bench } from 'mitata';

// Example benchmark
summary(() => {
  const register = (label: string, fn: (arr: any[], i: number) => any) => {
    bench(label, function* () {
      yield {
        [0]: () => [Math.random(), Math.random(), Math.random(), Math.random()],
        [1]: () => Math.random() > 0.5 ? 1 : 2,
        bench: fn
      }
    });
  };

  register('copyWithin', (arr, i) => {
    arr.copyWithin(-1, i);
  });

  register('direct set', (arr, i) => {
    arr[i] = arr[arr.length - 1];
  });

  register('direct set arr at', (arr, i) => {
    arr[i] = arr.at(-1);
  });
});

// Start the benchmark
run();
