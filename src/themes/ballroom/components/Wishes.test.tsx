import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { WeddingContentProvider } from "../../../context/WeddingContentContext";
import { Wishes } from "./Wishes";

vi.mock("../../../lib/supabase-rest", () => ({
  isSupabaseConfigured: false,
  fetchPublicWishes: vi.fn().mockResolvedValue({ data: [], error: true }),
}));

describe("Wishes public + invite forms", () => {
  it("shows public wish form without guestId", () => {
    render(
      <WeddingContentProvider>
        <Wishes guestId={null} guestName="" onToast={() => undefined} />
      </WeddingContentProvider>,
    );
    expect(screen.queryByText(/buka undangan dari link pribadi/i)).toBeNull();
    expect(screen.getByRole("button", { name: /kirim ucapan/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/nama anda/i)).toBeInTheDocument();
  });

  it("shows locked name chip when guestId is present", () => {
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
    expect(screen.getByText("Budi")).toBeInTheDocument();
  });
});
