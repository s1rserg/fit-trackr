# Fit Trackr

Mobile-first workout tracker built with Next.js App Router, Neon PostgreSQL, Drizzle ORM, Tailwind CSS, React Hook Form, and Zod.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set `DATABASE_URL` to your Neon connection string.
3. Install dependencies:

```bash
npm install
```

4. Push the schema to Neon:

```bash
npm run db:push
```

5. Seed the initial A/B workouts:

```bash
npm run db:seed
```

6. Start the app:

```bash
npm run dev
```

## Notes

- The database stores workouts, exercises, and per-set logs in `exercise_sets`.
- The seed script creates one initial workout `A` and one initial workout `B` with empty set logs so the app has a starting template shape in the database.
- The workout domain lives in `features/workouts`, while shared UI stays in `components/ui`.
