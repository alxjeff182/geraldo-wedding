import { useEffect, useState } from "react";
import { getSupabase, isSupabaseConfigured } from "../../lib/supabase";
import type { WeddingConfig } from "../../config/wedding.config";
import { buildChecks } from "./siap-kirim-checks";

type Props = {
  merged: WeddingConfig;
};

export function SiapKirimChecklist({ merged }: Props) {
  const [guestCount, setGuestCount] = useState<number | null>(null);
  const checks = buildChecks(merged, guestCount);
  const ready = checks.every((c) => c.ok);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setGuestCount(null);
      return;
    }
    const supabase = getSupabase();
    if (!supabase) return;

    void supabase
      .from("guests")
      .select("*", { count: "exact", head: true })
      .then(({ count, error }) => {
        if (error) {
          setGuestCount(null);
          return;
        }
        setGuestCount(count ?? 0);
      });
  }, []);

  return (
    <section className="admin-checklist admin-field--wide" aria-labelledby="siap-kirim-title">
      <h3 id="siap-kirim-title" className="admin-checklist__title">
        Siap kirim? {ready ? "✓" : "—"}
      </h3>
      <ul className="admin-checklist__list">
        {checks.map((item) => (
          <li key={item.id} className={item.ok ? "is-ok" : "is-pending"}>
            <span>{item.ok ? "✓" : "○"}</span>
            <div>
              <strong>{item.label}</strong>
              {!item.ok && item.hint ? <small>{item.hint}</small> : null}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
