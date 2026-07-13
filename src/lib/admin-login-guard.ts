const STORAGE_KEY = "gw-admin-login";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

type LoginGuardState = {
  failures: number;
  lockedUntil: number | null;
};

function readState(): LoginGuardState {
  if (typeof window === "undefined") {
    return { failures: 0, lockedUntil: null };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { failures: 0, lockedUntil: null };
    const parsed = JSON.parse(raw) as LoginGuardState;
    return {
      failures: Number(parsed.failures) || 0,
      lockedUntil: typeof parsed.lockedUntil === "number" ? parsed.lockedUntil : null,
    };
  } catch {
    return { failures: 0, lockedUntil: null };
  }
}

function writeState(state: LoginGuardState): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function getLoginLockoutRemainingMs(): number {
  const { lockedUntil } = readState();
  if (!lockedUntil) return 0;
  const remaining = lockedUntil - Date.now();
  if (remaining <= 0) {
    writeState({ failures: 0, lockedUntil: null });
    return 0;
  }
  return remaining;
}

export function canAttemptAdminLogin(): boolean {
  return getLoginLockoutRemainingMs() === 0;
}

export function recordFailedAdminLogin(): void {
  const state = readState();
  const failures = state.failures + 1;

  if (failures >= MAX_ATTEMPTS) {
    writeState({ failures, lockedUntil: Date.now() + LOCKOUT_MS });
    return;
  }

  writeState({ failures, lockedUntil: null });
}

export function clearAdminLoginAttempts(): void {
  writeState({ failures: 0, lockedUntil: null });
}

export function formatLockoutMinutes(remainingMs: number): number {
  return Math.max(1, Math.ceil(remainingMs / 60_000));
}
