import { useCallback, useEffect, useRef, useState } from "react";
import { apiFetch } from "../api";
import logo from "../assets/images/icons/logo.png";

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
  languages = "Hindi",
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

  useEffect(() => {
    const timer = window.setTimeout(openWidget, 2000);
    return () => window.clearTimeout(timer);
  }, []);

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
            timeoutMs: 75000,
            retries: 2,
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
        <div className="sathi-overlay">
          <div className="sathi-panel" role="dialog" aria-label="Sathi Homecare booking assistant">
            <button className="sathi-close" onClick={() => setIsOpen(false)} aria-label="Close">X</button>

            <aside className="sathi-left">
              <div className="sathi-left-brand">
                <img src={logo} alt="Sathi Homecare" />
                <div>
                  <strong>{brandName}</strong>
                  <span>Care That Feels Like Family</span>
                </div>
              </div>
              <div className="sathi-logo-stage">
                <img src={logo} alt="Sathi Homecare assistant" />
              </div>
              <div className="sathi-priya-card">
                <h2>Priya</h2>
                <span>AI Care Assistant</span>
                <p>Main aapki care requirement samajhne aur booking complete karne mein madad karungi.</p>
                <div className="sathi-left-stats">
                  <small>Trusted Care Experts</small>
                  <small>Verified Caregivers</small>
                  <small>24x7 Support</small>
                </div>
              </div>
            </aside>

            <section className="sathi-right">
              <div className="sathi-topbar">
                <div className="sathi-agent-row">
                  <Avatar text={initials(agentName)} large />
                  <div>
                    <div className="sathi-agent-name">{agentName}</div>
                    <div className="sathi-agent-role">{agentRole}</div>
                  </div>
                </div>
                <div className="sathi-lang-pills">
                  <span>English</span>
                  <span>{languages}</span>
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
                <div className="sathi-quickbar-label">Kripya chunein <span>(Please select)</span></div>
                <div className="sathi-quickbar-row">
                  {SERVICE_CHIPS.map((item) => (
                    <button key={item} className="sathi-quick-btn" onClick={() => handleQuickAction(item)}>{item}</button>
                  ))}
                </div>
              </div>

              <div className="sathi-inputbox">
                <div className="sathi-inputbar">
                  <button className="sathi-mic" type="button" aria-label="Voice input">Mic</button>
                  <input
                    className="sathi-input"
                    type="text"
                    placeholder="Type your message..."
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && handleSend()}
                  />
                  <button className="sathi-send" onClick={handleSend} aria-label="Send">Send</button>
                </div>
                <div className="sathi-or">or</div>
                <button className="sathi-speak" type="button">Speak Now</button>
              </div>

              <div className="sathi-lock-note">Aapki jankari surakshit hai aur sirf behtar seva ke liye istemal ki jayegi.</div>
            </section>
            <div className="sathi-powered">Powered by <strong>Sathi Homecare</strong> - India's Most Trusted Home Healthcare Service</div>
          </div>
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
.sathi-launcher{ min-width:64px; height:60px; border-radius:999px; border:none; cursor:pointer; background:linear-gradient(145deg,#6b4de6,#7c5cff); color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 30px rgba(97,74,214,.42); position:relative; font-weight:900; padding:0 18px; }
.sathi-launcher-badge{ position:absolute; top:-4px; right:-4px; background:#ef4444; color:#fff; font-size:11px; font-weight:700; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; }
.sathi-overlay{ position:fixed; inset:0; background:rgba(18,18,22,.76); backdrop-filter:blur(4px); display:grid; place-items:center; padding:24px; }
.sathi-panel{ position:relative; width:min(980px,calc(100vw - 48px)); height:min(650px,calc(100vh - 48px)); background:#fff; border-radius:18px; box-shadow:0 28px 80px rgba(0,0,0,.42); display:grid; grid-template-columns:390px minmax(0,1fr); grid-template-rows:minmax(0,1fr) 34px; overflow:hidden; animation:sathi-pop .22s ease; }
@keyframes sathi-pop{ from{ opacity:0; transform:translateY(16px) scale(.98);} to{ opacity:1; transform:translateY(0) scale(1);} }
.sathi-close{ position:absolute; top:20px; right:20px; z-index:4; background:#fff; border:1px solid #ede9fe; color:#334155; width:34px; height:34px; border-radius:50%; cursor:pointer; font-weight:900; box-shadow:0 8px 20px rgba(49,37,103,.1); }
.sathi-left{ position:relative; min-width:0; background:linear-gradient(180deg,#faf9ff 0%,#f7f5ff 52%,#614ad6 53%,#4d36bd 100%); overflow:hidden; }
.sathi-left-brand{ position:absolute; left:24px; top:22px; right:24px; display:flex; align-items:center; gap:10px; color:#5b43d6; z-index:2; }
.sathi-left-brand img{ width:40px; height:40px; object-fit:contain; }
.sathi-left-brand strong{ display:block; font-size:17px; line-height:1; }
.sathi-left-brand span{ display:block; color:#7b6ee6; font-size:11px; margin-top:3px; font-weight:700; }
.sathi-logo-stage{ position:absolute; inset:90px 42px 198px; border-radius:26px; background:#fff; display:grid; place-items:center; box-shadow:0 18px 45px rgba(91,67,214,.12); }
.sathi-logo-stage img{ width:min(230px,80%); height:auto; object-fit:contain; }
.sathi-priya-card{ position:absolute; left:0; right:0; bottom:0; height:210px; padding:34px 28px 26px; color:#fff; background:linear-gradient(145deg,#7057e8,#4d36bd); border-top-right-radius:110px; }
.sathi-priya-card h2{ margin:0; font-size:30px; letter-spacing:0; }
.sathi-priya-card > span{ display:inline-block; margin-left:8px; padding:5px 9px; border-radius:999px; background:rgba(255,255,255,.18); font-size:11px; font-weight:800; vertical-align:middle; }
.sathi-priya-card p{ margin:18px 0 20px; max-width:280px; color:#efeaff; font-size:13px; line-height:1.55; font-weight:600; }
.sathi-left-stats{ display:grid; grid-template-columns:repeat(3,1fr); gap:14px; max-width:310px; }
.sathi-left-stats small{ color:#fff; font-size:10px; line-height:1.35; font-weight:800; }
.sathi-right{ min-width:0; min-height:0; display:grid; grid-template-rows:64px minmax(0,1fr) auto auto auto; padding:22px 26px 0; background:#fff; }
.sathi-topbar{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding-right:46px; }
.sathi-agent-row{ display:flex; gap:10px; align-items:center; }
.sathi-agent-name{ font-size:15px; color:#1e2440; font-weight:900; }
.sathi-agent-role{ font-size:11px; color:#8b90a4; margin-top:2px; font-weight:700; }
.sathi-lang-pills{ display:flex; gap:8px; }
.sathi-lang-pills span{ border:1px solid #ede9fe; border-radius:999px; padding:8px 13px; color:#5b43d6; font-size:11px; font-weight:900; background:#fff; }
.sathi-avatar{ border-radius:50%; background:linear-gradient(135deg,#6b4de6,#a78bfa); color:#fff; font-weight:900; display:flex; align-items:center; justify-content:center; flex-shrink:0; position:relative; }
.sathi-avatar-lg{ width:42px; height:42px; font-size:13px; }
.sathi-avatar-sm{ width:34px; height:34px; font-size:11px; }
.sathi-online-dot{ position:absolute; bottom:-1px; right:-1px; width:10px; height:10px; border-radius:50%; background:#22c55e; border:2px solid #fff; }
.sathi-body{ min-height:0; overflow-y:auto; padding:4px 6px 12px 0; display:flex; flex-direction:column; gap:12px; }
.sathi-row{ display:flex; gap:12px; max-width:100%; }
.sathi-row-user{ flex-direction:row-reverse; }
.sathi-col{ display:flex; flex-direction:column; max-width:82%; }
.sathi-row-user .sathi-col{ align-items:flex-end; }
.sathi-bubble{ padding:14px 16px; border-radius:14px; font-size:13px; line-height:1.55; word-break:break-word; }
.sathi-bubble p{ margin:0; }
.sathi-bubble-bot{ background:#f1f2f7; color:#202740; border-top-left-radius:4px; }
.sathi-bubble-user{ background:#e9ddff; color:#33216a; border-top-right-radius:4px; }
.sathi-time{ font-size:10px; color:#8e94a8; margin-top:3px; display:flex; align-items:center; gap:3px; }
.sathi-time-user{ justify-content:flex-end; }
.sathi-chips{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin-top:12px; padding:14px; border:1px solid #edf0f6; border-radius:14px; background:#fff; box-shadow:0 10px 26px rgba(24,28,50,.04); }
.sathi-chip{ min-height:48px; border:1px solid #e4e8f1; background:#fff; color:#202740; font-size:13px; font-weight:900; padding:9px 12px; border-radius:9px; cursor:pointer; transition:.15s; }
.sathi-chip:hover:not(:disabled){ border-color:#7c5cff; background:#faf8ff; }
.sathi-chip-selected{ background:#6b4de6; color:#fff; border-color:#6b4de6; }
.sathi-chip-faded{ opacity:.42; }
.sathi-chip:disabled{ cursor:default; }
.sathi-summary{ display:flex; flex-direction:column; gap:7px; min-width:240px; }
.sathi-summary-row{ display:flex; justify-content:space-between; gap:12px; font-size:12px; border-bottom:1px dashed #dfe3ec; padding-bottom:6px; }
.sathi-summary-row span{ color:#6b7280; }
.sathi-summary-row b{ color:#2b235f; text-align:right; }
.sathi-typing{ display:flex; gap:4px; align-items:center; padding:13px; width:50px; }
.sathi-typing span{ width:6px; height:6px; border-radius:50%; background:#9aa1b5; animation:sathi-bounce 1.1s infinite; }
.sathi-typing span:nth-child(2){ animation-delay:.15s; }
.sathi-typing span:nth-child(3){ animation-delay:.3s; }
@keyframes sathi-bounce{ 0%,60%,100%{ transform:translateY(0); opacity:.5; } 30%{ transform:translateY(-4px); opacity:1; } }
.sathi-quickbar{ border:1px solid #edf0f6; border-radius:14px; padding:12px 16px; background:#fff; box-shadow:0 8px 22px rgba(24,28,50,.04); }
.sathi-quickbar-label{ color:#6b4de6; font-size:12px; font-weight:900; margin-bottom:10px; }
.sathi-quickbar-label span{ color:#7b8195; font-weight:800; }
.sathi-quickbar-row{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
.sathi-quick-btn{ min-height:42px; border:1px solid #e4e8f1; background:#fff; font-size:13px; font-weight:900; color:#202740; padding:8px 12px; border-radius:9px; cursor:pointer; white-space:nowrap; transition:.15s; }
.sathi-quick-btn:hover{ background:#faf8ff; border-color:#7c5cff; }
.sathi-inputbox{ margin-top:10px; border:1px solid #edf0f6; border-radius:14px; background:#fff; padding:12px 14px; box-shadow:0 8px 22px rgba(24,28,50,.04); }
.sathi-inputbar{ display:grid; grid-template-columns:42px minmax(0,1fr) 48px; align-items:center; gap:10px; }
.sathi-mic{ width:38px; height:38px; border:none; border-radius:50%; color:#6b4de6; background:#f3efff; font-size:11px; font-weight:900; cursor:pointer; }
.sathi-input{ width:100%; min-width:0; height:40px; border:1px solid #e4e8f1; border-radius:11px; padding:0 14px; font-size:13px; outline:none; }
.sathi-input:focus{ border-color:#7c5cff; }
.sathi-send{ width:42px; height:42px; border-radius:50%; border:none; background:linear-gradient(135deg,#6b4de6,#7c5cff); color:#fff; cursor:pointer; font-size:11px; font-weight:900; }
.sathi-or{ text-align:center; color:#7b8195; font-size:11px; margin:5px 0; font-weight:800; }
.sathi-speak{ display:block; margin:0 auto; border:none; border-radius:999px; background:#f2edff; color:#6b4de6; padding:8px 28px; font-size:11px; font-weight:900; cursor:pointer; }
.sathi-lock-note{ text-align:center; font-size:11px; color:#7b8195; padding:8px 0 10px; background:#fff; }
.sathi-powered{ grid-column:1 / -1; display:flex; align-items:center; justify-content:center; gap:4px; color:#8b90a4; font-size:12px; background:#fff; border-top:1px solid #f1f3f8; }
.sathi-powered strong{ color:#6b4de6; }
@media (max-width:860px){
  .sathi-overlay{ padding:10px; }
  .sathi-panel{ width:calc(100vw - 20px); height:calc(100vh - 20px); grid-template-columns:1fr; grid-template-rows:150px minmax(0,1fr) 30px; border-radius:16px; }
  .sathi-left{ min-height:150px; }
  .sathi-left-brand{ top:18px; left:18px; right:18px; }
  .sathi-logo-stage{ display:none; }
  .sathi-priya-card{ left:auto; width:48%; min-width:210px; height:150px; padding:42px 18px 18px; border-top-right-radius:0; border-top-left-radius:70px; }
  .sathi-priya-card h2{ font-size:22px; }
  .sathi-priya-card p,.sathi-left-stats{ display:none; }
  .sathi-right{ padding:14px 14px 0; grid-template-rows:54px minmax(0,1fr) auto auto auto; }
  .sathi-topbar{ padding-right:42px; }
  .sathi-quickbar-row,.sathi-chips{ grid-template-columns:1fr; }
}
`;
