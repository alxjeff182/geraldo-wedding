import { useCallback, useEffect, useMemo, useState } from "react";
import type { WeddingConfig } from "../../config/wedding.config";
import { getSupabase } from "../../lib/supabase";
import type { Guest, RsvpSubmission } from "../../lib/supabase";

type RsvpCopy = WeddingConfig["rsvp"];

type Props = {
  rsvp: RsvpCopy;
  onNotify: (message: string) => void;
};

type AttendanceFilter = "all" | RsvpSubmission["attendance"];

function formatDate(value: string): string {
  return new Date(value).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function attendanceLabel(
  value: RsvpSubmission["attendance"],
  copy: RsvpCopy,
): string {
  if (value === "hadir") return copy.attendanceHadir;
  if (value === "tidak_hadir") return copy.attendanceTidak;
  return copy.attendanceRagu;
}

export function RsvpSubmissionsPanel({ rsvp, onNotify }: Props) {
  const [submissions, setSubmissions] = useState<RsvpSubmission[]>([]);
  const [guestsById, setGuestsById] = useState<Record<string, Guest>>({});
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<AttendanceFilter>("all");

  const loadData = useCallback(async () => {
    const supabase = getSupabase();
    if (!supabase) {
      setLoading(false);
      return;
    }

    const [rsvpResult, guestsResult] = await Promise.all([
      supabase
        .from("rsvp_submissions")
        .select("id, guest_id, name, gender, city, attendance, guest_count, created_at")
        .order("created_at", { ascending: false }),
      supabase.from("guests").select("id, slug, display_name, phone"),
    ]);

    if (rsvpResult.error) {
      onNotify(rsvp.loadError);
      setLoading(false);
      return;
    }

    setSubmissions(rsvpResult.data ?? []);

    const guestMap: Record<string, Guest> = {};
    for (const guest of guestsResult.data ?? []) {
      guestMap[guest.id] = guest;
    }
    setGuestsById(guestMap);
    setLoading(false);
  }, [onNotify, rsvp.loadError]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    const channel = supabase
      .channel("admin-rsvp-submissions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "rsvp_submissions" },
        () => {
          void loadData();
          onNotify(rsvp.liveUpdateMessage);
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "rsvp_submissions" },
        () => {
          void loadData();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [loadData, onNotify, rsvp.liveUpdateMessage]);

  const stats = useMemo(() => {
    const hadirRows = submissions.filter((row) => row.attendance === "hadir");
    const tidakRows = submissions.filter((row) => row.attendance === "tidak_hadir");

    return {
      total: submissions.length,
      people: hadirRows.reduce((sum, row) => sum + row.guest_count, 0),
      hadir: hadirRows.length,
      tidak: tidakRows.length,
    };
  }, [submissions]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return submissions.filter((row) => {
      if (filter !== "all" && row.attendance !== filter) return false;
      if (!q) return true;

      const guestName = row.guest_id ? guestsById[row.guest_id]?.display_name ?? "" : "";
      return (
        row.name.toLowerCase().includes(q) ||
        guestName.toLowerCase().includes(q)
      );
    });
  }, [submissions, search, filter, guestsById]);

  const handleDelete = async (row: RsvpSubmission) => {
    if (!window.confirm(rsvp.deleteConfirm)) return;

    setDeletingId(row.id);
    const supabase = getSupabase();
    if (!supabase) {
      onNotify(rsvp.deleteError);
      setDeletingId(null);
      return;
    }

    const { error } = await supabase.from("rsvp_submissions").delete().eq("id", row.id);
    setDeletingId(null);

    if (error) {
      onNotify(rsvp.deleteError);
      return;
    }

    onNotify(rsvp.deletedMessage);
    await loadData();
  };

  const handleExport = () => {
    const header = [
      rsvp.colDate,
      rsvp.colName,
      rsvp.colCount,
      rsvp.colAttendance,
      rsvp.colGuest,
    ];

    const lines = filtered.map((row) => {
      const guestLabel = row.guest_id
        ? guestsById[row.guest_id]?.display_name ?? row.guest_id
        : "-";

      return [
        formatDate(row.created_at),
        row.name,
        String(row.guest_count),
        attendanceLabel(row.attendance, rsvp),
        guestLabel,
      ]
        .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
        .join(",");
    });

    const csv = [header.map((cell) => `"${cell}"`).join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rsvp-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    onNotify(rsvp.exportSuccess);
  };

  const filters: { id: AttendanceFilter; label: string }[] = [
    { id: "all", label: rsvp.filterAll },
    { id: "hadir", label: rsvp.filterHadir },
    { id: "tidak_hadir", label: rsvp.filterTidak },
    { id: "ragu", label: rsvp.filterRagu },
  ];

  return (
    <section className="admin-rsvp-list">
      <header className="admin-rsvp-list__head">
        <div>
          <h3 className="admin-rsvp-list__title">{rsvp.listTitle}</h3>
          <p className="admin-rsvp-list__subtitle">{rsvp.listSubtitle}</p>
        </div>
        <div className="admin-rsvp-list__stats" aria-label="Ringkasan RSVP">
          <span className="admin-rsvp-list__stat">
            <strong>{stats.total}</strong> {rsvp.statTotal}
          </span>
          <span className="admin-rsvp-list__stat admin-rsvp-list__stat--hadir">
            <strong>{stats.people}</strong> {rsvp.statPeople}
          </span>
          <span className="admin-rsvp-list__stat admin-rsvp-list__stat--hadir">
            <strong>{stats.hadir}</strong> {rsvp.statHadir}
          </span>
          <span className="admin-rsvp-list__stat admin-rsvp-list__stat--tidak">
            <strong>{stats.tidak}</strong> {rsvp.statTidak}
          </span>
        </div>
      </header>

      <div className="admin-rsvp-list__toolbar">
        <input
          className="admin-input admin-rsvp-list__search"
          type="search"
          value={search}
          placeholder={rsvp.searchPlaceholder}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="admin-rsvp-list__filters" role="group" aria-label="Filter kehadiran">
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
          <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void loadData()}>
            {rsvp.refreshButton}
          </button>
          <button
            type="button"
            className="admin-btn admin-btn--ghost"
            disabled={filtered.length === 0}
            onClick={handleExport}
          >
            {rsvp.exportButton}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="admin-rsvp-list__empty">Memuat daftar RSVP...</p>
      ) : filtered.length === 0 ? (
        <p className="admin-rsvp-list__empty">{rsvp.emptyList}</p>
      ) : (
        <div className="admin-rsvp-list__table-wrap">
          <table className="admin-rsvp-list__table">
            <thead>
              <tr>
                <th>{rsvp.colDate}</th>
                <th>{rsvp.colName}</th>
                <th>{rsvp.colCount}</th>
                <th>{rsvp.colAttendance}</th>
                <th>{rsvp.colGuest}</th>
                <th>{rsvp.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => {
                const guest = row.guest_id ? guestsById[row.guest_id] : null;

                return (
                  <tr key={row.id}>
                    <td className="admin-rsvp-list__date">{formatDate(row.created_at)}</td>
                    <td className="admin-rsvp-list__name">{row.name}</td>
                    <td className="admin-rsvp-list__count">{row.guest_count}</td>
                    <td>
                      <span
                        className={`admin-rsvp-list__badge admin-rsvp-list__badge--${row.attendance}`}
                      >
                        {attendanceLabel(row.attendance, rsvp)}
                      </span>
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
                      <button
                        type="button"
                        className="admin-btn admin-btn--ghost admin-btn--danger"
                        disabled={deletingId === row.id}
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
