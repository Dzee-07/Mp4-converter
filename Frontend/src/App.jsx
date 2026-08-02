import React, { useState, useEffect, useRef } from "react";
import {
  History, User, Search, Download, X, Link2, Sun, Moon, Loader2,
  CheckCircle2, AlertCircle, WifiOff, Trash2, LogOut,
  Sparkles, ShieldOff, Play, Shield, Users as UsersIcon, CreditCard,
  ChevronRight, ArrowLeft, Crown, Clock
} from "lucide-react";

/* ---------------------------------------------------------
   API base — reads an env var under a real Vite build.
--------------------------------------------------------- */
function getApiBase() {
  return import.meta.env.VITE_API_BASE_URL || null;
}

/* ---------------------------------------------------------
   PLATFORM CONFIG
--------------------------------------------------------- */
const PLATFORMS = {
  youtube: {
    label: "YouTube",
    gradient: "from-red-600 via-red-500 to-white",
    ring: "focus:ring-red-500",
    watermark: false,
    icon: (c) => (
      <svg viewBox="0 0 24 24" width="20" height="20" fill={c}>
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.5v-7l6.3 3.5-6.3 3.5Z"/>
      </svg>
    ),
  },
  facebook: {
    label: "Facebook",
    gradient: "from-blue-600 via-blue-400 to-white",
    ring: "focus:ring-blue-500",
    watermark: false,
    icon: (c) => (
      <svg viewBox="0 0 24 24" width="20" height="20" fill={c}>
        <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.9h2.54V9.85c0-2.5 1.49-3.89 3.78-3.89 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.9h-2.34V22c4.78-.79 8.44-4.93 8.44-9.94Z"/>
      </svg>
    ),
  },
  tiktok: {
    label: "TikTok",
    gradient: "from-neutral-950 via-neutral-800 to-white",
    ring: "focus:ring-neutral-400",
    watermark: true,
    icon: (c) => (
      <svg viewBox="0 0 24 24" width="20" height="20" fill={c}>
        <path d="M16.6 5.82c-.9-.98-1.39-2.26-1.39-3.6h-3.1v13.9a2.8 2.8 0 1 1-2.3-2.75v-3.15A5.9 5.9 0 1 0 15.11 16.1V9.4a7.05 7.05 0 0 0 4.1 1.3V7.6c-1 0-2.02-.32-2.61-.98Z"/>
      </svg>
    ),
  },
  instagram: {
    label: "Instagram",
    gradient: "from-yellow-400 via-orange-500 to-red-600",
    ring: "focus:ring-orange-500",
    watermark: false,
    icon: (c) => (
      <svg viewBox="0 0 24 24" width="20" height="20" fill={c}>
        <path d="M12 2.2c3.2 0 3.6 0 4.85.07 1.17.05 2.2.26 2.99 1.05.8.8 1 1.82 1.06 2.99.06 1.25.07 1.65.07 4.85s0 3.6-.07 4.85c-.06 1.17-.26 2.2-1.06 2.99-.8.8-1.82 1-2.99 1.06-1.25.06-1.65.07-4.85.07s-3.6 0-4.85-.07c-1.17-.06-2.2-.26-2.99-1.06-.8-.8-1-1.82-1.06-2.99C3.04 15.6 3.03 15.2 3.03 12s0-3.6.07-4.85c.06-1.17.26-2.2 1.06-2.99.8-.8 1.82-1 2.99-1.06C8.4 3.03 8.8 3.02 12 3.02Zm0 1.8c-3.14 0-3.5 0-4.74.07-.98.04-1.5.2-1.86.34-.47.18-.8.4-1.15.75-.35.35-.57.68-.75 1.15-.14.36-.3.88-.34 1.86C3.1 9.2 3.1 9.56 3.1 12.7s0 3.5.06 4.73c.04.98.2 1.5.34 1.86.18.47.4.8.75 1.15.35.35.68.57 1.15.75.36.14.88.3 1.86.34 1.24.06 1.6.06 4.74.06s3.5 0 4.74-.06c.98-.04 1.5-.2 1.86-.34.47-.18.8-.4 1.15-.75.35-.35.57-.68.75-1.15.14-.36.3-.88.34-1.86.06-1.23.06-1.6.06-4.73s0-3.5-.06-4.73c-.04-.98-.2-1.5-.34-1.86a3.1 3.1 0 0 0-.75-1.15 3.1 3.1 0 0 0-1.15-.75c-.36-.14-.88-.3-1.86-.34C15.5 4 15.14 4 12 4Zm0 3.9a4.1 4.1 0 1 1 0 8.2 4.1 4.1 0 0 1 0-8.2Zm0 1.8a2.3 2.3 0 1 0 0 4.6 2.3 2.3 0 0 0 0-4.6Zm4.3-2a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z"/>
      </svg>
    ),
  },
};

const RESOLUTIONS = {
  youtube: ["1080p", "720p", "480p", "360p", "Audio (MP3)"],
  facebook: ["1080p", "720p", "480p"],
  tiktok: ["1080p (No watermark)", "720p", "Audio (MP3)"],
  instagram: ["1080p", "720p", "Audio (MP3)"],
};

const isUrl = (v) => /^(https?:\/\/)?(www\.)?[\w-]+\.[a-z]{2,}(\/\S*)?$/i.test(v.trim());

