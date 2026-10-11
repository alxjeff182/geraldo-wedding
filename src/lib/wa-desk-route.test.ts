import { describe, expect, it } from "vitest";
import { buildWaDeskPath, parseAppRoute } from "./wa-desk-route";

describe("wa-desk-route", () => {
  const token = "e5aa2d3c6d4e5d76da786a2ebf5450ea5297837c161a1e1a";

  it("parses admin and invite routes", () => {
    expect(parseAppRoute("/admin")).toEqual({ kind: "admin" });
    expect(parseAppRoute("/admin/")).toEqual({ kind: "admin" });
    expect(parseAppRoute("/")).toEqual({ kind: "invite" });
    expect(parseAppRoute("/?guest=ade")).toEqual({ kind: "invite" });
  });

  it("parses secret wa-desk token paths", () => {
    expect(parseAppRoute(`/k/${token}`)).toEqual({ kind: "wa-desk", token });
    expect(parseAppRoute(`/k/${token}/`)).toEqual({ kind: "wa-desk", token });
  });

  it("rejects short or malformed tokens", () => {
    expect(parseAppRoute("/k/tooshort")).toEqual({ kind: "invite" });
    expect(parseAppRoute("/k/")).toEqual({ kind: "invite" });
    expect(parseAppRoute("/kirim/" + token)).toEqual({ kind: "invite" });
    expect(parseAppRoute(`/k/${token}?x=1`.split("?")[0]!)).toEqual({
      kind: "wa-desk",
      token,
    });
  });

  it("builds desk path", () => {
    expect(buildWaDeskPath(token)).toBe(`/k/${token}`);
  });
});
