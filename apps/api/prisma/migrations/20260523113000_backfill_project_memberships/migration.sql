INSERT INTO "ProjectMembership" ("id", "projectId", "membershipId", "createdAt")
SELECT
  concat('backfill-', p."id", '-', m."id"),
  p."id",
  m."id",
  CURRENT_TIMESTAMP
FROM "Project" p
JOIN "Membership" m
  ON m."organizationId" = p."organizationId"
LEFT JOIN "ProjectMembership" pm
  ON pm."projectId" = p."id"
 AND pm."membershipId" = m."id"
WHERE pm."id" IS NULL;
