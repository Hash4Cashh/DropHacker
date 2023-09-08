"use client";

import { useEffect } from "react";

export function useWorker(
  workerRef: any, // const workerRef = useRef<Worker | null>(null);
  onMessage: (event: MessageEvent) => any,
  workerPath = "../worker.ts"
) {
  useEffect(() => {

    workerRef.current = new Worker(new URL("../worker.ts", import.meta.url));
    // workerRef.current = new Worker(resolveWorkerURL(workerPath));
    // console.log(workerPath);
    // workerRef.current = new Worker(new URL(workerPath, import.meta.url));
    // workerRef.current = new Worker(workerPath);
    // workerRef.current = new Worker("./workers/worker.ts");

    // Add an event listener to handle messages from the worker
    workerRef.current.onmessage = onMessage;

    workerRef.current.onerror = (event: MessageEvent) => {
      if (event instanceof Event) {
        console.log("🍎 Error message received from worker: ", event);
        return event;
      }

      console.log("🍎 Unexpected error: ", event);
      throw event;
    };

    // * How to call worker
    // workerRef.current.postMessage({
    //   amount: 5,
    //   startIndex: 1,
    //   walletPrefix: "Wallet",
    // });

    // Clean up the worker on component unmount
    return () => {
      if (workerRef.current) {
        workerRef.current.terminate(); // Terminate the worker
      }
    };
  }, []);
}
