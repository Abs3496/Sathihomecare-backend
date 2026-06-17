import { useEffect, useRef, useState } from "react";
import { apiFetch } from "../api";
import logo from "../assets/images/icons/logo.png";
import carePhoto from "../assets/images/services/nursing.jpeg";

const welcomeMessage = "Namaste! Main Priya hoon. Main aapki care requirement samajhne aur booking mein madad kar sakti hoon. Please batayein care kis ke liye chahiye?";
const coordinatorNumber = "918090806731";

const initialDraft = {
  patientName: "",
  age: null,
  location: "",
  serviceType: "",
  preferredDate: "",
  timeSlot: "",
  mobileNumber: ""
};

const relationOptions = ["Father", "Mother", "Self", "Senior Citizen", "Patient", "Not Sure"];
const serviceOptions = ["Home Nursing", "Elder Care", "Post Surgery Care", "Physiotherapy", "Ayurvedic Therapy"];
const ageOptions = ["45", "55", "65", "75", "85"];
const locationOptions = ["Lucknow", "Gomti Nagar", "Indira Nagar", "Aliganj", "Hazratganj"];
const timeSlotOptions = ["08:00 AM - 10:00 AM", "10:00 AM - 12:00 PM", "12:00 PM - 02:00 PM", "04:00 PM - 06:00 PM"];

function isoDate(offsetDays) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}

