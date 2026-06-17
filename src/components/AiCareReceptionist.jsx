import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "../api";
import logo from "../assets/images/icons/logo.png";
import carePhoto from "../assets/images/services/nursing.jpeg";

const welcomeMessage = "Namaste! Main Priya hoon, aapki care needs samajhne aur booking mein madad kar sakti hoon. Aap kis ke liye care arrange karna chahte hain?";
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

const relationChips = ["Father", "Mother", "Self", "Senior Citizen", "Patient", "Not Sure"];
const quickActions = ["Elder Care", "Home Nursing", "Post Surgery Care", "Physiotherapy", "Ayurvedic Therapy", "Talk to Human Expert"];

export default function AiCareReceptionist() {
  const [isVisible, setIsVisible] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [messages, setMessages] = useState([{ role: "assistant", content: welcomeMessage }]);
  const [draft, setDraft] = useState(initialDraft);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  const [summary, setSummary] = useState("");
  const [canConfirm, setCanConfirm] = useState(false);
  const [booking, setBooking] = useState(null);
  const recognitionRef = useRef(null);
  const bottomRef = useRef(null);

  const speechSupported = useMemo(
    () => typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window),
    []
  );

  useEffect(() => {
    const timer = window.setTimeout(() => setIsVisible(true), 2000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, summary, booking]);

  const speak = (text) => {
    if (!speakerEnabled || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "hi-IN";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

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

      const reply = response.reply || "Theek hai Sir, thodi aur detail bata dijiye.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      speak(reply);
    } catch (error) {
      const reply = error?.message || "Sorry Sir, abhi receptionist connect nahi ho pa rahi. Aap coordinator se baat kar sakte hain.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (!speechSupported) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Voice input is browser mein supported nahi hai. Aap message type kar dijiye Sir." }]);
      return;
    }

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new Recognition();
    recognition.lang = "hi-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setInput(transcript);
      sendMessage(transcript);
    };
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  };

  if (!isVisible) return null;

  if (isClosed) {
    return (
      <button type="button" onClick={() => setIsClosed(false)} style={floatingButton} aria-label="Open Priya care receptionist">
        <span style={floatingStatus} />
        Priya Care
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
            <p style={heroMini}>Sathi Care</p>
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

          <div style={relationRow}>
            {relationChips.map((chip) => (
              <button key={chip} type="button" onClick={() => sendMessage(`${chip} ke liye`)} style={relationChip}>
                <span style={chipIcon}>{chip.slice(0, 1)}</span>
                {chip}
              </button>
            ))}
          </div>

          <div style={quickBox}>
            <p style={quickTitle}>Quick Actions</p>
            <div style={quickGrid}>
              {quickActions.map((item) => {
                const isHuman = item === "Talk to Human Expert";
                return isHuman ? (
                  <a key={item} href={`tel:+${coordinatorNumber}`} style={quickChip}>{item}</a>
                ) : (
                  <button key={item} type="button" onClick={() => sendMessage(item)} style={quickChip}>{item}</button>
                );
              })}
            </div>
          </div>

          <form
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage(input);
            }}
            style={inputRow}
          >
            <button type="button" onClick={toggleMic} style={{ ...micButton, background: listening ? "#ef476f" : "#43c59e" }} aria-label="Voice microphone">
              MIC
            </button>
            <div style={inputShell}>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Type a message..."
                style={textInput}
              />
              <button type="button" onClick={() => setSpeakerEnabled((prev) => !prev)} style={speakerButton} aria-label="Speaker">
                {speakerEnabled ? "ON" : "OFF"}
              </button>
            </div>
            <button type="submit" disabled={loading} style={sendButton} aria-label="Send message">GO</button>
          </form>
          <p style={secureText}>Your information is secure and confidential.</p>
        </div>
      </section>
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
      <div style={{ ...assistantBubble, width: "140px" }}>
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
  padding: "24px",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};

const modalStyle = {
  width: "min(1120px, calc(100vw - 32px))",
  height: "min(900px, calc(100vh - 32px))",
  background: "#ffffff",
  borderRadius: "34px",
  overflow: "hidden",
  boxShadow: "0 32px 90px rgba(0, 0, 0, 0.45)",
  display: "grid",
  gridTemplateRows: "minmax(300px, 430px) minmax(0, 1fr)"
};

