import { useEffect, useState } from "react";
import { mergeWeddingContent } from "../lib/merge-content";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";
import type { SiteContentOverrides } from "../types/site-content";
import { useWeddingContent } from "../context/WeddingContentContext";
import { ImageUploader } from "../components/admin/ImageUploader";

type Tab = "umum" | "mempelai" | "acara" | "galeri" | "gift" | "media";

const TABS: { id: Tab; label: string }[] = [
  { id: "umum", label: "Umum" },
  { id: "mempelai", label: "Mempelai" },
  { id: "acara", label: "Acara" },
  { id: "galeri", label: "Galeri" },
  { id: "gift", label: "Gift" },
  { id: "media", label: "Media" },
];

export function AdminPage() {
  const { refresh } = useWeddingContent();
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("umum");
  const [draft, setDraft] = useState<SiteContentOverrides>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = getSupabase();
    if (!supabase) return;

    void supabase.auth.getSession().then(({ data }) => {
      setSessionEmail(data.session?.user.email ?? null);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user.email ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const supabase = getSupabase();
    if (!supabase) {
      setAuthError("Supabase belum dikonfigurasi");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError("Login gagal. Periksa email dan password.");
  };

  const handleLogout = async () => {
    const supabase = getSupabase();
    if (supabase) await supabase.auth.signOut();
    setSessionEmail(null);
  };

  const updateDraft = (path: string[], value: unknown) => {
    setDraft((prev) => {
      const next = structuredClone(prev) as Record<string, unknown>;
      let cursor: Record<string, unknown> = next;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        if (!cursor[key] || typeof cursor[key] !== "object") cursor[key] = {};
        cursor = cursor[key] as Record<string, unknown>;
      }
      cursor[path[path.length - 1]] = value;
      return next as SiteContentOverrides;
    });
  };

  useEffect(() => {
    if (!sessionEmail || !isSupabaseConfigured) return;
    const supabase = getSupabase();
    if (!supabase) return;

    void supabase
      .from("site_content")
      .select("content")
      .eq("id", "main")
      .maybeSingle()
      .then(({ data }) => {
        if (data?.content && typeof data.content === "object") {
          setDraft(data.content as SiteContentOverrides);
        }
      });
  }, [sessionEmail]);

  const merged = mergeWeddingContent(draft);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    const supabase = getSupabase();
    if (!supabase) {
      setMessage("Supabase tidak tersedia");
      setSaving(false);
      return;
    }

    const { error } = await supabase.from("site_content").upsert({
      id: "main",
      content: draft,
      updated_at: new Date().toISOString(),
    });

    setSaving(false);
    if (error) {
      setMessage("Gagal menyimpan.");
      return;
    }

    setMessage("Konten berhasil disimpan!");
    await refresh();
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="admin-page">
        <p>Set VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env.local</p>
      </div>
    );
  }

  if (!sessionEmail) {
    return (
      <div className="admin-page admin-page--login">
        <form className="admin-login" onSubmit={(e) => void handleLogin(e)}>
          <h1>CMS Undangan</h1>
          <p>Masuk dengan akun admin Supabase Auth</p>
          <label className="admin-field">
            <span>Email</span>
            <input
              type="email"
              className="admin-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="admin-field">
            <span>Password</span>
            <input
              type="password"
              className="admin-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
          {authError && <p className="admin-error">{authError}</p>}
          <button type="submit" className="admin-btn">
            Masuk
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h1>CMS Undangan</h1>
          <p>{sessionEmail}</p>
        </div>
        <div className="admin-header__actions">
          <a href="/" className="admin-btn admin-btn--secondary" target="_blank" rel="noreferrer">
            Lihat Situs
          </a>
          <button type="button" className="admin-btn admin-btn--secondary" onClick={() => void handleLogout()}>
            Keluar
          </button>
          <button type="button" className="admin-btn" disabled={saving} onClick={() => void handleSave()}>
            {saving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </header>

      {message && <p className="admin-message">{message}</p>}

      <nav className="admin-tabs" aria-label="Bagian editor">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`admin-tab${tab === t.id ? " admin-tab--active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      <div className="admin-panel">
        {tab === "umum" && (
          <>
            <label className="admin-field">
              <span>Judul Situs</span>
              <input
                className="admin-input"
                value={merged.site.title}
                onChange={(e) => updateDraft(["site", "title"], e.target.value)}
              />
            </label>
            <label className="admin-field">
              <span>Deskripsi SEO</span>
              <textarea
                className="admin-input"
                rows={3}
                value={merged.site.description}
                onChange={(e) => updateDraft(["site", "description"], e.target.value)}
              />
            </label>
            <label className="admin-field">
              <span>Tanggal (ISO)</span>
              <input
                className="admin-input"
                value={merged.date}
                onChange={(e) => updateDraft(["date"], e.target.value)}
              />
            </label>
            <label className="admin-field">
              <span>Label Tanggal</span>
              <input
                className="admin-input"
                value={merged.dateLabel}
                onChange={(e) => updateDraft(["dateLabel"], e.target.value)}
              />
            </label>
            <label className="admin-field">
              <span>Intro Mempelai</span>
              <textarea
                className="admin-input"
                rows={4}
                value={merged.intro}
                onChange={(e) => updateDraft(["intro"], e.target.value)}
              />
            </label>
          </>
        )}

        {tab === "mempelai" && (
          <>
            {(["groom", "bride"] as const).map((role) => (
              <fieldset key={role} className="admin-fieldset">
                <legend>{role === "groom" ? "Mempelai Pria" : "Mempelai Wanita"}</legend>
                <label className="admin-field">
                  <span>Nama Pendek</span>
                  <input
                    className="admin-input"
                    value={merged.couple[role].shortName}
                    onChange={(e) => updateDraft(["couple", role, "shortName"], e.target.value)}
                  />
                </label>
                <label className="admin-field">
                  <span>Nama Lengkap</span>
                  <input
                    className="admin-input"
                    value={merged.couple[role].fullName}
                    onChange={(e) => updateDraft(["couple", role, "fullName"], e.target.value)}
                  />
                </label>
                <ImageUploader
                  label="Foto"
                  folder={`couple/${role}`}
                  value={merged.couple[role].photo}
                  onChange={(url) => updateDraft(["couple", role, "photo"], url)}
                />
              </fieldset>
            ))}
            <fieldset className="admin-fieldset">
              <legend>Hero Caption</legend>
              <label className="admin-field">
                <span>Nama Pria (hero)</span>
                <input
                  className="admin-input"
                  value={merged.hero.groomName}
                  onChange={(e) => updateDraft(["hero", "groomName"], e.target.value)}
                />
              </label>
              <label className="admin-field">
                <span>Nama Wanita (hero)</span>
                <input
                  className="admin-input"
                  value={merged.hero.brideName}
                  onChange={(e) => updateDraft(["hero", "brideName"], e.target.value)}
                />
              </label>
            </fieldset>
          </>
        )}

        {tab === "acara" && (
          <div className="admin-stack">
            {merged.events.map((event, index) => (
              <fieldset key={index} className="admin-fieldset">
                <legend>Acara {index + 1}</legend>
                <label className="admin-field">
                  <span>Nama</span>
                  <input
                    className="admin-input"
                    value={event.name}
                    onChange={(e) => {
                      const events = [...merged.events];
                      events[index] = { ...events[index], name: e.target.value };
                      updateDraft(["events"], events);
                    }}
                  />
                </label>
                <label className="admin-field">
                  <span>Tanggal (baris baru = enter)</span>
                  <textarea
                    className="admin-input"
                    rows={2}
                    value={event.dateLabel}
                    onChange={(e) => {
                      const events = [...merged.events];
                      events[index] = { ...events[index], dateLabel: e.target.value };
                      updateDraft(["events"], events);
                    }}
                  />
                </label>
                <label className="admin-field">
                  <span>Waktu</span>
                  <input
                    className="admin-input"
                    value={event.time}
                    onChange={(e) => {
                      const events = [...merged.events];
                      events[index] = { ...events[index], time: e.target.value };
                      updateDraft(["events"], events);
                    }}
                  />
                </label>
                <label className="admin-field">
                  <span>Venue</span>
                  <input
                    className="admin-input"
                    value={event.venue}
                    onChange={(e) => {
                      const events = [...merged.events];
                      events[index] = { ...events[index], venue: e.target.value };
                      updateDraft(["events"], events);
                    }}
                  />
                </label>
                <label className="admin-field">
                  <span>Alamat</span>
                  <textarea
                    className="admin-input"
                    rows={2}
                    value={event.address}
                    onChange={(e) => {
                      const events = [...merged.events];
                      events[index] = { ...events[index], address: e.target.value };
                      updateDraft(["events"], events);
                    }}
                  />
                </label>
                <label className="admin-field">
                  <span>Maps URL</span>
                  <input
                    className="admin-input"
                    value={event.mapsUrl}
                    onChange={(e) => {
                      const events = [...merged.events];
                      events[index] = { ...events[index], mapsUrl: e.target.value };
                      updateDraft(["events"], events);
                    }}
                  />
                </label>
              </fieldset>
            ))}
          </div>
        )}

        {tab === "galeri" && (
          <>
            <label className="admin-field">
              <span>Judul</span>
              <input
                className="admin-input"
                value={merged.gallery.title}
                onChange={(e) => updateDraft(["gallery", "title"], e.target.value)}
              />
            </label>
            {merged.gallery.images.map((img, index) => (
              <div key={index} className="admin-gallery-row">
                <ImageUploader
                  label={`Foto ${index + 1}`}
                  folder="gallery"
                  value={img.src}
                  onChange={(url) => {
                    const images = merged.gallery.images.map((item, i) =>
                      i === index ? { ...item, src: url } : item,
                    ) as { src: string; alt: string }[];
                    updateDraft(["gallery", "images"], images);
                  }}
                />
                <label className="admin-field">
                  <span>Alt text</span>
                  <input
                    className="admin-input"
                    value={img.alt}
                    onChange={(e) => {
                      const images = merged.gallery.images.map((item, i) =>
                        i === index ? { ...item, alt: e.target.value } : item,
                      ) as { src: string; alt: string }[];
                      updateDraft(["gallery", "images"], images);
                    }}
                  />
                </label>
              </div>
            ))}
          </>
        )}

        {tab === "gift" && (
          <>
            <label className="admin-field">
              <span>Deskripsi</span>
              <textarea
                className="admin-input"
                rows={3}
                value={merged.gift.description}
                onChange={(e) => updateDraft(["gift", "description"], e.target.value)}
              />
            </label>
            <label className="admin-field">
              <span>Alamat Kado Fisik</span>
              <textarea
                className="admin-input"
                rows={2}
                value={merged.gift.physicalAddress}
                onChange={(e) => updateDraft(["gift", "physicalAddress"], e.target.value)}
              />
            </label>
            {merged.gift.accounts[0] && (
              <fieldset className="admin-fieldset">
                <legend>Rekening Bank</legend>
                <label className="admin-field">
                  <span>Bank</span>
                  <input
                    className="admin-input"
                    value={merged.gift.accounts[0].bank}
                    onChange={(e) => {
                      const accounts = [...merged.gift.accounts];
                      accounts[0] = { ...accounts[0], bank: e.target.value };
                      updateDraft(["gift", "accounts"], accounts);
                    }}
                  />
                </label>
                <label className="admin-field">
                  <span>Nomor</span>
                  <input
                    className="admin-input"
                    value={merged.gift.accounts[0].number}
                    onChange={(e) => {
                      const accounts = [...merged.gift.accounts];
                      accounts[0] = { ...accounts[0], number: e.target.value };
                      updateDraft(["gift", "accounts"], accounts);
                    }}
                  />
                </label>
                <ImageUploader
                  label="Logo Bank"
                  folder="gift"
                  value={merged.gift.accounts[0].logo}
                  onChange={(url) => {
                    const accounts = [...merged.gift.accounts];
                    accounts[0] = { ...accounts[0], logo: url };
                    updateDraft(["gift", "accounts"], accounts);
                  }}
                />
              </fieldset>
            )}
          </>
        )}

        {tab === "media" && (
          <>
            <ImageUploader
              label="Cover / Sampul"
              folder="media"
              value={merged.media.coverBg}
              onChange={(url) => updateDraft(["media", "coverBg"], url)}
            />
            <ImageUploader
              label="Hero Photo"
              folder="media"
              value={merged.media.heroPhoto}
              onChange={(url) => {
                updateDraft(["media", "heroPhoto"], url);
                updateDraft(["media", "portrait"], url);
              }}
            />
            <ImageUploader
              label="Video Hero"
              folder="media"
              accept="video/mp4,video/webm"
              value={merged.media.video}
              onChange={(url) => updateDraft(["media", "video"], url)}
            />
            <ImageUploader
              label="Audio"
              folder="media"
              accept="audio/mpeg,audio/mp3"
              value={merged.media.audio}
              onChange={(url) => updateDraft(["media", "audio"], url)}
            />
            <ImageUploader
              label="Background Desktop"
              folder="media"
              value={merged.media.desktopBg}
              onChange={(url) => updateDraft(["media", "desktopBg"], url)}
            />
            <ImageUploader
              label="Divider"
              folder="media"
              value={merged.media.divider}
              onChange={(url) => updateDraft(["media", "divider"], url)}
            />
            <ImageUploader
              label="OG Image"
              folder="media"
              value={merged.media.ogImage}
              onChange={(url) => updateDraft(["media", "ogImage"], url)}
            />
          </>
        )}
      </div>
    </div>
  );
}
