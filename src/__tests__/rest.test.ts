import axios, { AxiosInstance, AxiosResponse } from "axios";
import { createRestInterface } from "../rest";
import {
  ClosableBlockStore,
  lmdbBlockStoreFactory,
  Block,
} from "../block-store";
import { v4 as uuid } from "uuid";
import { createRestoreServer, RestoreServer } from "../restore";
import https from "https";
import { getCertificate } from "../cert";

describe("createRestInterface", () => {
  let restoreServer: RestoreServer;
  let httpClient: AxiosInstance;
  beforeEach(() => {
    const blockStore = lmdbBlockStoreFactory(`/tmp/block-store-${uuid()}`);
    restoreServer = createRestoreServer(blockStore);
    restoreServer.startHttps(3011, getCertificate(), () => {});
    httpClient = axios.create({
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
      baseURL: "https://localhost:3011",
    });
  });

  afterEach(() => {
    restoreServer.stopHttps(() => {});
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

  it("should store and retrieve 512Kb of data", async () => {
    const cid = "QmV5kz2FJNpGk7U2qL7v6QbC5w5VQcCv8YsZmUH5y1Ux";
    const bytes = new Uint8Array(512 * 1024);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = i % 256;
    }
    const response = await store(httpClient, cid, bytes);
    expect(response.status).toBe(201);
    const retrievedBytes = await retrieve(httpClient, cid);
    expect(retrievedBytes).toEqual(bytes);
  });

  it("should return 404 when retrieving a non-existent block", async () => {
    const cid = "non-existent-cid";
    try {
      const response = await httpClient.get(`/blocks/${cid}`);
      fail("Expected an error");
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
  });

  it("should list the cids stored in the block store", async () => {
    const cids = ["a", "b", "c", "d", "e"];
    for (const cid of cids) {
      const bytes = new TextEncoder().encode(cid);
      await store(httpClient, cid, bytes);
    }
    const response = await httpClient.get("/cids");
    expect(response.status).toBe(200);
    expect(response.data).toEqual(cids);
  });

  it("should return an empty array when no cids are stored", async () => {
    const response = await httpClient.get("/cids");
    expect(response.status).toBe(200);
    expect(response.data).toEqual([]);
  });

  it("should clear the block store", async () => {
    const cid = "QmV5kz2FJNpGk7U2qL7v6QbC5w5VQcCv8YsZmUH5y1Ux";
    const bytes = new TextEncoder().encode("hello world");
    await store(httpClient, cid, bytes);
    const response = await httpClient.delete("/blocks");
    expect(response.status).toBe(204);
    try {
      const response = await httpClient.get(`/blocks/${cid}`);
      fail("Expected an error");
    } catch (error) {
      expect(error.response.status).toBe(404);
    }
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
