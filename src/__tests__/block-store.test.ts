import { lmdbBlockStoreFactory, ClosableBlockStore } from "../block-store";
import { v4 as uuid } from "uuid";

describe("Block Store", () => {
  let blockStore: ClosableBlockStore;

  beforeEach(() => {
    blockStore = lmdbBlockStoreFactory(`/tmp/block-store-${uuid()}`);
  });

  afterEach(() => {
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

  it("should return an empty array when no cids are stored", async () => {
    const cids = blockStore.cids({ start: "0", end: "z", limit: 10 });
    expect(cids).toEqual([]);
  });

  it("should return the cids stored in the block store", async () => {
    const cids = ["a", "b", "c", "d", "e"];
    for (const cid of cids) {
      await blockStore.put({
        cid,
        buffer: Buffer.from(new TextEncoder().encode(cid)),
      });
    }
    const retrievedCids = blockStore.cids({ start: "0", end: "z", limit: 10 });
    expect(retrievedCids).toEqual(cids);
  });

  it("should clear the block store", async () => {
    const cid = "QmV5kz2FJNpGk7U2qL7v6QbC5w5VQcCv8YsZmUH5y1Ux";
    const bytes = new TextEncoder().encode("hello world");
    await blockStore.put({ cid, buffer: Buffer.from(bytes) });
    await blockStore.clear();
    const retrievedBuffer = blockStore.get(cid);
    expect(retrievedBuffer).toBeUndefined();
  });
  
});