// YouTube provides an official embeddable player (youtube.com/embed/<id>) —
// this extracts a real 11-char video ID so search results and pasted links
// can actually play via YouTube's own sanctioned embed, not a fake preview.
function extractYouTubeId(item) {
  if (item?.id && /^[\w-]{11}$/.test(item.id)) return item.id;
  const url = item?.url || "";
  const m = url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function mockTitle(platform, seed) {
  const titles = {
    youtube: ["How Rivers Shape Mountains", "Late Night Lo-Fi Mix", "Building a Tiny House Ep. 4", "Street Food Tour: Bangkok"],
    facebook: ["Family Reunion Highlights", "Local News: Downtown Festival", "Cooking Live: Sunday Roast", "Throwback Vacation Clip"],
    tiktok: ["3am cooking hits different", "gym transformation day 47", "POV: it's Friday finally", "life hack you didn't know"],
    instagram: ["Golden hour in the city", "Studio session behind the scenes", "Weekend market finds", "Reel: 60 sec travel diary"],
  };
  const list = titles[platform];
  return list[seed % list.length];
}

/* ---------------------------------------------------------
   CURRENCY — best-effort auto-detect from the browser locale.
   Real geo-IP or a live FX feed would replace this on a server.
--------------------------------------------------------- */
const CURRENCY_BY_REGION = {
  US: "USD", GB: "GBP", PH: "PHP", IN: "INR", JP: "JPY", CA: "CAD", AU: "AUD",
  DE: "EUR", FR: "EUR", ES: "EUR", IT: "EUR", NL: "EUR", IE: "EUR", PT: "EUR",
  NG: "NGN", ZA: "ZAR", MX: "MXN", BR: "BRL", SG: "SGD", MY: "MYR", ID: "IDR",
  TH: "THB", VN: "VND", KR: "KRW", CN: "CNY", AE: "AED", SA: "SAR", PK: "PKR",
};
const FX_FROM_USD = {
  USD: 1, GBP: 0.79, PHP: 56.5, INR: 83.2, JPY: 151, CAD: 1.36, AUD: 1.52,
  EUR: 0.92, NGN: 1550, ZAR: 18.3, MXN: 18.1, BRL: 5.4, SGD: 1.34, MYR: 4.7,
  IDR: 16200, THB: 36.4, VND: 25400, KRW: 1380, CNY: 7.24, AED: 3.67, SAR: 3.75, PKR: 278,
};

function detectCurrencyCode() {
  try {
    const locale = (typeof navigator !== "undefined" && navigator.language) || "en-US";
    const region = new Intl.Locale(locale).maximize().region;
    return CURRENCY_BY_REGION[region] || "USD";
  } catch {
    return "USD";
  }
}

function formatMoney(usdAmount, currencyCode, locale) {
  const rate = FX_FROM_USD[currencyCode] ?? 1;
  const converted = usdAmount * rate;
  try {
    return new Intl.NumberFormat(locale || "en-US", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: converted >= 100 ? 0 : 2,
    }).format(converted);
  } catch {
    return `$${usdAmount.toFixed(2)}`;
  }
}

/* ---------------------------------------------------------
   SUBSCRIPTION PLANS
--------------------------------------------------------- */
const PLANS = [
  { id: "free", name: "Free", usd: 0, tagline: "Try it out", perks: ["3 downloads / day", "Up to 720p", "Ads-free"] },
  { id: "pro", name: "Pro", usd: 4.99, tagline: "For regular use", perks: ["Unlimited downloads", "Up to 1080p", "Watermark removal"] },
  { id: "premium", name: "Premium", usd: 9.99, tagline: "For power users", perks: ["Everything in Pro", "Highest quality available", "Priority queue"] },
];

/* ---------------------------------------------------------
   MOCK ADMIN DATA — stand-ins for real accounts/payments.
   A production build replaces this with real database records.
--------------------------------------------------------- */
const SEED_USERS = [
  { id: "usr_maria", name: "Maria Santos", email: "maria@example.com", plan: "pro", joinedAt: "2026-03-14T09:12:00Z",
    payments: [
      { id: "pay_1", date: "2026-06-14T09:12:00Z", amountUsd: 4.99, plan: "Pro", status: "succeeded" },
      { id: "pay_2", date: "2026-05-14T09:12:00Z", amountUsd: 4.99, plan: "Pro", status: "succeeded" },
    ],
    downloads: [
      { id: "d1", title: "Sunset Timelapse Over Manila Bay", platform: "youtube", resolution: "1080p", time: "2026-07-02 14:22" },
      { id: "d2", title: "3am cooking hits different", platform: "tiktok", resolution: "720p", time: "2026-06-30 22:10" },
    ] },
  { id: "usr_jay", name: "Jay Cruz", email: "jay.cruz@example.com", plan: "premium", joinedAt: "2026-01-02T11:00:00Z",
    payments: [
      { id: "pay_3", date: "2026-07-02T11:00:00Z", amountUsd: 9.99, plan: "Premium", status: "succeeded" },
      { id: "pay_4", date: "2026-06-02T11:00:00Z", amountUsd: 9.99, plan: "Premium", status: "failed" },
    ],
    downloads: [
      { id: "d3", title: "Studio session behind the scenes", platform: "instagram", resolution: "1080p", time: "2026-07-10 08:41" },
    ] },
  { id: "usr_ana", name: "Ana Lopez", email: "ana.lopez@example.com", plan: "free", joinedAt: "2026-05-20T16:30:00Z",
    payments: [],
    downloads: [
      { id: "d4", title: "Family Reunion Highlights", platform: "facebook", resolution: "480p", time: "2026-07-15 19:05" },
    ] },
];

