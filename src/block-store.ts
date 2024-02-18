import { open, asBinary } from "lmdb";

export interface Block {
  cid: string;
  buffer: Buffer;
}

export interface BlockStore {
  put: (block: { cid: any; buffer: Buffer }) => Promise<void>;
  get: (cid: any) => Buffer;
}

export interface ClosableBlockStore extends BlockStore {
  close: () => void;
}

export const lmdbBlockStoreFactory = (path: string): ClosableBlockStore => {
  const db = open({
    path,
    maxDbs: 1,
    maxReaders: 126,
  });

  const put = async ({ cid, buffer }: Block): Promise<void> => {
    await db.put(cid.toString(), asBinary(buffer));
  };

  const get = (cid: any): Buffer => {
    return db.getBinary(cid.toString());
  };

  const close = async (): Promise<void> => {
    await db.close();
  };

  return {
    put,
    get,
    close,
  };
};
