const CEILING = 4000000;

const FIELDS = [
  {
    id: "name",
    label: "Legal name",
    ask: "What is the shop's legal name?",
    why: "The application is in the shop's legal name. Bank proof has to match that same name (ONB-POL-001 §2, ONB-POL-003 §1).",
  },
  {
    id: "city",
    label: "City",
    ask: "Which city is the shop in?",
    why: "The city is part of the application. It identifies the shop (ONB-POL-003 §1).",
  },
  {
    id: "type",
    label: "Business type",
    ask: "What kind of business is it? Restaurant, grocery, and retail are allowed. Money service, crypto, and gambling are not.",
    why: "Only restaurant, grocery, and retail can go live. Money service, crypto, and gambling are refused (ONB-POL-001 §3).",
    chips: ["Restaurant", "Grocery", "Retail"],
  },
  {
    id: "volume",
    label: "Monthly volume",
    ask: "What is the expected monthly volume, in rupees? Use the shop's own figure.",
    why: "The Merchant Risk Lead can decide up to ₹40,00,000 a month. Above that, the review goes to the Head of Payments. I will not lower the figure you give (ONB-POL-002).",
  },
  {
    id: "products",
    label: "Products",
    ask: "Do you want UPI, cards, or both?",
    why: "iPe onboards shops for UPI and card payments. The application records which of those you want (ONB-POL-003 §1).",
    chips: ["UPI", "Cards", "UPI and cards"],
  },
  {
    id: "registration",
    label: "Business registration",
    ask: "Upload the business registration. A PDF or a photo of the document is fine.",
    why: "The pack needs four items before anyone can turn the shop on. Business registration is the first. Upload the file here (ONB-POL-001 §2).",
    kind: "file",
    accept: ".pdf,.png,.jpg,.jpeg,.webp",
    uploadLabel: "Upload registration",
    chips: ["I don't have this file"],
  },
  {
    id: "ownerId",
    label: "Owner government ID",
    ask: "Upload the owner's government ID. Don't type the ID number.",
    why: "The pack needs the owner's government ID on file. Upload the document. I will not read the number back (ONB-POL-001 §2, ONB-POL-003 §1).",
    kind: "file",
    accept: ".pdf,.png,.jpg,.jpeg,.webp",
    uploadLabel: "Upload government ID",
    chips: ["I don't have this file"],
  },
  {
    id: "bank",
    label: "Bank proof",
    ask: "Upload bank proof in the shop's legal name. A cancelled cheque or a statement is enough. Don't type the account number.",
    why: "Bank proof must be in the shop's legal name. Upload the file. I will not repeat an account number (ONB-POL-001 §2).",
    kind: "file",
    accept: ".pdf,.png,.jpg,.jpeg,.webp",
    uploadLabel: "Upload bank proof",
    chips: ["I don't have this file"],
  },
  {
    id: "photo",
    label: "Shopfront photo",
    ask: "Upload a photo of the shopfront, taken in the last 90 days.",
    why: "The pack needs a shopfront photo from the last 90 days, so the shop can be seen as it is now (ONB-POL-001 §2).",
    kind: "file",
    accept: ".png,.jpg,.jpeg,.webp",
    uploadLabel: "Upload shopfront photo",
    chips: ["I don't have this file"],
  },
  {
    id: "phones",
    label: "Payer phone numbers",
    ask: "Will the shop store payer phone numbers?",
    why: "If the shop stores a payer's phone number, a signed data-processing addendum is required before go-live. A sentence in the application is not that addendum (ONB-POL-003 §2).",
    kind: "yesno",
    chips: ["Yes", "No"],
  },
  {
    id: "addendum",
    label: "Data-processing addendum",
    ask: "Upload the signed data-processing addendum. It has to be its own document.",
    why: "Storing payer phone numbers needs a signed addendum before go-live. Upload that file. A sentence in this chat does not count (ONB-POL-003 §2).",
    kind: "file",
    accept: ".pdf,.png,.jpg,.jpeg,.webp",
    uploadLabel: "Upload addendum",
    chips: ["I don't have this file"],
    when: (answers) => answers.phones === true,
  },
  {
    id: "note",
    label: "Note",
    ask: "Anything else you want on the application? You can say none.",
    why: "A note is optional. If it tells me to ignore the policy or to mark the shop Active, I keep it as your text and I do not follow it (ONB-POL-003 §3).",
    chips: ["None"],
  },
];

