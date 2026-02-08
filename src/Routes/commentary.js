      import { Router } from 'express';
      import { db } from '../db/db.js';
      import { commentary } from '../db/schema.js';
      import { matchIdParamSchema } from '../validation/matches.js';
      import { createCommentarySchema, listCommentaryQuerySchema } from '../validation/commentary.js';
      import { desc, eq } from 'drizzle-orm';
      
      export const commentaryRouter = Router({ mergeParams: true });
      
      const MAX_LIMIT = 100;
      
      commentaryRouter.get('/', async (req, res) => {
        try {
          const paramsValidation = matchIdParamSchema.safeParse(req.params);
          if (!paramsValidation.success) {
            return res.status(400).json({ error: 'Invalid match ID', details: paramsValidation.error });
          }
          const { id: matchId } = paramsValidation.data;
      
          const queryValidation = listCommentaryQuerySchema.safeParse(req.query);
          if (!queryValidation.success) {
            return res.status(400).json({ error: 'Invalid query parameters', details: queryValidation.error });
          }
          const limit = queryValidation.data.limit ?? MAX_LIMIT;
          const cappedLimit = Math.min(limit, MAX_LIMIT);
      
          const commentaries = await db
            .select()
            .from(commentary)
            .where(eq(commentary.matchId, matchId))
            .orderBy(desc(commentary.createdAt))
            .limit(cappedLimit);
      
          res.json(commentaries);
        } catch (error) {
          console.error('Error fetching commentary:', error);
          res.status(500).json({ error: 'Failed to fetch commentary' });
        }
      });
      
      commentaryRouter.post('/', async (req, res) => {
        try {
          const { id: matchId } = matchIdParamSchema.parse(req.params);
          const commentaryData = createCommentarySchema.parse(req.body);
      
          const newCommentary = await db.insert(commentary).values({
            ...commentaryData,
            matchId,
          }).returning();
      
          res.status(201).json(newCommentary);
        } catch (error) {
          console.error('Error creating commentary:', error);
          res.status(500).json({ error: 'Failed to create commentary' });
        }
      });