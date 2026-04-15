import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { homepageAssets } from "../assets";
import { usePageSeo } from "../hooks/usePageSeo";
import { useCart } from "../hooks/useCart";
import { useAuth } from "../hooks/useAuth";
import { servicesData } from "../data/servicesData";

const nursing = homepageAssets.serviceIcons.nursing;
const icu = homepageAssets.serviceIcons.therapy;
const oldcare = homepageAssets.serviceIcons.consultation;
const heroNursing = homepageAssets.heroBanner;

const heroCards = [
  { title: "Nursing Services", subtitle: "Certified support at home", offer: "UP TO 30% OFF", image: heroNursing, type: "nursing" },
  { title: "Ayurvedic Therapy", subtitle: "Natural wellness sessions", offer: "UP TO 25% OFF", image: icu, type: "therapy" },
  { title: "Counselling", subtitle: "Mental and family guidance", offer: "UP TO 20% OFF", image: oldcare, type: "counselling" }
];

const discoverServices = [
  { title: "Patient Care", category: "Nursing", image: nursing, type: "nursing", query: "patient care" },
  { title: "Elderly Care", category: "Nursing", image: oldcare, type: "nursing", query: "elderly care" },
  { title: "Mother & Baby", category: "Nursing", image: nursing, type: "nursing", query: "mother baby" },
  { title: "Post Surgery", category: "Recovery", image: heroNursing, type: "nursing", query: "post surgery" },
  { title: "Pain Relief", category: "Therapy", image: icu, type: "therapy", query: "pain relief" },
  { title: "Full Body Therapy", category: "Therapy", image: icu, type: "therapy", query: "full body" },
  { title: "Mental Health", category: "Counselling", image: oldcare, type: "counselling", query: "mental health" },
  { title: "Career Guidance", category: "Counselling", image: oldcare, type: "counselling", query: "career guidance" }
];

const scrollingDiscoverServices = [...discoverServices, ...discoverServices];

const featuredServices = [
  { id: "patient-care", serviceId: 1, title: "Patient Care at Home", category: "Nursing | Daily Support", price: "Rs. 1500", timing: "Round-the-clock bedside assistance", offer: "Flat 15% off on walk-in booking", extra: "Extra 10% off using SATHI10", image: nursing, type: "nursing", query: "patient care" },
  { id: "elder-care", serviceId: 2, title: "Elderly Care", category: "Senior Support | Compassionate Assistance", price: "Rs. 2000", timing: "24x7 attendant support available", offer: "Flat 20% off on pre-booking", extra: "Free consultation before first visit", image: oldcare, type: "nursing", query: "elderly care" },
  { id: "full-body-therapy", serviceId: 107, title: "Abhyanga (Full Body Massage)", category: "Ayurvedic | Relaxation", price: "Rs. 999", timing: "Rejuvenation sessions at home", offer: "Flat 18% off this week", extra: "Combo discount on repeat sessions", image: icu, type: "therapy", query: "massage" },
  { id: "mental-health", serviceId: 216, title: "Stress & Anxiety Management", category: "Counselling | Emotional Support", price: "Rs. 850", timing: "Confidential one-on-one guidance", offer: "Flat 12% off on first session", extra: "Family support add-on available", image: oldcare, type: "counselling", query: "stress anxiety" }
];

const reviews = [
  { name: "Priya Sharma", location: "Ranchi", text: "The nurse reached right on time and handled my mother's dressing and medication with complete professionalism.", role: "Booked home nursing care" },
  { name: "Amit Kumar", location: "Patna", text: "We used counselling and elder support together. The team was calm, responsive, and genuinely reassuring for the whole family.", role: "Booked counselling support" },
  { name: "Sneha Das", location: "Kolkata", text: "Ayurvedic therapy sessions were well planned and the booking experience felt smooth from search to first visit.", role: "Booked therapy sessions" }
];

const stats = [
  { value: 7000, label: "Happy families served" },
  { value: 6000000, label: "Care hours delivered" },
  { value: 8000000, label: "Health check-ins completed" },
  { value: 50, label: "Expert partners onboarded" }
];

