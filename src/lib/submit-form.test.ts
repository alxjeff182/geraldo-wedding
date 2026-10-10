import { beforeEach, describe, expect, it, vi } from "vitest";
import { submitForm } from "./submit-form";

const invokeMock = vi.fn();

vi.mock("./supabase-rest", () => ({
  isSupabaseConfigured: true,
  invokeSubmitFunction: (...args: unknown[]) => invokeMock(...args),
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
    expect(invokeMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "rsvp",
        payload: expect.objectContaining({
          name: "Budi",
          attendance: "hadir",
        }),
      }),
    );
  });

  it("submits wish payload to edge function", async () => {
    const result = await submitForm({
      type: "wish",
      payload: { name: "Ani", message: "Selamat menempuh hidup baru!" },
    });

    expect(result.ok).toBe(true);
    expect(invokeMock).toHaveBeenCalledWith(expect.objectContaining({ type: "wish" }));
  });

  it("surfaces server 429 message instead of generic networkError", async () => {
    invokeMock.mockResolvedValue({
      data: { error: "Tunggu sebentar sebelum mengirim ucapan lagi." },
      error: "Tunggu sebentar sebelum mengirim ucapan lagi.",
      kind: "server",
    });

    const result = await submitForm({
      type: "wish",
      payload: { name: "Ani", message: "Halo lagi" },
      messages: {
        networkErrorMessage: "Gagal mengirim. Silakan coba lagi.",
      },
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Tunggu sebentar sebelum mengirim ucapan lagi.");
  });

  it("uses networkError for transport failures", async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: "Gagal mengirim (jaringan)",
      kind: "network",
    });

    const result = await submitForm({
      type: "wish",
      payload: { name: "Ani", message: "Halo" },
      messages: {
        networkErrorMessage: "Gagal mengirim. Silakan coba lagi.",
      },
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Gagal mengirim. Silakan coba lagi.");
  });

  it("falls back to networkError for generic HTTP status without body", async () => {
    invokeMock.mockResolvedValue({
      data: null,
      error: "HTTP 500",
      kind: "server",
    });

    const result = await submitForm({
      type: "wish",
      payload: { name: "Ani", message: "Halo" },
      messages: {
        networkErrorMessage: "Gagal mengirim. Silakan coba lagi.",
      },
    });

    expect(result.ok).toBe(false);
    expect(result.error).toBe("Gagal mengirim. Silakan coba lagi.");
  });
});