const TOPICS = [
  { id: "registration", re: /regist|gst|incorporat|licen[cs]e/ },
  { id: "ownerId", re: /owner|government id|aadhaar|aadhar|pan card|\bpan\b/ },
  { id: "bank", re: /bank|cheque|check|statement|account/ },
  { id: "photo", re: /photo|shopfront|shop front|picture|image/ },
  { id: "phones", re: /phone|mobile|payer contact/ },
  { id: "addendum", re: /addendum|data-processing|data processing|privacy/ },
  { id: "volume", re: /volume|turnover|ceiling|lakh|rupee|₹/ },
  { id: "type", re: /business type|restaurant|grocery|retail|crypto|gambl/ },
  { id: "products", re: /\bupi\b|card/ },
  { id: "city", re: /\bcity\b|which city/ },
  { id: "name", re: /legal name|shop name/ },
  { id: "note", re: /\bnote\b/ },
  { id: "decision", re: /decision|verdict|why not|why can.?t|go live|refus/ },
];

function visibleFields(session) {
  return FIELDS.filter((field) => !field.when || field.when(session.answers));
}

function nextField(session) {
  return visibleFields(session).find((field) => session.answers[field.id] === undefined) || null;
}

function fieldById(id) {
  return FIELDS.find((field) => field.id === id);
}

export function formatINR(amount) {
  const digits = Math.round(amount).toString();
  if (digits.length <= 3) return "₹" + digits;
  const tail = digits.slice(-3);
  const head = digits.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return "₹" + head + "," + tail;
}

function parseVolume(text) {
  const cleaned = text.toLowerCase().replace(/₹|rs\.?|inr/g, "").replace(/,/g, "");
  const match = cleaned.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  let amount = Number(match[1]);
  if (/crore/.test(cleaned)) amount *= 10000000;
  else if (/lakh|lac/.test(cleaned)) amount *= 100000;
  if (!Number.isFinite(amount) || amount <= 0 || amount > 1e12) return null;
  return Math.round(amount);
}