export default function AiCareReceptionist() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: welcomeMessage }]);
  const [draft, setDraft] = useState(initialDraft);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState("");
  const [canConfirm, setCanConfirm] = useState(false);
  const [booking, setBooking] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, summary, booking]);

  const userMessageCount = messages.filter((message) => message.role === "user").length;
  const suggestions = getSuggestions({ draft, canConfirm, booking, userMessageCount });

  const sendMessage = async (text, confirmBooking = false) => {
    const content = String(text || "").trim();
    if (!content && !confirmBooking) return;

    const nextMessages = confirmBooking ? messages : [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);

    try {
      const response = await apiFetch("/ai-receptionist/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: nextMessages,
          draft,
          confirmBooking
        })
      });

      setDraft(response.draft || initialDraft);
      setSummary(response.bookingSummary || "");
      setCanConfirm(Boolean(response.canConfirm));
      if (response.booking) setBooking(response.booking);

      const reply = response.reply || "Theek hai. Please next detail share karein.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (error) {
      const reply = error?.message || "Sorry, abhi receptionist connect nahi ho pa rahi. Aap coordinator se baat kar sakte hain.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  if (isClosed) {
    return (
      <button type="button" onClick={() => setIsClosed(false)} style={floatingButton} aria-label="Open Priya care receptionist">
        <span style={floatingStatus} />
        Priya Chat
      </button>
    );
  }

  return (
    <div style={overlayStyle}>
      <section style={modalStyle} aria-label="Sathi care receptionist">
        <div style={heroStyle}>
          <button type="button" onClick={() => setIsClosed(true)} style={closeButton} aria-label="Close care receptionist">X</button>
          <div style={logoCard}>
            <img src={logo} alt="Sathi Homecare" style={logoStyle} />
            <div>
              <strong style={logoText}>SATHI</strong>
              <span style={logoSubtext}>HOMECARE</span>
            </div>
          </div>
          <div style={profileBlock}>
            <h2 style={profileName}>Priya Sharma</h2>
            <p style={profileRole}>Senior Care Receptionist</p>
            <p style={availableText}><span style={greenDot} /> Available Now</p>
            <p style={languageText}>Hindi - English</p>
          </div>
          <div style={heroTitleBlock}>
            <h1 style={heroTitle}>Welcome to<br /><span style={heroTitleAccent}>Sathi Care Reception</span></h1>
            <p style={heroSubtitle}>Get Care Guidance in <strong>Less Than 2 Minutes</strong></p>
            <div style={statsGrid}>
              <Stat value="5000+" label="Happy Families" />
              <Stat value="100%" label="Verified Staff" />
              <Stat value="24/7" label="Support" />
              <Stat value="4.8/5" label="Customer Rating" />
            </div>
          </div>
          <div style={photoWrap}>
            <img src={carePhoto} alt="Care receptionist helping senior patient" style={photoStyle} />
          </div>
        </div>

        <div style={chatArea}>
          <div style={timeStamp}>10:30 AM</div>
          <div style={messageList}>
            {messages.map((message, index) => (
              <ChatRow key={`${message.role}-${index}`} role={message.role} content={message.content} />
            ))}
            {loading ? <TypingRow /> : null}
            {!loading && suggestions.length ? (
              <SuggestionRow suggestions={suggestions} onSelect={sendMessage} />
            ) : null}
            {summary && !booking ? (
              <div style={summaryCard}>
                <strong>Booking Summary</strong>
                <pre style={summaryText}>{summary}</pre>
                <button type="button" disabled={!canConfirm || loading} onClick={() => sendMessage("", true)} style={confirmButton}>
                  Confirm Booking
                </button>
              </div>
            ) : null}
            {booking ? (
              <div style={bookingCard}>
                <strong>Booking Confirmed</strong>
                <span>Booking ID: {booking.bookingCode}</span>
                <span>{booking.serviceName}</span>
                <span>{booking.preferredDate} | {booking.preferredTimeSlot}</span>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          <div style={humanActions}>
            <a href={`https://wa.me/${coordinatorNumber}`} target="_blank" rel="noreferrer" style={humanButton}>WhatsApp Coordinator</a>
            <a href={`tel:+${coordinatorNumber}`} style={humanButton}>Call Coordinator</a>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
            style={inputRow}
          >
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Type your answer in Hindi or English..."
              style={textInput}
            />
            <button type="submit" disabled={loading} style={sendButton} aria-label="Send message">Send</button>
          </form>
          <p style={secureText}>Your information is secure and confidential.</p>
        </div>
      </section>
    </div>
  );
}

function getSuggestions({ draft, canConfirm, booking, userMessageCount }) {
  if (booking) return [];
  if (canConfirm) return [{ label: "Confirm Booking", value: "__CONFIRM__" }];
  if (userMessageCount === 0) return relationOptions.map((item) => ({ label: item, value: `Care for ${item}` }));
  if (!draft.serviceType) return serviceOptions.map((item) => ({ label: item, value: `Service type: ${item}` }));
  if (!draft.age) return ageOptions.map((item) => ({ label: `${item} years`, value: `Patient age is ${item}` }));
  if (!draft.location) return locationOptions.map((item) => ({ label: item, value: `Location is ${item}` }));
  if (!draft.preferredDate) {
    return [
      { label: "Today", value: `Preferred date is ${isoDate(0)}` },
      { label: "Tomorrow", value: `Preferred date is ${isoDate(1)}` },
      { label: "Day After", value: `Preferred date is ${isoDate(2)}` }
    ];
  }
  if (!draft.timeSlot) return timeSlotOptions.map((item) => ({ label: item, value: `Preferred time slot is ${item}` }));
  if (!draft.patientName) return [{ label: "Type Patient Name", value: "" }];
  if (!draft.mobileNumber) return [{ label: "Type Mobile Number", value: "" }];
  return [];
}

function SuggestionRow({ suggestions, onSelect }) {
  return (
    <div style={suggestionWrap}>
      {suggestions.map((suggestion) => (
        <button
          key={suggestion.label}
          type="button"
          disabled={!suggestion.value}
          onClick={() => suggestion.value === "__CONFIRM__" ? onSelect("", true) : onSelect(suggestion.value)}
          style={{ ...suggestionChip, opacity: suggestion.value ? 1 : 0.65, cursor: suggestion.value ? "pointer" : "default" }}
        >
          {suggestion.label}
        </button>
      ))}
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div style={statItem}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function ChatRow({ role, content }) {
  const isUser = role === "user";
  return (
    <div style={isUser ? userRow : assistantRow}>
      {!isUser ? <Avatar /> : null}
      <div style={isUser ? userBubble : assistantBubble}>
        {content}
        {isUser ? <span style={bubbleTime}>10:31 AM</span> : null}
      </div>
    </div>
  );
}

function TypingRow() {
  return (
    <div style={assistantRow}>
      <Avatar />
      <div style={{ ...assistantBubble, width: "130px" }}>
        <span style={typingDot} />
        <span style={typingDot} />
        <span style={typingDot} />
      </div>
    </div>
  );
}

function Avatar() {
  return (
    <div style={avatarStyle}>
      <img src={carePhoto} alt="Priya Sharma" style={avatarImage} />
      <span style={avatarOnline} />
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 80,
  background: "rgba(4, 15, 31, 0.74)",
  backdropFilter: "blur(5px)",
  display: "grid",
  placeItems: "center",
  padding: "18px",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

const modalStyle = {
  width: "min(1120px, calc(100vw - 24px))",
  height: "min(820px, calc(100vh - 24px))",
  background: "#ffffff",
  borderRadius: "28px",
  overflow: "hidden",
  boxShadow: "0 32px 90px rgba(0, 0, 0, 0.45)",
  display: "grid",
  gridTemplateRows: "270px minmax(0, 1fr)"
};

const heroStyle = {
  position: "relative",
  overflow: "hidden",
  background: "linear-gradient(105deg, #041c34 0%, #08294a 47%, #0b4163 100%)",
  color: "#ffffff",
  borderBottomLeftRadius: "22px",
  borderBottomRightRadius: "22px",
  boxShadow: "0 10px 22px rgba(36, 211, 186, 0.22)"
};

const closeButton = {
  position: "absolute",
  top: "24px",
  right: "24px",
  width: "50px",
  height: "50px",
  borderRadius: "50%",
  border: "none",
  background: "rgba(0, 0, 0, 0.28)",
  color: "#ffffff",
  fontSize: "20px",
  cursor: "pointer",
  zIndex: 4
};

const logoCard = {
  position: "absolute",
  top: "22px",
  left: "0",
  minWidth: "230px",
  height: "94px",
  padding: "18px 26px",
  background: "#ffffff",
  color: "#071b3a",
  borderTopRightRadius: "48px",
  borderBottomRightRadius: "48px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  zIndex: 3
};

const logoStyle = { width: "54px", height: "54px", objectFit: "contain" };
const logoText = { display: "block", fontSize: "26px", lineHeight: 1, letterSpacing: "0" };
const logoSubtext = { display: "block", fontSize: "14px", fontWeight: 900 };

const profileBlock = {
  position: "absolute",
  top: "36px",
  left: "260px",
  zIndex: 3
};

const profileName = { margin: 0, fontSize: "26px", letterSpacing: "0" };
const profileRole = { margin: "6px 0", color: "#d6e7f3", fontSize: "16px" };
const availableText = { margin: "0 0 5px", color: "#36e09f", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" };
const greenDot = { width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e", display: "inline-block" };
const languageText = { margin: 0, color: "#49d6c4" };

const heroTitleBlock = {
  position: "absolute",
  left: "42px",
  bottom: "30px",
  zIndex: 3,
  width: "510px"
};

const heroTitle = { margin: 0, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "32px", lineHeight: 1.12, letterSpacing: "0" };
const heroTitleAccent = { color: "#36d9c3" };
const heroSubtitle = { margin: "12px 0 18px", color: "#f2f8ff", fontSize: "16px" };

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "18px",
  maxWidth: "520px"
};

const statItem = {
  display: "grid",
  gap: "4px",
  color: "#d6e7f3",
  fontSize: "11px"
};

const photoWrap = {
  position: "absolute",
  inset: "0 0 0 auto",
  width: "54%",
  zIndex: 1
};

const photoStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
  opacity: 0.9,
  filter: "saturate(1.05) contrast(1.02)"
};

const chatArea = {
  minHeight: 0,
  padding: "18px 34px 16px",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr) auto auto auto",
  gap: "10px"
};

const timeStamp = { textAlign: "center", color: "#73839a", fontSize: "12px" };
const messageList = { minHeight: 0, overflowY: "auto", display: "grid", alignContent: "start", gap: "12px", padding: "0 8px 2px 0" };
const assistantRow = { display: "flex", alignItems: "flex-start", gap: "12px" };
const userRow = { display: "flex", justifyContent: "flex-end" };
const avatarStyle = { position: "relative", width: "52px", height: "52px", flex: "0 0 auto" };
const avatarImage = { width: "52px", height: "52px", borderRadius: "50%", objectFit: "cover", objectPosition: "35% 35%" };
const avatarOnline = { position: "absolute", right: "1px", bottom: "2px", width: "13px", height: "13px", borderRadius: "50%", background: "#22c55e", border: "3px solid #ffffff" };
const assistantBubble = { maxWidth: "480px", background: "#ffffff", color: "#102542", padding: "15px 18px", borderRadius: "0 16px 16px 16px", lineHeight: 1.65, boxShadow: "0 12px 28px rgba(15, 23, 42, 0.1)", whiteSpace: "pre-wrap" };
const userBubble = { maxWidth: "390px", background: "#dff9e9", color: "#0c342d", padding: "13px 18px", borderRadius: "16px 16px 0 16px", lineHeight: 1.55, boxShadow: "0 12px 28px rgba(67, 197, 158, 0.2)", whiteSpace: "pre-wrap" };
const bubbleTime = { marginLeft: "14px", color: "#7aa395", fontSize: "11px" };
const typingDot = { display: "inline-block", width: "8px", height: "8px", borderRadius: "50%", background: "#b6c0cf", marginRight: "7px" };

const suggestionWrap = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  marginLeft: "64px",
  maxWidth: "760px"
};

const suggestionChip = {
  border: "1px solid #d7e3ef",
  background: "#ffffff",
  color: "#102542",
  borderRadius: "999px",
  padding: "10px 15px",
  fontWeight: 800,
  boxShadow: "0 8px 18px rgba(15, 23, 42, 0.08)"
};

const humanActions = { display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" };
const humanButton = { border: "1px solid #d7e3ef", borderRadius: "999px", background: "#ffffff", color: "#0f766e", padding: "9px 14px", fontWeight: 900, textDecoration: "none" };

const inputRow = { display: "grid", gridTemplateColumns: "minmax(0, 1fr) 92px", gap: "12px", alignItems: "center" };
const textInput = { width: "100%", minWidth: 0, height: "54px", border: "1px solid #e3ebf5", borderRadius: "27px", outline: "none", color: "#102542", fontSize: "16px", background: "#ffffff", padding: "0 20px", boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)" };
const sendButton = { height: "54px", borderRadius: "27px", border: "none", background: "#6bc5af", color: "#ffffff", cursor: "pointer", fontWeight: 900, fontSize: "15px" };
const secureText = { margin: "-2px 0 0", textAlign: "center", color: "#73839a", fontSize: "12px" };

const summaryCard = { justifySelf: "center", width: "min(560px, 100%)", background: "#ffffff", border: "1px solid #c7f1e8", borderRadius: "18px", padding: "16px", boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)", color: "#102542" };
const summaryText = { margin: "10px 0 14px", whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.6, color: "#334155" };
const confirmButton = { border: "none", borderRadius: "14px", padding: "13px 18px", background: "#0f766e", color: "#ffffff", fontWeight: 900, cursor: "pointer" };
const bookingCard = { justifySelf: "center", display: "grid", gap: "6px", width: "min(460px, 100%)", background: "#ecfffb", border: "1px solid #b7f3e8", borderRadius: "18px", padding: "16px", color: "#0f3f3a", boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)" };

const floatingButton = {
  position: "fixed",
  right: "18px",
  bottom: "18px",
  zIndex: 80,
  border: "none",
  borderRadius: "999px",
  background: "#0f766e",
  color: "#ffffff",
  padding: "14px 18px",
  boxShadow: "0 18px 45px rgba(15,118,110,0.32)",
  fontWeight: 900,
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  gap: "8px"
};
const floatingStatus = { width: "9px", height: "9px", borderRadius: "50%", background: "#bbf7d0" };

if (typeof document !== "undefined" && !document.getElementById("sathi-care-reception-css")) {
  const style = document.createElement("style");
  style.id = "sathi-care-reception-css";
  style.textContent = `
    @media (max-width: 820px) {
      [aria-label="Sathi care receptionist"] {
        height: calc(100vh - 14px) !important;
        width: calc(100vw - 14px) !important;
        border-radius: 18px !important;
        grid-template-rows: 210px minmax(0, 1fr) !important;
      }
      [aria-label="Sathi care receptionist"] h1 {
        font-size: 24px !important;
      }
    }
  `;
  document.head.appendChild(style);
}
