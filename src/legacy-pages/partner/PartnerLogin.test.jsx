import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { vi } from "vitest";
import PartnerLogin from "./PartnerLogin";

const mockNavigate = vi.fn();
const mockUseAuth = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => mockUseAuth()
}));

describe("PartnerLogin page", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockUseAuth.mockReturnValue({
      loginPartner: vi.fn(),
      loginAdmin: vi.fn(),
      partners: []
    });
  });

  it("logs partners in with employee ID", async () => {
    const user = userEvent.setup();
    const loginPartner = vi.fn().mockResolvedValue({ id: "EMP001" });
    mockUseAuth.mockReturnValue({
      loginPartner,
      loginAdmin: vi.fn(),
      partners: []
    });

    render(
      <MemoryRouter>
        <PartnerLogin />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Employee ID"), " EMP001 ");
    await user.type(screen.getByLabelText("Password"), "secret123");
    await user.click(screen.getByRole("button", { name: "Login to Dashboard" }));

    expect(loginPartner).toHaveBeenCalledWith({ employeeId: " EMP001 ", password: "secret123" });
    expect(mockNavigate).toHaveBeenCalledWith("/partner/dashboard");
  });

  it("logs admins in with email or phone without falling back to partner login", async () => {
    const user = userEvent.setup();
    const loginAdmin = vi.fn().mockResolvedValue({ id: 1 });
    const loginPartner = vi.fn();
    mockUseAuth.mockReturnValue({
      loginPartner,
      loginAdmin,
      partners: []
    });

    render(
      <MemoryRouter>
        <PartnerLogin />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Admin" }));
    await user.type(screen.getByLabelText("Email or Phone"), "Abhishekadmin@sathihomecare.in");
    await user.type(screen.getByLabelText("Password"), "adminabhishek@123");
    await user.click(screen.getByRole("button", { name: "Login to Dashboard" }));

    expect(loginAdmin).toHaveBeenCalledWith({
      username: "Abhishekadmin@sathihomecare.in",
      password: "adminabhishek@123"
    });
    expect(loginPartner).not.toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/admin/dashboard");
  });
});