/* ---------------------------------------------------------
   MAIN APP
--------------------------------------------------------- */
export default function App() {
  const [booting, setBooting] = useState(true);
  const [bootProgress, setBootProgress] = useState(0);
  const [theme, setTheme] = useState("dark");
  const [platform, setPlatform] = useState("youtube");
  const [query, setQuery] = useState("");
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [stage, setStage] = useState("idle");
  const [searchResults, setSearchResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [resolution, setResolution] = useState(null);
  const [removeWatermark, setRemoveWatermark] = useState(true);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [authMode, setAuthMode] = useState(null);
  const [account, setAccount] = useState(null);
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  const [previewItem, setPreviewItem] = useState(null);
  const [downloadFlow, setDownloadFlow] = useState(null);
  const [toast, setToast] = useState(null);

  const [users, setUsers] = useState(SEED_USERS);
  const [adminAuthed, setAdminAuthed] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminView, setAdminView] = useState(false);
  const [adminSelectedUser, setAdminSelectedUser] = useState(null);

  const [currencyCode] = useState(() => detectCurrencyCode());
  const locale = typeof navigator !== "undefined" ? navigator.language : "en-US";
  const progressTimer = useRef(null);

  useEffect(() => {
    const t = setInterval(() => {
      setBootProgress((p) => { if (p >= 100) { clearInterval(t); return 100; } return p + 4; });
    }, 45);
    const done = setTimeout(() => setBooting(false), 1500);
    return () => { clearInterval(t); clearTimeout(done); };
  }, []);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener("online", on);
    window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  useEffect(() => () => clearInterval(progressTimer.current), []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (!previewItem) return;
    window.history.pushState({ omegaPreview: true }, "");
    const onPop = () => setPreviewItem(null);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [previewItem]);

  const closePreview = () => {
    if (window.history.state && window.history.state.omegaPreview) window.history.back();
    else setPreviewItem(null);
  };

  const theme_ = PLATFORMS[platform];
  const dark = theme === "dark";

  const resetFlow = () => { setStage("idle"); setSearchResults([]); setSelected(null); setResolution(null); };

  const handleAction = async () => {
    const q = query.trim();
    if (!q) return;

    if (isUrl(q)) {
      const item = { id: "u" + Date.now(), title: mockTitle(platform, q.length), platform, url: q };
      setSelected(item);
      setResolution(RESOLUTIONS[platform][0]);
      setStage("detail");

      const API_BASE = getApiBase();
      if (!API_BASE) return;
      try {
        const res = await fetch(`${API_BASE}/resolve`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: q }),
        });
        const data = await res.json();
        if (data.success && data.title) {
          setSelected((prev) => ({ ...prev, title: data.title, thumbnailUrl: data.thumbnail }));
        }
      } catch {}
    } else {
      setStage("results");
      const mock = Array.from({ length: 6 }).map((_, i) => ({
        id: "r" + i, title: mockTitle(platform, q.length + i), platform, query: q,
      }));
      setSearchResults(mock); // shown immediately so the UI never sits empty

      const API_BASE = getApiBase();
      if (!API_BASE) return;
      try {
        const res = await fetch(`${API_BASE}/search?platform=${platform}&q=${encodeURIComponent(q)}`);
        const data = await res.json();
        if (data.success && Array.isArray(data.results) && data.results.length) {
          setSearchResults(data.results.map((r) => ({ ...r, platform, query: q })));
        }
        // on failure (e.g. no API key, unsupported platform) we just keep the mock results
      } catch {
        // backend unreachable — keep mock results
      }
    }
  };

  const pickResult = (item) => {
    setSelected(item);
    setResolution(RESOLUTIONS[platform][0]);
    setStage("detail");
  };

  const saveBlobFile = (item, res) => {
    const blob = new Blob(
      [`Placeholder file from the Omega Converter demo.\n\nTitle: ${item.title}\nPlatform: ${platform}\nResolution: ${res}\n\nThis is saved to your browser's default Downloads folder. A website can't open OS folders directly (browser sandbox restriction) - but that's already where every download lands, and most browsers offer a "show in folder" shortcut from their own download tray/notification.`],
      { type: "text/plain" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${item.title.replace(/[^\w-]+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const openDownloadFlow = (item) => setDownloadFlow({ item, phase: "resolution", resolution: RESOLUTIONS[platform][0], progress: 0 });

  const runDownload = (item, res) => {
    if (!online) {
      setDownloadFlow({ item, phase: "failed", resolution: res, progress: 0 });
      setToast({ type: "error", text: "Download failed - no internet connection." });
      setTimeout(() => setDownloadFlow(null), 1200);
      return;
    }
    setDownloadFlow({ item, phase: "downloading", resolution: res, progress: 0 });
    setToast({ type: "info", text: `Downloading "${item.title}"...` });
    progressTimer.current = setInterval(() => {
      setDownloadFlow((f) => {
        if (!f || f.phase !== "downloading") return f;
        const nextVal = Math.min(100, f.progress + Math.random() * 20 + 10);
        if (nextVal >= 100) {
          clearInterval(progressTimer.current);
          saveBlobFile(item, res);
          setHistory((h) => [{ id: Date.now(), title: item.title, platform, resolution: res, time: new Date().toLocaleString() }, ...h]);
          setToast({ type: "success", text: "Download complete" });
          setTimeout(() => setDownloadFlow(null), 900);
          return { ...f, progress: 100, phase: "done" };
        }
        return { ...f, progress: nextVal };
      });
    }, 220);
  };

  const handleSignup = (data) => {
    const newUser = { id: "usr_" + Date.now(), name: data.name, email: data.email, plan: "free", joinedAt: new Date().toISOString(), payments: [], downloads: [] };
    setUsers((u) => [...u, newUser]);
    setAccount(newUser);
    setAuthMode(null);
  };

  const confirmSubscription = (plan) => {
    const payment = { id: "pay_" + Date.now(), date: new Date().toISOString(), amountUsd: plan.usd, plan: plan.name, status: "succeeded" };
    setAccount((a) => (a ? { ...a, plan: plan.id, payments: [payment, ...(a.payments || [])] } : a));
    setUsers((list) => list.map((u) => (account && u.id === account.id ? { ...u, plan: plan.id, payments: [payment, ...(u.payments || [])] } : u)));
    setSubscribeOpen(false);
    setToast({ type: "success", text: `Subscribed to ${plan.name}` });
  };

  const tryAdminLogin = (username, password) => {
    if (username === "admin" && password === "omega123") {
      setAdminAuthed(true);
      setAdminView(true);
      setShowAdminLogin(false);
      setShowProfile(false);
      return true;
    }
    return false;
  };

  const pageBgColor = dark ? "#0B0B0D" : "#E7E7EC";
  const cardBgColor = dark ? "#17171A" : "#FFFFFF";
  const cardBorderColor = dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.12)";
  const subtle = dark ? "text-neutral-400" : "text-neutral-600";
  const titleColor = dark ? "#FFFFFF" : "#111318";
  const textCls = dark ? "text-neutral-100" : "text-neutral-900";

  if (booting) {
    return (
      <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden" style={{ backgroundColor: "#0B0B0D" }}>
        <div className="flex flex-col items-center gap-5 animate-pulse">
          <OmegaLogo size={92} />
          <div className="text-white/90 font-semibold tracking-wide text-lg" style={{ fontFamily: "'Sora', sans-serif" }}>Omega Converter</div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
          <div className="h-full bg-gradient-to-r from-orange-400 via-pink-500 to-blue-500 transition-all duration-100" style={{ width: `${bootProgress}%` }} />
        </div>
      </div>
    );
  }

  if (adminView) {
    return (
      <AdminPanel
        dark={dark} pageBgColor={pageBgColor} cardBgColor={cardBgColor} cardBorderColor={cardBorderColor} subtle={subtle}
        users={users} selectedUser={adminSelectedUser} onSelectUser={setAdminSelectedUser}
        onBackToList={() => setAdminSelectedUser(null)}
        onExit={() => { setAdminView(false); setAdminSelectedUser(null); }}
        onLogout={() => { setAdminAuthed(false); setAdminView(false); setAdminSelectedUser(null); }}
        locale={locale}
      />
    );
  }

  return (
    <div className={`min-h-screen w-full ${textCls} font-sans transition-colors duration-300`} style={{ fontFamily: "'Inter', sans-serif", colorScheme: dark ? "dark" : "light", backgroundColor: pageBgColor }}>
      {!online && (
        <div className="w-full bg-amber-500/90 text-black text-xs sm:text-sm font-medium py-1.5 px-4 flex items-center justify-center gap-2">
          <WifiOff size={14} /> You're offline - browsing works, but downloads need a connection.
        </div>
      )}

      <header className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex items-center justify-between">
        <button onClick={() => setShowHistory(true)} className={`w-11 h-11 rounded-full flex items-center justify-center border ${dark ? "border-white/10 hover:bg-white/5" : "border-black/5 hover:bg-black/5"} transition`} aria-label="Download history">
          <History size={19} />
        </button>
        <div className="flex items-center gap-2.5">
          <OmegaLogo size={34} />
          <span className="font-semibold text-lg sm:text-xl tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>Omega Converter</span>
        </div>
        <button onClick={() => setShowProfile(true)} className={`w-11 h-11 rounded-full flex items-center justify-center border ${dark ? "border-white/10 hover:bg-white/5" : "border-black/5 hover:bg-black/5"} transition`} aria-label="Profile">
          <User size={19} />
        </button>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-4 gap-2 sm:gap-3">
          {Object.entries(PLATFORMS).map(([key, p]) => {
            const active = platform === key;
            return (
              <button key={key} onClick={() => { setPlatform(key); resetFlow(); setQuery(""); }}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all ${active ? `bg-gradient-to-br ${p.gradient} border-transparent shadow-lg scale-[1.03]` : dark ? "border-white/10 hover:bg-white/5" : "border-black/5 hover:bg-black/5"}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center ${active ? "bg-black/25" : dark ? "bg-white/5" : "bg-black/5"}`}>
                  {p.icon(active ? "#fff" : dark ? "#e5e5e5" : "#333")}
                </div>
                <span className={`text-[11px] sm:text-xs font-medium ${active ? "text-white drop-shadow" : subtle}`}>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-6">
        <div className={`flex items-center rounded-2xl border shadow-sm overflow-hidden focus-within:ring-2 ${theme_.ring} transition`} style={{ backgroundColor: dark ? "#17171A" : "#FFFFFF", borderColor: dark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)" }}>
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleAction()}
            placeholder={`Paste a ${theme_.label} link, or search videos...`}
            className="flex-1 outline-none px-4 sm:px-5 py-4 text-sm sm:text-base font-medium"
            style={{ color: dark ? "#FFFFFF" : "#0A0A0C", WebkitTextFillColor: dark ? "#FFFFFF" : "#0A0A0C", backgroundColor: dark ? "#17171A" : "#FFFFFF", colorScheme: dark ? "dark" : "light", caretColor: dark ? "#FFFFFF" : "#0A0A0C" }} />
          <button onClick={handleAction} className={`m-1.5 w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${theme_.gradient} shadow`} aria-label="Go">
            <Search size={18} className="text-white drop-shadow" />
          </button>
        </div>
        {query.trim() && (
          <div className={`mt-2 inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full ${dark ? "bg-white/5" : "bg-black/5"} ${subtle}`}>
            {isUrl(query) ? <Link2 size={12} /> : <Search size={12} />}
            {isUrl(query) ? "Link detected - will convert directly" : `Search mode - searching ${theme_.label}`}
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-8 pb-24">
        {stage === "idle" && (
          <div className="flex flex-col items-center justify-center text-center py-20 gap-4">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${dark ? "bg-white/5" : "bg-black/5"}`}>
              <Download size={30} className={subtle} />
            </div>
            <p className={`text-sm sm:text-base ${subtle} max-w-xs`}>Select a platform, then paste a video link or search - tap a thumbnail to preview, or the download icon to save it.</p>
          </div>
        )}

        {stage === "results" && (
          <div>
            <div className={`text-xs uppercase tracking-wide mb-3 ${subtle}`}>Results on {theme_.label}</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {searchResults.map((r) => (
                <div key={r.id} onClick={() => pickResult(r)} className="flex gap-3 p-3 rounded-2xl border text-left cursor-pointer hover:opacity-90 transition" style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor }}>
                  <Thumb item={r} gradientClass={theme_.gradient} size="grid" onPreview={setPreviewItem} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold truncate" style={{ color: titleColor }}>{r.title}</div>
                    <div className={`text-xs mt-1 ${subtle}`}>{theme_.label} - matches "{r.query}"</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); openDownloadFlow(r); }}
                    className={`self-center flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${dark ? "bg-white/10 hover:bg-white/20" : "bg-black/10 hover:bg-black/20"}`}
                    aria-label="Download"
                  >
                    <Download size={14} className={dark ? "text-white" : "text-neutral-800"} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {stage === "detail" && selected && (
          <div className="rounded-2xl border p-4 sm:p-5" style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor }}>
            <div className="flex gap-4">
              <Thumb item={selected} gradientClass={theme_.gradient} size="detail" onPreview={setPreviewItem} />
              <div className="min-w-0 flex-1">
                <div className="font-semibold truncate" style={{ color: titleColor }}>{selected.title}</div>
                <div className={`text-xs mt-1 ${subtle}`}>{theme_.label}{selected.url ? ` - ${selected.url}` : ""}</div>
              </div>
              <button
                onClick={() => openDownloadFlow(selected)}
                className={`self-center flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${dark ? "bg-white/10 hover:bg-white/20" : "bg-black/10 hover:bg-black/20"}`}
                aria-label="Download"
              >
                <Download size={15} className={dark ? "text-white" : "text-neutral-800"} />
              </button>
            </div>

            <div className="mt-5">
              <div className={`text-xs font-medium mb-2 ${subtle}`}>Resolution</div>
              <div className="flex flex-wrap gap-2">
                {RESOLUTIONS[platform].map((r) => (
                  <button key={r} onClick={() => setResolution(r)}
                    className={`px-3 py-1.5 rounded-full text-xs sm:text-sm border transition ${resolution === r ? `bg-gradient-to-r ${theme_.gradient} text-white border-transparent shadow` : dark ? "border-white/10 hover:bg-white/5" : "border-black/10 hover:bg-black/5"}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {theme_.watermark && (
              <button onClick={() => setRemoveWatermark((v) => !v)} className={`mt-5 w-full flex items-center justify-between rounded-xl border px-4 py-3 ${dark ? "border-white/10" : "border-black/10"}`}>
                <span className="flex items-center gap-2 text-sm"><ShieldOff size={16} className={subtle} /> Remove watermark</span>
                <span className={`w-10 h-6 rounded-full flex items-center px-0.5 transition ${removeWatermark ? `bg-gradient-to-r ${theme_.gradient}` : dark ? "bg-white/10" : "bg-black/10"}`}>
                  <span className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${removeWatermark ? "translate-x-4" : "translate-x-0"}`} />
                </span>
              </button>
            )}

            <div className="mt-5 flex gap-3">
              <button onClick={() => resolution && runDownload(selected, resolution)} className={`flex-1 py-3 rounded-xl font-medium text-white bg-gradient-to-r ${theme_.gradient} shadow flex items-center justify-center gap-2`}>
                <Sparkles size={16} /> Convert &amp; Download
              </button>
              <button onClick={resetFlow} className={`px-4 py-3 rounded-xl border text-sm ${dark ? "border-white/10 hover:bg-white/5" : "border-black/10 hover:bg-black/5"}`}>New</button>
            </div>
            <p className={`mt-4 text-[11px] ${subtle}`}>Demo build - simulates the convert flow. Connect a licensed extraction backend to enable real downloads.</p>
          </div>
        )}
      </div>

      {showHistory && (
        <Overlay dark={dark} onClose={() => setShowHistory(false)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Download history</h3>
            <button onClick={() => setShowHistory(false)}><X size={20} /></button>
          </div>
          {history.length === 0 ? (
            <p className={`text-sm ${subtle}`}>Nothing here yet - your converted videos will show up after a download.</p>
          ) : (
            <div className="space-y-2">
              {history.map((h) => (
                <div key={h.id} className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${dark ? "border-white/10" : "border-black/10"}`}>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{h.title}</div>
                    <div className={`text-xs ${subtle}`}>{PLATFORMS[h.platform].label} - {h.resolution} - {h.time}</div>
                  </div>
                </div>
              ))}
              <button onClick={() => setHistory([])} className="flex items-center gap-1.5 text-xs text-red-400 mt-2"><Trash2 size={13} /> Clear history</button>
            </div>
          )}
        </Overlay>
      )}

      {showProfile && (
        <Overlay dark={dark} onClose={() => { setShowProfile(false); setAuthMode(null); }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Profile</h3>
            <button onClick={() => { setShowProfile(false); setAuthMode(null); }}><X size={20} /></button>
          </div>

          <button onClick={() => setTheme(dark ? "light" : "dark")} className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 mb-3 ${dark ? "border-white/10" : "border-black/10"}`}>
            <span className="flex items-center gap-2 text-sm">{dark ? <Moon size={16} /> : <Sun size={16} />} Appearance</span>
            <span className={`text-xs ${subtle}`}>{dark ? "Dark" : "Light"}</span>
          </button>

          <div className={`w-full flex items-center justify-between rounded-xl border px-4 py-3 mb-4 ${dark ? "border-white/10" : "border-black/10"}`}>
            <span className={`text-xs ${subtle}`}>Detected currency</span>
            <span className="text-sm font-medium">{currencyCode}</span>
          </div>

          {account ? (
            <div className={`rounded-xl border px-4 py-3 mb-4 ${dark ? "border-white/10" : "border-black/10"}`}>
              <div className="text-sm font-medium">{account.name}</div>
              <div className={`text-xs ${subtle}`}>{account.email}</div>
              <div className="flex items-center justify-between mt-3">
                <span className={`text-xs flex items-center gap-1 ${subtle}`}><Crown size={13} /> {PLANS_LABEL(account.plan)} plan</span>
                <button onClick={() => setSubscribeOpen(true)} className={`text-xs font-medium px-3 py-1.5 rounded-full text-white bg-gradient-to-r ${theme_.gradient}`}>
                  {account.plan === "free" ? "Upgrade" : "Manage"}
                </button>
              </div>
              <button onClick={() => setAccount(null)} className="flex items-center gap-1.5 text-xs text-red-400 mt-3"><LogOut size={13} /> Log out</button>
            </div>
          ) : authMode ? (
            <AuthForm mode={authMode} dark={dark} onCancel={() => setAuthMode(null)} onSubmit={handleSignup} />
          ) : (
            <div className="flex flex-col gap-2 mb-4">
              <p className={`text-xs ${subtle} mb-1`}>An account is optional - you can convert videos without signing in.</p>
              <button onClick={() => setAuthMode("login")} className={`w-full py-2.5 rounded-xl border text-sm ${dark ? "border-white/10 hover:bg-white/5" : "border-black/10 hover:bg-black/5"}`}>Log in</button>
              <button onClick={() => setAuthMode("signup")} className={`w-full py-2.5 rounded-xl text-sm text-white bg-gradient-to-r ${theme_.gradient}`}>Create account</button>
            </div>
          )}

          <button onClick={() => setShowAdminLogin(true)} className={`w-full flex items-center justify-center gap-2 text-xs py-2.5 rounded-xl border ${dark ? "border-white/10 text-neutral-400 hover:bg-white/5" : "border-black/10 text-neutral-500 hover:bg-black/5"}`}>
            <Shield size={13} /> Admin panel
          </button>
        </Overlay>
      )}

      {subscribeOpen && (
        <Overlay dark={dark} onClose={() => setSubscribeOpen(false)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">Choose a plan</h3>
            <button onClick={() => setSubscribeOpen(false)}><X size={20} /></button>
          </div>
          <div className="flex flex-col gap-3">
            {PLANS.map((p) => (
              <div key={p.id} className={`rounded-xl border p-4 ${dark ? "border-white/10" : "border-black/10"}`}>
                <div className="flex items-center justify-between">
                  <div className="font-medium text-sm">{p.name}</div>
                  <div className="font-semibold text-sm">{formatMoney(p.usd, currencyCode, locale)}{p.usd > 0 ? "/mo" : ""}</div>
                </div>
                <div className={`text-xs mt-0.5 ${subtle}`}>{p.tagline}</div>
                <ul className={`text-xs mt-2 space-y-1 ${subtle}`}>
                  {p.perks.map((perk) => <li key={perk}>- {perk}</li>)}
                </ul>
                <button onClick={() => confirmSubscription(p)} disabled={account?.plan === p.id}
                  className={`mt-3 w-full py-2 rounded-lg text-xs font-medium ${account?.plan === p.id ? `${dark ? "bg-white/10 text-neutral-400" : "bg-black/10 text-neutral-500"}` : `text-white bg-gradient-to-r ${theme_.gradient}`}`}>
                  {account?.plan === p.id ? "Current plan" : "Choose"}
                </button>
              </div>
            ))}
          </div>
          <p className={`mt-3 text-[11px] ${subtle}`}>Demo checkout - no real payment is processed. Wire in Stripe/PayPal here for production.</p>
        </Overlay>
      )}

      {showAdminLogin && (
        <Overlay dark={dark} onClose={() => setShowAdminLogin(false)}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg flex items-center gap-2"><Shield size={18} /> Admin login</h3>
            <button onClick={() => setShowAdminLogin(false)}><X size={20} /></button>
          </div>
          <AdminLoginForm dark={dark} onSubmit={tryAdminLogin} />
        </Overlay>
      )}

      {previewItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/55 p-4" onClick={closePreview}>
          <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <button onClick={closePreview} className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center" aria-label="Close preview"><X size={16} className="text-white" /></button>
            {platform === "youtube" && extractYouTubeId(previewItem) ? (
              <iframe
                className="aspect-video w-full block"
                src={`https://www.youtube.com/embed/${extractYouTubeId(previewItem)}?rel=0`}
                title={previewItem.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div
                className={`aspect-video w-full flex items-center justify-center bg-cover bg-center ${(previewItem.thumbnail || previewItem.thumbnailUrl) ? "" : `bg-gradient-to-br ${theme_.gradient}`}`}
                style={(previewItem.thumbnail || previewItem.thumbnailUrl) ? { backgroundImage: `url(${previewItem.thumbnail || previewItem.thumbnailUrl})` } : undefined}
              >
                <div className="w-16 h-16 rounded-full bg-black/40 flex items-center justify-center"><Play size={26} className="text-white" fill="white" /></div>
              </div>
            )}
            <div className="p-4" style={{ backgroundColor: "#151517" }}>
              <div className="font-semibold text-sm text-white truncate">{previewItem.title}</div>
              <div className="text-xs text-neutral-400 mt-1">
                {platform === "youtube" && extractYouTubeId(previewItem)
                  ? "Playing via YouTube's own embedded player."
                  : `${theme_.label} preview - demo build - no real video stream is connected yet.`}
              </div>
              <button onClick={() => { closePreview(); openDownloadFlow(previewItem); }} className={`mt-3 w-full py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r ${theme_.gradient}`}>
                Choose resolution &amp; download
              </button>
            </div>
          </div>
        </div>
      )}

      <DownloadFlowSheet flow={downloadFlow} gradientClass={theme_.gradient} dark={dark} availableResolutions={RESOLUTIONS[platform]}
        onClose={() => setDownloadFlow(null)} onPickResolution={(r) => runDownload(downloadFlow.item, r)} />

      {toast && (
        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[70] px-4 py-2.5 rounded-full bg-black/90 text-white text-xs sm:text-sm shadow-lg flex items-center gap-2">
          {toast.type === "success" && <CheckCircle2 size={13} />}
          {toast.type === "error" && <AlertCircle size={13} />}
          {toast.type === "info" && <Download size={13} />}
          {toast.text}
        </div>
      )}
    </div>
  );
}

function OmegaLogo({ size = 32 }) {
  return (
    <div className="rounded-[22%] flex items-center justify-center flex-shrink-0" style={{ width: size, height: size, background: "#0e0e10" }}>
      <svg viewBox="0 0 100 100" width={size * 0.62} height={size * 0.62}>
        <defs>
          <linearGradient id="omg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF7A18" /><stop offset="35%" stopColor="#E0117A" /><stop offset="65%" stopColor="#8E2DE2" /><stop offset="100%" stopColor="#2196F3" />
          </linearGradient>
        </defs>
        <path d="M55 8 L55 30 A25 25 0 1 0 68 68" fill="none" stroke="url(#omg)" strokeWidth="11" strokeLinecap="round" />
        <path d="M55 62 L68 68 L62 82 Z" fill="url(#omg)" />
      </svg>
    </div>
  );
}

function Overlay({ children, onClose, dark = true }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-sm sm:rounded-2xl rounded-t-2xl p-5 max-h-[80vh] overflow-y-auto"
        style={{ backgroundColor: dark ? "#17171A" : "#FFFFFF", color: dark ? "#F5F5F5" : "#111318" }}>
        {children}
      </div>
    </div>
  );
}

function AuthForm({ mode, dark, onCancel, onSubmit }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const inputCls = `w-full rounded-xl border px-3 py-2.5 text-sm bg-transparent outline-none mb-2.5 ${dark ? "border-white/10" : "border-black/10"}`;
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit({ name: name || "New user", email: email || "you@example.com" }); }} className="flex flex-col mb-4">
      {mode === "signup" && <input className={inputCls} placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} style={{ color: dark ? "#fff" : "#111" }} />}
      <input className={inputCls} placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={{ color: dark ? "#fff" : "#111" }} />
      <input className={inputCls} placeholder="Password" type="password" style={{ color: dark ? "#fff" : "#111" }} />
      <div className="flex gap-2 mt-1">
        <button type="button" onClick={onCancel} className={`flex-1 py-2.5 rounded-xl border text-sm ${dark ? "border-white/10" : "border-black/10"}`}>Cancel</button>
        <button type="submit" className="flex-1 py-2.5 rounded-xl text-sm text-white bg-gradient-to-r from-orange-500 to-pink-600">{mode === "signup" ? "Sign up" : "Log in"}</button>
      </div>
    </form>
  );
}

function AdminLoginForm({ dark, onSubmit }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const inputCls = `w-full rounded-xl border px-3 py-2.5 text-sm bg-transparent outline-none mb-2.5 ${dark ? "border-white/10" : "border-black/10"}`;
  return (
    <form onSubmit={(e) => { e.preventDefault(); if (!onSubmit(username, password)) setError("Incorrect username or password."); }} className="flex flex-col">
      <input className={inputCls} placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} style={{ color: dark ? "#fff" : "#111" }} />
      <input className={inputCls} placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={{ color: dark ? "#fff" : "#111" }} />
      {error && <div className="text-xs text-red-400 mb-2">{error}</div>}
      <button type="submit" className="w-full py-2.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-pink-600">Log in</button>
      <p className={`mt-3 text-[11px] ${dark ? "text-neutral-500" : "text-neutral-400"}`}>Demo credentials: admin / omega123 - replace with real server-side auth before shipping.</p>
    </form>
  );
}

function Thumb({ item, gradientClass, size, onPreview }) {
  const grid = size === "grid";
  const dims = grid ? "w-20 h-14 sm:w-24 sm:h-16" : "w-24 h-16 sm:w-32 sm:h-20";
  const thumbUrl = item.thumbnail || item.thumbnailUrl || null;
  return (
    <button onClick={(e) => { e.stopPropagation(); onPreview(item); }} className={`relative rounded-xl overflow-hidden flex-shrink-0 ${dims} ${thumbUrl ? "bg-black" : `bg-gradient-to-br ${gradientClass}`}`} aria-label="Preview video">
      {thumbUrl && (
        <img
          src={thumbUrl}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => { e.currentTarget.style.display = "none"; e.currentTarget.parentElement.classList.add("bg-gradient-to-br", ...gradientClass.split(" ")); }}
        />
      )}
      <span className="absolute inset-0 flex items-center justify-center bg-black/10 hover:bg-black/25 transition">
        <Play size={grid ? 18 : 22} className="text-white drop-shadow" fill="white" />
      </span>
    </button>
  );
}

function DownloadFlowSheet({ flow, gradientClass, dark, onClose, onPickResolution, availableResolutions }) {
  if (!flow) return null;
  const { item, phase, resolution, progress } = flow;
  return (
    <div className="fixed inset-0 z-[65] flex items-end sm:items-center justify-center bg-black/55 p-0 sm:p-4" onClick={phase === "resolution" ? onClose : undefined}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-5" style={{ backgroundColor: dark ? "#17171A" : "#FFFFFF", color: dark ? "#fff" : "#111318" }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm font-semibold truncate pr-4">{item.title}</div>
          {phase === "resolution" && <button onClick={onClose}><X size={18} /></button>}
        </div>

        {phase === "resolution" && (
          <div className="flex flex-col gap-2">
            <div className={`text-xs mb-1 ${dark ? "text-neutral-400" : "text-neutral-500"}`}>Choose resolution</div>
            {availableResolutions.map((r) => (
              <button key={r} onClick={() => onPickResolution(r)} className={`flex items-center justify-between px-4 py-3 rounded-xl border ${dark ? "border-white/10 hover:bg-white/5" : "border-black/10 hover:bg-black/5"}`}>
                <span className="text-sm">{r}</span>
                <ChevronRight size={16} className={dark ? "text-neutral-500" : "text-neutral-400"} />
              </button>
            ))}
          </div>
        )}

        {(phase === "downloading" || phase === "done") && (
          <div className="py-2">
            <div className="flex items-center gap-2 text-sm mb-2">
              {phase === "downloading" ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} className="text-emerald-400" />}
              {phase === "downloading" ? `Downloading ${resolution}... ${Math.round(progress)}%` : "Saved to Downloads"}
            </div>
            <div className={`h-2 rounded-full overflow-hidden ${dark ? "bg-white/10" : "bg-black/10"}`}>
              <div className={`h-full bg-gradient-to-r ${gradientClass} transition-all duration-200`} style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {phase === "failed" && (
          <div className="flex items-center gap-2 text-sm text-red-400 py-2"><AlertCircle size={16} /> Download failed - check your connection and try again.</div>
        )}
      </div>
    </div>
  );
}

function AdminPanel({ dark, pageBgColor, cardBgColor, cardBorderColor, subtle, users, selectedUser, onSelectUser, onBackToList, onExit, onLogout, locale }) {
  const textCls = dark ? "text-neutral-100" : "text-neutral-900";
  return (
    <div className={`min-h-screen w-full ${textCls}`} style={{ backgroundColor: pageBgColor, colorScheme: dark ? "dark" : "light" }}>
      <header className="max-w-3xl mx-auto px-4 sm:px-6 pt-6 pb-4 flex items-center justify-between">
        <button onClick={selectedUser ? onBackToList : onExit} className={`flex items-center gap-1.5 text-sm ${subtle}`}>
          <ArrowLeft size={16} /> {selectedUser ? "All users" : "Back to app"}
        </button>
        <div className="flex items-center gap-2 font-semibold"><Shield size={16} /> Admin</div>
        <button onClick={onLogout} className={`flex items-center gap-1.5 text-xs ${subtle}`}><LogOut size={13} /> Log out</button>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-16">
        {!selectedUser ? (
          <div>
            <div className={`flex items-center gap-2 text-xs uppercase tracking-wide mb-3 ${subtle}`}><UsersIcon size={13} /> {users.length} users</div>
            <div className="flex flex-col gap-2">
              {users.map((u) => (
                <button key={u.id} onClick={() => onSelectUser(u)} className="flex items-center justify-between rounded-xl border p-3 text-left" style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor }}>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{u.name}</div>
                    <div className={`text-xs ${subtle}`}>{u.email}</div>
                    <div className={`text-xs mt-1 ${subtle}`}>Joined {new Date(u.joinedAt).toLocaleDateString()}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-[11px] px-2 py-1 rounded-full ${dark ? "bg-white/10" : "bg-black/10"}`}>{PLANS_LABEL(u.plan)}</span>
                    <ChevronRight size={16} className={subtle} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <div className="rounded-2xl border p-4 mb-4" style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor }}>
              <div className="font-semibold">{selectedUser.name}</div>
              <div className={`text-xs ${subtle}`}>{selectedUser.email}</div>
              <div className="flex items-center gap-4 mt-3 text-xs">
                <span className="flex items-center gap-1"><Crown size={13} /> {PLANS_LABEL(selectedUser.plan)} plan</span>
                <span className="flex items-center gap-1"><Clock size={13} /> Joined {new Date(selectedUser.joinedAt).toLocaleString()}</span>
              </div>
            </div>

            <div className={`text-xs uppercase tracking-wide mb-2 flex items-center gap-1.5 ${subtle}`}><CreditCard size={13} /> Payment history</div>
            {selectedUser.payments.length === 0 ? (
              <p className={`text-sm ${subtle} mb-4`}>No payments yet.</p>
            ) : (
              <div className="flex flex-col gap-2 mb-6">
                {selectedUser.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-xl border px-3 py-2.5" style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor }}>
                    <div>
                      <div className="text-sm font-medium">{p.plan}</div>
                      <div className={`text-xs ${subtle}`}>{new Date(p.date).toLocaleString(locale)}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{formatMoney(p.amountUsd, "USD", locale)}</div>
                      <div className={`text-[11px] ${p.status === "succeeded" ? "text-emerald-400" : "text-red-400"}`}>{p.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className={`text-xs uppercase tracking-wide mb-2 flex items-center gap-1.5 ${subtle}`}><Download size={13} /> Download history</div>
            {selectedUser.downloads.length === 0 ? (
              <p className={`text-sm ${subtle}`}>No downloads yet.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedUser.downloads.map((d) => (
                  <div key={d.id} className="flex items-center justify-between rounded-xl border px-3 py-2.5" style={{ backgroundColor: cardBgColor, borderColor: cardBorderColor }}>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{d.title}</div>
                      <div className={`text-xs ${subtle}`}>{PLATFORMS[d.platform]?.label} - {d.resolution} - {d.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function PLANS_LABEL(id) {
  return PLANS.find((p) => p.id === id)?.name || "Free";
}
