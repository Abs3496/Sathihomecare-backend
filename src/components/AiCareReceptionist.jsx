import { useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "../api";

const welcomeMessage = "Namaste Sir, main Priya hoon. Main aapki care requirement samajhne aur booking mein madad kar sakti hoon.";
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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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
    const nextMessages = confirmBooking ? messages : [...messages, { role: "user", content }];
    if (!content && !confirmBooking) return;

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
      const reply = response.reply || "Mujhe thoda aur detail bata dijiye Sir.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
      speak(reply);
    } catch (error) {
      const reply = error?.message || "Sorry Sir, abhi AI receptionist connect nahi ho pa rahi. Aap WhatsApp coordinator se baat kar sakte hain.";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMic = () => {
    if (!speechSupported) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Voice input is browser supported nahi hai. Aap message type kar dijiye Sir." }]);
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
      <button type="button" onClick={() => setIsClosed(false)} style={floatingButton} aria-label="Open AI care receptionist">
        <span style={floatingDot} />
        Priya
      </button>
    );
  }

  return (
    <section style={panelStyle} aria-label="AI care receptionist">
      <header style={headerStyle}>
        <div style={avatarStyle}>PS</div>
        <div style={{ minWidth: 0 }}>
          <strong style={{ display: "block", color: "#071b3a" }}>Priya Sharma</strong>
          <span style={statusStyle}><span style={onlineDot} /> Online care receptionist</span>
        </div>
        <button type="button" onClick={() => setIsClosed(true)} style={iconButton} aria-label="Close">X</button>
      </header>

      <div style={messagesStyle}>
        {messages.map((message, index) => (
          <div key={`${message.role}-${index}`} style={message.role === "user" ? userBubble : assistantBubble}>
            {message.content}
          </div>
        ))}
        {loading ? (
          <div style={typingBubble}><span style={typingDot} /><span style={typingDot} /><span style={typingDot} /></div>
        ) : null}
        {summary && !booking ? (
          <pre style={summaryStyle}>{summary}</pre>
        ) : null}
        {booking ? (
          <div style={bookingStyle}>
            <strong>Booking ID: {booking.bookingCode}</strong>
            <span>{booking.serviceName}</span>
            <span>{booking.preferredDate} | {booking.preferredTimeSlot}</span>
          </div>
        ) : null}
        <div ref={bottomRef} />
      </div>

      <div style={actionsStyle}>
        <button type="button" disabled={!canConfirm || loading || booking} onClick={() => sendMessage("", true)} style={{ ...actionButton, opacity: canConfirm && !booking ? 1 : 0.55 }}>
          Confirm Booking
        </button>
        <a href={`https://wa.me/${coordinatorNumber}`} target="_blank" rel="noreferrer" style={secondaryAction}>WhatsApp Coordinator</a>
        <a href={`tel:+${coordinatorNumber}`} style={secondaryAction}>Call Coordinator</a>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          sendMessage(input);
        }}
        style={inputBar}
      >
        <button type="button" onClick={toggleMic} style={{ ...roundButton, background: listening ? "#d7263d" : "#ecfffb", color: listening ? "#ffffff" : "#0f766e" }} aria-label="Voice microphone">
          Mic
        </button>
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Hindi, English ya Hinglish me bataye..."
          style={inputStyle}
        />
        <button type="button" onClick={() => setSpeakerEnabled((prev) => !prev)} style={roundButton} aria-label="Speaker">
          {speakerEnabled ? "Vol" : "Mute"}
        </button>
        <button type="submit" disabled={loading} style={sendButton}>Send</button>
      </form>
    </section>
  );
}

