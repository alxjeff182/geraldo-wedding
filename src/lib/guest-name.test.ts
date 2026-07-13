import { describe, expect, it } from "vitest";
import { decodeGuestName } from "./guest-name";

describe("decodeGuestName", () => {
  it("decodes plus signs as spaces", () => {
    expect(decodeGuestName("Jeffry+%26+Istri")).toBe("Jeffry & Istri");
  });

  it("returns raw string on invalid encoding", () => {
    expect(decodeGuestName("%E0%A4%A")).toBe("%E0%A4%A");
  });
});
