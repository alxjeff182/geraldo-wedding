type AdminLoginScreenProps = {
  siteTitle: string;
  email: string;
  password: string;
  authError: string | null;
  loggingIn: boolean;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function AdminLoginScreen({
  siteTitle,
  email,
  password,
  authError,
  loggingIn,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}: AdminLoginScreenProps) {
  return (
    <div className="admin-page admin-page--login">
      <div className="admin-login-bg" aria-hidden />
      <div className="admin-login-shell">
        <a href="/" className="admin-login__back">
          ← Kembali ke undangan
        </a>

        <form className="admin-login" onSubmit={(e) => void onSubmit(e)}>
          <div className="admin-login__brand">
            <p className="admin-login__eyebrow">Panel Admin</p>
            <h1 className="admin-login__title">{siteTitle}</h1>
            <p className="admin-login__subtitle">Kelola konten undangan pernikahan</p>
          </div>

          <div className="admin-login__divider" aria-hidden>
            <span />
          </div>

          <div className="admin-login__fields">
            <label className="admin-field admin-login__field">
              <span className="admin-label">Email</span>
              <input
                type="email"
                className="admin-input admin-login__input"
                value={email}
                onChange={(e) => onEmailChange(e.target.value)}
                placeholder="nama@email.com"
                autoComplete="email"
                required
              />
            </label>
            <label className="admin-field admin-login__field">
              <span className="admin-label">Password</span>
              <input
                type="password"
                className="admin-input admin-login__input"
                value={password}
                onChange={(e) => onPasswordChange(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
            </label>
          </div>

          {authError && (
            <p className="admin-error admin-login__error" role="alert">
              {authError}
            </p>
          )}

          <button type="submit" className="admin-btn admin-login__submit" disabled={loggingIn}>
            {loggingIn ? "Memproses..." : "Masuk ke CMS"}
          </button>
        </form>

        <p className="admin-login__footer">Hanya untuk pengelola undangan</p>
      </div>
    </div>
  );
}
