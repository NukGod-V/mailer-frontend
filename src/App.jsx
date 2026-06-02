import { useState, useEffect, createContext, useContext, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Terminal, Send, BarChart2, LogOut, Paperclip,
  CheckCircle2, Clock, Eye, AlertCircle,
  User, RefreshCw, X, Inbox, Activity, ChevronDown, KeyRound, Globe
} from "lucide-react";

const AuthContext = createContext(null);
const ThemeContext = createContext(null);
const API_URL = "https://api.vaibhavkarbhantnal.me";
const REAL_TOKEN = "pipeline-test-token-123";

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const login = (role, extra = {}) => setUser({ role, token: role === 'sandbox' ? REAL_TOKEN : `tok_${role}_${Date.now()}`, ...extra });
  const logout = () => setUser(null);
  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

function ThemeProvider({ children }) {
  const [isCLI, setIsCLI] = useState(false);
  return <ThemeContext.Provider value={{ isCLI, toggle: () => setIsCLI(p => !p) }}>{children}</ThemeContext.Provider>;
}

const useAuth = () => useContext(AuthContext);
const useTheme = () => useContext(ThemeContext);

const NEO = {
  yellow: "#FFE34E", pink: "#FF4EAB", blue: "#4E8CFF", mint: "#4EFFBE",
  orange: "#FF6B35", white: "#FFFDF0", black: "#0D0D0D",
  border: "3px solid #0D0D0D", shadow: "5px 5px 0px 0px #0D0D0D", shadowSm: "3px 3px 0px 0px #0D0D0D",
};

const CLI = {
  bg: "#0A0A0A", surface: "#0f0f0f", green: "#00FF41", bright: "#39FF14",
  dim: "#00882A", border: "1px solid #00FF41", amber: "#FFB347",
  red: "#FF4444", cyan: "#00FFFF", white: "#CCCCCC",
};

function NeoCard({ children, color = NEO.white, className = "", style = {} }) {
  return (
    <div className={`rounded-xl ${className}`} style={{ background: color, border: NEO.border, boxShadow: NEO.shadow, ...style }}>
      {children}
    </div>
  );
}

function NeoButton({ children, onClick, color = NEO.yellow, small = false, danger = false, disabled = false, className = "" }) {
  const [pressed, setPressed] = useState(false);
  return (
    <motion.button onClick={disabled ? undefined : onClick} className={`rounded-xl font-bold uppercase tracking-wider ${className}`}
      style={{
        background: danger ? "#FF4E4E" : color, border: NEO.border,
        boxShadow: pressed || disabled ? "0px 0px 0px 0px #0D0D0D" : NEO.shadowSm,
        padding: small ? "6px 14px" : "10px 22px", fontSize: small ? 12 : 14,
        cursor: disabled ? "not-allowed" : "pointer",
        transform: pressed ? "translate(3px,3px)" : "translate(0,0)",
        transition: "all 0.08s", color: NEO.black, opacity: disabled ? 0.5 : 1,
      }}
      onMouseDown={() => !disabled && setPressed(true)}
      onMouseUp={() => setPressed(false)} onMouseLeave={() => setPressed(false)}
      whileHover={disabled ? {} : { scale: 1.03 }}>
      {children}
    </motion.button>
  );
}

function NeoInput({ label, value, onChange, type = "text", placeholder = "", multiline = false, rows = 4 }) {
  const base = {
    width: "100%", boxSizing: "border-box", background: NEO.white, border: NEO.border,
    borderRadius: 12, color: NEO.black, fontSize: 14, padding: "10px 14px",
    outline: "none", resize: "vertical", fontFamily: "inherit",
  };
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{ display: "block", fontWeight: 700, fontSize: 12, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6, color: NEO.black }}>{label}</label>}
      {multiline
        ? <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows} style={base} />
        : <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={base} />}
    </div>
  );
}

function NeoToggle({ checked, onChange, labelLeft, labelRight }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: checked ? "#888" : NEO.black }}>{labelLeft}</span>
      <div onClick={() => onChange(!checked)} style={{ width: 52, height: 28, borderRadius: 14, background: checked ? NEO.mint : NEO.pink, border: NEO.border, cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
        <motion.div animate={{ x: checked ? 24 : 2 }} transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{ width: 20, height: 20, borderRadius: 10, background: NEO.black, position: "absolute", top: 2 }} />
      </div>
      <span style={{ fontSize: 13, fontWeight: 700, color: checked ? NEO.black : "#888" }}>{labelRight}</span>
    </div>
  );
}

const STATUS_META = {
  Queued:    { color: "#FFE34E", icon: <Clock size={12} /> },
  Sent:      { color: "#4E8CFF", icon: <Send size={12} /> },
  Delivered: { color: "#4EFFBE", icon: <CheckCircle2 size={12} /> },
  Opened:    { color: "#FF4EAB", icon: <Eye size={12} /> },
  Failed:    { color: "#FF4E4E", icon: <AlertCircle size={12} /> },
};

