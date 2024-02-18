import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";
import { BlockStore } from ".";

export const createRestInterface = (blockStore: BlockStore): Application => {
  const configure = (): Application => {
    const app = express();
    app.use(cors());
    app.use(express.raw({ type: "application/octet-stream" }));

    app.put("/blocks/:cid", async (req: Request, res: Response) => {
      try {
        const buffer: Buffer = req.body;
        await blockStore.put({
          cid: req.params.cid,
          buffer,
        });
        res.status(201).send();
      } catch (err) {
        res.status(500).send();
      }
    });

    app.get("/blocks/:cid", (req: Request, res: Response) => {
      try {
        const buffer: Buffer = blockStore.get(req.params.cid);
        if (buffer !== undefined) {
          res.status(200).send(buffer);
        } else {
          res.status(404).send();
        }
      } catch (err) {
        res.status(500).send();
      }
    });

    app.get("/cids", (req: Request, res: Response) => {
      try {
        const start = (req.query.start as string) || "0";
        const end = (req.query.end as string) || "z";
        const limit = parseInt((req.query.limit as string) || "10");
        const cids = blockStore.cids({ start, end, limit });
        res.status(200).send(cids);
      } catch (err) {
        res.status(500).send();
      }
    });
    return app;
  };

  return configure();
};
