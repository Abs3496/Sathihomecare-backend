import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../hooks/useCart";

export default function CartBar() {
  const { cartCount, cartTotal } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  if (cartCount === 0 || location.pathname === "/checkout") return null;

  return (
    <div
      className="cartbar"
      style={{
        position: "fixed",
        right: "18px",
        top: "50%",
        transform: "translateY(-50%)",
        width: "220px",
        background: "#102542",
        color: "#ffffff",
        borderRadius: "22px",
        padding: "18px",
        boxShadow: "0 20px 45px rgba(16, 37, 66, 0.22)",
        zIndex: 20
      }}
    >
      <p style={{ margin: 0, fontSize: "13px", color: "#8de3d4", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        Checkout
      </p>
      <h3 style={{ margin: "10px 0 0", fontSize: "24px" }}>{cartCount} items</h3>
      <p style={{ margin: "8px 0 0", color: "rgba(255,255,255,0.78)" }}>Total Rs. {cartTotal}</p>
      <button
        type="button"
        onClick={() => navigate("/checkout")}
        style={{
          marginTop: "16px",
          width: "100%",
          background: "#1cb5ac",
          border: "none",
          padding: "12px 14px",
          color: "#ffffff",
          borderRadius: "12px",
          cursor: "pointer",
          fontWeight: 700
        }}
      >
        Go to Checkout
      </button>
    </div>
  );
}
