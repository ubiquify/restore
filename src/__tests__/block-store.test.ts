import { lmdbBlockStoreFactory, ClosableBlockStore } from "../block-store";
import { v4 as uuid } from "uuid";

describe("Block Store", () => {
  let blockStore: ClosableBlockStore;

  beforeAll(() => {
    blockStore = lmdbBlockStoreFactory(`/tmp/block-store-${uuid()}`);
  });

  afterAll(() => {
    blockStore.close();
  });

  it("should store and retrieve a block", async () => {
    const cid = "QmV5kz2FJNpGk7U2qL7v6QbC5w5VQcCv8YsZmUH5y1Ux";
    const bytes = new TextEncoder().encode("hello world");
    await blockStore.put({ cid, buffer: Buffer.from(bytes) });
    const retrievedBuffer = blockStore.get(cid);
    expect(new Uint8Array(retrievedBuffer)).toEqual(bytes);
  });

  it("should throw an error when retrieving a non-existent block", async () => {
    const nonExistentCid = "non-existent-cid";
    expect(blockStore.get(nonExistentCid)).toBeUndefined();
  });
});
