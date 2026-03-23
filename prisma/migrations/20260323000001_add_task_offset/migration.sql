-- AlterTable: add offset column with default 0
ALTER TABLE "Task" ADD COLUMN "offset" INTEGER NOT NULL DEFAULT 0;

-- Backfill offset for any existing rows based on their due date relative to the project deadline
UPDATE "Task" t
SET "offset" = ROUND(EXTRACT(EPOCH FROM (t.due - p.deadline)) / 86400)::INTEGER
FROM "Project" p
WHERE t."projectId" = p.id;
