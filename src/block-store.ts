import { open, asBinary } from "lmdb";

export interface Block {
  cid: string;
  buffer: Buffer;
}

export interface BlockStore {
  put: (block: { cid: any; buffer: Buffer }) => Promise<void>;
  get: (cid: any) => Buffer;
  cids: ({
    start,
    end,
    limit,
  }: {
    start: string;
    end: string;
    limit: number;
  }) => string[];
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

  const cids = ({
    start,
    end,
    limit,
  }: {
    start: string;
    end: string;
    limit: number;
  }): string[] => {
    const options = {
      start,
      end,
      limit,
    };
    const keys = Array.from(db.getKeys(options));
    return keys.map((key) => key.toString());
  };

  return {
    put,
    get,
    close,
    cids,
  };
};
