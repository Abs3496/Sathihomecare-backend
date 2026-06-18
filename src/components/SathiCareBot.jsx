import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { apiFetch } from "../api";
import logo from "../assets/images/icons/logo.png";
import nurseImage from "../assets/images/homepage/servicenursing.jpg";
import { servicesData } from "../data/servicesData";

const SERVICE_GROUPS = [
  { key: "nursing", label: "Nursing", hi: "Nursing" },
  { key: "therapy", label: "Ayurvedic Therapy", hi: "Ayurvedic Therapy" },
  { key: "counselling", label: "Counselling", hi: "Counselling" }
];

const BENEFICIARY = ["Self", "Patient", "Senior Citizen"];
const GENDER = ["Female", "Male", "Other"];
const DATE_CHIPS = ["Today", "Tomorrow", "This week", "I will decide later"];
const DURATION = ["One visit", "3 days", "7 days", "15 days", "Monthly"];
const POST_BOOKING = ["Talk to Human Expert", "Book another service", "WhatsApp"];

const COPY = {
  en: {
    lang: "English",
    welcome: "Welcome to Sathi Homecare. I am Priya AI Care Assistant. How may I assist you today?",
    first: "Which service do you want to take?",
    chooseSub: "Please choose the service you need. You can also ask for details about any service.",
    beneficiary: "Who is this service for?",
    name: "Please share the patient/customer name.",
    age: "Please share age.",
    gender: "Please select gender.",
    city: "Which city do you need service in?",
    address: "Please share complete address or locality.",
    mobile: "Please share a valid 10-digit mobile number.",
    date: "Preferred date?",
    duration: "Preferred duration?",
    special: "Any special requirements? For example medical condition, mobility, equipment, timing, or language preference.",
    budget: "What is your budget for this service?",
    budgetLow: "Budget cannot be below the minimum service amount.",
    summary: "Here is your booking summary. Shall I submit it?",
    finalPrice: "Final pricing will be confirmed by care coordinator.",
    offTopic: "I can help only with Sathi Homecare services, booking, estimates, FAQs and healthcare support information. I cannot provide medical diagnosis.",
    sent: "Booking request received. Our care coordinator will contact you shortly.",
    error: "Booking could not be submitted right now. Please connect with our care coordinator.",
    human: "You can talk to our human care expert now.",
    detailsLead: "Here are the service details:",
    estimateLead: "Estimated price range:",
    placeholder: "Type your message..."
  },
  hi: {
    lang: "Hindi",
    welcome: "Namaste, Sathi Homecare mein aapka swagat hai. Main Priya AI Care Assistant hoon. Main aapki kis prakaar sahayata kar sakti hoon?",
    first: "Aap kaunsi service lena chahte hain?",
    chooseSub: "Kripya required service chunein. Aap kisi bhi service ki details bhi pooch sakte hain.",
    beneficiary: "Yeh service kiske liye chahiye?",
    name: "Patient/customer ka naam share karein.",
    age: "Age batayein.",
    gender: "Gender select karein.",
    city: "Service kis city mein chahiye?",
    address: "Complete address ya locality share karein.",
    mobile: "Valid 10-digit mobile number share karein.",
    date: "Preferred date kya rahegi?",
    duration: "Preferred duration kya rahegi?",
    special: "Koi special requirement? Jaise condition, mobility, equipment, timing ya language preference.",
    budget: "Is service ke liye aapka budget kya hai?",
    budgetLow: "Budget minimum service amount se kam nahi ho sakta.",
    summary: "Yeh aapki booking summary hai. Submit kar doon?",
    finalPrice: "Final pricing care coordinator confirm karega.",
    offTopic: "Main sirf Sathi Homecare services, booking, estimate, FAQs aur healthcare support information me help kar sakti hoon. Main medical diagnosis nahi deti.",
    sent: "Booking request mil gayi. Hamare care coordinator jald hi aapse contact karenge.",
    error: "Booking abhi submit nahi ho pa rahi. Kripya care coordinator se connect karein.",
    human: "Aap abhi human care expert se baat kar sakte hain.",
    detailsLead: "Service details yeh hain:",
    estimateLead: "Estimated price range:",
    placeholder: "Apna message type karein..."
  }
};

const uid = () => Math.random().toString(36).slice(2) + Date.now();
const nowTime = () => new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
const phoneDigits = (value) => String(value || "").replace(/\D/g, "");