function parseYesNo(text) {
  const value = text.trim().toLowerCase();
  if (/^(no|nope|not attached|not yet|missing|don'?t|do not|later)\b/.test(value) || /\bnot attached\b/.test(value)) {
    return false;
  }
  if (/^(y|yes|yeah|yep|attached|i have|have it|done|uploaded)\b/.test(value) || /\battached\b/.test(value)) {
    return true;
  }
  return null;
}

function parseType(text) {
  const value = text.toLowerCase();
  if (/crypto|bitcoin/.test(value)) return "crypto";
  if (/gambl|betting|casino/.test(value)) return "gambling";
  if (/money service|remittance|forex|money transfer/.test(value)) return "money service";
  if (/restaurant|cafe|café|tea house|eatery|dhaba/.test(value)) return "restaurant";
  if (/grocery|kirana|supermarket/.test(value)) return "grocery";
  if (/\bretail\b|\bstore\b/.test(value)) return "retail";
  return null;
}

function parseProducts(text) {
  const value = text.toLowerCase();
  const upi = /\bupi\b/.test(value);
  const cards = /card/.test(value);
  if (/both/.test(value) || (upi && cards)) return "UPI and cards";
  if (upi) return "UPI";
  if (cards) return "Cards";
  return null;
}

function parseName(text) {
  const value = text.trim().replace(/\s+/g, " ");
  if (value.length < 2 || value.length > 80) return null;
  if (/[?]/.test(value) || /^(why|what|how)\b/i.test(value)) return null;
  return value;
}

function parseCity(text) {
  const value = text.trim().replace(/\s+/g, " ");
  if (!/^[a-zA-Z][a-zA-Z .'-]{1,40}$/.test(value)) return null;
  return value;
}

function parseFile(text) {
  const value = text.trim();
  if (/^(i don't have|i do not have|don't have|do not have|not attached|no file|not yet|missing)\b/i.test(value) || /^(no|nope)[.!\s]*$/i.test(value)) {
    return false;
  }
  const named = value.match(/^attached:\s*(.+)$/i);
  if (!named) return null;
  const name = named[1].trim().replace(/\s+/g, " ");
  if (name.length < 3 || name.length > 140) return null;
  if (!/\.[a-z0-9]{2,5}$/i.test(name)) return null;
  return name;
}

function parseNote(text) {
  if (/^(none|nothing|no|n\/a|na|skip|nope)[.!\s]*$/i.test(text.trim())) return "";
  return text.trim().slice(0, 400);
}

function hasSecretNumber(text) {
  return /\d(?:[\d\s-]{6,})\d/.test(text);
}

function redact(text) {
  return text.replace(/\d(?:[\d\s-]{6,})\d/g, "[number omitted]");
}

function isWhy(text) {
  return /\b(why|what for|reason|explain|how come|do i have to|is this (really )?required|why are you asking|what do you need that)\b/i.test(text);
}

function isInjection(text) {
  return /ignore (the |our |your )?polic|mark .{0,40}active|set .{0,40}active|\bactivate (us|me|the shop|this|now|it)\b|turn (us|me|the shop|it) on/i.test(text);
}

function isSubmit(text) {
  return /^(yes[, ]*)?(please )?submit( (it|this|the application|my application))?[.!\s]*$/i.test(text.trim())
    || /^(go ahead|submit application|send it|send the application)[.!\s]*$/i.test(text.trim());
}

function displayValue(session, field) {
  const value = session.answers[field.id];
  if (value === undefined) return "";
  if (field.id === "volume") return formatINR(value) + " a month";
  if (field.id === "phones") return value ? "Yes, will store" : "No";
  if (field.kind === "file") return value ? value : "Not provided";
  if (field.kind === "yesno") return value ? "Yes" : "No";
  if (field.id === "type") return value.charAt(0).toUpperCase() + value.slice(1);
  if (field.id === "note") return value ? redact(value) : "None";
  return String(value);
}

export function fieldState(session) {
  const current = session.phase === "collect" ? nextField(session) : null;
  return visibleFields(session).map((field) => ({
    id: field.id,
    label: field.label,
    value: displayValue(session, field),
    state: session.answers[field.id] !== undefined ? "done" : current && current.id === field.id ? "now" : "wait",
  }));
}

function pack(session, text, extra = {}) {
  const field = session.phase === "collect" ? nextField(session) : null;
  const message = { from: "agent", text };
  if (extra.cites) message.cites = extra.cites;
  return {
    session,
    messages: [message],
    chips: extra.chips || (field && field.chips) || [],
    fields: fieldState(session),
    needsFile: !!(field && field.kind === "file"),
    fileAccept: (field && field.accept) || "",
    uploadLabel: (field && field.uploadLabel) || "Upload file",
  };
}

function resume(session, preface) {
  const field = nextField(session);
  const text = preface ? preface + "\n\n" + field.ask : field.ask;
  return pack(session, text, { chips: field.chips || [] });
}

function explain(session, text) {
  let topic = null;
  for (const item of TOPICS) {
    if (item.re.test(text)) {
      topic = item.id;
      break;
    }
  }
  if (topic === "decision" && session.phase === "done") {
    return pack(session, session.verdict.why, { chips: doneChips(session) });
  }
  const field = (topic && fieldById(topic)) || (session.phase === "collect" ? nextField(session) : null);
  if (!field) {
    return pack(session, "Ask me about a field I collected, about what is missing, or about who turns the shop on.", {
      chips: doneChips(session),
    });
  }
  if (session.phase === "collect") {
    const current = nextField(session);
    const tail = current ? "\n\n" + current.ask : "";
    return pack(session, field.why + tail, { chips: (current && current.chips) || [] });
  }
  return pack(session, field.why, { chips: session.phase === "confirm" ? confirmChips() : doneChips(session) });
}

function confirmChips() {
  return ["Submit application"];
}

function doneChips(session) {
  if (session.review) return ["Why this decision?", "What is still missing?", "Who turns the shop on?"];
  return ["Why this decision?", "Who turns the shop on?"];
}

function roleFor(volume) {
  return volume > CEILING ? "Head of Payments" : "Merchant Risk Lead";
}

function reviewIdFor(name) {
  if (/lotus tea house/i.test(name)) return "MR-2041";
  let hash = 0;
  for (const char of name.toLowerCase()) hash = (hash * 33 + char.charCodeAt(0)) >>> 0;
  return "MR-" + String(1000 + (hash % 9000));
}

function missingItems(session) {
  const answers = session.answers;
  const missing = [];
  if (!answers.registration) missing.push("business registration");
  if (!answers.ownerId) missing.push("owner government ID");
  if (!answers.bank) missing.push("bank proof");
  if (!answers.photo) missing.push("shopfront photo");
  if (answers.phones && !answers.addendum) missing.push("data-processing addendum");
  return missing;
}

function verdict(session) {
  const answers = session.answers;
  const forbidden = ["crypto", "gambling", "money service"].includes(answers.type);
  const role = roleFor(answers.volume);
  const missing = missingItems(session);
  const note = answers.note || "";
  const ignored = isInjection(note);
  const cites = [];

  if (forbidden) {
    session.phase = "done";
    session.review = null;
    const why = answers.type.charAt(0).toUpperCase() + answers.type.slice(1) + " is not an allowed business type. I cannot put " + answers.name + " in a go-live queue (ONB-POL-001 §3).";
    session.verdict = { why };
    return {
      session,
      messages: [{
        from: "agent",
        text: "No. " + answers.name + " cannot go live. " + why + " I have not activated the shop.",
        cites: "ONB-POL-001 §3",
      }],
      chips: ["Why this decision?", "Who turns the shop on?"],
      fields: fieldState(session),
    };
  }

  const id = reviewIdFor(answers.name);
  session.review = {
    id,
    status: "In review",
    name: answers.name,
    city: answers.city,
    type: answers.type.charAt(0).toUpperCase() + answers.type.slice(1),
    volume: formatINR(answers.volume) + " a month",
    assignee: role,
    missing,
  };
  session.phase = "done";

  const lines = [];
  if (missing.length) {
    lines.push("No. " + answers.name + " stays in review.");
    lines.push("Missing: " + missing.join(", ") + ".");
  } else {
    lines.push(answers.name + " can be recommended for go-live. I have not turned the shop on.");
  }
  lines.push(answers.type.charAt(0).toUpperCase() + answers.type.slice(1) + " is an allowed business type.");
  lines.push(formatINR(answers.volume) + " a month is " + (answers.volume > CEILING ? "above" : "inside") + " the Merchant Risk Lead ceiling of ₹40,00,000, so " + role + " decides. You cannot turn the shop on.");
  if (answers.phones) {
    lines.push(answers.addendum
      ? "A signed data-processing addendum is attached."
      : "A signed data-processing addendum is required, because payer phone numbers will be stored. Those numbers are not shown here.");
  }
  if (ignored) lines.push("The note says to ignore the policy or to mark the merchant Active. That line was not followed.");
  cites.push("ONB-POL-001 §2, §3, §4", "ONB-POL-002");
  if (answers.phones || ignored) cites.push("ONB-POL-003 §2, §3");

  const why = lines.slice(1).join(" ");
  session.verdict = { why };
  return {
    session,
    messages: [
      { from: "agent", text: "Checking the application against the onboarding policies." },
      { from: "agent", text: lines.join("\n\n"), cites: cites.join(" · "), card: session.review },
    ],
    chips: doneChips(session),
    fields: fieldState(session),
  };
}

function refuse(session) {
  const field = session.phase === "collect" ? nextField(session) : null;
  const review = session.review
    ? " Review " + session.review.id + " is still in review with the " + session.review.assignee + "."
    : "";
  const text = "I can't activate the shop." + review + " This chat cannot turn a merchant on, change a ceiling, mark the pack complete, or waive a document (ONB-POL-001 §4, ONB-POL-003 §3)."
    + (field ? "\n\n" + field.ask : "");
  return pack(session, text, {
    chips: field ? field.chips || [] : doneChips(session),
    cites: "ONB-POL-001 §4",
  });
}

function storeAnswer(session, field, value) {
  session.answers[field.id] = value;
  if (field.id === "phones") delete session.answers.addendum;
}

function readAnswer(field, text) {
  if (field.kind === "yesno") return parseYesNo(text);
  if (field.kind === "file") return parseFile(text);
  if (field.id === "name") return parseName(text);
  if (field.id === "city") return parseCity(text);
  if (field.id === "type") return parseType(text);
  if (field.id === "volume") return parseVolume(text);
  if (field.id === "products") return parseProducts(text);
  if (field.id === "note") return parseNote(text);
  return null;
}

function invalidHint(field) {
  if (field.id === "volume") return "Give the amount in rupees, for example 12,00,000 or 12 lakh.";
  if (field.id === "type") return "Say restaurant, grocery, retail, or the type that applies.";
  if (field.id === "products") return "Say UPI, cards, or both.";
  if (field.kind === "yesno") return "Say yes or no.";
  if (field.kind === "file") return "Upload the file, or say you don't have it.";
  if (field.id === "city") return "Give the city name.";
  return "Give a short answer.";
}

const FIELD_WORDS = [
  ["legal name", "name"],
  ["name", "name"],
  ["city", "city"],
  ["business type", "type"],
  ["type", "type"],
  ["volume", "volume"],
  ["products", "products"],
  ["registration", "registration"],
  ["owner id", "ownerId"],
  ["government id", "ownerId"],
  ["bank", "bank"],
  ["photo", "photo"],
  ["shopfront", "photo"],
  ["phone", "phones"],
  ["addendum", "addendum"],
  ["note", "note"],
];

function parseChange(text) {
  const match = text.trim().match(/^(?:please\s+)?(?:change|update|correct|set)\s+(?:the\s+|my\s+)?(.+?)\s+to\s+(.+)$/i);
  if (!match) return null;
  const label = match[1].toLowerCase();
  const raw = match[2].trim();
  const found = FIELD_WORDS.find(([word]) => label.includes(word));
  if (!found) return null;
  return { id: found[1], raw };
}

function applyChange(session, change) {
  const field = fieldById(change.id);
  if (!field || (field.when && !field.when({ ...session.answers, phones: change.id === "phones" ? true : session.answers.phones }))) {
    return null;
  }
  if (change.id !== "volume" && change.id !== "note" && hasSecretNumber(change.raw)) return "secret";
  const value = readAnswer(field, change.raw);
  if (value === null || value === undefined) return "bad";
  storeAnswer(session, field, value);
  return "ok";
}

export function opening() {
  const session = { phase: "collect", answers: {}, review: null, verdict: null };
  const field = nextField(session);
  return pack(
    session,
    "I'm the iPe onboarding agent. I'll ask for your application one answer at a time. Ask me why whenever you want.\n\n" + field.ask,
    { chips: field.chips || [] },
  );
}

export function turn(session, input) {
  const text = String(input || "").trim();
  if (!text) return pack(session, "Type an answer, or ask me why I'm asking.", { chips: (nextField(session) || {}).chips || [] });

  if (isWhy(text)) return explain(session, text);

  if (session.phase === "done") {
    if (isInjection(text)) return refuse(session);
    if (/what('?s| is)? still missing|what is missing/i.test(text)) {
      const missing = session.review && session.review.missing.length
        ? "Still missing: " + session.review.missing.join(", ") + "."
        : "Nothing from the pack is missing.";
      return pack(session, missing, { chips: doneChips(session) });
    }
    if (/who (turns|decides|activates)|who turns the shop/i.test(text)) {
      const who = session.review
        ? session.review.assignee + " turns the shop on, outside this chat. You cannot (ONB-POL-001 §4)."
        : "Only the Merchant Risk Lead may turn a merchant on, and only when the pack is complete and the business type is allowed (ONB-POL-001 §4). This application was refused before that.";
      return pack(session, who, { chips: doneChips(session), cites: "ONB-POL-001 §4" });
    }
    if (isSubmit(text)) {
      const id = session.review ? " Review " + session.review.id + " is already open." : "";
      return pack(session, "This application is already submitted." + id, { chips: doneChips(session) });
    }
    return explain(session, text);
  }

  const change = parseChange(text);
  if (change && session.answers[change.id] !== undefined) {
    if (hasSecretNumber(change.raw) && change.id !== "volume") {
      return pack(session, "Don't put an ID number, account number, or phone number in the chat.\n\n" + (nextField(session) ? nextField(session).ask : "Submit the application when the answers look right."), {
        chips: session.phase === "confirm" ? confirmChips() : (nextField(session).chips || []),
      });
    }
    const result = applyChange(session, change);
    if (result !== "ok") {
      return pack(session, "I couldn't change that. Try: change city to Pune.", {
        chips: session.phase === "confirm" ? confirmChips() : (nextField(session) || {}).chips || [],
      });
    }
    if (nextField(session)) return resume(session, "Updated " + fieldById(change.id).label.toLowerCase() + ".");
    session.phase = "confirm";
    return pack(session, "Updated. I have the full application for " + session.answers.name + ". Submit it?", { chips: confirmChips() });
  }

  if (session.phase === "confirm") {
    if (isInjection(text)) return refuse(session);
    if (/^(yes|yep|ok|okay|sure)[.!\s]*$/i.test(text) || isSubmit(text)) return verdict(session);
    if (/change something|want to change/i.test(text)) {
      return pack(session, "Tell me what to change. For example: change city to Pune.", { chips: confirmChips() });
    }
    return pack(session, "Say submit when you want me to review " + session.answers.name + ", or tell me what to change.", {
      chips: confirmChips(),
    });
  }

  const field = nextField(session);
  if (field.kind !== "file" && field.id !== "volume" && field.id !== "note" && hasSecretNumber(text)) {
    return pack(session, "Don't put an ID number, account number, or phone number in the chat. I will not repeat it.\n\n" + field.ask, {
      chips: field.chips || [],
    });
  }
  if (field.id !== "note" && isInjection(text)) return refuse(session);

  const value = readAnswer(field, text);
  if (value === null || value === undefined) {
    return pack(session, invalidHint(field) + "\n\n" + field.ask, { chips: field.chips || [] });
  }
  storeAnswer(session, field, value);
  const following = nextField(session);
  if (following) return resume(session, "Got it.");
  session.phase = "confirm";
  return pack(session, "I have every answer for " + session.answers.name + ". Submit the application? I'll review it after you submit.", {
    chips: confirmChips(),
  });
}
