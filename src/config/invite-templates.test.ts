import { describe, expect, it } from "vitest";
import { INVITE_MESSAGE_TEMPLATES } from "../config/invite-templates";

describe("invite-templates", () => {
  it("ships 3 default WhatsApp templates", () => {
    expect(INVITE_MESSAGE_TEMPLATES).toHaveLength(3);
    expect(INVITE_MESSAGE_TEMPLATES.every((item) => item.id && item.name && item.message)).toBe(
      true,
    );
  });

  it("uses the formal invite as the default guest-list template", () => {
    const def = INVITE_MESSAGE_TEMPLATES[0];
    expect(def.message).toContain("Kepada Yth.");
    expect(def.message).toContain("*{nama}*");
    expect(def.message).toContain("PESTA PERNIKAHAN {pasangan}");
    expect(def.message).toContain("{link}");
    expect(def.message).toContain("Salam hormat,");
  });
});