export default function SathiCareBot({
  brandName = "Sathi Homecare",
  agentName = "Priya AI",
  agentRole = "AI Care Assistant",
  phone = "+91 94517 64251"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const [language, setLanguage] = useState("hi");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [awaitingField, setAwaitingField] = useState(null);
  const [booking, setBooking] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const bodyEndRef = useRef(null);
  const initialised = useRef(false);
  const recognitionRef = useRef(null);
  const t = COPY[language];
  const cleanPhone = phoneDigits(phone);
  const whatsappUrl = `https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent("Emergency booking request for Sathi Homecare. Please contact me.")}`;

  const catalog = useMemo(() => ({
    nursing: servicesData.nursing,
    therapy: servicesData.therapy,
    counselling: servicesData.counselling
  }), []);

  useEffect(() => {
    bodyEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(Boolean(SpeechRecognition));
  }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  }, [language]);

  const pushBot = useCallback((text, chips = null, stepKey = null, extra = {}) => {
    setIsTyping(true);
    setAwaitingField(null);
    setTimeout(() => {
      setMessages((current) => [...current, { id: uid(), sender: "bot", text, chips, stepKey, time: nowTime(), ...extra }]);
      setIsTyping(false);
    }, 360);
  }, []);

  const pushUser = useCallback((text) => {
    setMessages((current) => [...current, { id: uid(), sender: "user", text, time: nowTime() }]);
  }, []);

  const startFlow = useCallback((withVoice = false) => {
    setIsOpen(true);
    setHasUnread(false);
    if (withVoice) speak(t.welcome);
    if (!initialised.current) {
      initialised.current = true;
      setTimeout(() => {
        pushBot(t.welcome);
        setTimeout(() => pushBot(t.first, SERVICE_GROUPS.map((item) => item.label), "serviceGroup"), 520);
      }, 260);
    }
  }, [pushBot, speak, t.first, t.welcome]);

  useEffect(() => {
    const timer = window.setTimeout(() => startFlow(false), 2000);
    return () => window.clearTimeout(timer);
  }, [startFlow]);

  const detectLanguage = (text) => {
    if (/[\u0900-\u097F]/.test(text) || /\b(namaste|kripya|kaunsi|chahiye|bata|haan|nahi)\b/i.test(text)) {
      setLanguage("hi");
    } else if (/[a-z]/i.test(text)) {
      setLanguage("en");
    }
  };

  const serviceChips = (groupKey) => (catalog[groupKey] || []).slice(0, 10).map((service) => service.name);
  const findService = (name) => Object.values(catalog).flat().find((service) => service.name === name);
  const findGroupByLabel = (label) => SERVICE_GROUPS.find((group) => group.label === label || group.hi === label);
  const getMinimum = (serviceName) => findService(serviceName)?.price || 499;

  const markAnswered = (msgId, label) => {
    setMessages((current) => current.map((message) => (message.id === msgId ? { ...message, answered: label } : message)));
  };

  const showServiceDetails = (serviceName) => {
    const service = findService(serviceName);
    if (!service) return;
    pushBot(`${t.detailsLead}\n${service.name}\nStarting from Rs. ${service.price}\n${service.desc}\n\n${t.finalPrice}`, ["Continue booking", "Talk to Human Expert"], "detailsChoice");
  };

  const estimateText = (draft) => {
    const min = getMinimum(draft.service);
    const durationBoost = { "One visit": 0, "3 days": 2, "7 days": 5, "15 days": 10, Monthly: 18 }[draft.duration] || 1;
    const low = Math.max(min, Math.round(min * (1 + durationBoost * 0.75)));
    const high = Math.round(low * 1.35 + (draft.specialRequirements ? 350 : 0));
    return `${t.estimateLead} Rs. ${low.toLocaleString("en-IN")} - Rs. ${high.toLocaleString("en-IN")}. ${t.finalPrice}`;
  };

  const askNext = (field) => {
    const prompts = {
      beneficiary: [t.beneficiary, BENEFICIARY, "beneficiary"],
      name: [t.name, null, null],
      age: [t.age, null, null],
      gender: [t.gender, GENDER, "gender"],
      city: [t.city, null, null],
      address: [t.address, null, null],
      mobile: [t.mobile, null, null],
      date: [t.date, DATE_CHIPS, "date"],
      duration: [t.duration, DURATION, "duration"],
      specialRequirements: [t.special, ["No special requirement", "Need female caregiver", "Need medical equipment"], "specialRequirements"],
      budget: [t.budget, null, null]
    };
    const [text, chips, stepKey] = prompts[field];
    pushBot(text, chips, stepKey);
    if (!chips) setAwaitingField(field);
  };

  const handleChip = (msg, chipLabel) => {
    markAnswered(msg.id, chipLabel);
    pushUser(chipLabel);

    if (msg.stepKey === "serviceGroup") {
      const group = findGroupByLabel(chipLabel);
      setBooking((current) => ({ ...current, serviceGroup: group?.key }));
      pushBot(t.chooseSub, serviceChips(group?.key), "service");
      return;
    }

    if (msg.stepKey === "service") {
      setBooking((current) => ({ ...current, service: chipLabel }));
      showServiceDetails(chipLabel);
      return;
    }

    if (msg.stepKey === "detailsChoice") {
      if (chipLabel === "Talk to Human Expert") {
        pushBot(t.human, ["Call Now", "WhatsApp", "Continue booking"], "human");
      } else {
        askNext("beneficiary");
      }
      return;
    }

    if (msg.stepKey === "human") {
      if (chipLabel === "Call Now") window.location.href = `tel:+91${cleanPhone.slice(-10)}`;
      if (chipLabel === "WhatsApp") window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      if (chipLabel === "Continue booking") askNext("beneficiary");
      return;
    }

    if (msg.stepKey === "confirm") {
      if (chipLabel === "Submit booking") {
        submitBooking();
      } else {
        askNext("name");
      }
      return;
    }

    if (msg.stepKey === "postBooking") {
      if (chipLabel === "Book another service") restartFlow();
      if (chipLabel === "Talk to Human Expert") pushBot(t.human, ["Call Now", "WhatsApp"], "human");
      if (chipLabel === "WhatsApp") window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const fieldOrder = ["beneficiary", "gender", "date", "duration", "specialRequirements"];
    if (fieldOrder.includes(msg.stepKey)) {
      const nextMap = {
        beneficiary: "name",
        gender: "city",
        date: "duration",
        duration: "specialRequirements",
        specialRequirements: "budget"
      };
      setBooking((current) => ({ ...current, [msg.stepKey]: chipLabel }));
      askNext(nextMap[msg.stepKey]);
    }
  };

  const restartFlow = () => {
    setBooking({});
    pushBot(t.first, SERVICE_GROUPS.map((item) => item.label), "serviceGroup");
  };

  const handleQuickAction = (label) => {
    pushUser(label);
    if (label === "Talk to Human Expert") {
      pushBot(t.human, ["Call Now", "WhatsApp", "Continue booking"], "human");
      return;
    }
    const group = findGroupByLabel(label);
    if (group) {
      setBooking((current) => ({ ...current, serviceGroup: group.key }));
      pushBot(t.chooseSub, serviceChips(group.key), "service");
    }
  };

  const completeField = (field, value) => {
    const nextMap = {
      name: "age",
      age: "gender",
      city: "address",
      address: "mobile",
      mobile: "date"
    };
    setBooking((current) => ({ ...current, [field]: value }));
    askNext(nextMap[field]);
  };

  const submitText = (value) => {
    const trimmed = value.trim();
    if (!trimmed) return;
    detectLanguage(trimmed);

    if (awaitingField) {
      pushUser(trimmed);
      if (awaitingField === "mobile") {
        const digitsOnly = phoneDigits(trimmed);
        if (!/^[6-9]\d{9}$/.test(digitsOnly)) {
          pushBot(t.mobile);
          setAwaitingField("mobile");
          return;
        }
        completeField("mobile", digitsOnly);
        return;
      }
      if (awaitingField === "budget") {
        const amount = Number(phoneDigits(trimmed));
        const minimum = getMinimum(booking.service);
        if (!amount || amount < minimum) {
          pushBot(`${t.budgetLow} Minimum: Rs. ${minimum.toLocaleString("en-IN")}`, null, null);
          setAwaitingField("budget");
          return;
        }
        const updated = { ...booking, budget: amount };
        setBooking(updated);
        pushBot(estimateText(updated));
        pushBot(t.summary, ["Submit booking", "Edit details"], "confirm", { type: "summary", summary: updated });
        return;
      }
      completeField(awaitingField, trimmed);
      return;
    }

    pushUser(trimmed);
    const matched = Object.values(catalog).flat().find((service) => trimmed.toLowerCase().includes(service.name.toLowerCase().slice(0, 8)));
    if (matched) {
      showServiceDetails(matched.name);
      return;
    }
    if (/\b(price|cost|budget|estimate|kitna|rate|charge)\b/i.test(trimmed) && booking.service) {
      pushBot(`${estimateText(booking)} Minimum amount: Rs. ${getMinimum(booking.service).toLocaleString("en-IN")}.`);
      return;
    }
    if (/\b(call|human|whatsapp|expert|contact|baat)\b/i.test(trimmed)) {
      pushBot(t.human, ["Call Now", "WhatsApp", "Continue booking"], "human");
      return;
    }
    if (/\b(diagnosis|medicine|tablet|dose|prescribe|इलाज|दवा)\b/i.test(trimmed)) {
      pushBot(t.offTopic);
      return;
    }
    pushBot(t.first, SERVICE_GROUPS.map((item) => item.label), "serviceGroup");
  };

  const handleSend = () => {
    if (!inputValue.trim()) return;
    submitText(inputValue);
    setInputValue("");
  };

  const startListening = () => {
    startFlow(true);
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      pushBot(language === "hi" ? "Voice input is browser mein supported nahi hai." : "Voice input is not supported in this browser.");
      return;
    }
    recognitionRef.current?.abort?.();
    const recognition = new SpeechRecognition();
    recognition.lang = language === "hi" ? "hi-IN" : "en-IN";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript) submitText(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const submitBooking = () => {
    setIsTyping(true);
    const payload = { ...booking, submittedAt: new Date().toISOString() };
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
        setMessages((current) => [...current, { id: uid(), sender: "bot", text: `${t.sent} Reference ID: ${code}. ${t.finalPrice}`, chips: POST_BOOKING, stepKey: "postBooking", time: nowTime() }]);
      } catch (error) {
        setMessages((current) => [...current, { id: uid(), sender: "bot", text: error?.message || t.error, chips: ["Call Now", "WhatsApp"], stepKey: "human", time: nowTime() }]);
      } finally {
        setIsTyping(false);
      }
    })();
  };

  return (
    <div className="sathi-root">
      <style>{CSS}</style>

      {!isOpen && (
        <button className="sathi-launcher" onClick={() => startFlow(false)} aria-label="Chat with Priya AI">
          <span>Priya AI</span>
          {hasUnread && <span className="sathi-launcher-badge">1</span>}
        </button>
      )}

      {isOpen && (
        <div className="sathi-overlay">
          <div className="sathi-panel" role="dialog" aria-label="Priya AI Care Assistant">
            <button className="sathi-close" onClick={() => setIsOpen(false)} aria-label="Close">X</button>

            <aside className="sathi-left">
              <div className="sathi-left-brand">
                <button type="button" className={`sathi-logo-button ${isListening ? "is-listening" : ""}`} onClick={startListening} aria-label="Start voice chat">
                  <span className="sathi-ring sathi-ring-one" />
                  <span className="sathi-ring sathi-ring-two" />
                  <img src={logo} alt={brandName} />
                  <span className="sathi-particle p1" />
                  <span className="sathi-particle p2" />
                  <span className="sathi-particle p3" />
                </button>
                <div>
                  <strong>{brandName}</strong>
                  <span>Care That Feels Like Family</span>
                </div>
              </div>
              <div className="sathi-nurse-stage">
                <img src={nurseImage} alt="Smiling Indian nurse care assistant" />
                <div className="sathi-wave" />
              </div>
              <div className="sathi-priya-card">
                <h2>Priya AI</h2>
                <span>Voice enabled</span>
                <p>{language === "hi" ? "Services samjhiye, estimate lijiye aur booking complete kijiye." : "Understand services, get estimates and complete bookings."}</p>
                <div className="sathi-human-actions">
                  <a href={`tel:+91${cleanPhone.slice(-10)}`}>Call Now</a>
                  <a href={whatsappUrl} target="_blank" rel="noreferrer">WhatsApp</a>
                </div>
              </div>
            </aside>

            <section className="sathi-right">
              <div className="sathi-topbar">
                <div className="sathi-agent-row">
                  <button type="button" className={`sathi-avatar sathi-avatar-lg ${isListening ? "is-listening" : ""}`} onClick={startListening} aria-label="Start voice mode">AI</button>
                  <div>
                    <div className="sathi-agent-name">{agentName}</div>
                    <div className="sathi-agent-role">{agentRole}</div>
                  </div>
                </div>
                <div className="sathi-lang-pills" aria-label="Language selector">
                  <button className={language === "hi" ? "active" : ""} onClick={() => setLanguage("hi")}>Hindi</button>
                  <button className={language === "en" ? "active" : ""} onClick={() => setLanguage("en")}>English</button>
                </div>
              </div>

              <div className="sathi-body">
                {messages.map((msg) => (
                  <div key={msg.id} className={`sathi-row sathi-row-${msg.sender}`}>
                    {msg.sender === "bot" && <Avatar />}
                    <div className="sathi-col">
                      <div className={`sathi-bubble sathi-bubble-${msg.sender}`}>
                        {msg.type === "summary" ? <SummaryCard data={msg.summary} /> : <p>{msg.text}</p>}
                      </div>
                      <div className={`sathi-time sathi-time-${msg.sender}`}>{msg.time}{msg.sender === "user" ? " seen" : ""}</div>

                      {msg.chips && (
                        <div className="sathi-chips">
                          {msg.chips.map((chip) => {
                            const isAnswered = msg.answered;
                            const isThisOne = msg.answered === chip;
                            return (
                              <button
                                key={chip}
                                className={`sathi-chip ${isThisOne ? "sathi-chip-selected" : ""} ${isAnswered && !isThisOne ? "sathi-chip-faded" : ""}`}
                                disabled={Boolean(isAnswered) && !["human", "postBooking"].includes(msg.stepKey)}
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
                    <Avatar />
                    <div className="sathi-bubble sathi-bubble-bot sathi-typing"><span /><span /><span /></div>
                  </div>
                )}
                {isListening && <div className="sathi-listening"><span />Listening...</div>}
                <div ref={bodyEndRef} />
              </div>

              <div className="sathi-quickbar">
                <div className="sathi-quickbar-row">
                  {SERVICE_GROUPS.map((item) => (
                    <button key={item.key} className="sathi-quick-btn" onClick={() => handleQuickAction(item.label)}>{item.label}</button>
                  ))}
                  <button className="sathi-quick-btn sathi-human-btn" onClick={() => handleQuickAction("Talk to Human Expert")}>Talk to Human Expert</button>
                </div>
              </div>

              <div className="sathi-inputbox">
                <div className="sathi-inputbar">
                  <button className={`sathi-mic ${isListening ? "is-listening" : ""}`} type="button" onClick={startListening} aria-label="Voice input">{isListening ? "..." : "Mic"}</button>
                  <input
                    className="sathi-input"
                    type="text"
                    placeholder={t.placeholder}
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={(event) => event.key === "Enter" && handleSend()}
                  />
                  <button className="sathi-send" onClick={handleSend} aria-label="Send">Send</button>
                </div>
                <div className="sathi-voice-row">
                  <button className="sathi-speak" type="button" onClick={() => speak(t.welcome)}>Play Welcome</button>
                  <span>{voiceSupported ? "Voice ready" : "Voice limited"}</span>
                </div>
              </div>

              <div className="sathi-lock-note">{language === "hi" ? "Aapki jankari surakshit hai aur sirf behtar seva ke liye istemal hogi." : "Your information is secure and used only to arrange better care."}</div>
            </section>
            <div className="sathi-powered">Powered by <strong>Sathi Homecare</strong></div>
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar() {
  return <div className="sathi-avatar sathi-avatar-sm">AI<span className="sathi-online-dot" /></div>;
}

function SummaryCard({ data }) {
  const rows = [
    ["Service Type", data.service],
    ["For", data.beneficiary],
    ["Name", data.name],
    ["Age", data.age],
    ["Gender", data.gender],
    ["City", data.city],
    ["Address", data.address],
    ["Mobile", data.mobile],
    ["Preferred Date", data.date],
    ["Duration", data.duration],
    ["Special Requirements", data.specialRequirements],
    ["Budget", data.budget ? `Rs. ${Number(data.budget).toLocaleString("en-IN")}` : ""]
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

function buildAiMessages(payload) {
  const content = [
    "Priya AI booking request for Sathi Homecare.",
    "Do not provide medical diagnosis. Confirm booking flow only.",
    `Service Type: ${payload.service || ""}`,
    `Self/Patient/Senior Citizen: ${payload.beneficiary || ""}`,
    `Name: ${payload.name || ""}`,
    `Age: ${payload.age || ""}`,
    `Gender: ${payload.gender || ""}`,
    `City: ${payload.city || ""}`,
    `Address: ${payload.address || ""}`,
    `Mobile: ${payload.mobile || ""}`,
    `Preferred Date: ${payload.date || ""}`,
    `Duration: ${payload.duration || ""}`,
    `Special Requirements: ${payload.specialRequirements || ""}`,
    `Budget: ${payload.budget || ""}`
  ].join("\n");
  return [{ role: "user", content }];
}

function buildAiDraft(payload) {
  return {
    patientName: payload.name || "",
    age: Number(String(payload.age || "").match(/\d+/)?.[0] || 0) || null,
    location: [payload.city, payload.address].filter(Boolean).join(", "),
    serviceType: payload.service || "",
    preferredDate: dateToIso(payload.date),
    timeSlot: payload.duration || "",
    mobileNumber: payload.mobile || ""
  };
}

function dateToIso(value) {
  const date = new Date();
  if (value === "Tomorrow") date.setDate(date.getDate() + 1);
  if (value === "This week") date.setDate(date.getDate() + 3);
  return date.toISOString().slice(0, 10);
}

const CSS = `
.sathi-root{ position:fixed; inset:auto 24px 24px auto; z-index:9999; font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif; }
.sathi-launcher{ min-width:96px; height:56px; border-radius:999px; border:none; cursor:pointer; background:#146c63; color:#fff; display:flex; align-items:center; justify-content:center; box-shadow:0 10px 30px rgba(20,108,99,.34); position:relative; font-weight:900; padding:0 18px; }
.sathi-launcher-badge{ position:absolute; top:-4px; right:-4px; background:#ef4444; color:#fff; font-size:11px; font-weight:700; width:20px; height:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; border:2px solid #fff; }
.sathi-overlay{ position:fixed; inset:0; background:rgba(13,24,36,.76); backdrop-filter:blur(4px); display:grid; place-items:center; padding:24px; }
.sathi-panel{ position:relative; width:min(980px,calc(100vw - 48px)); height:min(650px,calc(100vh - 48px)); background:#fff; border-radius:18px; box-shadow:0 28px 80px rgba(0,0,0,.42); display:grid; grid-template-columns:380px minmax(0,1fr); grid-template-rows:minmax(0,1fr) 34px; overflow:hidden; animation:sathi-pop .22s ease; }
@keyframes sathi-pop{ from{ opacity:0; transform:translateY(16px) scale(.98);} to{ opacity:1; transform:translateY(0) scale(1);} }
.sathi-close{ position:absolute; top:18px; right:18px; z-index:4; background:#fff; border:1px solid #dbe7e3; color:#334155; width:34px; height:34px; border-radius:50%; cursor:pointer; font-weight:900; box-shadow:0 8px 20px rgba(15,23,42,.1); }
.sathi-left{ position:relative; min-width:0; background:linear-gradient(180deg,#f8fffd 0%,#edf8f4 52%,#146c63 53%,#0f4f49 100%); overflow:hidden; }
.sathi-left-brand{ position:absolute; left:22px; top:20px; right:22px; display:flex; align-items:center; gap:12px; color:#0f766e; z-index:2; }
.sathi-left-brand strong{ display:block; font-size:17px; line-height:1; }
.sathi-left-brand span{ display:block; color:#39877f; font-size:11px; margin-top:3px; font-weight:700; }
.sathi-logo-button{ width:54px; height:54px; border:none; border-radius:18px; background:#fff; display:grid; place-items:center; position:relative; box-shadow:0 14px 28px rgba(15,118,110,.14); cursor:pointer; isolation:isolate; }
.sathi-logo-button img{ width:44px; height:44px; object-fit:contain; z-index:2; }
.sathi-ring{ position:absolute; inset:-5px; border:1px solid rgba(20,108,99,.34); border-radius:22px; animation:sathi-ring 2.2s infinite ease-out; }
.sathi-ring-two{ animation-delay:.7s; }
.sathi-logo-button.is-listening .sathi-ring{ border-color:#22c55e; }
@keyframes sathi-ring{ 0%{ transform:scale(.9); opacity:.9;} 100%{ transform:scale(1.42); opacity:0;} }
.sathi-particle{ position:absolute; width:5px; height:5px; border-radius:50%; background:#22c55e; opacity:.8; animation:sathi-float 2.8s infinite ease-in-out; }
.p1{ left:2px; top:10px; }.p2{ right:0; top:28px; animation-delay:.5s; }.p3{ left:28px; bottom:0; animation-delay:1s; }
@keyframes sathi-float{ 50%{ transform:translateY(-9px); opacity:.35;} }
.sathi-nurse-stage{ position:absolute; inset:94px 34px 205px; border-radius:24px; background:#fff; overflow:hidden; box-shadow:0 18px 45px rgba(15,118,110,.14); }
.sathi-nurse-stage img{ width:100%; height:100%; object-fit:cover; }
.sathi-wave{ position:absolute; left:20px; right:20px; bottom:16px; height:32px; background:repeating-linear-gradient(90deg,rgba(255,255,255,.85) 0 5px,transparent 5px 12px); border-radius:999px; opacity:.8; animation:sathi-wave 1.2s infinite ease-in-out; }
@keyframes sathi-wave{ 50%{ transform:scaleY(.55); opacity:.55;} }
.sathi-priya-card{ position:absolute; left:0; right:0; bottom:0; height:210px; padding:30px 28px 24px; color:#fff; background:linear-gradient(145deg,#16877d,#0f4f49); border-top-right-radius:96px; }
.sathi-priya-card h2{ margin:0; font-size:30px; letter-spacing:0; }
.sathi-priya-card > span{ display:inline-block; margin-top:8px; padding:5px 9px; border-radius:999px; background:rgba(255,255,255,.18); font-size:11px; font-weight:800; }
.sathi-priya-card p{ margin:14px 0 16px; max-width:280px; color:#e6fffb; font-size:13px; line-height:1.55; font-weight:600; }
.sathi-human-actions{ display:flex; gap:10px; flex-wrap:wrap; }
.sathi-human-actions a{ min-height:38px; border-radius:999px; background:#fff; color:#0f766e; padding:9px 13px; text-decoration:none; font-size:12px; font-weight:900; }
.sathi-right{ min-width:0; min-height:0; display:grid; grid-template-rows:64px minmax(0,1fr) auto auto auto; padding:22px 26px 0; background:#fff; }
.sathi-topbar{ display:flex; align-items:flex-start; justify-content:space-between; gap:12px; padding-right:44px; }
.sathi-agent-row{ display:flex; gap:10px; align-items:center; min-width:0; }
.sathi-agent-name{ font-size:15px; color:#1e2440; font-weight:900; }
.sathi-agent-role{ font-size:11px; color:#697586; margin-top:2px; font-weight:700; }
.sathi-lang-pills{ display:flex; gap:8px; flex-wrap:wrap; justify-content:flex-end; }
.sathi-lang-pills button{ min-height:34px; border:1px solid #dbe7e3; border-radius:999px; padding:7px 12px; color:#0f766e; font-size:11px; font-weight:900; background:#fff; }
.sathi-lang-pills button.active{ background:#0f766e; color:#fff; border-color:#0f766e; }
.sathi-avatar{ border:none; border-radius:50%; background:linear-gradient(135deg,#0f766e,#22c55e); color:#fff; font-weight:900; display:flex; align-items:center; justify-content:center; flex-shrink:0; position:relative; }
.sathi-avatar-lg{ width:42px; height:42px; font-size:13px; cursor:pointer; }
.sathi-avatar-sm{ width:34px; height:34px; font-size:11px; }
.sathi-avatar.is-listening{ box-shadow:0 0 0 8px rgba(34,197,94,.16); }
.sathi-online-dot{ position:absolute; bottom:-1px; right:-1px; width:10px; height:10px; border-radius:50%; background:#22c55e; border:2px solid #fff; }
.sathi-body{ min-height:0; overflow-y:auto; padding:4px 6px 12px 0; display:flex; flex-direction:column; gap:12px; }
.sathi-row{ display:flex; gap:12px; max-width:100%; }
.sathi-row-user{ flex-direction:row-reverse; }
.sathi-col{ display:flex; flex-direction:column; max-width:84%; min-width:0; }
.sathi-row-user .sathi-col{ align-items:flex-end; }
.sathi-bubble{ padding:13px 15px; border-radius:14px; font-size:13px; line-height:1.55; white-space:pre-line; overflow-wrap:anywhere; }
.sathi-bubble p{ margin:0; }
.sathi-bubble-bot{ background:#f1f5f4; color:#202740; border-top-left-radius:4px; }
.sathi-bubble-user{ background:#dff7ef; color:#164e46; border-top-right-radius:4px; }
.sathi-time{ font-size:10px; color:#8e94a8; margin-top:3px; }
.sathi-time-user{ text-align:right; }
.sathi-chips{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; margin-top:12px; padding:12px; border:1px solid #edf0f6; border-radius:14px; background:#fff; box-shadow:0 10px 26px rgba(24,28,50,.04); }
.sathi-chip{ min-height:46px; border:1px solid #dfe8e5; background:#fff; color:#202740; font-size:12px; font-weight:900; padding:9px 10px; border-radius:9px; cursor:pointer; transition:.15s; white-space:normal; }
.sathi-chip:hover:not(:disabled){ border-color:#0f766e; background:#f3fffb; }
.sathi-chip-selected{ background:#0f766e; color:#fff; border-color:#0f766e; }
.sathi-chip-faded{ opacity:.42; }
.sathi-chip:disabled{ cursor:default; }
.sathi-summary{ display:flex; flex-direction:column; gap:7px; min-width:min(260px,100%); }
.sathi-summary-row{ display:flex; justify-content:space-between; gap:12px; font-size:12px; border-bottom:1px dashed #dfe3ec; padding-bottom:6px; }
.sathi-summary-row span{ color:#6b7280; }
.sathi-summary-row b{ color:#164e46; text-align:right; }
.sathi-typing{ display:flex; gap:4px; align-items:center; padding:13px; width:50px; }
.sathi-typing span{ width:6px; height:6px; border-radius:50%; background:#0f766e; animation:sathi-bounce 1.1s infinite; }
.sathi-typing span:nth-child(2){ animation-delay:.15s; }
.sathi-typing span:nth-child(3){ animation-delay:.3s; }
@keyframes sathi-bounce{ 0%,60%,100%{ transform:translateY(0); opacity:.5; } 30%{ transform:translateY(-4px); opacity:1; } }
.sathi-listening{ align-self:center; display:flex; align-items:center; gap:10px; color:#0f766e; font-size:12px; font-weight:900; }
.sathi-listening span{ width:80px; height:24px; border-radius:999px; background:repeating-linear-gradient(90deg,#0f766e 0 5px,transparent 5px 11px); animation:sathi-wave 1s infinite ease-in-out; }
.sathi-quickbar{ border:1px solid #edf0f6; border-radius:14px; padding:12px; background:#fff; box-shadow:0 8px 22px rgba(24,28,50,.04); }
.sathi-quickbar-row{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px; }
.sathi-quick-btn{ min-height:42px; border:1px solid #dfe8e5; background:#fff; font-size:13px; font-weight:900; color:#202740; padding:8px 10px; border-radius:9px; cursor:pointer; white-space:normal; transition:.15s; }
.sathi-quick-btn:hover{ background:#f3fffb; border-color:#0f766e; }
.sathi-human-btn{ background:#ecfdf5; color:#0f766e; }
.sathi-inputbox{ margin-top:10px; border:1px solid #edf0f6; border-radius:14px; background:#fff; padding:12px 14px; box-shadow:0 8px 22px rgba(24,28,50,.04); }
.sathi-inputbar{ display:grid; grid-template-columns:44px minmax(0,1fr) 54px; align-items:center; gap:10px; }
.sathi-mic{ width:40px; height:40px; border:none; border-radius:50%; color:#0f766e; background:#e7fbf6; font-size:11px; font-weight:900; cursor:pointer; }
.sathi-mic.is-listening{ background:#0f766e; color:#fff; animation:sathi-pulse 1s infinite; }
@keyframes sathi-pulse{ 50%{ transform:scale(1.08); } }
.sathi-input{ width:100%; min-width:0; height:40px; border:1px solid #dfe8e5; border-radius:11px; padding:0 14px; font-size:13px; outline:none; }
.sathi-input:focus{ border-color:#0f766e; }
.sathi-send{ min-width:50px; height:42px; border-radius:999px; border:none; background:#0f766e; color:#fff; cursor:pointer; font-size:11px; font-weight:900; }
.sathi-voice-row{ display:flex; align-items:center; justify-content:center; gap:10px; margin-top:8px; flex-wrap:wrap; }
.sathi-voice-row span{ color:#7b8195; font-size:11px; font-weight:800; }
.sathi-speak{ border:none; border-radius:999px; background:#e7fbf6; color:#0f766e; padding:8px 18px; font-size:11px; font-weight:900; cursor:pointer; min-height:34px; }
.sathi-lock-note{ text-align:center; font-size:11px; color:#7b8195; padding:8px 0 10px; background:#fff; }
.sathi-powered{ grid-column:1 / -1; display:flex; align-items:center; justify-content:center; gap:4px; color:#8b90a4; font-size:12px; background:#fff; border-top:1px solid #f1f3f8; }
.sathi-powered strong{ color:#0f766e; }
@media (max-width:860px){
  .sathi-root{ inset:auto 12px 12px auto; }
  .sathi-overlay{ padding:8px; }
  .sathi-panel{ width:calc(100vw - 16px); height:calc(100dvh - 16px); grid-template-columns:1fr; grid-template-rows:148px minmax(0,1fr) 30px; border-radius:16px; }
  .sathi-left{ min-height:148px; }
  .sathi-left-brand{ top:14px; left:14px; right:14px; }
  .sathi-nurse-stage{ left:auto; right:18px; top:76px; bottom:auto; width:112px; height:58px; border-radius:16px; }
  .sathi-wave{ display:none; }
  .sathi-priya-card{ left:0; right:0; height:80px; padding:10px 146px 10px 16px; border-top-right-radius:54px; }
  .sathi-priya-card h2{ font-size:20px; }
  .sathi-priya-card p,.sathi-human-actions{ display:none; }
  .sathi-right{ padding:12px 12px 0; grid-template-rows:auto minmax(0,1fr) auto auto auto; }
  .sathi-topbar{ padding-right:40px; align-items:center; }
  .sathi-agent-role{ display:none; }
  .sathi-lang-pills button{ padding:6px 10px; }
  .sathi-chips,.sathi-quickbar-row{ grid-template-columns:1fr; }
  .sathi-col{ max-width:88%; }
  .sathi-inputbar{ grid-template-columns:42px minmax(0,1fr) 50px; gap:8px; }
}
`;
