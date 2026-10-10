import { useCallback, useEffect, useMemo, useState } from "react";
import { getSupabase } from "../../lib/supabase";
import type { Guest, Wish } from "../../lib/supabase";

type Props = {
  onNotify: (message: string, options?: { retry?: () => void }) => void;
};

type VisibilityFilter = "all" | "visible" | "hidden";

function formatDate(value: string): string {
  return new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function WishesModerationPanel({ onNotify }: Props) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [guestsById, setGuestsById] = useState<Record<string, Guest>>({});
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<VisibilityFilter>("all");

  const loadData = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const [wishesResult, guestsResult] = await Promise.all([
      supabase
        .from("wishes")
        .select("id, guest_id, name, message, attendance, hidden, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("guests").select("id, slug, display_name, phone"),
    ]);

    if (wishesResult.error) {
      onNotify(wishesResult.error.message || "Gagal memuat daftar ucapan", {
        retry: () => void loadData(),
      });
      setLoading(false);
      return;
    }

    setWishes((wishesResult.data ?? []) as Wish[]);

    const guestMap: Record<string, Guest> = {};
    for (const guest of guestsResult.data ?? []) {
      guestMap[guest.id] = guest;
    }
    setGuestsById(guestMap);
    setLoading(false);
  }, [onNotify]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const stats = useMemo(() => {
    const hidden = wishes.filter((row) => row.hidden).length;
    return {
      total: wishes.length,
      visible: wishes.length - hidden,
      hidden,
    };
  }, [wishes]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return wishes.filter((row) => {
      if (filter === "visible" && row.hidden) return false;
      if (filter === "hidden" && !row.hidden) return false;
      if (!q) return true;
      const guestName = row.guest_id ? (guestsById[row.guest_id]?.display_name ?? "") : "";
      return (
        row.name.toLowerCase().includes(q) ||
        row.message.toLowerCase().includes(q) ||
        guestName.toLowerCase().includes(q)
      );
    });
  }, [wishes, search, filter, guestsById]);

  const toggleHidden = async (row: Wish) => {
    setBusyId(row.id);
    const supabase = getSupabase();
    if (!supabase) {
      onNotify("Gagal memperbarui ucapan");
      setBusyId(null);
      return;
    }

    const nextHidden = !row.hidden;
    const { error } = await supabase.from("wishes").update({ hidden: nextHidden }).eq("id", row.id);

    setBusyId(null);
    if (error) {
      onNotify("Gagal memperbarui ucapan");
      return;
    }

    onNotify(nextHidden ? "Ucapan disembunyikan" : "Ucapan ditampilkan kembali");
    await loadData();
  };

  const handleDelete = async (row: Wish) => {
    if (!window.confirm("Hapus ucapan ini secara permanen?")) return;

    setBusyId(row.id);
    const supabase = getSupabase();
    if (!supabase) {
      onNotify("Gagal menghapus ucapan");
      setBusyId(null);
      return;
    }

    const { error } = await supabase.from("wishes").delete().eq("id", row.id);
    setBusyId(null);

    if (error) {
      onNotify("Gagal menghapus ucapan");
      return;
    }

    onNotify("Ucapan dihapus");
    await loadData();
  };

  const filters: { id: VisibilityFilter; label: string }[] = [
    { id: "all", label: "Semua" },
    { id: "visible", label: "Tampil" },
    { id: "hidden", label: "Disembunyikan" },
  ];

  return (
    <section className="admin-rsvp-list">
      <h3 className="admin-label" style={{ marginTop: "1.5rem", marginBottom: "0.75rem" }}>
        Moderasi Ucapan
      </h3>
      <div className="admin-rsvp-list__toolbar">
        <input
          className="admin-input admin-rsvp-list__search"
          type="search"
          value={search}
          placeholder="Cari nama atau ucapan..."
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="admin-rsvp-list__filters" role="group" aria-label="Filter ucapan">
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`admin-rsvp-list__filter${filter === item.id ? " admin-rsvp-list__filter--active" : ""}`}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="admin-rsvp-list__actions">
          <div className="admin-rsvp-list__stats" aria-label="Ringkasan ucapan">
            <span className="admin-rsvp-list__stat">
              <strong>{stats.total}</strong> Total
            </span>
            <span className="admin-rsvp-list__stat admin-rsvp-list__stat--hadir">
              <strong>{stats.visible}</strong> Tampil
            </span>
            <span className="admin-rsvp-list__stat admin-rsvp-list__stat--tidak">
              <strong>{stats.hidden}</strong> Disembunyikan
            </span>
          </div>
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            onClick={() => void loadData()}
          >
            Muat Ulang
          </button>
        </div>
      </div>

      {loading ? (
        <p className="admin-rsvp-list__empty">Memuat daftar ucapan...</p>
      ) : filtered.length === 0 ? (
        <p className="admin-rsvp-list__empty">Belum ada ucapan.</p>
      ) : (
        <div className="admin-table-wrap admin-rsvp-list__table-wrap">
          <table className="admin-table admin-table--striped admin-rsvp-list__table">
            <thead>
              <tr>
                <th>Waktu</th>
                <th>Nama</th>
                <th>Ucapan</th>
                <th>Tamu</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const guest = row.guest_id ? guestsById[row.guest_id] : null;
                return (
                  <tr key={row.id}>
                    <td className="admin-rsvp-list__date">{formatDate(row.created_at)}</td>
                    <td className="admin-rsvp-list__name">{row.name}</td>
                    <td
                      style={{ maxWidth: "18rem", whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                    >
                      {row.message}
                    </td>
                    <td className="admin-rsvp-list__guest">
                      {guest ? (
                        <>
                          <span>{guest.display_name}</span>
                          <small>{guest.slug}</small>
                        </>
                      ) : (
                        <span className="admin-rsvp-list__guest-empty">—</span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`admin-rsvp-list__badge admin-rsvp-list__badge--${row.hidden ? "tidak_hadir" : "hadir"}`}
                      >
                        {row.hidden ? "Disembunyikan" : "Tampil"}
                      </span>
                    </td>
                    <td style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost"
                        disabled={busyId === row.id}
                        onClick={() => void toggleHidden(row)}
                      >
                        {row.hidden ? "Tampilkan" : "Sembunyikan"}
                      </button>
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--danger"
                        disabled={busyId === row.id}
                        onClick={() => void handleDelete(row)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
