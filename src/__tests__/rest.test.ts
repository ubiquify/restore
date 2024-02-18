import axios, { AxiosInstance, AxiosResponse } from "axios";
import { createRestInterface } from "../rest";
import {
  ClosableBlockStore,
  lmdbBlockStoreFactory,
  Block,
} from "../block-store";
import { v4 as uuid } from "uuid";
import { createRestoreServer, RestoreServer } from "../restore";

describe("createRestInterface", () => {
  let restoreServer: RestoreServer;
  let httpClient: AxiosInstance;
  beforeAll(() => {
    const blockStore = lmdbBlockStoreFactory(`/tmp/block-store-${uuid()}`);
    restoreServer = createRestoreServer(blockStore);
    restoreServer.startHttp(3011, () => {});
    httpClient = axios.create({
      baseURL: "http://localhost:3011",
    });
  });

  afterAll(() => {
    restoreServer.stopHttp(() => {});
  });

  it("should store a block when receiving a PUT request", async () => {
    const cid = "QmV5kz2FJNpGk7U2qL7v6QbC5w5VQcCv8YsZmUH5y1Ux";
    const bytes = new TextEncoder().encode("hello world");
    const response = await store(httpClient, cid, bytes);
    expect(response.status).toBe(201);
  });

  it("should retrieve a block when receiving a GET request", async () => {
    const cid = "QmV5kz2FJNpGk7U2qL7v6QbC5w5VQcCv8YsZmUH5y1Ux";
    const bytes = new TextEncoder().encode("hello world");
    const response = await store(httpClient, cid, bytes);
    expect(response.status).toBe(201);
    const retrievedBytes = await retrieve(httpClient, cid);
    expect(retrievedBytes).toEqual(bytes);
  });
});

async function store(
  httpClient: any,
  cid: string,
  bytes: Uint8Array
): Promise<AxiosResponse> {
  return await httpClient.put(`/blocks/${cid}`, bytes, {
    headers: {
      "Content-Type": "application/octet-stream",
    },
    data: bytes,
  });
}

async function retrieve(
  httpClient: any,
  cid: string
): Promise<Uint8Array | undefined> {
  const response: AxiosResponse<ArrayBuffer> = await httpClient.get(
    `/blocks/${cid}`,
    {
      responseType: "arraybuffer",
    }
  );
  if (response.data) {
    return new Uint8Array(response.data);
  }
  return undefined;
}
