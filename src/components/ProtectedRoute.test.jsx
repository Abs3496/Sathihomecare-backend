import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import { vi } from "vitest";

const mockUseAuth = vi.fn();

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => mockUseAuth()
}));

function renderProtectedRoute(role) {
  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route
          path="/protected"
          element={(
            <ProtectedRoute role={role}>
              <div>Allowed Content</div>
            </ProtectedRoute>
          )}
        />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/partner/login" element={<div>Partner Login Page</div>} />
        <Route path="/admin" element={<div>Admin Login Page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("redirects logged-out customers to login", () => {
    mockUseAuth.mockReturnValue({ customer: null, partner: null, admin: null });

    renderProtectedRoute("customer");

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("redirects logged-out partners to partner login", () => {
    mockUseAuth.mockReturnValue({ customer: null, partner: null, admin: null });

    renderProtectedRoute("partner");

    expect(screen.getByText("Partner Login Page")).toBeInTheDocument();
  });

  it("redirects logged-out admins to admin login", () => {
    mockUseAuth.mockReturnValue({ customer: null, partner: null, admin: null });

    renderProtectedRoute("admin");

    expect(screen.getByText("Admin Login Page")).toBeInTheDocument();
  });

  it("renders children when role is authenticated", () => {
    mockUseAuth.mockReturnValue({ customer: { name: "Asha" }, partner: null, admin: null });

    renderProtectedRoute("customer");

    expect(screen.getByText("Allowed Content")).toBeInTheDocument();
  });
});