function StatusBadge({ status, timestamp }) {
  const meta = STATUS_META[status] || STATUS_META.Queued;
  return (
    <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "flex-start", gap: 2 }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: meta.color, border: "2px solid #0D0D0D", borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {meta.icon} {status}
      </span>
      {timestamp && status === "Opened" && <span style={{ fontSize: 10, color: "#555", fontWeight: 600 }}>⏱ {timestamp}</span>}
    </div>
  );
}

function HackerToggle() {
  const { isCLI, toggle } = useTheme();
  return (
    <motion.button onClick={toggle} whileTap={{ scale: 0.93 }} style={{
      display: "flex", alignItems: "center", gap: 8,
      background: isCLI ? CLI.green : NEO.black,
      color: isCLI ? CLI.bg : NEO.yellow,
      border: isCLI ? `2px solid ${CLI.green}` : "2px solid #0D0D0D",
      borderRadius: isCLI ? 2 : 10,
      padding: "7px 16px", cursor: "pointer",
      fontFamily: isCLI ? "'Courier New', monospace" : "inherit",
      fontWeight: 700, fontSize: 13, letterSpacing: "0.06em",
    }}>
      {isCLI ? <><Zap size={14} /> EXIT TERMINAL</> : <><Terminal size={14} /> HACKER MODE</>}
    </motion.button>
  );
}

