import readline from 'readline';

import notifier from 'node-notifier';

export function askQuestion(query): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) =>
    rl.question(query, (ans) => {
      rl.close();
      resolve(ans);
    })
  );
}

export const promiseWithTimeout = <T>(
  timeoutMs: number,
  promise: () => Promise<T>,
  failureMessage?: string
) => {
  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(failureMessage));
    }, timeoutMs);
  });

  return {
    promise: Promise.race([promise(), timeoutPromise]).then((result) => {
      clearTimeout(timeoutHandle);
      return result;
    }),
    handle: timeoutHandle,
  };
};

export type TimeOutResult<T> = { promise: Promise<T>; handle: NodeJS.Timeout };

export const setTimeoutPromise = <T>(
  timeoutMs: number,
  func: () => T
): TimeOutResult<T> => {
  let handle: NodeJS.Timeout;
  const promise = new Promise<T>((resolve) => {
    handle = setTimeout(() => {
      resolve(func());
    }, timeoutMs);
  });
  return { promise, handle };
};

export function systemAlert(title: string, message: string) {
  notifier.notify({ title, message, sound: true });
}
