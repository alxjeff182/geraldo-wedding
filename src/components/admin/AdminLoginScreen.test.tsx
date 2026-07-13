import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminLoginScreen } from "./AdminLoginScreen";

const baseProps = {
  siteTitle: "Geraldo & Christin",
  email: "",
  password: "",
  authError: null as string | null,
  loggingIn: false,
  onEmailChange: vi.fn(),
  onPasswordChange: vi.fn(),
  onSubmit: vi.fn((e: React.FormEvent) => e.preventDefault()),
};

describe("AdminLoginScreen", () => {
  it("renders login form and submits credentials", () => {
    const onSubmit = vi.fn((e: React.FormEvent) => e.preventDefault());

    render(<AdminLoginScreen {...baseProps} onSubmit={onSubmit} />);

    expect(screen.getByText(/panel admin/i)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /geraldo & christin/i })).toBeInTheDocument();
    const form = screen.getByRole("button", { name: /masuk ke cms/i }).closest("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it("shows auth error when provided", () => {
    render(
      <AdminLoginScreen
        {...baseProps}
        email="admin@example.com"
        authError="Email atau password salah"
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(/password salah/i);
  });
});
