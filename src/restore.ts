import * as http from "http";
import https from "https";
import { createRestInterface } from ".";
import { ClosableBlockStore } from ".";

export interface RestoreServer {
  startHttp(port: number, callback: () => void): http.Server;
  stopHttp(callback: () => void): void;
  startHttps(
    port: number,
    options: { key: string; cert: string },
    callback: () => void
  ): https.Server;
  stopHttps(callback: () => void): void;
}

export const createRestoreServer = (
  blockStore: ClosableBlockStore
): RestoreServer => {
  let httpServer: http.Server | undefined;
  let httpsServer: https.Server | undefined;

  const createApplication = () => {
    return createRestInterface(blockStore);
  };

  const startHttp = (port: number, callback: () => void): http.Server => {
    const app = createApplication();
    httpServer = http.createServer(app);
    httpServer.listen(port, callback);
    return httpServer;
  };

  const stopHttp = (callback: () => void): void => {
    try {
      if (httpServer) httpServer.close(callback);
    } finally {
      blockStore.close();
    }
  };

  const startHttps = (
    port: number,
    options: { key: string; cert: string },
    callback: () => void
  ): https.Server => {
    const app = createApplication();
    httpsServer = https.createServer(options, app);
    httpsServer.listen(port, callback);
    return httpsServer;
  };

  const stopHttps = (callback: () => void): void => {
    try {
      if (httpsServer) httpsServer.close(callback);
    } finally {
      blockStore.close();
    }
  };

  return {
    startHttp,
    stopHttp,
    startHttps,
    stopHttps,
  };
};
