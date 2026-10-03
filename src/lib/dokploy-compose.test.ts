import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const compose = readFileSync("docker-compose.dokploy.yml", "utf8");

describe("Dokploy database isolation", () => {
  it("pins application database traffic to the private Compose service", () => {
    expect(compose).toContain(
      "DATABASE_URL: postgresql://${APP_DATABASE_USER:?APP_DATABASE_USER is required}:" +
      "${APP_DATABASE_PASSWORD:?APP_DATABASE_PASSWORD is required}@postgres:5432/" +
      "${POSTGRES_DB:?POSTGRES_DB is required}",
    );
    expect(compose).not.toContain("DATABASE_URL: ${DATABASE_URL:");
  });

  it("rejects credentials that would make the generated URI ambiguous", () => {
    expect(compose).toContain("APP_DATABASE_USER must contain only URI-safe characters");
    expect(compose).toContain("APP_DATABASE_PASSWORD must contain only URI-safe characters");
  });
});
