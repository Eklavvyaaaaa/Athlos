import { z } from 'zod';

export const matchIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().positive().max(100).optional(),
});

export const createMatchSchema = z.object({
  // Add validation for match creation here
});

export const MATCH_STATUS = {
  UPCOMING: 'UPCOMING',
  IN_PROGRESS: 'IN_PROGRESS',
  FINISHED: 'FINISHED',
};