import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Login from "./Login";
import { vi } from "vitest";

const mockNavigate = vi.fn();
const mockUseAuth = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => mockUseAuth()
}));

describe("Login page", () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockUseAuth.mockReturnValue({
      loginCustomer: vi.fn(),
      registerCustomer: vi.fn()
    });
  });

  it("shows validation when login fields are missing", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Continue to User Dashboard" }));

    expect(screen.getByText("Please enter both email and password.")).toBeInTheDocument();
  });

  it("switches to register mode and validates required fields", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.click(screen.getByRole("button", { name: "Register" }));
    await user.click(screen.getByRole("button", { name: "Create Account and Continue" }));

    expect(screen.getByText("Please fill all registration details.")).toBeInTheDocument();
  });

  it("navigates to dashboard after successful customer login", async () => {
    const user = userEvent.setup();
    const loginCustomer = vi.fn().mockResolvedValue({ id: 1 });
    mockUseAuth.mockReturnValue({
      loginCustomer,
      registerCustomer: vi.fn()
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    await user.type(screen.getByLabelText("Email Address"), "abhishek@sathi.com");
    await user.type(screen.getByLabelText("Password"), "customer123");
    await user.click(screen.getByRole("button", { name: "Continue to User Dashboard" }));

    expect(loginCustomer).toHaveBeenCalledWith({
      fullName: "",
      email: "abhishek@sathi.com",
      phone: "",
      password: "customer123"
    });
    expect(mockNavigate).toHaveBeenCalledWith("/user/dashboard");
  });
});
