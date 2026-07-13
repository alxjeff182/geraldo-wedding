import { afterEach, describe, expect, it } from "vitest";
import {
  canAttemptAdminLogin,
  clearAdminLoginAttempts,
  formatLockoutMinutes,
  getLoginLockoutRemainingMs,
  recordFailedAdminLogin,
} from "./admin-login-guard";

afterEach(() => {
  window.localStorage.clear();
});

describe("admin-login-guard", () => {
  it("locks out after repeated failures", () => {
    for (let i = 0; i < 5; i += 1) recordFailedAdminLogin();
    expect(canAttemptAdminLogin()).toBe(false);
    expect(getLoginLockoutRemainingMs()).toBeGreaterThan(0);
  });

  it("clears lockout after success", () => {
    recordFailedAdminLogin();
    clearAdminLoginAttempts();
    expect(canAttemptAdminLogin()).toBe(true);
  });

  it("formats remaining lockout minutes", () => {
    expect(formatLockoutMinutes(90_000)).toBe(2);
    expect(formatLockoutMinutes(1_000)).toBe(1);
  });
});
