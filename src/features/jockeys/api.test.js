import { describe, it, expect } from "vitest";
import { findEntryId, mapInvitation } from "./api";

describe("findEntryId", () => {
  it("returns the entryId for the matching horse", () => {
    const entries = [
      { entryId: "e1", horseId: "h1" },
      { entryId: "e2", horseId: "h2" },
    ];
    expect(findEntryId(entries, "h2")).toBe("e2");
    expect(findEntryId(entries, "nope")).toBeNull();
  });
});

describe("mapInvitation", () => {
  it("maps an InvitationResponse to an Invitation VM", () => {
    const inv = mapInvitation({
      assignmentId: "a1",
      status: "INVITED",
      invitedAt: "2026-01-01T00:00:00Z",
      horseId: "h3",
      horseName: "Sapphire Wind",
      horseCode: "HRS0003",
      raceId: "r1",
      raceName: "Belmont",
      scheduledStartAt: null,
      tournamentName: "Dubai",
      jockeyUserId: "j1",
      jockeyName: "Alex Mercer",
      jockeyAvatarUrl: null,
      entryId: "e1",
      entryNo: 3,
    });
    expect(inv.id).toBe("a1");
    expect(inv.status).toBe("INVITED");
    expect(inv.horse).toBe("Sapphire Wind");
    expect(inv.jockey).toBe("Alex Mercer");
    expect(inv.tournament).toBe("Dubai");
    expect(inv.entryId).toBe("e1");
    expect(inv.jockeyUserId).toBe("j1");
  });
});
