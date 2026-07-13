import { beforeEach, describe, expect, it, vi } from "vitest";
import { submitForm } from "./submit-form";

const invokeMock = vi.fn();

vi.mock("./supabase", () => ({
  isSupabaseConfigured: true,
  getSupabase: () => ({
    functions: { invoke: invokeMock },
  }),
}));

describe("submitForm", () => {
  beforeEach(() => {
    invokeMock.mockReset();
    invokeMock.mockResolvedValue({ data: { ok: true }, error: null });
  });

  it("submits RSVP payload to edge function", async () => {
    const result = await submitForm({
      type: "rsvp",
      payload: {
        name: "Budi",
        guest_count: 2,
        attendance: "hadir",
      },
    });

    expect(result.ok).toBe(true);
    expect(invokeMock).toHaveBeenCalledWith("submit", {
      body: expect.objectContaining({
        type: "rsvp",
        payload: expect.objectContaining({
          name: "Budi",
          attendance: "hadir",
        }),
      }),
    });
  });

  it("submits wish payload to edge function", async () => {
    const result = await submitForm({
      type: "wish",
      payload: { name: "Ani", message: "Selamat menempuh hidup baru!" },
    });

    expect(result.ok).toBe(true);
    expect(invokeMock).toHaveBeenCalledWith("submit", {
      body: expect.objectContaining({ type: "wish" }),
    });
  });
});
