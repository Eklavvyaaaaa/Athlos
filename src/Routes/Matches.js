import { Router } from "express";
import { createMatchSchema, listMatchesQuerySchema } from "../validation/matches.js";
import {matches} from "../db/schema.js";
import {db} from "../db/db.js";
import { getMatchStatus } from "../utils/match-status.js";
import { desc } from "drizzle-orm";
import { commentaryRouter } from "./commentary.js";


export const matchRouter = Router();
const MAX_LIMIT = 50;

matchRouter.get("/", async (req, res) => {
  const paresd = listMatchesQuerySchema.safeParse(req.query);
  
  if(!paresd.success) {
    return res.status(400).json({error : 'Invalid query', details : JSON.stringify(paresd.error)});
    }

    const limit = Math.min(paresd.data.limit ?? 50, MAX_LIMIT)

  try {
    const data = await db
    .select()
    .from(matches)
    .orderBy(desc(matches.createdAt))
    .limit(limit);

    res.json({data});
  
  } catch (e) {
    res.status(500).json({error: 'failed to fetch matches.', details: JSON.stringify(e)});
  }
});

matchRouter.post('/',async (req, res) => {
  const paresd = createMatchSchema.safeParse(req.body);

  if(!paresd.success) {
    return res.status(400).json({error: 'Invalid Payload,' , details: JSON.stringify(paresd.error)});
  }
  try {
    const {data : {startTime, endTime,homeScore, awayScore}} = paresd;
    const [event] = await db.insert(matches).values({
      ...paresd.data,
      startTime: new Date(paresd.data.startTime),
      endTime: new Date(paresd.data.endTime),
      homeScore: homeScore ?? null,
      awayScore: awayScore ?? null,
      status: getMatchStatus(startTime, endTime),
    }).returning();

    if(res.app.locals.broadcastMatchCreated) {
      res.app.locals.broadcastMatchCreated(event);
    }

    res.status(201).json({data:event})
  } catch (e) {
    res.status(500).json({error: 'failed to create a match.', details: JSON.stringify(e)});
  }

});

matchRouter.use("/:id/commentary", commentaryRouter);
