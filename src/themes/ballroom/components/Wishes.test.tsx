import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WeddingContentProvider } from "../../../context/WeddingContentContext";
import { Wishes } from "./Wishes";

vi.mock("../../../lib/supabase-rest", () => ({
  isSupabaseConfigured: false,
  fetchPublicWishes: vi.fn().mockResolvedValue({ data: [], error: true }),
}));

describe("Wishes invite gating", () => {
  it("locks wish form without guestId", () => {
    render(
      <WeddingContentProvider>
        <Wishes guestId={null} guestName="Tamu" onToast={() => undefined} />
      </WeddingContentProvider>,
    );
    expect(
      screen.getByText(/buka undangan dari link pribadi/i),
    ).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /kirim ucapan/i })).toBeNull();
  });

  it("shows wish form when guestId is present", () => {
    render(
      <WeddingContentProvider>
        <Wishes
          guestId="11111111-1111-4111-8111-111111111111"
          guestName="Budi"
          onToast={() => undefined}
        />
      </WeddingContentProvider>,
    );
    expect(screen.getByRole("button", { name: /kirim ucapan/i })).toBeInTheDocument();
  });
});
