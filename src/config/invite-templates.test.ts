import { describe, expect, it } from "vitest";
import {
  DEFAULT_INVITE_TEMPLATE_ID,
  INVITE_MESSAGE_TEMPLATES,
} from "../config/invite-templates";

describe("invite-templates", () => {
  it("ships 3 default WhatsApp templates", () => {
    expect(INVITE_MESSAGE_TEMPLATES).toHaveLength(3);
    expect(INVITE_MESSAGE_TEMPLATES.every((item) => item.id && item.name && item.message)).toBe(
      true,
    );
  });

  it("defaults guest-list sends to 3. Singkat & Sopan", () => {
    expect(DEFAULT_INVITE_TEMPLATE_ID).toBe("singkat-sopan");
    const def = INVITE_MESSAGE_TEMPLATES.find((t) => t.id === DEFAULT_INVITE_TEMPLATE_ID);
    expect(def?.name).toMatch(/Singkat/i);
    expect(def?.message).toContain("{nama}");
    expect(def?.message).toContain("{link}");
  });
});
