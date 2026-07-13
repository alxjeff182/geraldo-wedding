import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RsvpForm } from "./RsvpForm";
import { WeddingContentProvider } from "../../context/WeddingContentContext";

vi.mock("../../lib/submit-form", () => ({
  submitForm: vi.fn(async () => ({ ok: true, message: "Terima kasih!" })),
}));

vi.mock("../../lib/supabase", () => ({
  isSupabaseConfigured: false,
}));

function renderRsvp(props?: Partial<Parameters<typeof RsvpForm>[0]>) {
  return render(
    <WeddingContentProvider>
      <RsvpForm guestId={null} embedded onSuccess={vi.fn()} {...props} />
    </WeddingContentProvider>,
  );
}

describe("RsvpForm", () => {
  it("renders attendance choices", () => {
    renderRsvp();
    expect(screen.getByRole("group", { name: /pilihan kehadiran/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^hadir$/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tidak hadir/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^ragu$/i })).toBeInTheDocument();
  });

  it("hides guest count when attendance is tidak hadir", async () => {
    const user = userEvent.setup();
    renderRsvp();

    const attendance = screen.getByRole("group", { name: /pilihan kehadiran/i });
    await user.click(within(attendance).getByRole("button", { name: /tidak hadir/i }));

    expect(screen.queryByRole("group", { name: /jumlah kehadiran/i })).not.toBeInTheDocument();
  });
});