const panelStyle = {
  position: "fixed",
  right: "18px",
  bottom: "18px",
  width: "min(390px, calc(100vw - 28px))",
  height: "min(620px, calc(100vh - 34px))",
  background: "#ffffff",
  border: "1px solid #d7e3ef",
  borderRadius: "18px",
  boxShadow: "0 24px 70px rgba(7, 27, 58, 0.22)",
  zIndex: 50,
  display: "grid",
  gridTemplateRows: "auto minmax(0, 1fr) auto auto",
  overflow: "hidden",
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
};
const headerStyle = { display: "flex", alignItems: "center", gap: "12px", padding: "14px", borderBottom: "1px solid #e6eef6", background: "#f8fbff" };
const avatarStyle = { width: "42px", height: "42px", borderRadius: "50%", background: "#0f766e", color: "#ffffff", display: "grid", placeItems: "center", fontWeight: 900 };
const statusStyle = { display: "inline-flex", alignItems: "center", gap: "6px", color: "#5b6878", fontSize: "12px", marginTop: "3px" };
const onlineDot = { width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a" };
const iconButton = { marginLeft: "auto", border: "none", background: "#102542", color: "#ffffff", borderRadius: "10px", width: "34px", height: "34px", cursor: "pointer", fontWeight: 900 };
const messagesStyle = { padding: "14px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", background: "#f6f8fb" };
const assistantBubble = { alignSelf: "flex-start", maxWidth: "86%", background: "#ffffff", color: "#102542", padding: "11px 13px", borderRadius: "14px 14px 14px 4px", lineHeight: 1.5, boxShadow: "0 8px 18px rgba(15,23,42,0.06)", whiteSpace: "pre-wrap" };
const userBubble = { alignSelf: "flex-end", maxWidth: "86%", background: "#0f766e", color: "#ffffff", padding: "11px 13px", borderRadius: "14px 14px 4px 14px", lineHeight: 1.5, whiteSpace: "pre-wrap" };
const typingBubble = { ...assistantBubble, display: "inline-flex", gap: "5px", width: "fit-content" };
const typingDot = { width: "6px", height: "6px", borderRadius: "50%", background: "#94a3b8" };
const summaryStyle = { margin: 0, padding: "12px", background: "#ecfffb", border: "1px solid #b7f3e8", borderRadius: "12px", color: "#0f3f3a", whiteSpace: "pre-wrap", fontFamily: "inherit", fontSize: "13px", lineHeight: 1.5 };
const bookingStyle = { display: "grid", gap: "5px", padding: "12px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "12px", color: "#7c2d12" };
const actionsStyle = { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", padding: "10px 14px", borderTop: "1px solid #e6eef6" };
const actionButton = { gridColumn: "1 / -1", border: "none", borderRadius: "12px", background: "#0f766e", color: "#ffffff", padding: "12px", fontWeight: 900, cursor: "pointer" };
const secondaryAction = { textAlign: "center", textDecoration: "none", borderRadius: "12px", background: "#f1f5f9", color: "#102542", padding: "10px", fontWeight: 800, fontSize: "13px" };
const inputBar = { display: "grid", gridTemplateColumns: "44px minmax(0, 1fr) 52px 56px", gap: "8px", padding: "12px 14px", borderTop: "1px solid #e6eef6", background: "#ffffff" };
const inputStyle = { minWidth: 0, border: "1px solid #d7e3ef", borderRadius: "12px", padding: "0 12px", fontSize: "14px" };
const roundButton = { border: "none", borderRadius: "12px", background: "#ecfffb", color: "#0f766e", fontWeight: 900, cursor: "pointer", fontSize: "12px" };
const sendButton = { border: "none", borderRadius: "12px", background: "#d7263d", color: "#ffffff", fontWeight: 900, cursor: "pointer" };
const floatingButton = { position: "fixed", right: "18px", bottom: "18px", zIndex: 50, border: "none", borderRadius: "999px", background: "#0f766e", color: "#ffffff", padding: "14px 18px", boxShadow: "0 18px 45px rgba(15,118,110,0.32)", fontWeight: 900, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" };
const floatingDot = { width: "9px", height: "9px", borderRadius: "50%", background: "#bbf7d0" };
