import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { WeddingContentProvider } from "../../../context/WeddingContentContext";
import { RsvpSheet } from "./RsvpSheet";

function renderSheet(guestId: string | null) {
  return render(
    <WeddingContentProvider>
      <RsvpSheet
        open
        guestId={guestId}
        guestName="Budi"
        onClose={() => undefined}
        setSheetRef={() => undefined}
        onToast={() => undefined}
      />
    </WeddingContentProvider>,
  );
}

describe("RsvpSheet invite gating", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-10T12:00:00+07:00"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("locks RSVP without personal guest link", () => {
    renderSheet(null);
    expect(screen.getByText(/khusus untuk tamu undangan/i)).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup", { name: /kehadiran/i })).toBeNull();
  });

  it("shows attendance form when guestId is present", () => {
    renderSheet("11111111-1111-4111-8111-111111111111");
    expect(screen.getByRole("radiogroup", { name: /kehadiran/i })).toBeInTheDocument();
  });
});
