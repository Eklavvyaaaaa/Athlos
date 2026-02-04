import { z } from 'zod';

export const listMatchesQuerySchema = z.object({
  limit: z.coerce.number().positive().max(100).optional(),
});

export const MATCH_STATUS = {
  SCHEDULED: 'scheduled',
  LIVE: 'live',
  FINISHED: 'finished',
};

export const matchIdParamSchema = z.object({
  id: z.coerce.number().positive(),
});

export const createMatchSchema = z
  .object({
    sport: z.string().min(1),
    homeTeam: z.string().min(1),
    awayTeam: z.string().min(1),
    startTime: z.string().datetime(),
    endTime: z.string().datetime(),
    homeScore: z.coerce.number().nonnegative().optional(),
    awayScore: z.coerce.number().nonnegative().optional(),
  })
  .superRefine((data, ctx) => {
    if (new Date(data.startTime) >= new Date(data.endTime)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time must be after start time',
        path: ['endTime'],
      });
    }
  });

export const updateScoreSchema = z.object({
  homeScore: z.coerce.number().nonnegative(),
  awayScore: z.coerce.number().nonnegative(),
});