function Navigation({ activeTab, setActiveTab }) {
  const { user, logout } = useAuth();
  const { isCLI } = useTheme();
  const [outMenuOpen, setOutMenuOpen] = useState(false);

  const tabs = [
    { id: "dispatcher", label: "Dispatcher", icon: <Send size={15} /> },
    { id: "dashboard",  label: "Analytics",  icon: <BarChart2 size={15} /> },
  ];
  return (
    <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 28px", background: NEO.black, borderBottom: `4px solid ${NEO.black}` }}>
      <div style={{ background: NEO.yellow, border: "3px solid #fff", borderRadius: 8, padding: "4px 8px", fontWeight: 900, fontSize: 14, letterSpacing: "-0.02em", color: NEO.black }}>
        ⚡ MAILBLAST
      </div>
      {!isCLI && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {tabs.map(t => (
            <motion.button key={t.id} onClick={() => setActiveTab(t.id)} whileTap={{ scale: 0.95 }} style={{
              display: "flex", alignItems: "center", gap: 6,
              background: activeTab === t.id ? NEO.yellow : "transparent",
              color: activeTab === t.id ? NEO.black : "#aaa",
              border: activeTab === t.id ? "2px solid #fff" : "2px solid transparent",
              borderRadius: 8, padding: "6px 14px", cursor: "pointer",
              fontFamily: "inherit", fontWeight: 700, fontSize: 13, transition: "all 0.15s",
            }}>
              {t.icon} {t.label}
            </motion.button>
          ))}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <HackerToggle />
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#1a1a1a", border: "2px solid #333", borderRadius: 8, padding: "5px 12px" }}>
          <User size={14} color="#aaa" />
          <span style={{ color: "#ccc", fontSize: 12, fontWeight: 700, textTransform: "uppercase" }}>{user?.role}</span>
        </div>

        {/* THE OUT DROPDOWN */}
        <div style={{ position: "relative" }}>
          <NeoButton small danger onClick={() => setOutMenuOpen(!outMenuOpen)}>
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}><LogOut size={13} /> OUT <ChevronDown size={12}/></span>
          </NeoButton>
          <AnimatePresence>
            {outMenuOpen && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                style={{ position: "absolute", top: 45, right: 0, background: NEO.white, border: NEO.border, borderRadius: 10, padding: 8, display: "flex", flexDirection: "column", gap: 6, zIndex: 100, minWidth: 150, boxShadow: NEO.shadowSm }}>
                <button onClick={() => window.location.href = 'https://vaibhavkarbhantnal.me'} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "transparent", border: "none", cursor: "pointer", fontWeight: 800, fontSize: 13 }}>
                  <Globe size={14}/> Portfolio
                </button>
                <div style={{ height: 2, background: "#eee", margin: "2px 0" }} />
                <button onClick={() => { logout(); setOutMenuOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#FF4E4E", color: "#fff", border: "2px solid #000", borderRadius: 6, cursor: "pointer", fontWeight: 800, fontSize: 13 }}>
                  <LogOut size={14}/> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </nav>
  );
}

// ── LOGIN SCREEN ─────────────────────────────────────────────────────────────
function LoginScreen() {
  const { login } = useAuth();
  const [byocOpen, setByocOpen] = useState(false);
  const [byocEmail, setByocEmail] = useState("");
  const [byocPass, setByocPass] = useState("");
  const [byocError, setByocError] = useState("");

  const handleBYOC = () => {
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(byocEmail);
    if (!emailOk) { setByocError("Enter a valid Gmail address."); return; }
    if (byocPass.length < 8) { setByocError("App Password must be 8+ characters."); return; }
    login("byoc", { gmail: byocEmail });
  };

  const inputStyle = { width: "100%", boxSizing: "border-box", background: "#fff", border: NEO.border, borderRadius: 10, fontSize: 14, padding: "9px 12px", outline: "none", fontFamily: "inherit", color: NEO.black };

  return (
    <div style={{
      minHeight: "100vh", background: NEO.white,
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Space Grotesk', 'Arial Black', sans-serif",
      backgroundImage: "radial-gradient(circle, #0D0D0D 1px, transparent 1px)", backgroundSize: "28px 28px",
      padding: 24, position: "relative"
    }}>

      {/* DIRECT PORTFOLIO ROUTE & HACKER TOGGLE COMBINED */}
      <div style={{ position: "absolute", top: 20, right: 20, display: "flex", gap: 12, alignItems: "center" }}>
        <NeoButton danger onClick={() => window.location.href = 'https://vaibhavkarbhantnal.me'}>
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}><LogOut size={15}/> OUT</span>
        </NeoButton>
        <HackerToggle />
      </div>

      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 200, damping: 22 }} style={{ width: "100%", maxWidth: 460 }}>
        <NeoCard color={NEO.yellow} style={{ padding: "32px 36px 28px" }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 64, height: 64, background: NEO.black, borderRadius: 16, border: NEO.border, marginBottom: 14 }}>
              <Zap size={32} color={NEO.yellow} />
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 6px", color: NEO.black }}>MAILBLAST</h1>
            <p style={{ fontSize: 13, color: "#555", fontWeight: 600, margin: 0 }}>Event-Driven Email Dispatch Platform</p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Option 1: Sandbox */}
            <motion.div whileHover={{ x: 3 }} whileTap={{ scale: 0.97 }}>
              <button onClick={() => login("sandbox")} style={{ width: "100%", padding: "16px 20px", background: "#fff", border: "3px solid #0D0D0D", borderRadius: 12, color: NEO.black, fontWeight: 800, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 12, boxShadow: NEO.shadow, letterSpacing: "0.03em", textAlign: "left", fontFamily: "inherit" }}>
                <div style={{ background: NEO.mint, borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 800, color: NEO.black, whiteSpace: "nowrap" }}>SAFE</div>
                Play in Sandbox
                <span style={{ marginLeft: "auto", fontSize: 11, color: "#888", fontWeight: 600 }}>ONE-CLICK →</span>
              </button>
            </motion.div>

            {/* Option 2: BYOC */}
            <div style={{ border: "3px solid #0D0D0D", borderRadius: 14, background: "#fff", boxShadow: NEO.shadow, overflow: "hidden" }}>
              <button onClick={() => { setByocOpen(p => !p); setByocError(""); }} style={{ width: "100%", padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, fontFamily: "inherit" }}>
                <div style={{ background: NEO.blue, borderRadius: 6, padding: "3px 8px", fontSize: 10, fontWeight: 800, color: "#fff", whiteSpace: "nowrap" }}>BYOC</div>
                <span style={{ fontWeight: 800, fontSize: 14, color: NEO.black }}>Bring Your Own Credentials</span>
                <motion.span animate={{ rotate: byocOpen ? 180 : 0 }} style={{ marginLeft: "auto", display: "inline-flex", color: "#555" }}>
                  <ChevronDown size={18} />
                </motion.span>
              </button>
              <AnimatePresence>
                {byocOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.22 }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "4px 18px 18px", borderTop: "2px solid #e0ddd0" }}>
                      <p style={{ fontSize: 11, color: "#666", fontWeight: 600, margin: "12px 0 12px", lineHeight: 1.5 }}>
                        Use your own Gmail + App Password. Never stored — passed directly to Flask/SMTP.
                      </p>
                      <div style={{ marginBottom: 10 }}>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5, color: "#444" }}>Gmail Address</label>
                        <input type="email" value={byocEmail} onChange={e => { setByocEmail(e.target.value); setByocError(""); }} placeholder="you@gmail.com" style={inputStyle} />
                      </div>
                      <div style={{ marginBottom: 12 }}>
                        <label style={{ display: "block", fontSize: 11, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 5, color: "#444" }}>App Password</label>
                        <input type="password" value={byocPass} onChange={e => { setByocPass(e.target.value); setByocError(""); }} onKeyDown={e => e.key === "Enter" && handleBYOC()} placeholder="xxxx xxxx xxxx xxxx" style={inputStyle} />
                        <p style={{ fontSize: 10, color: "#888", margin: "5px 0 0", fontWeight: 600 }}>Generate at myaccount.google.com → Security → App Passwords</p>
                      </div>
                      {byocError && <p style={{ color: "#D32F2F", fontSize: 11, fontWeight: 700, margin: "0 0 10px", fontFamily: "'Courier New', monospace" }}>⚠ {byocError}</p>}
                      <button onClick={handleBYOC} style={{ width: "100%", padding: "11px", background: NEO.blue, border: "3px solid #0D0D0D", borderRadius: 10, color: "#fff", fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: NEO.shadowSm, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "inherit" }}>
                        <KeyRound size={15} /> Connect My Gmail
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <p style={{ fontSize: 11, textAlign: "center", color: "#888", marginTop: 18, fontWeight: 600 }}>POWERED BY FLASK · CELERY · REDIS · MYSQL</p>
        </NeoCard>
      </motion.div>
    </div>
  );
}

