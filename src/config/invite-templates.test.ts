import { describe, expect, it } from "vitest";
import { INVITE_MESSAGE_TEMPLATES } from "../config/invite-templates";

describe("invite-templates", () => {
  it("ships 10 default WhatsApp templates", () => {
    expect(INVITE_MESSAGE_TEMPLATES).toHaveLength(10);
    expect(INVITE_MESSAGE_TEMPLATES.every((item) => item.id && item.name && item.message)).toBe(true);
  });
});
