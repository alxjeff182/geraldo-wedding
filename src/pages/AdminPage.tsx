import { useEffect, useState } from "react";
import { mergeWeddingContent } from "../lib/merge-content";
import { getSupabase, isSupabaseConfigured } from "../lib/supabase";
import type { SiteContentOverrides } from "../types/site-content";
import { useWeddingContent } from "../context/WeddingContentContext";
import { usePageMeta } from "../hooks/usePageMeta";
import { checkAdminAccess } from "../lib/admin-access";
import {
  canAttemptAdminLogin,
  clearAdminLoginAttempts,
  formatLockoutMinutes,
  getLoginLockoutRemainingMs,
  recordFailedAdminLogin,
} from "../lib/admin-login-guard";
import { AdminLoginScreen } from "../components/admin/AdminLoginScreen";
import { AdminTabContent } from "../components/admin/AdminTabContent";
import { TABS } from "../components/admin/admin-tabs";
import type { AdminTab } from "../components/admin/types";

export function AdminPage() {
  const { refresh, content } = useWeddingContent();
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [tab, setTab] = useState<AdminTab>("umum");
  const [draft, setDraft] = useState<SiteContentOverrides>({});
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  usePageMeta(content, { noIndex: true });

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

  useEffect(() => {
    if (!sessionEmail) {
      setIsAdmin(null);
      return;
    }

    void checkAdminAccess().then(setIsAdmin);
  }, [sessionEmail]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const lockoutRemaining = getLoginLockoutRemainingMs();
    if (lockoutRemaining > 0) {
      setAuthError(
        `Terlalu banyak percobaan login. Coba lagi dalam ${formatLockoutMinutes(lockoutRemaining)} menit.`,
      );
      return;
    }

    setLoggingIn(true);
    const supabase = getSupabase();
    if (!supabase) {
      setAuthError("Supabase belum dikonfigurasi");
      setLoggingIn(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoggingIn(false);
    if (error) {
      recordFailedAdminLogin();
      setAuthError("Login gagal. Periksa email dan password.");
      return;
    }

    clearAdminLoginAttempts();
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
    if (!sessionEmail || !isAdmin || !isSupabaseConfigured) return;
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
  }, [sessionEmail, isAdmin]);

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
      <AdminLoginScreen
        siteTitle={content.site.title}
        email={email}
        password={password}
        authError={authError}
        loggingIn={loggingIn}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleLogin}
      />
    );
  }

  if (isAdmin === null) {
    return (
      <div className="admin-page admin-page--login">
        <p className="admin-login__subtitle">Memverifikasi akses admin...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="admin-page admin-page--login">
        <div className="admin-login-shell">
          <h1 className="admin-login__title">Akses ditolak</h1>
          <p className="admin-login__subtitle">
            Akun ini tidak terdaftar sebagai admin. Hubungi pengelola undangan.
          </p>
          <button type="button" className="admin-btn admin-login__submit" onClick={() => void handleLogout()}>
            Keluar
          </button>
        </div>
      </div>
    );
  }

  const activeTab = TABS.find((t) => t.id === tab);
  const isSuccessMessage = message?.includes("berhasil");

  return (
    <div className="admin-page admin-page--dashboard">
      <div className="admin-dashboard-bg" aria-hidden />

      <div className="admin-shell">
        <header className="admin-topbar">
          <div className="admin-topbar__brand">
            <p className="admin-topbar__eyebrow">Panel Admin</p>
            <h1 className="admin-topbar__title">{content.site.title}</h1>
            <p className="admin-topbar__user">{sessionEmail}</p>
          </div>
          <div className="admin-topbar__actions">
            <a href="/" className="admin-btn admin-btn--ghost" target="_blank" rel="noreferrer">
              Lihat Situs
            </a>
            <button type="button" className="admin-btn admin-btn--ghost" onClick={() => void handleLogout()}>
              Keluar
            </button>
            <button type="button" className="admin-btn admin-btn--primary" disabled={saving} onClick={() => void handleSave()}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </header>

        {message && (
          <p
            className={`admin-toast${isSuccessMessage ? " admin-toast--success" : " admin-toast--error"}`}
            role="status"
          >
            {message}
          </p>
        )}

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

        <section className="admin-panel" aria-labelledby="admin-panel-title">
          <header className="admin-panel__head">
            <h2 id="admin-panel-title" className="admin-panel__title">
              {activeTab?.label}
            </h2>
            <p className="admin-panel__desc">{activeTab?.description}</p>
          </header>

          <div className="admin-panel__body">
            <AdminTabContent tab={tab} merged={merged} updateDraft={updateDraft} setMessage={setMessage} />
          </div>
        </section>
      </div>
    </div>
  );
}
