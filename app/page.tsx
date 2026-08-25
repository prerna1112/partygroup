"use client";

import {
  Bell,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock3,
  LocateFixed,
  MapPin,
  MessageCircle,
  Navigation,
  PartyPopper,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
} from "lucide-react";
import Image from "next/image";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type Screen =
  | "location"
  | "welcome"
  | "terms"
  | "parties"
  | "email"
  | "otp"
  | "name"
  | "username"
  | "age"
  | "pronouns"
  | "invite"
  | "success";

type Party = {
  id: number;
  title: string;
  type: string;
  description: string;
  host: string;
  category: string;
  date: string;
  time: string;
  place: string;
  distance: string;
  spots: number;
  image: string;
  accent: string;
};

type Toast = { kind: "success" | "error"; message: string } | null;

const ncrAreas = [
  { label: "New Delhi", latitude: 28.6139, longitude: 77.209 },
  { label: "Gurugram", latitude: 28.4595, longitude: 77.0266 },
  { label: "Noida", latitude: 28.5355, longitude: 77.391 },
];

const parties: Party[] = [
  {
    id: 1,
    title: "Coffee Date",
    type: "Private party",
    description:
      "Slow coffee, fast friendships. Come solo—we'll handle the introductions.",
    host: "@neelpatel",
    category: "Coffee break",
    date: "29 Aug",
    time: "11:00 AM",
    place: "Blue Tokai, Greater Kailash II",
    distance: "1.8 km",
    spots: 4,
    image: "/events/cafe.jpg",
    accent: "gold",
  },
  {
    id: 2,
    title: "Rooftop Roulette",
    type: "Open party",
    description:
      "A golden-hour rooftop, a no-skip playlist and a table full of new people.",
    host: "@raahi",
    category: "Sunset social",
    date: "30 Aug",
    time: "7:30 PM",
    place: "Auro Kitchen & Bar, Hauz Khas",
    distance: "3.2 km",
    spots: 7,
    image: "/events/rooftop.jpg",
    accent: "violet",
  },
  {
    id: 3,
    title: "Move Like Nobody's Watching",
    type: "Open party",
    description:
      "No choreography. No judgement. Just a dance floor that starts early.",
    host: "@dancinghuman",
    category: "Dance night",
    date: "31 Aug",
    time: "8:00 PM",
    place: "Studio XO Bar, Gurugram",
    distance: "8.6 km",
    spots: 10,
    image: "/events/dance.jpg",
    accent: "coral",
  },
];

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernamePattern = /^[a-zA-Z0-9_]+$/;
const invitePattern = /^[A-Z0-9]{5,10}$/;

function wait(milliseconds: number) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