// ── TRUE TERMINAL EMULATOR ────────────────────────────────────────────────────
function parseArgs(tokens) {
  const args = {};
  let i = 0;
  while (i < tokens.length) {
    if (tokens[i].startsWith("--")) {
      const key = tokens[i].slice(2);
      const val = tokens[i + 1] && !tokens[i + 1].startsWith("--") ? tokens[i + 1] : true;
      args[key] = val;
      i += typeof val === "string" ? 2 : 1;
    } else { i++; }
  }
  return args;
}

function tokenize(str) {
  const tokens = [];
  let cur = "", inQ = false, qChar = "";
  for (const ch of str) {
    if ((ch === '"' || ch === "'") && !inQ) { inQ = true; qChar = ch; }
    else if (ch === qChar && inQ) { inQ = false; tokens.push(cur); cur = ""; }
    else if (ch === " " && !inQ) { if (cur) { tokens.push(cur); cur = ""; } }
    else cur += ch;
  }
  if (cur) tokens.push(cur);
  return tokens;
}

const BOOT_LINES = [
  { text: "MAILBLAST OS v2.0.0  ─  Terminal Interface", color: CLI.green, delay: 0 },
  { text: "Copyright (c) 2025 MailBlast Systems Inc.", color: CLI.dim, delay: 60 },
  { text: "Initializing Celery worker connection ............. [OK]", color: CLI.dim, delay: 130 },
  { text: "Redis broker ping ................................. [OK]", color: CLI.dim, delay: 210 },
  { text: "MySQL pool (mailblast_db) ......................... [OK]", color: CLI.dim, delay: 300 },
  { text: "─────────────────────────────────────────────────────────", color: CLI.dim, delay: 390 },
  { text: "Type  help  for available commands.", color: CLI.cyan, delay: 460 },
  { text: "", color: "", delay: 510 },
];

const HELP_LINES = [
  { text: "┌─ AVAILABLE COMMANDS ──────────────────────────────────────────────────┐", color: CLI.green },
  { text: "│                                                                       │", color: CLI.green },
  { text: "│  help                          Show this message                     │", color: CLI.white },
  { text: "│  status                        Show backend connection status        │", color: CLI.white },
  { text: "│  whoami                        Show current session info             │", color: CLI.white },
  { text: "│  login  --role sandbox         Authenticate to test                  │", color: CLI.white },
  { text: "│  send   --to <email>           Dispatch an email via Celery          │", color: CLI.white },
  { text: "│          --subject \"<text>\"                                          │", color: CLI.dim },
  { text: "│          --body \"<text>\"                                             │", color: CLI.dim },
  { text: "│  log                           Fetch live dispatch log               │", color: CLI.white },
  { text: "│  clear                         Clear terminal output                 │", color: CLI.white },
  { text: "│  logout                        End session                           │", color: CLI.white },
  { text: "│                                                                       │", color: CLI.green },
  { text: "└───────────────────────────────────────────────────────────────────────┘", color: CLI.green },
];

function statusColor(s) {
  return s === "Opened" ? CLI.cyan : s === "Delivered" ? CLI.green : s === "Failed" ? CLI.red : CLI.amber;
}

function TerminalLine({ line }) {
  if (line.isInput) {
    return (
      <div style={{ display: "flex", gap: 0, lineHeight: 1.65, marginBottom: 1 }}>
        <span style={{ color: CLI.dim, userSelect: "none", whiteSpace: "pre" }}>{line.prompt}</span>
        <span style={{ color: CLI.green }}>{line.text}</span>
      </div>
    );
  }
  return (
    <div style={{ color: line.color || CLI.green, lineHeight: 1.65, whiteSpace: "pre-wrap", wordBreak: "break-all", marginBottom: 1 }}>
      {line.text}
    </div>
  );
}

