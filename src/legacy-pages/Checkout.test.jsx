import "@testing-library/jest-dom/vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import Checkout from "./Checkout";
import { vi } from "vitest";

const mockUseCart = vi.fn();
const mockUseAuth = vi.fn();
const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock("../hooks/useCart", () => ({
  useCart: () => mockUseCart()
}));

vi.mock("../hooks/useAuth", () => ({
  useAuth: () => mockUseAuth()
}));

const services = [
  { id: 1, name: "Nursing Care", price: 1500 },
  { id: 2, name: "Physiotherapy", price: 1800 }
];

function renderCheckout() {
  render(
    <MemoryRouter>
      <Checkout />
    </MemoryRouter>
  );
}

describe("Checkout page", () => {
  const clearCart = vi.fn();
  const fetchAdminServices = vi.fn(() => Promise.resolve());
  const createPublicBooking = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseCart.mockReturnValue({
      cart: [],
      cartTotal: 0,
      clearCart
    });
    mockUseAuth.mockReturnValue({
      services,
      fetchAdminServices,
      createPublicBooking
    });
  });

  it("renders direct booking form without login or payment prompt", () => {
    renderCheckout();

    expect(screen.getByRole("heading", { name: /service booking without login or payment friction/i })).toBeInTheDocument();
    expect(screen.getByLabelText("Patient Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Preferred Date")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Submit Booking" })).toBeEnabled();
    expect(screen.queryByText("Please login before booking a service.")).not.toBeInTheDocument();
    expect(screen.queryByText(/upi/i)).not.toBeInTheDocument();
  });

  it("shows validation error for incomplete booking details", async () => {
    const user = userEvent.setup();

    renderCheckout();

    await user.click(screen.getByRole("button", { name: "Submit Booking" }));

    expect(screen.getByText("Please complete all required booking fields.")).toBeInTheDocument();
    expect(createPublicBooking).not.toHaveBeenCalled();
  });

  it("submits a guest booking and navigates to thank you page", async () => {
    const user = userEvent.setup();
    createPublicBooking.mockResolvedValue({
      bookingCode: "SHC-2026-00001",
      service: "Nursing Care",
      preferredDate: "2026-06-20",
      preferredTimeSlot: "10:00 AM - 12:00 PM"
    });

    mockUseCart.mockReturnValue({
      cart: [{ id: 1, name: "Nursing Care", price: 1500, quantity: 1 }],
      cartTotal: 1500,
      clearCart
    });

    renderCheckout();

    await user.type(screen.getByLabelText("Patient Name"), "Asha Kumari");
    await user.type(screen.getByLabelText("Age"), "68");
    await user.selectOptions(screen.getByLabelText("Gender"), "Female");
    await user.type(screen.getByLabelText("Mobile Number"), "9876543210");
    await user.type(screen.getByLabelText("Email"), "asha@example.com");
    await user.type(screen.getByLabelText("Address"), "221 Care Street, Patna");
    await user.type(screen.getByLabelText("Preferred Date"), "2026-06-20");
    await user.selectOptions(screen.getByLabelText("Preferred Time Slot"), "10:00 AM - 12:00 PM");
    await user.type(screen.getByLabelText("Additional Notes"), "Post surgery care");
    await user.click(screen.getByRole("button", { name: "Submit Booking" }));

    await waitFor(() => expect(createPublicBooking).toHaveBeenCalledWith(expect.objectContaining({
      patientName: "Asha Kumari",
      mobileNumber: "9876543210",
      email: "asha@example.com",
      serviceId: "1",
      serviceType: "Nursing Care",
      preferredDate: "2026-06-20",
      preferredTimeSlot: "10:00 AM - 12:00 PM"
    })));
    expect(clearCart).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/thank-you", expect.objectContaining({
      state: expect.objectContaining({ mobileNumber: "9876543210" })
    }));
  });
});