const heroStyle = {
  position: "relative",
  overflow: "hidden",
  background: "linear-gradient(105deg, #041c34 0%, #08294a 48%, #0b4163 100%)",
  color: "#ffffff",
  borderBottomLeftRadius: "28px",
  borderBottomRightRadius: "28px",
  boxShadow: "0 10px 22px rgba(36, 211, 186, 0.22)"
};

const closeButton = {
  position: "absolute",
  top: "28px",
  right: "28px",
  width: "56px",
  height: "56px",
  borderRadius: "50%",
  border: "none",
  background: "rgba(255, 255, 255, 0.15)",
  color: "#ffffff",
  fontSize: "22px",
  cursor: "pointer",
  zIndex: 4
};

const logoCard = {
  position: "absolute",
  top: "26px",
  left: "0",
  minWidth: "230px",
  height: "116px",
  padding: "22px 28px",
  background: "#ffffff",
  color: "#071b3a",
  borderTopRightRadius: "58px",
  borderBottomRightRadius: "58px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  zIndex: 3
};

const logoStyle = { width: "64px", height: "64px", objectFit: "contain" };
const logoText = { display: "block", fontSize: "28px", lineHeight: 1, letterSpacing: "0" };
const logoSubtext = { display: "block", fontSize: "15px", fontWeight: 900 };

const profileBlock = {
  position: "absolute",
  top: "38px",
  left: "260px",
  zIndex: 3
};

const profileName = { margin: 0, fontSize: "28px", letterSpacing: "0" };
const profileRole = { margin: "8px 0", color: "#d6e7f3", fontSize: "18px" };
const availableText = { margin: "0 0 6px", color: "#36e09f", fontWeight: 800, display: "flex", alignItems: "center", gap: "8px" };
const greenDot = { width: "10px", height: "10px", borderRadius: "50%", background: "#22c55e", display: "inline-block" };
const languageText = { margin: 0, color: "#49d6c4" };

const heroTitleBlock = {
  position: "absolute",
  left: "42px",
  bottom: "42px",
  zIndex: 3,
  width: "520px"
};

const heroMini = { margin: "0 0 10px 390px", color: "#34d6c6", fontSize: "20px", fontWeight: 800 };
const heroTitle = { margin: 0, fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "40px", lineHeight: 1.12, letterSpacing: "0" };
const heroTitleAccent = { color: "#36d9c3" };
const heroSubtitle = { margin: "18px 0 28px", color: "#f2f8ff", fontSize: "18px" };

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
  gap: "20px",
  maxWidth: "560px"
};

const statItem = {
  display: "grid",
  gap: "5px",
  color: "#d6e7f3",
  fontSize: "12px"
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
  padding: "26px 38px 20px",
  background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
  display: "grid",
  gridTemplateRows: "auto minmax(120px, 1fr) auto auto auto auto",
  gap: "14px"
};

const timeStamp = { textAlign: "center", color: "#73839a", fontSize: "13px" };
const messageList = { minHeight: 0, overflowY: "auto", display: "grid", gap: "14px", paddingRight: "8px" };
const assistantRow = { display: "flex", alignItems: "flex-start", gap: "14px" };
const userRow = { display: "flex", justifyContent: "flex-end" };
const avatarStyle = { position: "relative", width: "58px", height: "58px", flex: "0 0 auto" };
const avatarImage = { width: "58px", height: "58px", borderRadius: "50%", objectFit: "cover", objectPosition: "35% 35%" };
const avatarOnline = { position: "absolute", right: "1px", bottom: "2px", width: "14px", height: "14px", borderRadius: "50%", background: "#22c55e", border: "3px solid #ffffff" };
const assistantBubble = { maxWidth: "430px", background: "#ffffff", color: "#102542", padding: "18px 22px", borderRadius: "0 16px 16px 16px", lineHeight: 1.7, boxShadow: "0 14px 32px rgba(15, 23, 42, 0.1)", whiteSpace: "pre-wrap" };
const userBubble = { maxWidth: "360px", background: "#dff9e9", color: "#0c342d", padding: "15px 22px", borderRadius: "16px 16px 0 16px", lineHeight: 1.6, boxShadow: "0 12px 28px rgba(67, 197, 158, 0.2)", whiteSpace: "pre-wrap" };
const bubbleTime = { marginLeft: "18px", color: "#7aa395", fontSize: "12px" };
const typingDot = { display: "inline-block", width: "9px", height: "9px", borderRadius: "50%", background: "#b6c0cf", marginRight: "8px" };