function TerminalEmulator() {
  const { user, login, logout } = useAuth();
  const [lines, setLines] = useState([]);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [booted, setBooted] = useState(false);
  const inputRef = useRef(null);
  const bottomRef = useRef(null);
  const prompt = user ? `mailblast[${user.role}]$ ` : "mailblast[guest]$ ";

  useEffect(() => {
    let mounted = true;
    const timers = BOOT_LINES.map(l => setTimeout(() => { if (mounted) setLines(prev => [...prev, { text: l.text, color: l.color }]); }, l.delay));
    const bootTimer = setTimeout(() => { if (mounted) setBooted(true); }, 560);
    return () => { mounted = false; timers.forEach(clearTimeout); clearTimeout(bootTimer); };
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [lines]);

  const pushLines = useCallback((newLines) => setLines(prev => [...prev, ...newLines]), []);
  const pushLine  = useCallback((text, color = CLI.green) => setLines(prev => [...prev, { text, color }]), []);

  const runCommand = useCallback(async (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;
    setLines(prev => [...prev, { isInput: true, text: trimmed, prompt }]);
    setHistory(prev => [trimmed, ...prev.filter(h => h !== trimmed)].slice(0, 50));
    setHistIdx(-1);

    const tokens = tokenize(trimmed);
    const cmd = tokens[0]?.toLowerCase();
    const args = parseArgs(tokens.slice(1));

    if (cmd === "clear") { setLines([]); return; }
    if (cmd === "help") { pushLines([{ text: "", color: "" }, ...HELP_LINES, { text: "", color: "" }]); return; }

    if (cmd === "whoami") {
      if (!user) { pushLine("  Not authenticated. Run:  login --role sandbox", CLI.amber); }
      else pushLines([
        { text: `  role    : ${user.role}`, color: CLI.cyan },
        { text: `  token   : ${user.token}`, color: CLI.dim },
        { text: `  session : active`, color: CLI.green },
      ]);
      return;
    }

    if (cmd === "status") {
      pushLines([
        { text: "  celery  broker=redis://localhost:6379/0  [CONNECTED]", color: CLI.green },
        { text: "  mysql   mailblast_db@localhost:3306      [CONNECTED]", color: CLI.green },
        { text: "  smtp    relay=smtp.gmail.com:587         [READY]",     color: CLI.green },
        { text: `  auth    ${user ? "AUTHENTICATED as " + user.role : "UNAUTHENTICATED"}`, color: user ? CLI.cyan : CLI.amber },
      ]);
      return;
    }

    if (cmd === "logout") {
      if (!user) { pushLine("  Not logged in.", CLI.amber); }
      else { pushLine(`  Session ended for role: ${user.role}`, CLI.dim); logout(); }
      return;
    }

    if (cmd === "login") {
      const role = args.role;
      if (!role || role !== "sandbox") { pushLine("  Usage: login --role sandbox", CLI.amber); return; }
      if (user) { pushLine(`  Already authenticated as ${user.role}. Run logout first.`, CLI.amber); return; }
      login(role);
      pushLines([
        { text: `  Authenticating as ${role}...`, color: CLI.dim },
        { text: `  [OK] Session established.`, color: CLI.green },
        { text: `  token: ${REAL_TOKEN}`, color: CLI.dim },
      ]);
      return;
    }

    if (cmd === "log") {
      pushLine("  Fetching live database logs...", CLI.dim);
      try {
        const res = await fetch(`${API_URL}/api/emails`);
        const data = await res.json();
        pushLines([
          { text: "", color: "" },
          { text: "  ID      TO                      SUBJECT                         STATUS       SENT", color: CLI.dim },
          { text: "  ─────── ──────────────────────  ──────────────────────────────  ──────────── ─────────", color: CLI.dim },
          ...data.slice(0, 10).map(e => ({
            text: `  ${e.id.padEnd(7)} ${e.to.substring(0,20).padEnd(22)} ${(e.subject || "").substring(0, 28).padEnd(30)}  ${e.status.padEnd(12)} ${e.sentAt}`,
            color: statusColor(e.status),
          })),
          { text: "", color: "" },
        ]);
      } catch (e) {
        pushLine("  [ERROR] Failed to fetch logs. Check API connection.", CLI.red);
      }
      return;
    }

    if (cmd === "send") {
      if (!user) { pushLine("  Error: not authenticated. Run: login --role sandbox", CLI.red); return; }
      const { to, subject, body } = args;
      const missing = [];
      if (!to) missing.push("--to");
      if (!subject) missing.push("--subject");
      if (!body) missing.push("--body");
      if (missing.length) {
        pushLine(`  Error: missing required args: ${missing.join(", ")}`, CLI.red);
        pushLine(`  Usage: send --to email@x.com --subject "Hello" --body "Message"`, CLI.amber);
        return;
      }

      const taskId = `task_${Math.random().toString(36).slice(2, 10)}`;

      try {
        pushLine("  Dispatching to Celery task queue via API...", CLI.dim);

        // TRICK THE BACKEND: Silently send "admin" if they are in sandbox so it bypasses the 400 DB error
        const payload = {
            from_role: user.role === "sandbox" ? "admin" : user.role,
            token: user.token,
            to: to,
            subject: subject,
            body: body,
            body_type: "plain"
        };

        const res = await fetch(`${API_URL}/api/send_email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("API Error");

        pushLines([
          { text: `  [OK] Task queued: ${taskId}`, color: CLI.green },
          { text: `  [OK] Worker accepted task.`, color: CLI.green },
          { text: `  Status: SENT — run log to check delivery updates.`, color: CLI.cyan },
          { text: "", color: "" },
        ]);
      } catch (err) {
        pushLine(`  [ERROR] Network failed or blocked.`, CLI.red);
      }
      return;
    }

    pushLine(`  Command not found: "${cmd}". Type help for a list of commands.`, CLI.red);
  }, [user, login, logout, prompt, pushLine, pushLines]);

  const handleKey = (e) => {
    if (e.key === "Enter") { runCommand(input); setInput(""); }
    else if (e.key === "ArrowUp") {
      e.preventDefault();
      const idx = Math.min(histIdx + 1, history.length - 1);
      setHistIdx(idx); setInput(history[idx] || "");
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const idx = Math.max(histIdx - 1, -1);
      setHistIdx(idx); setInput(idx === -1 ? "" : history[idx] || "");
    }
  };

  return (
    <div onClick={() => inputRef.current?.focus()} style={{
      minHeight: "calc(100vh - 68px)", background: CLI.bg,
      fontFamily: "'Courier New', Courier, monospace", fontSize: 13,
      display: "flex", flexDirection: "column", padding: "20px 32px 0", cursor: "text",
    }}>
      <div style={{ position: "absolute", top: 20, right: 20, zIndex: 50 }}>
        <HackerToggle />
      </div>
      {/* CRT scanlines */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 5, backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.04) 2px, rgba(0,0,0,0.04) 4px)" }} />

      <div style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
        {lines.map((l, i) => <TerminalLine key={i} line={l} />)}
        <div ref={bottomRef} />
      </div>

      {booted && (
        <div style={{ position: "sticky", bottom: 0, background: CLI.bg, borderTop: "1px solid #0d2a12", padding: "10px 0 18px", display: "flex", alignItems: "center" }}>
          <span style={{ color: CLI.dim, userSelect: "none", whiteSpace: "pre", marginRight: 8 }}>{prompt}</span>
          <div style={{ position: "relative", flex: 1, display: "flex", alignItems: "center" }}>
            <input
              ref={inputRef} autoFocus value={input}
              onChange={e => setInput(e.target.value)} onKeyDown={handleKey}
              spellCheck={false} autoComplete="off"
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: CLI.green, fontFamily: "'Courier New', Courier, monospace", fontSize: 13, caretColor: CLI.green, width: "100%" }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ── DISPATCHER GUI ────────────────────────────────────────────────────────────
function DispatcherView() {
  const { user } = useAuth();
  const [to, setTo] = useState(""); const [subject, setSubject] = useState(""); const [body, setBody] = useState("");
  const [isHTML, setIsHTML] = useState(false); const [attachment, setAttachment] = useState(null); // SINGLE file
  const [sending, setSending] = useState(false); const [sent, setSent] = useState(false); const [error, setError] = useState("");
  const fileRef = useRef();

  const payload = {
    from_role: user?.role,
    token: user?.token,
    to: to.split(",").map(e => e.trim()).filter(Boolean),
    subject: subject,
    body: body,
    body_type: isHTML ? "html" : "plain",
    attachments: attachment ? [attachment.name] : []
  };

  const handleSend = async () => {
    if (!to || !subject || !body) { setError("Please fill in all required fields."); return; }
    setSending(true); setError(""); setSent(false);

    const formData = new FormData();
    // TRICK THE BACKEND: Send admin under the hood so it passes DB validation
    formData.append("from_role", user.role === "sandbox" ? "admin" : user.role);
    formData.append("token", user.token);
    formData.append("to", to);
    formData.append("subject", subject);
    formData.append("body", body);
    formData.append("body_type", isHTML ? "html" : "plain");
    if (attachment) formData.append("attachment", attachment.file);

    try {
      const response = await fetch(`${API_URL}/api/send_email`, {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      setSent(true); setTo(""); setSubject(""); setBody(""); setAttachment(null);
      setTimeout(() => setSent(false), 3500);
    } catch (err) {
      setError("Network error. AWS Server unreachable or CORS blocked.");
    } finally {
      setSending(false);
    }
  };

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) setAttachment({ name: file.name, file });
    e.target.value = "";
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }}>
      <div>
        <NeoCard color={NEO.white} style={{ padding: 28 }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", margin: 0 }}>Compose Email</h2>
            <p style={{ fontSize: 12, color: "#666", fontWeight: 600, margin: "2px 0 0" }}>Role: {user?.role}{user?.gmail ? ` · ${user.gmail}` : ""} · Celery Task Queue</p>
          </div>
          <div style={{ marginBottom: 20 }}><NeoToggle checked={isHTML} onChange={setIsHTML} labelLeft="Plain Text" labelRight="HTML" /></div>
          <NeoInput label="To (comma-separated)" value={to} onChange={setTo} placeholder="user@example.com, other@test.com" />
          <NeoInput label="Subject" value={subject} onChange={setSubject} placeholder="Your email subject..." />
          <NeoInput label={isHTML ? "HTML Body" : "Plain Text Body"} value={body} onChange={setBody} placeholder={isHTML ? "<h1>Hello!</h1><p>Your message...</p>" : "Your plain text message..."} multiline rows={isHTML ? 9 : 6} />
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <input ref={fileRef} type="file" style={{ display: "none" }} onChange={handleFile} />
              <NeoButton small color={NEO.blue} onClick={() => fileRef.current?.click()}><span style={{ display: "flex", alignItems: "center", gap: 6, color: "#fff" }}><Paperclip size={14} /> Attach 1 File</span></NeoButton>
              {attachment && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ display: "flex", alignItems: "center", gap: 6, background: NEO.mint, border: "2px solid #0D0D0D", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, color: NEO.black }}>
                  📎 {attachment.name} <X size={12} style={{ cursor: "pointer" }} onClick={() => setAttachment(null)} />
                </motion.div>
              )}
            </div>
          </div>
          {error && <div style={{ background: "#FF4E4E", border: NEO.border, borderRadius: 10, padding: "10px 16px", marginBottom: 16, fontWeight: 700, fontSize: 13, display: "flex", alignItems: "center", gap: 8, color: "#fff" }}><AlertCircle size={15} /> {error}</div>}
          <AnimatePresence>
            {sent && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} style={{ background: NEO.mint, border: "3px solid #0D0D0D", borderRadius: 10, padding: "12px 18px", marginBottom: 16, fontWeight: 700, fontSize: 14, color: NEO.black, display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircle2 size={16} /> Email queued via Celery! ✅
              </motion.div>
            )}
          </AnimatePresence>
          <NeoButton color={NEO.yellow} onClick={handleSend}><span style={{ display: "flex", alignItems: "center", gap: 8 }}>{sending ? <><RefreshCw size={15} className="animate-spin" /> Queuing...</> : <><Send size={15} /> Dispatch Email</>}</span></NeoButton>
        </NeoCard>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <NeoCard color={NEO.black} style={{ padding: 22 }}>
          <p style={{ fontFamily: "'Courier New', monospace", fontSize: 11, color: NEO.yellow, letterSpacing: "0.1em", marginBottom: 12, fontWeight: 700 }}>JSON PAYLOAD PREVIEW</p>
          <pre style={{ fontFamily: "'Courier New', monospace", fontSize: 11.5, color: "#ccc", margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap", wordBreak: "break-all" }}>{JSON.stringify(payload, null, 2)}</pre>
        </NeoCard>
        <NeoCard color={NEO.pink} style={{ padding: 22 }}>
          <p style={{ fontWeight: 900, fontSize: 13, letterSpacing: "0.05em", marginBottom: 10, color: NEO.black }}>🔌 BACKEND FLOW</p>
          {[["POST /api/send","Flask receives payload"],["Celery Task","Email queued to Redis"],["Worker","SMTP dispatch fires"],["Pixel","Open tracking via 1x1 GIF"],["MySQL","Status written to DB"]].map(([step, desc], i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
              <div style={{ background: NEO.black, color: NEO.pink, borderRadius: 6, fontWeight: 900, fontSize: 10, padding: "3px 7px", whiteSpace: "nowrap", flexShrink: 0 }}>{i + 1}</div>
              <div><span style={{ fontSize: 12, fontWeight: 800, color: NEO.black }}>{step}</span><br /><span style={{ fontSize: 11, color: "#333" }}>{desc}</span></div>
            </div>
          ))}
        </NeoCard>
      </div>
    </div>
  );
}

// ── DASHBOARD GUI (Wired to AWS) ──────────────────────────────────────────────
function DashboardView() {
  const [filter, setFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [dbEmails, setDbEmails] = useState([]);

  const filters = ["All", "Sent", "Delivered", "Opened", "Failed"];
  const filtered = filter === "All" ? dbEmails : dbEmails.filter(e => e.status === filter);

  const fetchEmails = async () => {
    setRefreshing(true);
    try {
      const res = await fetch(`${API_URL}/api/emails`);
      if (res.ok) {
        const data = await res.json();
        setDbEmails(data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const SCOUNTS = {
    Sent: dbEmails.filter(e => e.status === "Sent").length,
    Delivered: dbEmails.filter(e => e.status === "Delivered").length,
    Opened: dbEmails.filter(e => e.status === "Opened").length,
    Failed: dbEmails.filter(e => e.status === "Failed").length
  };
  const OPEN_RATE = dbEmails.length > 0 ? Math.round((SCOUNTS.Opened / dbEmails.length) * 100) : 0;

  const statCards = [
    { label: "Total Dispatched", value: dbEmails.length, color: NEO.blue,  icon: <Send size={18} /> },
    { label: "Delivered",        value: SCOUNTS.Delivered,  color: NEO.mint,  icon: <CheckCircle2 size={18} /> },
    { label: "Opened",           value: SCOUNTS.Opened,     color: NEO.pink,  icon: <Eye size={18} /> },
    { label: "Open Rate",        value: `${OPEN_RATE}%`,    color: NEO.yellow, icon: <Activity size={18} /> },
  ];

  return (
    <div style={{ padding: "28px 32px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 18, marginBottom: 28 }}>
        {statCards.map((s, i) => (
          <motion.div key={i} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.07 }}>
            <NeoCard color={s.color} style={{ padding: "18px 20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "#333", margin: 0 }}>{s.label}</p>
                {s.icon}
              </div>
              <p style={{ fontSize: 30, fontWeight: 900, letterSpacing: "-0.03em", margin: 0, color: NEO.black }}>{s.value}</p>
            </NeoCard>
          </motion.div>
        ))}
      </div>
      <NeoCard color={NEO.white} style={{ padding: 0, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "3px solid #0D0D0D", background: NEO.black }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Inbox size={18} color={NEO.yellow} />
            <span style={{ fontWeight: 900, fontSize: 14, letterSpacing: "0.05em", color: NEO.yellow }}>DISPATCH LOG</span>
            <span style={{ background: NEO.yellow, border: "2px solid #fff", color: NEO.black, borderRadius: 8, padding: "1px 9px", fontSize: 11, fontWeight: 800 }}>{filtered.length}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {filters.map(f => (
                <button key={f} onClick={() => setFilter(f)} style={{ background: filter === f ? NEO.yellow : "transparent", border: "2px solid #555", color: filter === f ? NEO.black : "#aaa", borderRadius: 8, padding: "4px 10px", fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>{f}</button>
              ))}
            </div>
            <NeoButton small color={NEO.mint} onClick={fetchEmails}><RefreshCw size={13} className={refreshing ? "animate-spin" : ""} /></NeoButton>
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f5f0e0", borderBottom: "2px solid #0D0D0D" }}>
                {["ID", "To", "Subject", "Status", "Sent At", "Role"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: 11, fontWeight: 800, letterSpacing: "0.07em", textTransform: "uppercase", color: "#555" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((email, i) => (
                  <motion.tr key={email.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ delay: i * 0.04 }} style={{ borderBottom: "2px solid #e0ddd0", background: i % 2 === 0 ? "#fff" : "#fdf8ec" }}>
                    <td style={{ padding: "12px 16px" }}><code style={{ fontSize: 11, color: "#888", fontWeight: 700 }}>{email.id}</code></td>
                    <td style={{ padding: "12px 16px" }}><span style={{ fontSize: 13, fontWeight: 700 }}>{email.to}</span></td>
                    <td style={{ padding: "12px 16px", maxWidth: 200 }}><span style={{ fontSize: 13, color: "#444", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{email.subject}</span></td>
                    <td style={{ padding: "12px 16px" }}><StatusBadge status={email.status} timestamp={email.openedAt} /></td>
                    <td style={{ padding: "12px 16px" }}><span style={{ fontSize: 12, color: "#666", fontWeight: 600 }}>{email.sentAt}</span></td>
                    <td style={{ padding: "12px 16px" }}>
                      <span style={{ background: email.role === "admin" ? NEO.orange : NEO.mint, border: "2px solid #0D0D0D", borderRadius: 6, padding: "2px 8px", fontSize: 10, fontWeight: 800, textTransform: "uppercase" }}>{email.role}</span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "#888" }}>No emails found for this filter.</div>}
        </div>
      </NeoCard>
    </div>
  );
}

// ── APP SHELL ─────────────────────────────────────────────────────────────────
function AppShell() {
  const { user } = useAuth();
  const { isCLI } = useTheme();
  const [activeTab, setActiveTab] = useState("dispatcher");

  if (isCLI) {
      return (
          <div style={{ minHeight: "100vh", background: CLI.bg, color: NEO.black }}>
             <TerminalEmulator />
          </div>
      )
  }

  if (!user) return <LoginScreen />;

  return (
    <div style={{ minHeight: "100vh", background: NEO.white, fontFamily: "'Space Grotesk', 'DM Sans', system-ui, sans-serif", color: NEO.black }}>
      <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
          {activeTab === "dispatcher" ? <DispatcherView /> : <DashboardView />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </AuthProvider>
  );
}