import { describe, expect, it } from "vitest";
import { DEFAULT_INVITE_TEMPLATE_ID, INVITE_MESSAGE_TEMPLATES } from "../config/invite-templates";

describe("invite-templates", () => {
  it("ships 3 default WhatsApp templates", () => {
    expect(INVITE_MESSAGE_TEMPLATES).toHaveLength(3);
    expect(INVITE_MESSAGE_TEMPLATES.every((item) => item.id && item.name && item.message)).toBe(
      true,
    );
  });

  it("defaults guest-list sends to 1. Undangan Resmi", () => {
    expect(DEFAULT_INVITE_TEMPLATE_ID).toBe("formal-kristen");
    const def = INVITE_MESSAGE_TEMPLATES.find((t) => t.id === DEFAULT_INVITE_TEMPLATE_ID);
    expect(def?.name).toMatch(/Undangan Resmi/i);
    expect(def?.message).toContain("Kepada Yth.");
    expect(def?.message).toContain("Pesta Pernikahan {pasangan}");
    expect(def?.message).not.toContain("PESTA PERNIKAHAN");
    expect(def?.message).toContain("Salam hormat,\n{pasangan}.");
    expect(def?.message).toContain("{nama}");
    expect(def?.message).toContain("{link}");
  });
});