const footerGroups = {
  services: ["Home Nursing", "Ayurvedic Therapy", "Counselling", "ICU Care at Home"],
  company: [
    { label: "Know The Founders", to: "/founders" },
    { label: "How It Works", to: "/services" },
    { label: "Join as Caregiver", to: "/partner/login" },
    { label: "Contact Us", to: "/" }
  ],
  support: [
    { label: "Book a Visit", to: "/services" },
    { label: "FAQ", to: "/services" },
    { label: "Privacy Policy", to: "/privacy-policy" },
    { label: "Terms & Conditions", to: "/terms-conditions" },
    { label: "Refund & Cancellation", to: "/refund-cancellation-policy" }
  ]
};

const mixedServices = [...servicesData.nursing.slice(0, 4), ...servicesData.therapy, ...servicesData.counselling];

export default function Home() {
  usePageSeo({
    title: "Sathi Homecare | Trusted Nursing, Therapy and Counselling at Home",
    description: "Book trusted home nursing, ayurvedic therapy, counselling and elder care with Sathi Homecare. Secure booking, responsive support and startup-ready care delivery."
  });

  const navigate = useNavigate();
  const { cart, addToCart, removeFromCart } = useCart();
  const { customer, partner, logout } = useAuth();
  const [location, setLocation] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [locationCoords, setLocationCoords] = useState(null);

  const buildServicesPath = ({ type = "", query = "", nextLocation = "" } = {}) => {
    const params = new URLSearchParams();
    if (type) params.set("type", type);
    if (query) params.set("q", query);
    if (nextLocation) params.set("location", nextLocation);
    const queryString = params.toString();
    return queryString ? `/services?${queryString}` : "/services";
  };

  const handleSearch = () => navigate(buildServicesPath({ query: serviceSearch.trim(), nextLocation: location.trim() }));
  const handleSearchKeyDown = (event) => { if (event.key === "Enter") handleSearch(); };
  const cardLinkStyle = { textDecoration: "none" };
  const getQty = (id) => cart.find((item) => item.id === id)?.quantity || 0;
  const dashboardPath = customer ? "/user/dashboard" : partner ? "/partner/dashboard" : "/login";

  useEffect(() => {
    if (location.trim().length < 3) {
      setLocationSuggestions([]);
      return undefined;
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(location.trim())}`, { signal: controller.signal });
        const data = await response.json();
        setLocationSuggestions(data.map((item) => ({ label: item.display_name, coords: { lat: Number(item.lat), lng: Number(item.lon) } })));
      } catch (error) {
        if (error.name !== "AbortError") setLocationSuggestions([]);
      }
    }, 350);
    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [location]);

  const handleLocationSelect = (suggestion) => {
    setLocation(suggestion.label);
    setLocationCoords(suggestion.coords || null);
    setLocationSuggestions([]);
    setLocationError("");
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported in this browser.");
      return;
    }
    setLocationLoading(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      setLocationCoords({ lat: latitude, lng: longitude });
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
        const data = await response.json();
        setLocation(data.display_name || `Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`);
      } catch {
        setLocation(`Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`);
        setLocationError("Location mil gayi, but exact address fetch nahi ho paya.");
      } finally {
        setLocationLoading(false);
        setLocationSuggestions([]);
      }
    }, () => {
      setLocationLoading(false);
      setLocationError("Current location fetch nahi ho paya.");
    });
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", background: "#f8f7f2", color: "#1f2937" }}>
      <style>{`
        @keyframes care-marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
      <section style={{ position: "relative", overflow: "hidden", background: "linear-gradient(180deg, #0a2440 0%, #0d594f 78%, #f8f7f2 78%, #f8f7f2 100%)", padding: "20px 24px 0" }} className="page-padding">
        <video autoPlay loop muted playsInline poster={homepageAssets.heroBanner} style={{ position: "absolute", inset: 0, width: "100%", height: "78%", objectFit: "cover" }}>
          <source src={homepageAssets.heroVideo} type="video/mp4" />
        </video>
        <div style={{ position: "absolute", inset: 0, height: "78%", background: "linear-gradient(90deg, rgba(8, 31, 53, 0.82) 0%, rgba(8, 31, 53, 0.68) 34%, rgba(12, 100, 82, 0.62) 100%)" }} />
        <div style={{ maxWidth: "1480px", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#ffffff", color: "#0f8f86", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "22px" }}>S</div>
              <span style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>Sathi Homecare</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "18px", flexWrap: "wrap" }}>
              <span style={{ color: "#fff3eb", fontSize: "14px", fontWeight: 600 }}>For Families</span>
              <Link to="/founders" style={{ color: "#fff3eb", fontSize: "14px", fontWeight: 600, textDecoration: "none" }}>Know the Founders</Link>
              <Link to="/login" style={{ padding: "12px 18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.45)", textDecoration: "none", color: "#ffffff", fontWeight: 700, background: "rgba(255,255,255,0.06)" }}>Login As</Link>
              <Link to={dashboardPath} style={{ width: "42px", height: "42px", borderRadius: "50%", textDecoration: "none", background: "rgba(255,255,255,0.14)", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                {customer?.name?.charAt(0) || partner?.name?.charAt(0) || "U"}
              </Link>
              {customer || partner ? (
                <button type="button" onClick={logout} style={{ border: "none", borderRadius: "12px", background: "#ef4444", color: "#ffffff", padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}>
                  Logout
                </button>
              ) : null}
            </div>
          </div>

          <div style={{ maxWidth: "980px", margin: "72px auto 48px", textAlign: "center" }}>
            <h1 style={{ margin: 0, color: "#ffffff", fontSize: "clamp(2.3rem, 4vw, 4rem)", lineHeight: 1.18, fontWeight: 800, letterSpacing: "-0.02em" }}>
              Book home services and discover trusted caregivers with Sathi Homecare.
            </h1>
            <div style={{ marginTop: "28px", display: "grid", gridTemplateColumns: "minmax(360px, 1.15fr) minmax(300px, 0.85fr)", gap: "14px", alignItems: "start", justifyContent: "center" }} className="home-hero-search-grid">
              <div style={{ position: "relative" }}>
                <div style={{ background: "#ffffff", borderRadius: "18px", padding: "0 16px", display: "flex", alignItems: "center", minHeight: "60px", boxShadow: "0 14px 28px rgba(112, 47, 0, 0.12)" }}>
                  <span style={{ fontSize: "18px", color: "#1cb5ac", marginRight: "10px" }}>@</span>
                  <input placeholder="Your city or locality" style={{ width: "100%", border: "none", outline: "none", fontSize: "15px", color: "#374151", background: "transparent" }} value={location} onChange={(event) => { setLocation(event.target.value); setLocationError(""); }} onKeyDown={handleSearchKeyDown} />
                  <button type="button" onClick={handleUseCurrentLocation} style={{ border: "none", borderRadius: "12px", background: "#1cb5ac", color: "#ffffff", fontWeight: 700, fontSize: "13px", padding: "10px 12px", cursor: "pointer", flexShrink: 0 }}>
                    {locationLoading ? "Locating..." : "Use current"}
                  </button>
                </div>
                {locationSuggestions.length > 0 ? (
                  <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, right: 0, background: "#ffffff", borderRadius: "18px", overflow: "hidden", boxShadow: "0 20px 40px rgba(15, 23, 42, 0.18)", zIndex: 3 }}>
                    {locationSuggestions.map((suggestion) => (
                      <button key={suggestion.label} type="button" onClick={() => handleLocationSelect(suggestion)} style={{ width: "100%", textAlign: "left", border: "none", background: "#ffffff", padding: "14px 16px", cursor: "pointer", color: "#334155", borderBottom: "1px solid #eef2f7" }}>
                        {suggestion.label}
                      </button>
                    ))}
                  </div>
                ) : null}
                {locationError ? <p style={{ margin: "10px 0 0", color: "#ffd5cf", fontSize: "13px" }}>{locationError}</p> : null}
              </div>
              <div style={{ background: "#ffffff", borderRadius: "18px", padding: "0 16px", display: "flex", alignItems: "center", minHeight: "60px", boxShadow: "0 14px 28px rgba(112, 47, 0, 0.12)" }}>
                <span style={{ fontSize: "18px", color: "#1cb5ac", marginRight: "10px" }}>?</span>
                <input placeholder="Search nursing, therapy, counselling..." style={{ width: "100%", border: "none", outline: "none", fontSize: "15px", color: "#374151", background: "transparent" }} value={serviceSearch} onChange={(event) => setServiceSearch(event.target.value)} onKeyDown={handleSearchKeyDown} />
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", paddingBottom: "32px" }}>
            {heroCards.map((card) => (
              <Link key={card.title} to={buildServicesPath({ type: card.type, nextLocation: location.trim() })} style={cardLinkStyle}>
                <article style={{ background: "#fdfdfd", borderRadius: "38px", padding: "30px 30px 22px", minHeight: "340px", boxShadow: "0 26px 50px rgba(79, 32, 0, 0.16)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                  <div>
                    <h3 style={{ margin: 0, color: "#35353d", fontSize: "clamp(1.7rem, 2.6vw, 2.5rem)", fontWeight: 800, lineHeight: 1.08 }}>{card.title}</h3>
                    <p style={{ margin: "14px 0 0", color: "#6b7280", fontSize: "18px", lineHeight: 1.45, fontWeight: 500 }}>{card.subtitle}</p>
                    <div style={{ display: "inline-flex", marginTop: "18px", padding: "10px 14px", borderRadius: "999px", color: "#1aa398", fontWeight: 700, fontSize: "15px", background: card.accent }}>{card.offer}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px" }}>
                    <div style={{ width: "58px", height: "58px", borderRadius: "50%", background: "#d7eefc", color: "#0c506c", boxShadow: "0 10px 24px rgba(12, 80, 108, 0.14)", border: "1px solid rgba(12, 80, 108, 0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", flexShrink: 0 }}>{">"}</div>
                    <img src={card.image} alt={card.title} loading="lazy" style={{ width: "160px", maxWidth: "55%", objectFit: "contain", alignSelf: "flex-end" }} />
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <SectionShell title="Services for every care need" subtitle="A mixed marketplace of nursing, ayurvedic therapy, counselling, elderly support, and critical care.">
        <div style={{ overflow: "hidden", width: "100%" }}>
          <div style={{ display: "flex", gap: "24px", width: "max-content", animation: "care-marquee 28s linear infinite" }}>
            {scrollingDiscoverServices.map((item, index) => (
              <article key={`${item.title}-${index}`} style={{ textAlign: "center", minWidth: "140px", flex: "0 0 auto" }}>
                <div style={{ width: "114px", height: "114px", margin: "0 auto 12px", borderRadius: "50%", background: "linear-gradient(145deg, #ffffff, #fde7d9)", boxShadow: "0 12px 30px rgba(29, 41, 57, 0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <img src={item.image} alt={item.title} loading="lazy" style={{ width: "74px", height: "74px", objectFit: "contain" }} />
                </div>
                <h3 style={{ margin: 0, fontSize: "16px", color: "#1f2937" }}>{item.title}</h3>
                <p style={{ margin: "6px 0 0", color: "#667085", fontSize: "13px" }}>{item.category}</p>
              </article>
            ))}
          </div>
        </div>
      </SectionShell>

      <SectionShell title="Featured homecare services" subtitle="A curated mix from nursing, therapy, and counselling designed like a modern booking marketplace.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "18px" }}>
          {featuredServices.map((service) => (
            <article key={service.id} style={{ background: "#ffffff", borderRadius: "22px", overflow: "hidden", border: "1px solid #ececec", boxShadow: "0 14px 28px rgba(15, 23, 42, 0.05)" }}>
              <div style={{ position: "relative", height: "190px", background: "linear-gradient(145deg, #fff4ed, #ffe6d5)" }}>
                <img src={service.image} alt={service.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "contain", padding: "18px" }} />
                <div style={{ position: "absolute", left: "14px", top: "14px", background: "#1aa398", color: "#ffffff", padding: "6px 10px", borderRadius: "999px", fontSize: "12px", fontWeight: 700, textTransform: "uppercase" }}>Care Special</div>
              </div>
              <div style={{ padding: "16px" }}>
                <h3 style={{ margin: 0, fontSize: "24px", color: "#1f2937" }}>{service.title}</h3>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "10px", color: "#667085", fontSize: "14px", lineHeight: 1.5 }}><span>{service.category}</span><span>{service.price}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", marginTop: "10px", color: "#667085", fontSize: "14px", lineHeight: 1.5 }}><span>{service.timing}</span><span>Book today</span></div>
                <div style={{ marginTop: "14px", background: "#2bb673", color: "#ffffff", padding: "10px 12px", borderRadius: "12px", fontWeight: 700, fontSize: "14px" }}>{service.offer}</div>
                <div style={{ marginTop: "10px", background: "#dff6ea", color: "#2b8a5b", padding: "10px 12px", borderRadius: "12px", fontWeight: 600, fontSize: "14px" }}>{service.extra}</div>
                <div style={{ display: "flex", gap: "10px", marginTop: "14px", flexWrap: "wrap" }}>
                  <Link to={buildServicesPath({ type: service.type, query: service.query, nextLocation: location.trim() })} style={{ display: "inline-flex", textDecoration: "none", color: "#1aa398", fontWeight: 700, alignItems: "center" }}>View Details</Link>
                  <button
                    type="button"
                    onClick={() => {
                      const item = servicesData[service.type].find((entry) => entry.id === service.serviceId);
                      if (item) addToCart(item);
                    }}
                    style={{ border: "none", borderRadius: "12px", background: "#102542", color: "#ffffff", padding: "10px 14px", fontWeight: 700, cursor: "pointer" }}
                  >
                    Add to Cart
                  </button>
                  <div style={{ minWidth: "92px", borderRadius: "12px", background: "#f3f7fb", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px" }}>
                    <button
                      type="button"
                      onClick={() => removeFromCart(service.serviceId)}
                      style={{ width: "24px", height: "24px", borderRadius: "8px", border: "none", background: "#dbeafe", cursor: "pointer", fontWeight: 700 }}
                    >
                      -
                    </button>
                    <span style={{ fontWeight: 700, color: "#102542" }}>{getQty(service.serviceId)}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const item = servicesData[service.type].find((entry) => entry.id === service.serviceId);
                        if (item) addToCart(item);
                      }}
                      style={{ width: "24px", height: "24px", borderRadius: "8px", border: "none", background: "#dbeafe", cursor: "pointer", fontWeight: 700 }}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </SectionShell>

      <SectionShell title="Achievements so far" subtitle="A growing network of care experts, partner teams, and families relying on Sathi Homecare every day.">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
          {stats.map((item) => (
            <div key={item.label} style={{ background: "#ffffff", borderRadius: "26px", padding: "30px 24px", textAlign: "center", boxShadow: "0 14px 32px rgba(15, 23, 42, 0.06)" }}>
              <Counter value={item.value} />
              <p style={{ margin: "10px 0 0", color: "#667085", lineHeight: 1.6 }}>{item.label}</p>
            </div>
          ))}
        </div>
      </SectionShell>

      <section style={{ maxWidth: "1480px", margin: "0 auto", padding: "56px 24px 0", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "22px" }}>
        <div style={{ background: "#ffffff", borderRadius: "28px", padding: "28px", boxShadow: "0 14px 32px rgba(15, 23, 42, 0.06)" }}>
          <p style={{ margin: 0, color: "#1aa398", fontWeight: 700, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Customer feedback</p>
          <h2 style={{ margin: "12px 0 0", fontSize: "clamp(2rem, 3vw, 2.6rem)", color: "#1f2937" }}>Families trust our care experience</h2>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "22px" }}>
            <span style={{ fontSize: "54px", color: "#f59e0b", lineHeight: 1 }}>*</span>
            <div>
              <p style={{ margin: 0, fontSize: "28px", fontWeight: 700, color: "#1f2937" }}>4.5 / 5</p>
              <p style={{ margin: "4px 0 0", color: "#667085" }}>Based on 49.6K verified reviews</p>
            </div>
          </div>
          <p style={{ margin: "18px 0 0", color: "#667085", lineHeight: 1.8 }}>
            From home nursing and post-surgery support to counselling and therapy, families come back because the experience stays simple, kind, and reliable.
          </p>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "20px" }}>
            {mixedServices.slice(0, 4).map((service) => (
              <div key={service.id} style={{ background: "#e7fbf6", padding: "10px 12px", borderRadius: "999px", fontSize: "13px" }}>
                <Link to={buildServicesPath({ type: inferServiceType(service.name), query: service.name, nextLocation: location.trim() })} style={{ color: "#168f86", fontWeight: 600, textDecoration: "none" }}>{service.name}</Link>
              </div>
            ))}
          </div>
        </div>
        <ReviewSlider items={reviews} />
      </section>

      {locationCoords ? (
        <section style={{ maxWidth: "1480px", margin: "0 auto", padding: "56px 24px 0" }} className="page-section">
          <div style={{ background: "#ffffff", borderRadius: "28px", padding: "24px", boxShadow: "0 18px 40px rgba(15, 23, 42, 0.08)", display: "grid", gridTemplateColumns: "minmax(260px, 0.9fr) minmax(320px, 1.1fr)", gap: "20px", alignItems: "stretch" }} className="home-location-grid compact-mobile-card">
            <div>
              <p style={{ margin: 0, color: "#1aa398", fontWeight: 700, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Selected location</p>
              <h2 style={{ margin: "10px 0 0", color: "#102542", fontSize: "clamp(1.8rem, 3vw, 2.3rem)" }}>Service availability near you</h2>
              <p style={{ margin: "12px 0 0", color: "#667085", lineHeight: 1.7 }}>Is area ko use karke hum services aur caregivers ke relevant results dikha sakte hain.</p>
              <p style={{ margin: "16px 0 0", color: "#0f8f86", fontWeight: 600, lineHeight: 1.6 }}>{location}</p>
              <button type="button" onClick={handleSearch} style={{ marginTop: "18px", border: "none", borderRadius: "14px", background: "#1cb5ac", color: "#ffffff", fontWeight: 700, fontSize: "15px", padding: "14px 20px", cursor: "pointer", boxShadow: "0 16px 32px rgba(28, 181, 172, 0.24)" }}>See services for this area</button>
            </div>
            <div style={{ minHeight: "280px", borderRadius: "22px", overflow: "hidden", border: "1px solid #e5e7eb" }}>
              <iframe
                title="Selected location map"
                style={{ width: "100%", height: "100%", border: "none" }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${locationCoords.lng - 0.02}%2C${locationCoords.lat - 0.02}%2C${locationCoords.lng + 0.02}%2C${locationCoords.lat + 0.02}&layer=mapnik&marker=${locationCoords.lat}%2C${locationCoords.lng}`}
              />
            </div>
          </div>
        </section>
      ) : null}

      <footer style={{ marginTop: "52px", background: "#111827", color: "#cbd5e1", padding: "54px 24px 22px" }} className="page-padding">
        <div style={{ maxWidth: "1480px", margin: "0 auto", display: "grid", gridTemplateColumns: "minmax(260px, 1.3fr) repeat(auto-fit, minmax(170px, 1fr))", gap: "26px" }}>
          <div style={{ maxWidth: "380px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#ffffff", color: "#0f8f86", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "22px" }}>S</div>
              <span style={{ fontSize: "18px", fontWeight: 700, color: "#ffffff" }}>Sathi Homecare</span>
            </div>
            <p style={{ margin: "16px 0 0", lineHeight: 1.8, color: "#cbd5e1" }}>Home nursing, therapy, counselling, and elder support for families who want quality care without leaving home.</p>
            <p style={{ margin: "10px 0 0", color: "#cbd5e1" }}>Call us: +91 98765 43210</p>
            <p style={{ margin: "10px 0 0", color: "#cbd5e1" }}>Email: care@sathihomecare.in</p>
          </div>
          <FooterColumn title="Services" items={footerGroups.services} />
          <FooterColumn title="Company" items={footerGroups.company} />
          <FooterColumn title="Support" items={footerGroups.support} />
        </div>
        <div style={{ maxWidth: "1480px", margin: "26px auto 0", paddingTop: "18px", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", color: "#94a3b8" }}>
          <span>Copyright 2026 Sathi Homecare. All rights reserved.</span>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <Link to="/privacy-policy" style={footerLegalLink}>Privacy</Link>
            <Link to="/terms-conditions" style={footerLegalLink}>Terms</Link>
            <Link to="/refund-cancellation-policy" style={footerLegalLink}>Refunds</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function inferServiceType(name) {
  const value = name.toLowerCase();
  if (value.includes("therapy") || value.includes("massage")) return "therapy";
  if (value.includes("mental") || value.includes("career")) return "counselling";
  return "nursing";
}

function SectionShell({ title, subtitle, children }) {
  return (
    <section style={{ maxWidth: "1480px", margin: "0 auto", padding: "56px 24px 0" }} className="page-section">
      <div style={{ marginBottom: "26px" }}>
        <p style={{ margin: 0, color: "#1aa398", fontWeight: 700, fontSize: "13px", textTransform: "uppercase", letterSpacing: "0.08em" }}>Discover care</p>
        <h2 style={{ margin: "10px 0 0", color: "#1f2937", fontSize: "clamp(2rem, 3vw, 2.8rem)" }}>{title}</h2>
        <p style={{ margin: "10px 0 0", color: "#667085", fontSize: "16px", lineHeight: 1.7, maxWidth: "760px" }}>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function ReviewSlider({ items }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setIndex((previous) => (previous + 1) % items.length), 3500);
    return () => clearInterval(timer);
  }, [items.length]);

  return (
    <div style={{ background: "linear-gradient(155deg, #1f2937, #111827)", color: "#ffffff", borderRadius: "28px", padding: "28px", minHeight: "340px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 18px 34px rgba(15, 23, 42, 0.14)" }}>
      <p style={{ margin: 0, fontSize: "66px", lineHeight: 0.85, color: "rgba(255,255,255,0.45)" }}>"</p>
      <p style={{ margin: "10px 0 0", fontSize: "18px", lineHeight: 1.8, color: "rgba(255,255,255,0.95)" }}>{items[index].text}</p>
      <div style={{ display: "flex", alignItems: "center", gap: "14px", marginTop: "22px" }}>
        <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "20px" }}>{items[index].name.charAt(0)}</div>
        <div>
          <h3 style={{ margin: 0, fontSize: "18px" }}>{items[index].name}</h3>
          <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.74)" }}>{items[index].role}</p>
          <p style={{ margin: "4px 0 0", color: "rgba(255,255,255,0.74)" }}>{items[index].location}</p>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "14px", marginTop: "24px", flexWrap: "wrap" }}>
        <button type="button" style={{ border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.08)", color: "#ffffff", padding: "10px 16px", borderRadius: "999px", cursor: "pointer" }} onClick={() => setIndex((previous) => (previous - 1 + items.length) % items.length)}>Prev</button>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {items.map((item, itemIndex) => (
            <button key={item.name} type="button" aria-label={`Review ${itemIndex + 1}`} onClick={() => setIndex(itemIndex)} style={{ width: "12px", height: "12px", borderRadius: "50%", border: "none", background: "#ffffff", cursor: "pointer", transition: "all 0.2s ease", opacity: itemIndex === index ? 1 : 0.35, transform: itemIndex === index ? "scale(1)" : "scale(0.82)" }} />
          ))}
        </div>
        <button type="button" style={{ border: "1px solid rgba(255,255,255,0.14)", background: "rgba(255,255,255,0.08)", color: "#ffffff", padding: "10px 16px", borderRadius: "999px", cursor: "pointer" }} onClick={() => setIndex((previous) => (previous + 1) % items.length)}>Next</button>
      </div>
    </div>
  );
}

function Counter({ value }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let current = 0;
    const step = Math.max(1, Math.ceil(value / 55));
    const interval = setInterval(() => {
      current += step;
      if (current >= value) {
        setCount(value);
        clearInterval(interval);
      } else {
        setCount(current);
      }
    }, 32);
    return () => clearInterval(interval);
  }, [value]);
  return <h3 style={{ margin: 0, fontSize: "clamp(2rem, 4vw, 3rem)", color: "#1f2937" }}>{count.toLocaleString()}+</h3>;
}

function FooterColumn({ title, items }) {
  return (
    <div>
      <h3 style={{ margin: 0, color: "#ffffff", fontSize: "18px" }}>{title}</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
        {items.map((item) => (
          typeof item === "string" ? (
            <span key={item} style={{ color: "#cbd5e1" }}>{item}</span>
          ) : (
            <Link key={item.label} to={item.to} style={footerColumnLink}>{item.label}</Link>
          )
        ))}
      </div>
    </div>
  );
}

const footerColumnLink = {
  color: "#cbd5e1",
  textDecoration: "none"
};

const footerLegalLink = {
  color: "#94a3b8",
  textDecoration: "none"
};
