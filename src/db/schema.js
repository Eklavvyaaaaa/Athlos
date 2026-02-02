import {
    pgTable,
    pgEnum,
    serial,
    varchar,
    integer,
    timestamp,
    text,
    jsonb,
} from 'drizzle-orm/pg-core';

export const matchStatusEnum = pgEnum('match_status', [
    'scheduled',
    'live',
    'finished',
]);

export const matches = pgTable('matches', {
    id: serial('id').primaryKey(),

    sport: varchar('sport', { length: 50 }).notNull(),

    homeTeam: varchar('home_team', { length: 100 }).notNull(),
    awayTeam: varchar('away_team', { length: 100 }).notNull(),

    status: matchStatusEnum('status').notNull().default('scheduled'),

    startTime: timestamp('start_time', { withTimezone: true }),
    endTime: timestamp('end_time', { withTimezone: true }),

    homeScore: integer('home_score').notNull().default(0),
    awayScore: integer('away_score').notNull().default(0),

    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow(),
});

export const commentary = pgTable('commentary', {
    id: serial('id').primaryKey(),

    matchId: integer('match_id')
        .notNull()
        .references(() => matches.id, { onDelete: 'cascade' }),

    minute: integer('minute'),
    sequence: integer('sequence').notNull(),
    period: varchar('period', { length: 50 }),

    eventType: varchar('event_type', { length: 50 }),
    actor: varchar('actor', { length: 100 }),
    team: varchar('team', { length: 100 }),

    message: text('message').notNull(),

    metadata: jsonb('metadata'),
    tags: text('tags'),

    createdAt: timestamp('created_at', { withTimezone: true })
        .notNull()
        .defaultNow(),
});
