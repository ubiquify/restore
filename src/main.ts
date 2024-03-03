import {
  RestoreServer,
  createRestoreServer,
  ClosableBlockStore,
  lmdbBlockStoreFactory,
  getCertificate,
} from ".";

const env1 = {
  RESTORE_PERSISTENCE_PATH: "./data",
  RESTORE_HTTP_PORT: "3007",
  RESTORE_HTTPS_PORT: "3009",
};
const isDockerEnv = process.env.RESTORE_DOCKER_ENV === "true";
const env = isDockerEnv ? process.env : env1;
const httpPort = parseInt(env.RESTORE_HTTP_PORT!);
const httpsPort = parseInt(env.RESTORE_HTTPS_PORT!);
const persistencePath = env.RESTORE_PERSISTENCE_PATH || "./data";

const blockStore: ClosableBlockStore = lmdbBlockStoreFactory(persistencePath);

const restoreServer: RestoreServer = createRestoreServer(blockStore);

restoreServer.startHttp(httpPort, () => {
  console.log(
    `Restore server listening on http port ${httpPort}, isDockerEnv: ${isDockerEnv}, persistencePath: ${persistencePath}, url: http://localhost:${httpPort}`
  );
});

restoreServer.startHttps(httpsPort, getCertificate(), () => {
  console.log(
    `Restore server listening on https port ${httpsPort}, isDockerEnv: ${isDockerEnv}, persistencePath: ${persistencePath}, url: https://localhost:${httpsPort}`
  );
});

const shutDown = (signal: any) => {
  return (err: any) => {
    console.log(`Restore server stopped by ${signal}`);
    if (err) console.error(err.stack || err);
    setTimeout(() => {
      restoreServer.stopHttp(() => {
        restoreServer.stopHttps(() => {
          process.exit(err ? 1 : 0);
        });
      });
    }, 5000).unref();
  };
};

process
  .on("SIGTERM", shutDown("SIGTERM"))
  .on("SIGINT", shutDown("SIGINT"))
  .on("uncaughtException", shutDown("uncaughtException"));
