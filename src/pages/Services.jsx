import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { servicesData } from "../data/servicesData";
import { apiFetch } from "../api";
import { useCart } from "../hooks/useCart";

const categoryLabels = {
  all: "All Services",
  nursing: "Nursing Services",
  therapy: "Ayurvedic Therapy",
  counselling: "Counselling"
};

const categoryDescriptions = {
  all: "Explore the full Sathi Homecare catalogue across nursing, therapy, and counselling.",
  nursing: "Professional care for recovery, bedside assistance, and critical support at home.",
  therapy: "Ayurvedic therapy plans for pain management, detox, metabolic support, and holistic wellness.",
  counselling: "Career and growth counselling sessions for students, parents, focus improvement, and long-term planning."
};

const serviceCategoryMap = {
  NURSING: "nursing",
  THERAPY: "therapy",
  COUNSELLING: "counselling"
};

const serviceImages = {
  nursing: servicesData.nursing[0].image,
  therapy: servicesData.therapy[0].image,
  counselling: servicesData.counselling[0].image,
  default: servicesData.nursing[0].image
};

export default function Services() {
  const [searchParams] = useSearchParams();
  const { cart, addToCart, removeFromCart } = useCart();
  const [backendServices, setBackendServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [serviceError, setServiceError] = useState(null);

  const selectedType = searchParams.get("type") || "all";
  const searchQuery = (searchParams.get("q") || "").trim().toLowerCase();
  const location = (searchParams.get("location") || "").trim();

  const servicesSource = backendServices.length ? backendServices : Object.entries(servicesData).flatMap(([type, items]) =>
    items.map((item) => ({ ...item, type }))
  );

  useEffect(() => {
    let active = true;

    const loadServices = async () => {
      try {
        const services = await apiFetch("/services");
        if (!active) return;
        setBackendServices(
          services.map((service) => ({
            id: service.id,
            name: service.name,
            desc: service.description,
            price: Number(service.price),
            type: serviceCategoryMap[service.category] || service.category?.toLowerCase() || "all",
            image: serviceImages[serviceCategoryMap[service.category]?.toLowerCase()] || serviceImages.default
          }))
        );
      } catch (error) {
        if (!active) return;
        setServiceError(error?.message || "Unable to load services from backend.");
      } finally {
        if (active) setLoadingServices(false);
      }
    };

    loadServices();
    return () => {
      active = false;
    };
  }, []);

  const allServices = servicesSource;

  const visibleServices = allServices.filter((item) => {
    const matchesType = selectedType === "all" ? true : item.type === selectedType;
    const haystack = `${item.name} ${item.desc} ${item.type}`.toLowerCase();
    const matchesQuery = searchQuery ? haystack.includes(searchQuery) : true;
    return matchesType && matchesQuery;
  });

  const getQty = (id) => cart.find((item) => item.id === id)?.quantity || 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f6f8fb", color: "#102542", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", paddingBottom: "80px" }}>
      <section style={{ background: "linear-gradient(135deg, #0a2440, #0d594f)", padding: "48px 24px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <p style={{ margin: 0, color: "#8de3d4", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, fontSize: "13px" }}>Service catalogue</p>
          <h1 style={{ margin: "12px 0 0", color: "#ffffff", fontSize: "clamp(2.2rem, 4vw, 3.5rem)" }}>{categoryLabels[selectedType] || "Services"}</h1>
          <p style={{ margin: "12px 0 0", color: "rgba(255,255,255,0.84)", maxWidth: "760px", lineHeight: 1.7 }}>
            {categoryDescriptions[selectedType] || categoryDescriptions.all}
          </p>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "22px" }}>
            <span style={summaryChip}>{visibleServices.length} services found</span>
            {location ? <span style={summaryChip}>Location: {location}</span> : null}
            {searchQuery ? <span style={summaryChip}>Search: {searchQuery}</span> : null}
          </div>

          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "22px" }}>
            {Object.keys(categoryLabels).map((type) => (
              <Link
                key={type}
                to={buildServicesPath({ type, query: searchQuery, location })}
                style={{
                  textDecoration: "none",
                  padding: "11px 16px",
                  borderRadius: "999px",
                  fontWeight: 700,
                  boxShadow: "0 10px 20px rgba(0,0,0,0.08)",
                  background: selectedType === type ? "#1cb5ac" : "#ffffff",
                  color: selectedType === type ? "#ffffff" : "#102542"
                }}
              >
                {categoryLabels[type]}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "32px 24px 0" }}>
        {serviceError ? (
          <div style={{ background: "#fee2e2", borderRadius: "24px", padding: "28px", color: "#991b1b", textAlign: "center", boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)" }}>
            <h2 style={{ margin: 0, fontSize: "28px" }}>Unable to load services</h2>
            <p style={{ margin: "12px 0 0", lineHeight: 1.7 }}>There was a problem fetching the backend service catalogue. Showing the offline service catalogue instead.</p>
          </div>
        ) : null}

        {loadingServices && !visibleServices.length ? (
          <div style={{ background: "#ffffff", borderRadius: "24px", padding: "36px", textAlign: "center", boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)" }}>
            <h2 style={{ margin: 0, fontSize: "28px" }}>Loading services...</h2>
            <p style={{ margin: "12px 0 0", color: "#667085", lineHeight: 1.7 }}>Please wait while we load the latest service catalogue.</p>
          </div>
        ) : visibleServices.length ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {visibleServices.map((item) => {
              const quantity = getQty(item.id);

              return (
                <article key={`${item.type}-${item.id}`} style={{ background: "#ffffff", borderRadius: "24px", overflow: "hidden", boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)", border: "1px solid #eef2f7", display: "flex", flexDirection: "column" }}>
                  <div style={{ position: "relative", height: "220px", background: "linear-gradient(145deg, #effcf8, #e0f2fe)" }}>
                    <img src={item.image} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: "24px" }} />
                    <div style={{ position: "absolute", top: "14px", left: "14px", background: "#1cb5ac", color: "#ffffff", padding: "6px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 700 }}>
                      {categoryLabels[item.type]}
                    </div>
                  </div>

                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: "22px", color: "#102542", lineHeight: 1.3 }}>{item.name}</h3>
                    <p style={{ margin: "12px 0 0", color: "#5b6878", lineHeight: 1.75, flex: 1 }}>{item.desc}</p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginTop: "18px" }}>
                      <span style={{ color: "#0f8f86", fontWeight: 800, fontSize: "20px" }}>Rs. {item.price}</span>
                      <span style={{ color: "#667085", textTransform: "capitalize", fontSize: "14px" }}>{item.type}</span>
                    </div>

                    <div style={{ display: "flex", gap: "10px", marginTop: "18px" }}>
                      <button type="button" onClick={() => addToCart(item)} style={{ flex: 1, border: "none", borderRadius: "14px", background: "#102542", color: "#ffffff", padding: "14px 16px", fontWeight: 700, cursor: "pointer" }}>
                        Add to Cart
                      </button>
                      <div style={{ minWidth: "96px", borderRadius: "14px", background: "#f3f7fb", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}>
                        <button type="button" onClick={() => removeFromCart(item.id)} style={qtyButtonStyle}>-</button>
                        <span style={{ fontWeight: 700, color: "#102542" }}>{quantity}</span>
                        <button type="button" onClick={() => addToCart(item)} style={qtyButtonStyle}>+</button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div style={{ background: "#ffffff", borderRadius: "24px", padding: "36px", textAlign: "center", boxShadow: "0 18px 42px rgba(15, 23, 42, 0.08)" }}>
            <h2 style={{ margin: 0, fontSize: "28px" }}>No services found</h2>
            <p style={{ margin: "12px 0 0", color: "#667085", lineHeight: 1.7 }}>
              Try another category or search term. You can also browse the full service catalogue.
            </p>
            <Link to="/services" style={{ marginTop: "18px", display: "inline-flex", textDecoration: "none", background: "#1cb5ac", color: "#ffffff", padding: "12px 18px", borderRadius: "14px", fontWeight: 700 }}>
              View All Services
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

function buildServicesPath({ type = "all", query = "", location = "" }) {
  const params = new URLSearchParams();
  if (type && type !== "all") params.set("type", type);
  if (query) params.set("q", query);
  if (location) params.set("location", location);
  const queryString = params.toString();
  return queryString ? `/services?${queryString}` : "/services";
}

const summaryChip = {
  padding: "10px 14px",
  borderRadius: "999px",
  background: "rgba(255,255,255,0.1)",
  color: "#ffffff",
  fontSize: "14px"
};

const qtyButtonStyle = {
  width: "28px",
  height: "28px",
  borderRadius: "8px",
  border: "none",
  background: "#dbeafe",
  color: "#102542",
  cursor: "pointer",
  fontWeight: 700
};