const relationRow = { display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px" };
const relationChip = { border: "none", minHeight: "52px", padding: "0 22px", borderRadius: "14px", background: "#ffffff", color: "#0f1f38", boxShadow: "0 10px 26px rgba(15, 23, 42, 0.1)", fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "10px" };
const chipIcon = { width: "22px", height: "22px", borderRadius: "8px", background: "#e7f7ff", color: "#2563eb", display: "grid", placeItems: "center", fontSize: "12px" };

const quickBox = { border: "1px solid #e3ebf5", borderRadius: "18px", padding: "18px 22px", background: "rgba(255, 255, 255, 0.92)" };
const quickTitle = { margin: "0 0 14px", color: "#0f9f83", fontWeight: 900 };
const quickGrid = { display: "flex", flexWrap: "wrap", gap: "10px" };
const quickChip = { border: "1px solid #dae5f0", background: "#ffffff", borderRadius: "12px", padding: "11px 18px", color: "#102542", fontWeight: 800, cursor: "pointer", textDecoration: "none" };

const inputRow = { display: "grid", gridTemplateColumns: "64px minmax(0, 1fr) 64px", gap: "16px", alignItems: "center" };
const micButton = { width: "56px", height: "56px", borderRadius: "50%", border: "none", color: "#ffffff", boxShadow: "0 10px 24px rgba(67, 197, 158, 0.32)", cursor: "pointer", fontWeight: 900 };
const inputShell = { height: "56px", borderRadius: "28px", background: "#ffffff", border: "1px solid #e3ebf5", boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)", display: "grid", gridTemplateColumns: "minmax(0, 1fr) 52px", alignItems: "center", padding: "0 8px 0 20px" };
const textInput = { width: "100%", minWidth: 0, border: "none", outline: "none", color: "#102542", fontSize: "16px", background: "transparent" };
const speakerButton = { border: "none", width: "42px", height: "42px", borderRadius: "50%", background: "#f1f5f9", color: "#66758a", cursor: "pointer", fontWeight: 900 };
const sendButton = { width: "56px", height: "56px", borderRadius: "50%", border: "none", background: "#6bc5af", color: "#ffffff", cursor: "pointer", fontWeight: 900, fontSize: "14px" };
const secureText = { margin: "-4px 0 0", textAlign: "center", color: "#73839a", fontSize: "13px" };

const summaryCard = { justifySelf: "center", width: "min(560px, 100%)", background: "#ffffff", border: "1px solid #c7f1e8", borderRadius: "18px", padding: "18px", boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)", color: "#102542" };
const summaryText = { margin: "10px 0 14px", whiteSpace: "pre-wrap", fontFamily: "inherit", lineHeight: 1.6, color: "#334155" };
const confirmButton = { border: "none", borderRadius: "14px", padding: "13px 18px", background: "#0f766e", color: "#ffffff", fontWeight: 900, cursor: "pointer" };
const bookingCard = { justifySelf: "center", display: "grid", gap: "6px", width: "min(460px, 100%)", background: "#ecfffb", border: "1px solid #b7f3e8", borderRadius: "18px", padding: "18px", color: "#0f3f3a", boxShadow: "0 12px 28px rgba(15, 23, 42, 0.08)" };

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
        height: calc(100vh - 18px) !important;
        width: calc(100vw - 18px) !important;
        border-radius: 22px !important;
        grid-template-rows: 250px minmax(0, 1fr) !important;
      }
      [aria-label="Sathi care receptionist"] h1 {
        font-size: 28px !important;
      }
      [aria-label="Sathi care receptionist"] form {
        grid-template-columns: 52px minmax(0, 1fr) 52px !important;
      }
    }
  `;
  document.head.appendChild(style);
}
