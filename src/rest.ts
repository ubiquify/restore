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
    return app;
  };

  return configure();
};
