import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../api";

const RELATION_CHIPS = ["Father", "Mother", "Self", "Senior Citizen", "Patient", "Not Sure"];
const SERVICE_CHIPS = ["Elder Care", "Home Nursing", "Post Surgery Care", "Physiotherapy", "Ayurvedic Therapy", "Talk to Human Expert"];
const AGE_CHIPS = ["Under 60", "60 - 75", "75+"];
const DATE_CHIPS = ["Today", "Tomorrow", "This week", "I will decide later"];
const TIME_CHIPS = ["Morning (8-12)", "Afternoon (12-4)", "Evening (4-8)", "Anytime"];
const CONFIRM_CHIPS = ["Confirm booking", "Edit details"];
const POST_BOOKING_CHIPS = ["Book another service", "Talk to human expert"];
const EXPERT_CHIPS = ["Call now", "Continue booking"];

const uid = () => Math.random().toString(36).slice(2) + Date.now();
const nowTime = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

export default function SathiCareBot({
  brandName = "Sathi Homecare",
  agentName = "Priya Sharma",
  agentRole = "Senior Care Receptionist",
  languages = "Hindi - English",
  phone = "+91 63929 52884",
  stats = { families: "5000+", verified: "100%", support: "24/7", rating: "4.8/5" }
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [awaitingField, setAwaitingField] = useState(null);
  const [booking, setBooking] = useState({});
  const bodyEndRef = useRef(null);
  const initialised = useRef(false);

  useEffect(() => {
    bodyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const pushBot = useCallback((text, chips = null, stepKey = null, extra = {}) => {
    setIsTyping(true);
    setAwaitingField(null);
    setTimeout(() => {
      setMessages((current) => [...current, { id: uid(), sender: "bot", text, chips, stepKey, time: nowTime(), ...extra }]);
      setIsTyping(false);
    }, 420);
  }, []);

  const pushUser = useCallback((text) => {
    setMessages((current) => [...current, { id: uid(), sender: "user", text, time: nowTime() }]);
  }, []);

  const openWidget = () => {
    setIsOpen(true);
    setHasUnread(false);
    if (!initialised.current) {
      initialised.current = true;
      setTimeout(() => {
        pushBot(
          `Namaste. Main ${agentName.split(" ")[0]} hoon, aapki care needs samajhne aur booking mein madad kar sakti hoon. Aap kis ke liye care arrange karna chahte hain?`,
          RELATION_CHIPS,
          "relation"
        );
      }, 300);
    }
  };

  const markAnswered = (msgId, label) => {
    setMessages((current) => current.map((message) => (message.id === msgId ? { ...message, answered: label } : message)));
  };

  const goAfterAgeOrRelation = () => {
    setBooking((current) => {
      if (current.service) {
        pushBot(`Bahut accha. Aap "${current.service}" ke liye kab se care shuru karna chahenge?`, DATE_CHIPS, "date");
      } else {
        pushBot("Bahut accha. Aapko kis tarah ki care chahiye?", SERVICE_CHIPS, "service");
      }
      return current;
    });
  };

  const handleChip = (msg, chipLabel) => {
    markAnswered(msg.id, chipLabel);
    pushUser(chipLabel);

    switch (msg.stepKey) {
      case "relation":
        setBooking((current) => ({ ...current, relation: chipLabel }));
        pushBot("Theek hai. Unki age kya hai?", AGE_CHIPS, "age");
        break;
      case "age":
        setBooking((current) => ({ ...current, age: chipLabel }));
        goAfterAgeOrRelation();
        break;
      case "service":
        setBooking((current) => ({ ...current, service: chipLabel }));
        if (chipLabel === "Talk to Human Expert") {
          pushBot(`Bilkul. Aap humein abhi call kar sakte hain ${phone} par. Ya booking yahin continue kar sakte hain.`, EXPERT_CHIPS, "expertChoice");
        } else {
          pushBot("Great choice. Kab se care shuru karni hai?", DATE_CHIPS, "date");
        }
        break;
      case "date":
        setBooking((current) => ({ ...current, date: chipLabel }));
        pushBot("Konsa time prefer karenge?", TIME_CHIPS, "time");
        break;
      case "time":
        setBooking((current) => ({ ...current, time: chipLabel }));
        pushBot("Patient ka naam bata sakte hain?", null, null);
        setAwaitingField("name");
        break;
      case "confirm":
        if (chipLabel === "Confirm booking") {
          submitBooking();
        } else {
          pushBot("Koi baat nahi. Patient ka naam phir se bata dijiye.", null, null);
          setAwaitingField("name");
        }
        break;
      case "postBooking":
        if (chipLabel === "Book another service") {
          restartFlow();
        } else {
          pushBot(`Aap care team ko ${phone} par call kar sakte hain.`, EXPERT_CHIPS, "expertChoice");
        }
        break;
      case "expertChoice":
        if (chipLabel === "Call now") {
          window.location.href = `tel:${phone.replace(/\s/g, "")}`;
        } else {
          pushBot("Sure. Yeh care kiske liye chahiye?", RELATION_CHIPS, "relation");
        }
        break;
      default:
        break;
    }
  };

  const restartFlow = () => {
    setBooking({});
    pushBot("Chaliye, nayi booking shuru karte hain. Yeh care kiske liye chahiye?", RELATION_CHIPS, "relation");
  };

  const handleQuickAction = (item) => {
    pushUser(item);
    if (item === "Talk to Human Expert") {
      pushBot(`Bilkul. Aap humein abhi call kar sakte hain ${phone} par. Ya booking yahin continue kar sakte hain.`, EXPERT_CHIPS, "expertChoice");
      return;
    }
    setBooking((current) => {
      const next = { ...current, service: item };
      if (!next.relation) {
        pushBot("Great pick. Pehle thodi details le lete hain. Yeh care kiske liye chahiye?", RELATION_CHIPS, "relation");
      } else {
        pushBot(`Got it. "${item}" ke liye kab se care shuru karni hai?`, DATE_CHIPS, "date");
      }
      return next;
    });
  };

  const submitText = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;

    if (awaitingField === "name") {
      pushUser(trimmed);
      setBooking((current) => ({ ...current, name: trimmed }));
      pushBot(`Shukriya, ${trimmed.split(" ")[0]}. Aapka 10-digit contact number share karein:`, null, null);
      setAwaitingField("phone");
      return;
    }

    if (awaitingField === "phone") {
      const digitsOnly = trimmed.replace(/\D/g, "");
      if (!/^[6-9]\d{9}$/.test(digitsOnly)) {
        pushUser(trimmed);
        pushBot("Number sahi nahi lag raha. Kripya 10-digit valid mobile number daalein:", null, null);
        setAwaitingField("phone");
        return;
      }
      pushUser(digitsOnly);
      setBooking((current) => ({ ...current, phone: digitsOnly }));
      pushBot("Address ya area batayein jaha care chahiye:", null, null);
      setAwaitingField("address");
      return;
    }

    if (awaitingField === "address") {
      pushUser(trimmed);
      setBooking((current) => {
        const updated = { ...current, address: trimmed };
        pushBot("Yeh raha aapka booking summary. Sab theek hai?", CONFIRM_CHIPS, "confirm", {
          type: "summary",
          summary: updated
        });
        return updated;
      });
      setAwaitingField(null);
      return;
    }

    pushUser(trimmed);
    pushBot("Got it. Aap upar diye options se quickly choose kar sakte hain.", SERVICE_CHIPS, "service");
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    submitText(inputValue);
    setInputValue("");
  };

  const submitBooking = () => {
    setIsTyping(true);
    setBooking((current) => {
      const payload = { ...current, submittedAt: new Date().toISOString() };
      (async () => {
        try {
          const response = await apiFetch("/ai-receptionist/chat", {
            method: "POST",
            body: JSON.stringify({
              messages: buildAiMessages(payload),
              draft: buildAiDraft(payload),
              confirmBooking: true
            })
          });

          const code = response?.booking?.bookingCode || `SC${Date.now().toString().slice(-7)}`;
          setMessages((currentMessages) => [
            ...currentMessages,
            {
              id: uid(),
              sender: "bot",
              text: `Booking confirmed. Reference ID: ${code}. Hamari care coordinator jaldi aapko ${payload.phone || ""} par call karegi.`,
              chips: POST_BOOKING_CHIPS,
              stepKey: "postBooking",
              time: nowTime()
            }
          ]);
        } catch (error) {
          setMessages((currentMessages) => [
            ...currentMessages,
            {
              id: uid(),
              sender: "bot",
              text: error?.message || "Booking submit nahi ho pa rahi. Please coordinator ko call karein.",
              chips: EXPERT_CHIPS,
              stepKey: "expertChoice",
              time: nowTime()
            }
          ]);
        } finally {
          setIsTyping(false);
        }
      })();
      return payload;
    });
  };

  return (
    <div className="sathi-root">
      <style>{CSS}</style>

      {!isOpen && (
        <button className="sathi-launcher" onClick={openWidget} aria-label="Chat with Sathi Care">
          <span>Chat</span>
          {hasUnread && <span className="sathi-launcher-badge">1</span>}
        </button>
      )}

      {isOpen && (
        <div className="sathi-panel" role="dialog" aria-label="Sathi Homecare booking assistant">
          <div className="sathi-header">
            <button className="sathi-close" onClick={() => setIsOpen(false)} aria-label="Close">X</button>
            <div className="sathi-header-top">
              <div className="sathi-brand-pill">
                <span className="sathi-brand-logo">S</span>
                <span className="sathi-brand-name">{brandName.toUpperCase()}</span>
              </div>
              <span className="sathi-header-right-title">Premium Care, At Home</span>
            </div>

            <div className="sathi-agent-row">
              <Avatar text={initials(agentName)} large />
              <div>
                <div className="sathi-agent-name">{agentName}</div>
                <div className="sathi-agent-role">{agentRole}</div>
                <div className="sathi-agent-meta">
                  <span className="sathi-available"><span className="sathi-dot-green" /> Available Now</span>
                  <span className="sathi-langs">{languages}</span>
                </div>
              </div>
            </div>

            <div className="sathi-stats">
              <Stat value={stats.families} label="Happy Families" />
              <Stat value={stats.verified} label="Verified Staff" />
              <Stat value={stats.support} label="Support" />
              <Stat value={stats.rating} label="Customer Rating" />
            </div>
          </div>

          <div className="sathi-body">
            {messages.map((msg) => (
              <div key={msg.id} className={`sathi-row sathi-row-${msg.sender}`}>
                {msg.sender === "bot" && <Avatar text={initials(agentName)} />}
                <div className="sathi-col">
                  <div className={`sathi-bubble sathi-bubble-${msg.sender}`}>
                    {msg.type === "summary" ? <SummaryCard data={msg.summary} /> : <p>{msg.text}</p>}
                  </div>
                  <div className={`sathi-time sathi-time-${msg.sender}`}>{msg.time}{msg.sender === "user" ? "  seen" : ""}</div>

                  {msg.chips && (
                    <div className="sathi-chips">
                      {msg.chips.map((chip) => {
                        const isAnswered = msg.answered;
                        const isThisOne = msg.answered === chip;
                        return (
                          <button
                            key={chip}
                            className={`sathi-chip ${isThisOne ? "sathi-chip-selected" : ""} ${isAnswered && !isThisOne ? "sathi-chip-faded" : ""}`}
                            disabled={Boolean(isAnswered) && msg.stepKey !== "expertChoice" && msg.stepKey !== "postBooking"}
                            onClick={() => handleChip(msg, chip)}
                          >
                            {chip}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="sathi-row sathi-row-bot">
                <Avatar text={initials(agentName)} />
                <div className="sathi-bubble sathi-bubble-bot sathi-typing"><span /><span /><span /></div>
              </div>
            )}
            <div ref={bodyEndRef} />
          </div>

          <div className="sathi-quickbar">
            <div className="sathi-quickbar-label">Quick Actions</div>
            <div className="sathi-quickbar-row">
              {SERVICE_CHIPS.map((item) => (
                <button key={item} className="sathi-quick-btn" onClick={() => handleQuickAction(item)}>{item}</button>
              ))}
            </div>
          </div>

          <div className="sathi-inputbar">
            <input
              className="sathi-input"
              type="text"
              placeholder="Type a message..."
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && handleSend()}
            />
            <button className="sathi-send" onClick={handleSend} aria-label="Send">Send</button>
          </div>
          <div className="sathi-lock-note">Your information is secure and confidential.</div>
        </div>
      )}
    </div>
  );
}

function Avatar({ text, large = false }) {
  return <div className={`sathi-avatar ${large ? "sathi-avatar-lg" : "sathi-avatar-sm"}`}>{text}<span className="sathi-online-dot" /></div>;
}

function Stat({ value, label }) {
  return <div className="sathi-stat"><b>{value}</b><small>{label}</small></div>;
}

function SummaryCard({ data }) {
  const rows = [
    ["Care for", data.relation],
    ["Age group", data.age],
    ["Service", data.service],
    ["Start", data.date],
    ["Time slot", data.time],
    ["Name", data.name],
    ["Phone", data.phone],
    ["Address", data.address]
  ];
  return (
    <div className="sathi-summary">
      {rows.map(([label, value]) => value ? (
        <div className="sathi-summary-row" key={label}>
          <span>{label}</span>
          <b>{value}</b>
        </div>
      ) : null)}
    </div>
  );
}

function initials(name) {
  return name.split(" ").map((word) => word[0]).join("").slice(0, 2);
}

function buildAiMessages(payload) {
  const content = [
    `Care for: ${payload.relation || "Patient"}`,
    `Patient name: ${payload.name || ""}`,
    `Age: ${ageToNumber(payload.age)}`,
    `Location: ${payload.address || ""}`,
    `Service Type: ${normalizeService(payload.service)}`,
    `Preferred Date: ${dateToIso(payload.date)}`,
    `Time Slot: ${timeToSlot(payload.time)}`,
    `Mobile Number: ${payload.phone || ""}`
  ].join("\n");
  return [{ role: "user", content }];
}

function buildAiDraft(payload) {
  return {
    patientName: payload.name || "",
    age: ageToNumber(payload.age),
    location: payload.address || "",
    serviceType: normalizeService(payload.service),
    preferredDate: dateToIso(payload.date),
    timeSlot: timeToSlot(payload.time),
    mobileNumber: payload.phone || ""
  };
}

function ageToNumber(value) {
  if (value === "Under 60") return 55;
  if (value === "60 - 75") return 65;
  if (value === "75+") return 76;
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

function normalizeService(value) {
  const text = String(value || "");
  if (text === "Elder Care") return "Elderly Care";
  if (text === "Home Nursing" || text === "Post Surgery Care") return "Patient Care at Home";
  if (text === "Ayurvedic Therapy") return "Abhyanga (Full Body Massage)";
  return text;
}

function dateToIso(value) {
  const date = new Date();
  if (value === "Tomorrow") date.setDate(date.getDate() + 1);
  if (value === "This week") date.setDate(date.getDate() + 3);
  return date.toISOString().slice(0, 10);
}

function timeToSlot(value) {
  if (value === "Morning (8-12)") return "08:00 AM - 12:00 PM";
  if (value === "Afternoon (12-4)") return "12:00 PM - 04:00 PM";
  if (value === "Evening (4-8)") return "04:00 PM - 08:00 PM";
  return "10:00 AM - 12:00 PM";
}

const CSS = `
.sathi-root{ position:fixed; inset:auto 24px 24px auto; z-index:9999; font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif; }
.sathi-launcher{ min-width:64px; height:60px; border-radius:999px; border:none; cursor:pointer; background:linear-gradient(145deg,#0f766e,#10b981); color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 30px rgba(15,118,110,.45); position:relative; font-weight:900; padding:0 18px; }
.sathi-launcher-badge{ position:absolute; top:-4px; right:-4px; background:#ef4444; color:#fff; font-size:11px; font-weight:700; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; }
.sathi-panel{ width:380px; max-width:calc(100vw - 24px); height:640px; max-height:calc(100vh - 48px); background:#fff; border-radius:20px; box-shadow:0 24px 60px rgba(0,0,0,.25); display:flex; flex-direction:column; overflow:hidden; animation:sathi-pop .25s ease; }
@keyframes sathi-pop{ from{ opacity:0; transform:translateY(16px) scale(.97);} to{ opacity:1; transform:translateY(0) scale(1);} }
.sathi-header{ background:linear-gradient(160deg,#0a1c33 0%,#0f2a47 55%,#0f766e 130%); color:#fff; padding:16px 18px 14px; position:relative; flex-shrink:0; }
.sathi-close{ position:absolute; top:10px; right:10px; background:rgba(255,255,255,.15); border:none; color:#fff; width:28px; height:28px; border-radius:50%; cursor:pointer; font-weight:900; }
.sathi-header-top{ display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; padding-right:24px; gap:12px; }
.sathi-brand-pill{ display:flex; align-items:center; gap:6px; background:#fff; color:#0f2a47; padding:5px 10px 5px 6px; border-radius:999px; font-size:11px; font-weight:800; letter-spacing:.3px; }
.sathi-brand-logo{ background:linear-gradient(135deg,#0f766e,#10b981); color:#fff; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
.sathi-header-right-title{ font-size:10.5px; color:#5eead4; font-weight:700; text-align:right; }
.sathi-agent-row{ display:flex; gap:12px; align-items:flex-start; margin-bottom:14px; }
.sathi-agent-name{ font-size:17px; font-weight:800; }
.sathi-agent-role{ font-size:12px; color:#cbd5e1; margin-top:1px; }
.sathi-agent-meta{ display:flex; gap:10px; align-items:center; margin-top:5px; font-size:11px; }
.sathi-available{ color:#34d399; font-weight:700; display:flex; align-items:center; gap:4px; }
.sathi-dot-green{ width:6px; height:6px; border-radius:50%; background:#34d399; box-shadow:0 0 0 3px rgba(52,211,153,.25); }
.sathi-langs{ color:#94a3b8; }
.sathi-stats{ display:grid; grid-template-columns:repeat(4,1fr); gap:6px; background:rgba(255,255,255,.07); border-radius:12px; padding:9px 6px; }
.sathi-stat{ display:flex; flex-direction:column; align-items:center; gap:3px; text-align:center; color:#e2e8f0; }
.sathi-stat b{ font-size:12px; font-weight:800; line-height:1; }
.sathi-stat small{ font-size:8.5px; color:#94a3b8; }
.sathi-avatar{ border-radius:50%; background:linear-gradient(135deg,#0f766e,#14b8a6); color:#fff; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; position:relative; }
.sathi-avatar-lg{ width:48px; height:48px; font-size:15px; border:2px solid rgba(255,255,255,.35); }
.sathi-avatar-sm{ width:30px; height:30px; font-size:11px; }
.sathi-online-dot{ position:absolute; bottom:-2px; right:-2px; width:11px; height:11px; border-radius:50%; background:#22c55e; border:2px solid #0a1c33; }
.sathi-body{ flex:1; overflow-y:auto; padding:16px 14px; background:#f4f7f8; display:flex; flex-direction:column; gap:14px; }
.sathi-row{ display:flex; gap:8px; max-width:100%; }
.sathi-row-user{ flex-direction:row-reverse; }
.sathi-col{ display:flex; flex-direction:column; max-width:78%; }
.sathi-row-user .sathi-col{ align-items:flex-end; }
.sathi-bubble{ padding:10px 13px; border-radius:14px; font-size:13.5px; line-height:1.45; word-break:break-word; }
.sathi-bubble p{ margin:0; }
.sathi-bubble-bot{ background:#fff; color:#1f2937; border-top-left-radius:4px; box-shadow:0 1px 3px rgba(0,0,0,.06); }
.sathi-bubble-user{ background:#d6f5e8; color:#0f3d2e; border-top-right-radius:4px; }
.sathi-time{ font-size:10px; color:#94a3b8; margin-top:3px; display:flex; align-items:center; gap:3px; }
.sathi-time-user{ justify-content:flex-end; }
.sathi-chips{ display:flex; flex-wrap:wrap; gap:6px; margin-top:8px; }
.sathi-chip{ border:1.5px solid #e2e8f0; background:#fff; color:#334155; font-size:12px; font-weight:700; padding:7px 11px; border-radius:999px; cursor:pointer; transition:.15s; }
.sathi-chip:hover:not(:disabled){ border-color:#0f766e; background:#f0fdfa; }
.sathi-chip-selected{ background:#0f766e; color:#fff; border-color:#0f766e; }
.sathi-chip-faded{ opacity:.4; }
.sathi-chip:disabled{ cursor:default; }
.sathi-summary{ display:flex; flex-direction:column; gap:6px; min-width:200px; }
.sathi-summary-row{ display:flex; justify-content:space-between; gap:10px; font-size:12px; border-bottom:1px dashed #e2e8f0; padding-bottom:5px; }
.sathi-summary-row span{ color:#64748b; }
.sathi-summary-row b{ color:#0f2a47; text-align:right; }
.sathi-typing{ display:flex; gap:4px; align-items:center; padding:13px; width:48px; }
.sathi-typing span{ width:6px; height:6px; border-radius:50%; background:#94a3b8; animation:sathi-bounce 1.1s infinite; }
.sathi-typing span:nth-child(2){ animation-delay:.15s; }
.sathi-typing span:nth-child(3){ animation-delay:.3s; }
@keyframes sathi-bounce{ 0%,60%,100%{ transform:translateY(0); opacity:.5; } 30%{ transform:translateY(-4px); opacity:1; } }
.sathi-quickbar{ border-top:1px solid #eef1f3; padding:10px 14px 8px; flex-shrink:0; background:#fff; }
.sathi-quickbar-label{ font-size:10.5px; font-weight:800; color:#0f766e; margin-bottom:6px; }
.sathi-quickbar-row{ display:flex; gap:6px; overflow-x:auto; padding-bottom:2px; scrollbar-width:thin; }
.sathi-quick-btn{ flex-shrink:0; border:1.5px solid #e2e8f0; background:#fafbfc; font-size:11px; font-weight:700; color:#334155; padding:6px 10px; border-radius:999px; cursor:pointer; white-space:nowrap; transition:.15s; }
.sathi-quick-btn:hover{ background:#f0fdfa; border-color:#0f766e; }
.sathi-inputbar{ display:flex; align-items:center; gap:8px; padding:10px 14px; border-top:1px solid #eef1f3; background:#fff; flex-shrink:0; }
.sathi-input{ flex:1; border:1.5px solid #e2e8f0; border-radius:999px; padding:10px 14px; font-size:13px; outline:none; min-width:0; }
.sathi-input:focus{ border-color:#0f766e; }
.sathi-send{ border-radius:999px; border:none; background:linear-gradient(135deg,#0f766e,#14b8a6); color:#fff; padding:10px 14px; cursor:pointer; font-weight:900; flex-shrink:0; }
.sathi-lock-note{ text-align:center; font-size:10px; color:#94a3b8; padding:0 0 10px; background:#fff; flex-shrink:0; }
@media (max-width:480px){ .sathi-root{ inset:auto 12px 12px auto; } .sathi-panel{ width:calc(100vw - 24px); height:calc(100vh - 24px); border-radius:16px; } }
`;