function distanceInKilometres(
  latitudeA: number,
  longitudeA: number,
  latitudeB: number,
  longitudeB: number,
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371;
  const latitudeDelta = toRadians(latitudeB - latitudeA);
  const longitudeDelta = toRadians(longitudeB - longitudeA);
  const startLatitude = toRadians(latitudeA);
  const endLatitude = toRadians(latitudeB);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(startLatitude) *
      Math.cos(endLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return earthRadius * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function nearestSupportedArea(latitude: number, longitude: number) {
  const nearest = ncrAreas
    .map((area) => ({
      ...area,
      distance: distanceInKilometres(
        latitude,
        longitude,
        area.latitude,
        area.longitude,
      ),
    }))
    .sort((areaA, areaB) => areaA.distance - areaB.distance)[0];

  return nearest.distance <= 120
    ? { label: nearest.label, inCoverage: true }
    : { label: "Delhi NCR", inCoverage: false };
}

function validateName(value: string) {
  const cleanName = value.trim().replace(/\s+/g, " ");
  if (cleanName.length < 2) return "Tell us the name your new friends should call you.";
  if (cleanName.length > 50) return "Keep your name under 50 characters.";
  return "";
}

function validateUsername(value: string) {
  const cleanUsername = value.trim().replace(/^@/, "");
  if (cleanUsername.length < 3 || cleanUsername.length > 20) {
    return "Use between 3 and 20 characters.";
  }
  if (!usernamePattern.test(cleanUsername)) {
    return "Use only letters, numbers and underscores—no spaces.";
  }
  return "";
}

function validateAge(value: string) {
  const numberAge = Number(value);
  if (!value || !Number.isInteger(numberAge)) return "Enter your age as a whole number.";
  if (numberAge < 18) return "You must be at least 18 years old to join Extroverts.";
  if (numberAge > 100) return "Enter an age between 18 and 100.";
  return "";
}

function validateInviteCode(value: string) {
  const code = value.trim().toUpperCase();
  if (code && !invitePattern.test(code)) return "Invite codes use 5–10 letters or numbers.";
  if (code && code !== "PARTY30" && code !== "FAIL500") {
    return "We couldn't find that invite code. You can also leave it blank.";
  }
  return "";
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("location");
  const [direction, setDirection] = useState<"forward" | "back">("forward");
  const [location, setLocation] = useState("");
  const [locationError, setLocationError] = useState("");
  const [locationLoading, setLocationLoading] = useState(false);
  const [partyLoading, setPartyLoading] = useState(true);
  const [partyLoadError, setPartyLoadError] = useState(false);
  const [selectedPartyId, setSelectedPartyId] = useState<number | null>(null);
  const [joinedPartyIds, setJoinedPartyIds] = useState<number[]>([]);
  const [email, setEmail] = useState("");
  const [newsletter, setNewsletter] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpSeconds, setOtpSeconds] = useState(20);
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [age, setAge] = useState("");
  const [ageError, setAgeError] = useState("");
  const [pronouns, setPronouns] = useState("");
  const [customPronouns, setCustomPronouns] = useState("");
  const [pronounsError, setPronounsError] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [inviteError, setInviteError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<Toast>(null);
  const [termsOpen, setTermsOpen] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const partyErrorTriggered = useRef(false);
  const termsCloseRef = useRef<HTMLButtonElement | null>(null);
  const termsTriggerRef = useRef<HTMLButtonElement | null>(null);

  const selectedParty = useMemo(
    () => parties.find((party) => party.id === selectedPartyId) ?? parties[0],
    [selectedPartyId],
  );

  useEffect(() => {
    if (screen !== "parties") return;
    const shouldPreviewError =
      new URLSearchParams(window.location.search).get("partyError") === "1" &&
      !partyErrorTriggered.current;
    const timer = window.setTimeout(() => {
      if (shouldPreviewError) {
        partyErrorTriggered.current = true;
        setPartyLoadError(true);
      }
      setPartyLoading(false);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [screen, partyLoadError]);

  useEffect(() => {
    if (!termsOpen) return;
    termsCloseRef.current?.focus();
    const handleEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setTermsOpen(false);
        window.setTimeout(() => termsTriggerRef.current?.focus(), 0);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [termsOpen]);

  function closeTerms() {
    setTermsOpen(false);
    window.setTimeout(() => termsTriggerRef.current?.focus(), 0);
  }

  useEffect(() => {
    if (screen !== "otp" || otpSeconds <= 0) return;
    const timer = window.setTimeout(() => setOtpSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [otpSeconds, screen]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  function navigate(next: Screen, nextDirection: "forward" | "back" = "forward") {
    setDirection(nextDirection);
    setScreen(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function useLocation() {
    setLocationError("");
    setLocationLoading(true);

    if (!navigator.geolocation) {
      await wait(500);
      setLocationLoading(false);
      setLocationError("Location isn't available in this browser. Choose a city instead.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await wait(550);
        const detectedArea = nearestSupportedArea(
          position.coords.latitude,
          position.coords.longitude,
        );
        setLocation(detectedArea.label);
        setLocationLoading(false);
        if (!detectedArea.inCoverage) {
          setToast({
            kind: "success",
            message: "Location found. This demo currently shows the closest available Delhi NCR scenes.",
          });
        }
        navigate("welcome");
      },
      () => {
        setLocationLoading(false);
        setLocationError("We couldn't access your location. You can still explore nearby parties.");
      },
      { enableHighAccuracy: false, timeout: 6000 },
    );
  }

  function chooseFallbackLocation() {
    setLocation("New Delhi");
    setLocationError("");
    navigate("welcome");
  }

  function selectParty(id: number) {
    if (joinedPartyIds.includes(id)) {
      setToast({ kind: "success", message: "You're already on this guest list." });
      return;
    }
    setSelectedPartyId(id);
    navigate("email");
  }

  async function submitEmail(event: FormEvent) {
    event.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!emailPattern.test(cleanEmail)) {
      setEmailError("Enter a valid email address, like you@example.com.");
      return;
    }
    setEmailError("");
    setLoading(true);
    await wait(850);
    if (cleanEmail.startsWith("fail@")) {
      setLoading(false);
      setToast({ kind: "error", message: "We couldn't send the OTP. Try another email or retry." });
      return;
    }
    setEmail(cleanEmail);
    setOtpSeconds(20);
    setOtp(["", "", "", "", "", ""]);
    setLoading(false);
    navigate("otp");
    window.setTimeout(() => otpRefs.current[0]?.focus(), 250);
  }

  function updateOtp(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);
    setOtpError("");
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function handleOtpKey(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) otpRefs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < 5) otpRefs.current[index + 1]?.focus();
  }

  function pasteOtp(event: React.ClipboardEvent<HTMLDivElement>) {
    const digits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!digits) return;
    event.preventDefault();
    const nextOtp = Array.from({ length: 6 }, (_, index) => digits[index] ?? "");
    setOtp(nextOtp);
    otpRefs.current[Math.min(digits.length, 6) - 1]?.focus();
  }

  async function verifyOtp(event: FormEvent) {
    event.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      setOtpError("Enter all six digits from your email.");
      return;
    }
    setLoading(true);
    await wait(800);
    if (code !== "123456") {
      setLoading(false);
      setOtpError("That code doesn't match. For this demo, use 123456.");
      otpRefs.current[0]?.focus();
      return;
    }
    setLoading(false);
    navigate("name");
  }

  async function resendOtp() {
    if (otpSeconds > 0) return;
    setLoading(true);
    await wait(650);
    setLoading(false);
    setOtpSeconds(20);
    setOtp(["", "", "", "", "", ""]);
    setToast({ kind: "success", message: "A fresh demo code is ready: 123456." });
    otpRefs.current[0]?.focus();
  }

  function submitName(event: FormEvent) {
    event.preventDefault();
    const cleanName = name.trim().replace(/\s+/g, " ");
    const validationError = validateName(cleanName);
    if (validationError) return setNameError(validationError);
    setName(cleanName);
    setNameError("");
    navigate("username");
  }

  async function submitUsername(event: FormEvent) {
    event.preventDefault();
    const cleanUsername = username.trim().replace(/^@/, "");
    const validationError = validateUsername(cleanUsername);
    if (validationError) return setUsernameError(validationError);
    setUsernameError("");
    setLoading(true);
    await wait(750);
    if (cleanUsername.toLowerCase() === "extrovert") {
      setLoading(false);
      setUsernameError("That party name is taken. Try adding a number or underscore.");
      return;
    }
    setUsername(cleanUsername);
    setLoading(false);
    navigate("age");
  }

  function submitAge(event: FormEvent) {
    event.preventDefault();
    const validationError = validateAge(age);
    if (validationError) return setAgeError(validationError);
    setAgeError("");
    navigate("pronouns");
  }

  function submitPronouns(event: FormEvent) {
    event.preventDefault();
    if (!pronouns) {
      setPronounsError("Choose the option that feels right for you.");
      return;
    }
    if (pronouns === "Custom" && customPronouns.trim().length < 2) {
      setPronounsError("Enter the pronouns you'd like us to use.");
      return;
    }
    setPronounsError("");
    navigate("invite");
  }

  async function finishSignup(event: FormEvent) {
    event.preventDefault();
    const code = inviteCode.trim().toUpperCase();
    const validationError = validateInviteCode(code);
    if (validationError) return setInviteError(validationError);
    setInviteError("");
    setLoading(true);
    await wait(1100);
    if (code === "FAIL500") {
      setLoading(false);
      setToast({ kind: "error", message: "Signup hit a temporary snag. Your details are safe—please retry." });
      return;
    }
    setJoinedPartyIds((current) =>
      selectedPartyId && !current.includes(selectedPartyId)
        ? [...current, selectedPartyId]
        : current,
    );
    setLoading(false);
    navigate("success");
  }

  function resetDemo() {
    setScreen("location");
    setDirection("back");
    setLocation("");
    setSelectedPartyId(null);
    setJoinedPartyIds([]);
    setEmail("");
    setNewsletter(false);
    setOtp(["", "", "", "", "", ""]);
    setName("");
    setUsername("");
    setAge("");
    setPronouns("");
    setCustomPronouns("");
    setInviteCode("");
    setToast(null);
  }

  const pageClass = `screen screen-${screen} screen-${direction}`;

  return (
    <main className="app-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      {toast && (
        <div className={`toast toast-${toast.kind}`} role="alert">
          <span className="toast-icon" aria-hidden="true">
            {toast.kind === "success" ? <Check size={18} /> : "!"}
          </span>
          <span>{toast.message}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss notification">×</button>
        </div>
      )}

      {termsOpen && (
        <div className="dialog-backdrop" role="presentation">
          <section
            className="terms-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="terms-dialog-title"
          >
            <div className="dialog-heading">
              <div>
                <span className="eyebrow">House rules</span>
                <h2 id="terms-dialog-title">Terms and Conditions</h2>
              </div>
              <button ref={termsCloseRef} type="button" onClick={closeTerms} aria-label="Close Terms and Conditions">×</button>
            </div>
            <div className="dialog-copy">
              <p><strong>Be respectful.</strong> Harassment, discrimination and unsafe behaviour are not welcome at any Extroverts scene.</p>
              <p><strong>Party responsibly.</strong> Follow venue rules, respect personal boundaries and arrange safe travel home.</p>
              <p><strong>Keep plans genuine.</strong> Join only when you intend to attend, and update the host if your plans change.</p>
              <p><strong>Protect privacy.</strong> Do not share another member’s personal information or photos without permission.</p>
            </div>
            <ActionButton onClick={closeTerms}>Done</ActionButton>
          </section>
        </div>
      )}

      <section id="main-content" className={pageClass} key={screen}>
        {screen === "location" && (
          <div className="brand-stage location-stage">
            <div className="brand-art" aria-hidden="true">
              <span className="colour-block colour-block-one" />
              <span className="colour-block colour-block-two" />
              <span className="colour-block colour-block-three" />
              <span className="night-hill" />
            </div>
            <div className="brand-stage-inner location-inner">
              <Logo large />
              <div className="location-copy">
                <span className="eyebrow"><Navigation size={16} /> Your city sets the scene</span>
                <h1>Good parties<br />start nearby.</h1>
                <p>Share your location to discover café dates, rooftop scenes and people worth leaving the house for.</p>
              </div>
              <div className="bottom-actions location-actions">
                {locationError && <div className="inline-alert" role="alert">{locationError}</div>}
                <ActionButton loading={locationLoading} onClick={useLocation}>
                  <LocateFixed size={20} /> Use my location
                </ActionButton>
                <button className="text-button" type="button" onClick={chooseFallbackLocation}>
                  Continue with New Delhi
                </button>
                <p className="privacy-note"><ShieldCheck size={14} /> Used only to show nearby events in this demo.</p>
              </div>
            </div>
          </div>
        )}

        {screen === "welcome" && (
          <div className="brand-stage welcome-stage">
            <div className="brand-art" aria-hidden="true">
              <span className="colour-block colour-block-one" />
              <span className="colour-block colour-block-two" />
              <span className="colour-block colour-block-three" />
              <span className="night-hill" />
            </div>
            <div className="brand-stage-inner welcome-inner">
              <div className="welcome-logo"><Logo large /></div>
              <div className="welcome-copy">
                <p className="welcome-kicker">An app only for</p>
                <h1>Extroverts</h1>
                <p><span>Warning:</span> entering may lead to spontaneous dancing and unsolicited high-fives.</p>
              </div>
              <div className="bottom-actions">
                <ActionButton onClick={() => navigate("terms")}>Continue</ActionButton>
                <p className="location-confirm"><MapPin size={14} /> Showing scenes around {location || "New Delhi"}</p>
              </div>
            </div>
          </div>
        )}

        {screen === "terms" && (
          <div className="form-screen terms-screen">
            <header className="simple-header"><Logo /></header>
            <div className="terms-copy">
              <p>
                By using this app, you’re agreeing to keep things fun, safe, and respectful… and also agreeing to our terms and conditions. Politeness is a must—treat others how you’d want to be treated. Everyone here is looking for reasons to <em>party</em>, so bring your best vibe and expect the same from others. Let’s party responsibly and make every experience a great one!
              </p>
            </div>
            <div className="bottom-actions sticky-form-actions">
              <p className="terms-hint">To proceed, accept <button ref={termsTriggerRef} type="button" onClick={() => setTermsOpen(true)}>Terms and Conditions</button></p>
              <ActionButton onClick={() => navigate("parties")}>Accept</ActionButton>
              <SecondaryButton onClick={() => navigate("welcome", "back")}>Back</SecondaryButton>
            </div>
          </div>
        )}

        {screen === "parties" && (
          <div className="parties-page">
            <header className="discovery-header">
              <Logo />
              <div className="header-actions">
                <button type="button" aria-label="Vibe tickets" onClick={() => setToast({ kind: "success", message: "You have 160 honorary vibe tokens." })}><Ticket /><span>160</span></button>
                <button type="button" aria-label="Notifications" onClick={() => setToast({ kind: "success", message: "You’re all caught up—no new notifications." })}><Bell /></button>
                <button type="button" aria-label="Messages" onClick={() => setToast({ kind: "success", message: "Your inbox is ready for new party plans." })}><MessageCircle /></button>
              </div>
            </header>

            <section className="club-section" aria-labelledby="club-title">
              <div className="section-heading-row">
                <div>
                  <span className="eyebrow">Your club</span>
                  <h1 id="club-title">Silver Club Member</h1>
                </div>
                <span className="member-badge"><Sparkles size={18} /> Silver</span>
              </div>
              <div className="club-progress"><span /></div>
              <p><span>✦</span> You have 160 honorary vibe tokens!</p>
            </section>

            <section className="discover-section" aria-labelledby="discover-title">
              <div className="discover-title-row">
                <div>
                  <span className="eyebrow">Around {location || "New Delhi"}</span>
                  <h2 id="discover-title">Pick your scene.</h2>
                </div>
                <span className="live-pill"><i /> 3 live</span>
              </div>

              {partyLoadError ? (
                <div className="state-card" role="alert">
                  <RefreshCw />
                  <h3>The party list took a wrong turn.</h3>
                  <p>Your location is safe. Give the guest list another try.</p>
                  <ActionButton onClick={() => { setPartyLoading(true); setPartyLoadError(false); }}>Try again</ActionButton>
                </div>
              ) : partyLoading ? (
                <div className="party-grid" aria-label="Loading nearby parties">
                  {[1, 2, 3].map((item) => <PartySkeleton key={item} />)}
                </div>
              ) : (
                <div className="party-grid">
                  {parties.map((party) => (
                    <PartyCard
                      key={party.id}
                      party={party}
                      joined={joinedPartyIds.includes(party.id)}
                      onJoin={() => selectParty(party.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {screen === "email" && (
          <div className="form-screen auth-screen">
            <header className="simple-header"><Logo /></header>
            <form className="auth-form" onSubmit={submitEmail} noValidate>
              <button className="back-link" type="button" onClick={() => navigate("parties", "back")}><ChevronLeft /> Back to parties</button>
              <div className="context-chip"><PartyPopper size={16} /> Joining {selectedParty.title}</div>
              <h1>Enter your email</h1>
              <FormField label="Email" error={emailError} id="email">
                <input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  maxLength={80}
                  aria-invalid={Boolean(emailError)}
                  aria-describedby={emailError ? "email-error" : undefined}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    if (emailError) setEmailError("");
                  }}
                  onBlur={() => {
                    if (email && !emailPattern.test(email.trim())) setEmailError("Enter a valid email address, like you@example.com.");
                  }}
                />
              </FormField>
              <ActionButton type="submit" loading={loading}>Proceed</ActionButton>
              <label className="checkbox-row">
                <input type="checkbox" checked={newsletter} onChange={(event) => setNewsletter(event.target.checked)} />
                <span className="custom-checkbox"><Check /></span>
                <span>I’d like to subscribe to your newsletter</span>
              </label>
            </form>
          </div>
        )}

        {screen === "otp" && (
          <div className="form-screen auth-screen otp-screen">
            <header className="otp-logo"><Logo large /></header>
            <form className="auth-form" onSubmit={verifyOtp} noValidate>
              <span className="eyebrow">Email verified next</span>
              <h1>Enter OTP</h1>
              <p className="auth-lead">We sent a six-digit code to <strong>{email}</strong>.</p>
              <div className="otp-row" onPaste={pasteOtp}>
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => { otpRefs.current[index] = element; }}
                    aria-label={`OTP digit ${index + 1}`}
                    inputMode="numeric"
                    autoComplete={index === 0 ? "one-time-code" : "off"}
                    maxLength={1}
                    value={digit}
                    onChange={(event) => updateOtp(index, event.target.value)}
                    onKeyDown={(event) => handleOtpKey(index, event)}
                    aria-invalid={Boolean(otpError)}
                  />
                ))}
              </div>
              {otpError && <p className="field-error otp-error" role="alert">{otpError}</p>}
              <div className="resend-row">
                <span>{otpSeconds > 0 ? `Resend available in 0:${String(otpSeconds).padStart(2, "0")}` : "Didn't get it?"}</span>
                <button type="button" disabled={otpSeconds > 0 || loading} onClick={resendOtp}>Resend OTP</button>
              </div>
              <div className="auth-actions">
                <ActionButton type="submit" loading={loading}>Verify</ActionButton>
                <SecondaryButton onClick={() => navigate("email", "back")}>Change email</SecondaryButton>
              </div>
            </form>
          </div>
        )}

        {screen === "name" && (
          <WizardShell step={1} onBack={() => navigate("otp", "back")}>
            <form className="wizard-form" onSubmit={submitName} noValidate>
              <h1>“Name, please, for the party check!”</h1>
              <FormField label="Name" error={nameError} id="name">
                <input
                  id="name"
                  autoComplete="name"
                  placeholder="Your name"
                  value={name}
                  maxLength={50}
                  aria-invalid={Boolean(nameError)}
                  aria-describedby={nameError ? "name-error" : undefined}
                  onBlur={() => setNameError(validateName(name))}
                  onChange={(event) => {
                    const nextName = event.target.value;
                    setName(nextName);
                    if (nameError) setNameError(validateName(nextName));
                  }}
                />
              </FormField>
              <p className="field-helper">This is the name shown on member lists and join requests. You can’t change it later.</p>
              <WizardActions disabled={!name.trim()} loading={false} onBack={() => navigate("otp", "back")} />
            </form>
          </WizardShell>
        )}

        {screen === "username" && (
          <WizardShell step={2} onBack={() => navigate("name", "back")}>
            <form className="wizard-form" onSubmit={submitUsername} noValidate>
              <h1>Create a party name that fits your vibe.</h1>
              <FormField label="Party name" error={usernameError} id="username">
                <div className="input-prefix"><span>@</span><input
                  id="username"
                  autoComplete="username"
                  placeholder="partyname"
                  value={username}
                  maxLength={20}
                  aria-invalid={Boolean(usernameError)}
                  aria-describedby={usernameError ? "username-error" : undefined}
                  onBlur={() => setUsernameError(validateUsername(username))}
                  onChange={(event) => {
                    const nextUsername = event.target.value.replace(/^@/, "");
                    setUsername(nextUsername);
                    if (usernameError) setUsernameError(validateUsername(nextUsername));
                  }}
                /></div>
              </FormField>
              <p className="field-helper">Superlatives, invites and new friends will find you by this name—make it unforgettable.</p>
              <WizardActions disabled={!username.trim()} loading={loading} onBack={() => navigate("name", "back")} />
            </form>
          </WizardShell>
        )}

        {screen === "age" && (
          <WizardShell step={3} onBack={() => navigate("username", "back")}>
            <form className="wizard-form" onSubmit={submitAge} noValidate>
              <h1>How many years have you been partying?</h1>
              <FormField label="Age" error={ageError} id="age">
                <input
                  id="age"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="18+"
                  value={age}
                  maxLength={3}
                  aria-invalid={Boolean(ageError)}
                  aria-describedby={ageError ? "age-error" : undefined}
                  onBlur={() => setAgeError(validateAge(age))}
                  onChange={(event) => {
                    const nextAge = event.target.value.replace(/\D/g, "");
                    setAge(nextAge);
                    if (ageError) setAgeError(validateAge(nextAge));
                  }}
                />
              </FormField>
              <p className="field-helper">We need your age to verify you’re eligible and help others know who they’re connecting with.</p>
              <WizardActions disabled={!age} loading={false} onBack={() => navigate("username", "back")} />
            </form>
          </WizardShell>
        )}

        {screen === "pronouns" && (
          <WizardShell step={4} onBack={() => navigate("age", "back")}>
            <form className="wizard-form" onSubmit={submitPronouns} noValidate>
              <h1>Which pronouns feel right for you?</h1>
              <fieldset className="pronoun-fieldset">
                <legend>Pronouns</legend>
                <div className="pronoun-grid">
                  {["He / him", "She / her", "They / them", "Custom", "Prefer not to say"].map((option) => (
                    <button key={option} className={pronouns === option ? "selected" : ""} type="button" aria-pressed={pronouns === option} onClick={() => { setPronouns(option); setPronounsError(""); }}>
                      {option}<span>{pronouns === option && <Check size={16} />}</span>
                    </button>
                  ))}
                </div>
              </fieldset>
              {pronouns === "Custom" && (
                <FormField label="Your pronouns" id="custom-pronouns">
                  <input
                    id="custom-pronouns"
                    value={customPronouns}
                    maxLength={30}
                    placeholder="e.g. ze / zir"
                    aria-invalid={Boolean(pronounsError)}
                    aria-describedby={pronounsError ? "pronouns-error" : undefined}
                    onBlur={() => {
                      if (customPronouns.trim().length < 2) {
                        setPronounsError("Enter the pronouns you'd like us to use.");
                      }
                    }}
                    onChange={(event) => {
                      const nextPronouns = event.target.value;
                      setCustomPronouns(nextPronouns);
                      if (pronounsError) {
                        setPronounsError(nextPronouns.trim().length < 2 ? "Enter the pronouns you'd like us to use." : "");
                      }
                    }}
                  />
                </FormField>
              )}
              {pronounsError && <p id="pronouns-error" className="field-error" role="alert">{pronounsError}</p>}
              <p className="field-helper">Choose the words you’d like the community to use for you.</p>
              <WizardActions disabled={!pronouns || (pronouns === "Custom" && !customPronouns.trim())} loading={false} onBack={() => navigate("age", "back")} />
            </form>
          </WizardShell>
        )}

        {screen === "invite" && (
          <div className="form-screen wizard-screen">
            <WizardHeader step={4} complete />
            <form className="invite-form" onSubmit={finishSignup} noValidate>
              <div className="house-rules">
                <p>Kindness = good <em>hair day</em></p>
                <p>Sip in? <em>Chip in.</em></p>
                <p>Ghosting is for <em>Halloween.</em></p>
                <p>Outfits loud, <em>intentions clear.</em></p>
                <p>Joining? Free. Hosting? <em>Also free.</em></p>
                <p>Early is <em>iconic.</em></p>
              </div>
              <FormField label="Invite code (optional)" error={inviteError} id="invite-code">
                <input
                  id="invite-code"
                  autoCapitalize="characters"
                  placeholder="Optional"
                  value={inviteCode}
                  maxLength={10}
                  aria-invalid={Boolean(inviteError)}
                  aria-describedby={inviteError ? "invite-code-error" : undefined}
                  onBlur={() => setInviteError(validateInviteCode(inviteCode))}
                  onChange={(event) => {
                    const nextCode = event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                    setInviteCode(nextCode);
                    if (inviteError) setInviteError(validateInviteCode(nextCode));
                  }}
                />
              </FormField>
              <p className="field-helper">Enter an invite code and get up to +30 HVTs.</p>
              <div className="wizard-actions invite-actions">
                <ActionButton type="submit" loading={loading}>Sign up & join</ActionButton>
                <SecondaryButton onClick={() => navigate("pronouns", "back")}>Back</SecondaryButton>
              </div>
            </form>
          </div>
        )}

        {screen === "success" && (
          <div className="success-screen">
            <div className="confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, index) => <i key={index} />)}</div>
            <div className="success-content">
              <Logo large />
              <div className="success-mark"><Check /></div>
              <span className="eyebrow">You’re on the list</span>
              <h1>See you at<br />{selectedParty.title}.</h1>
              <p>Profile created, spot reserved. We’ve kept your vibe tokens warm.</p>
              <div className="success-party">
                <Image src={selectedParty.image} alt="" width={96} height={96} />
                <div>
                  <strong>{selectedParty.date} · {selectedParty.time}</strong>
                  <span><MapPin size={14} /> {selectedParty.place}</span>
                </div>
              </div>
              <div className="success-actions">
                <ActionButton onClick={() => { navigate("parties", "back"); setToast({ kind: "success", message: `${selectedParty.title} is now in your plans.` }); }}>View my scene</ActionButton>
                <button className="text-button" type="button" onClick={resetDemo}>Restart demo</button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function Logo({ large = false }: { large?: boolean }) {
  return <span className={`brand-logo${large ? " brand-logo-large" : ""}`} aria-label="Extroverts">E<sup>°</sup></span>;
}

function ActionButton({
  children,
  loading = false,
  type = "button",
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  loading?: boolean;
  type?: "button" | "submit";
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button className="primary-button" type={type} onClick={onClick} disabled={disabled || loading}>
      {loading ? <><span className="spinner" /> Hang tight</> : children}
    </button>
  );
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return <button className="secondary-button" type="button" onClick={onClick}>{children}</button>;
}

function FormField({
  label,
  error,
  id,
  children,
}: {
  label: string;
  error?: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`form-field${error ? " form-field-error" : ""}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && <p id={`${id}-error`} className="field-error" role="alert">{error}</p>}
    </div>
  );
}

function WizardHeader({ step, complete = false }: { step: number; complete?: boolean }) {
  return (
    <header className="wizard-header">
      <Logo />
      <div className="wizard-progress-wrap">
        <div className="wizard-progress-label"><span>{complete ? "Profile complete" : "Getting ready"}</span><strong>{complete ? "✓" : `${step} / 4`}</strong></div>
        <div className="wizard-progress"><span style={{ width: `${complete ? 100 : step * 25}%` }} /></div>
      </div>
    </header>
  );
}

function WizardShell({ step, onBack, children }: { step: number; onBack: () => void; children: React.ReactNode }) {
  return (
    <div className="form-screen wizard-screen">
      <WizardHeader step={step} />
      <button className="sr-only" type="button" onClick={onBack}>Go to previous step</button>
      {children}
    </div>
  );
}

function WizardActions({ disabled, loading, onBack }: { disabled: boolean; loading: boolean; onBack: () => void }) {
  return (
    <div className="wizard-actions">
      <ActionButton type="submit" disabled={disabled} loading={loading}>Next</ActionButton>
      <SecondaryButton onClick={onBack}>Back</SecondaryButton>
    </div>
  );
}

function PartyCard({ party, joined, onJoin }: { party: Party; joined: boolean; onJoin: () => void }) {
  return (
    <article className={`party-card accent-${party.accent}`}>
      <div className="party-image-wrap">
        <Image src={party.image} alt={`Friends at ${party.title}`} width={1000} height={760} priority={party.id === 1} />
        <div className="party-image-top"><span>{party.distance}</span><span><Users size={14} /> {party.spots} spots</span></div>
        <span className="party-type">{party.type}</span>
      </div>
      <div className="party-card-content">
        <div className="party-title-row">
          <div><h3>{party.title}</h3><p>{party.description}</p></div>
          <span className="party-token"><Sparkles size={16} /></span>
        </div>
        <div className="party-meta-top"><strong>{party.host}</strong><span>{party.category}</span></div>
        <div className="party-details">
          <span><Clock3 /> {party.time}</span>
          <span><CalendarDays /> {party.date}</span>
          <span className="party-address"><MapPin /> {party.place}</span>
        </div>
        <button className={`join-button${joined ? " joined" : ""}`} type="button" onClick={onJoin}>
          {joined ? <><Check size={19} /> Joined</> : "Join this party"}
        </button>
      </div>
    </article>
  );
}

function PartySkeleton() {
  return (
    <div className="party-card party-skeleton" aria-hidden="true">
      <div className="skeleton-image shimmer" />
      <div className="skeleton-body">
        <span className="shimmer wide" /><span className="shimmer medium" /><span className="shimmer short" />
      </div>
    </div>
  );
}
