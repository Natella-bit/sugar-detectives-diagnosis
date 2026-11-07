"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Category = "תקין" | "טרום־סוכרת" | "סוכרת" | "עדיין לא ניתן לקבוע";
type Screen = "intro" | "instructions" | "game" | "bonus" | "summary" | "map";

type Scenario = {
  name: string;
  age: number;
  reason: string;
  symptoms?: string;
  background?: string;
  test: string;
  result: string;
  fasting?: string;
  answer: Category;
  feedback: string;
  threshold: string;
  image: number;
  stamp?: string;
};

const categories: { label: Category; icon: string; hint: string }[] = [
  { label: "תקין", icon: "◌", hint: "בטווח התקין" },
  { label: "טרום־סוכרת", icon: "◐", hint: "טווח סיכון מוגבר" },
  { label: "סוכרת", icon: "◆", hint: "אבחנה מאומתת" },
  { label: "עדיין לא ניתן לקבוע", icon: "◇", hint: "נדרש מידע או אימות" },
];

const scenarios: Scenario[] = [
  {
    name: "יוסי", age: 46, reason: "בדיקת סקר תקופתית",
    symptoms: "ללא תסמינים", test: "גלוקוז בפלזמה", result: "92 mg/dL",
    fasting: "צום של 10 שעות", answer: "תקין",
    feedback: "נכון. גלוקוז בצום מתחת ל־100 mg/dL נמצא בטווח התקין.",
    threshold: "סף: גלוקוז בצום תקין < 100 mg/dL", image: 0,
  },
  {
    name: "מרים", age: 58, reason: "יתר לחץ דם והשמנה",
    symptoms: "ללא תסמינים", test: "HbA1c", result: "6.1%",
    answer: "טרום־סוכרת",
    feedback: "נכון. HbA1c בטווח 5.7%–6.4% מתאים לטרום־סוכרת.",
    threshold: "סף: HbA1c 5.7%–6.4%", image: 1,
  },
  {
    name: "ראמי", age: 51, reason: "כבד שומני",
    test: "גלוקוז בפלזמה", result: "117 mg/dL", fasting: "צום של 9 שעות",
    answer: "טרום־סוכרת",
    feedback: "נכון. גלוקוז בצום בטווח 100–125 mg/dL מתאים לטרום־סוכרת.",
    threshold: "סף: גלוקוז בצום 100–125 mg/dL", image: 2,
  },
  {
    name: "דינה", age: 63, reason: "בדיקת דם שגרתית",
    symptoms: "ללא תסמינים", background: "אין בדיקה חריגה נוספת",
    test: "HbA1c", result: "6.8%", answer: "עדיין לא ניתן לקבוע",
    feedback: "הערך נמצא בטווח המתאים לסוכרת, אך בהיעדר תסמינים או היפרגליקמיה חד־משמעית נדרש אימות באמצעות תוצאה חריגה נוספת.",
    threshold: "HbA1c ≥ 6.5%: טווח סוכרת; ללא תסמינים נדרש אימות",
    image: 3, stamp: "חשד גבוה לסוכרת — נדרש אימות",
  },
  {
    name: "אורי", age: 39, reason: "צמא מוגבר, השתנה מרובה וירידה בלתי מוסברת במשקל",
    symptoms: "תסמינים קלאסיים של היפרגליקמיה", test: "גלוקוז אקראי בפלזמה",
    result: "286 mg/dL", answer: "סוכרת",
    feedback: "נכון. גלוקוז אקראי של 200 mg/dL ומעלה בנוכחות תסמינים קלאסיים מאפשר לקבוע אבחנת סוכרת.",
    threshold: "סף: גלוקוז אקראי ≥ 200 mg/dL + תסמינים קלאסיים", image: 4,
  },
  {
    name: "שרה", age: 72, reason: "בדיקות בקבלה למחלקה",
    symptoms: "ללא תסמינים קלאסיים", background: "אין תוצאה חריגה נוספת",
    test: "גלוקוז אקראי בפלזמה", result: "214 mg/dL",
    answer: "עדיין לא ניתן לקבוע",
    feedback: "הערך חריג ודורש התייחסות, אך ללא תסמינים קלאסיים או משבר היפרגליקמי יש לאמת את האבחנה בבדיקה נוספת.",
    threshold: "גלוקוז אקראי ≥ 200 mg/dL ללא תסמינים: נדרש אימות", image: 5,
  },
  {
    name: "לינה", age: 44, reason: "בירור עקב גורמי סיכון",
    test: "העמסת גלוקוז פומית של 75 גרם", result: "168 mg/dL",
    background: "תוצאה לאחר שעתיים", answer: "טרום־סוכרת",
    feedback: "נכון. ערך של 140–199 mg/dL שעתיים לאחר העמסת 75 גרם גלוקוז מתאים לטרום־סוכרת.",
    threshold: "סף: שעתיים לאחר העמסה 140–199 mg/dL", image: 6,
  },
  {
    name: "אלכס", age: 55, reason: "בירור ערכי גלוקוז מוגברים",
    symptoms: "ללא תסמינים קלאסיים", test: "שתי בדיקות גלוקוז בצום",
    result: "132 ← 129 mg/dL", background: "בדיקה חוזרת ביום אחר",
    answer: "סוכרת",
    feedback: "נכון. שתי תוצאות גלוקוז בצום של 126 mg/dL ומעלה מאשרות את האבחנה גם ללא תסמינים.",
    threshold: "סף: שתי תוצאות גלוקוז בצום ≥ 126 mg/dL", image: 7,
  },
];

const bonus: Scenario = {
  name: "נועה", age: 49, reason: "מדידה במחלקה",
  symptoms: "ללא תסמינים קלאסיים", background: "ללא תוצאת מעבדה",
  test: "מדידת גלוקומטר", result: "238 mg/dL",
  answer: "עדיין לא ניתן לקבוע",
  feedback: "מדידת גלוקומטר יכולה לזהות מצב הדורש טיפול ובירור, אך אבחנה רשמית צריכה להתבסס על בדיקת מעבדה מתאימה ובהתאם להקשר הקליני.",
  threshold: "אבחנה רשמית אינה נקבעת על סמך גלוקומטר בלבד", image: 8,
};

function fmtTime(total: number) {
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function Home() {
  const [screen, setScreen] = useState<Screen>("intro");
  const [index, setIndex] = useState(0);
  const [attempt, setAttempt] = useState(1);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [secondTry, setSecondTry] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [caseStartElapsed, setCaseStartElapsed] = useState(0);
  const [feedback, setFeedback] = useState<"correct" | "wrong" | null>(null);
  const [sound, setSound] = useState(true);
  const [help, setHelp] = useState(false);
  const [helpUsed, setHelpUsed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [bonusEarned, setBonusEarned] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const audioRef = useRef<AudioContext | null>(null);

  const active = screen === "bonus" ? bonus : scenarios[index];
  const playing = screen === "game" || screen === "bonus";

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const saved = localStorage.getItem("sugar-detectives-progress");
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.screen && p.screen !== "summary" && p.screen !== "map") {
          setScreen(p.screen); setIndex(p.index ?? 0); setAttempt(p.attempt ?? 1);
          setScore(p.score ?? 0); setCorrect(p.correct ?? 0); setSecondTry(p.secondTry ?? 0);
          setElapsed(p.elapsed ?? 0); setBonusEarned(p.bonusEarned ?? false);
        }
      } catch { /* ignore corrupt local progress */ }
    }
    setLoaded(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem("sugar-detectives-progress", JSON.stringify({
      screen, index, attempt, score, correct, secondTry, elapsed, bonusEarned,
    }));
  }, [screen, index, attempt, score, correct, secondTry, elapsed, bonusEarned, loaded]);

  useEffect(() => {
    if (!playing || feedback) return;
    const timer = window.setInterval(() => setElapsed((v) => v + 1), 1000);
    return () => window.clearInterval(timer);
  }, [playing, feedback]);

  function tone(ok: boolean) {
    if (!sound) return;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = audioRef.current ?? new AudioCtx();
    audioRef.current = ctx;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = ok ? 620 : 260;
    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
    osc.connect(gain); gain.connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.22);
  }

  function choose(category: Category) {
    if (feedback) return;
    if (category === active.answer) {
      const seconds = Math.max(0, elapsed - caseStartElapsed);
      const speed = helpUsed ? 0 : Math.max(0, 20 - Math.floor(seconds / 2));
      const earned = screen === "bonus" ? 100 : (attempt === 1 ? 100 : 60) + speed;
      setScore((v) => Math.min(1000, v + earned));
      setCorrect((v) => v + 1);
      if (attempt === 2) setSecondTry((v) => v + 1);
      setFeedback("correct"); tone(true);
    } else if (attempt === 1) {
      setAttempt(2); setFeedback("wrong"); tone(false);
      window.setTimeout(() => setFeedback(null), 1800);
    } else {
      setFeedback("correct"); tone(false);
    }
  }

  function next() {
    setFeedback(null); setAttempt(1); setHelpUsed(false); setCaseStartElapsed(elapsed);
    if (screen === "bonus") { setScreen("summary"); return; }
    if (index < scenarios.length - 1) { setIndex((v) => v + 1); return; }
    const qualifies = correct >= 6;
    setBonusEarned(qualifies);
    setScreen(qualifies ? "bonus" : "summary");
  }

  function reset() {
    setScreen("intro"); setIndex(0); setAttempt(1); setScore(0); setCorrect(0);
    setSecondTry(0); setElapsed(0); setFeedback(null); setHelp(false);
    setHelpUsed(false); setBonusEarned(false); setCaseStartElapsed(0);
    localStorage.removeItem("sugar-detectives-progress");
  }

  const performance = useMemo(() => {
    const denom = bonusEarned ? 9 : 8;
    const pct = Math.round((correct / denom) * 100);
    if (pct >= 90) return { title: "בלש/ית סוכר מומחה/ית", text: "זיהיתם נכון את ערכי הסף וגם את המצבים שבהם נדרש אימות לפני קביעת אבחנה." };
    if (pct >= 70) return { title: "פענוח קליני טוב", text: "הבסיס מצוין. מומלץ לחזור על ההבדל בין ערך בטווח סוכרת לבין אבחנה מאומתת." };
    return { title: "החקירה עדיין פתוחה", text: "עברו על מפת האבחון ונסו שוב. ההבדל בין בדיקה חריגה לבין אבחנה סופית הוא חלק מרכזי בהחלטה הקלינית." };
  }, [correct, bonusEarned]);

  if (screen === "intro") return (
    <Shell sound={sound} setSound={setSound}>
      <main className="intro-stage">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-shade" aria-hidden="true" />
        <div className="ambient-grid" />
        <section className="hero-panel">
          <div className="hero-kicker"><i /> משימה קלינית חדשה · תיק 01</div>
          <p className="series-label">בלשי הסוכר — סדרת המשחקים הקליניים</p>
          <h1><span>בלשי הסוכר</span>פענחו את <em>האבחנה</em></h1>
          <p className="subtitle">תקין, טרום־סוכרת, סוכרת — או שעדיין מוקדם לקבוע?</p>
          <p className="mission-copy">שמונה תיקים רפואיים נכנסו למערכת. סרקו את הנתונים, קבעו את סיווג הגלוקוז — והחליטו אם הראיות מספיקות לאבחנה.</p>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => setScreen("instructions")}>
              <span>כניסה לחדר הפענוח</span><b>←</b>
            </button>
            <div className="mission-meta"><strong>8</strong><span>תיקים קליניים</span></div>
            <div className="mission-meta"><strong>2–3</strong><span>דקות למשימה</span></div>
          </div>
          <div className="hero-scan-card" aria-hidden="true">
            <span className="scan-corner one" /><span className="scan-corner two" />
            <i className="hero-scan-line" />
            <b>מערכת פענוח פעילה</b><small>CLINICAL DATA READY</small>
          </div>
        </section>
        <div className="status-chip">חיבור מאובטח <i /></div>
      </main>
    </Shell>
  );

  if (screen === "instructions") return (
    <Shell sound={sound} setSound={setSound}>
      <main className="instructions-stage">
        <section className="instruction-card">
          <div className="eyebrow">פרוטוקול המשימה · 01</div>
          <h2>איך מפענחים?</h2>
          <p>בכל תיק יוצגו נתוני מטופל ותוצאות בדיקות. העבירו את התיק לאזור המתאים.</p>
          <div className="category-preview">
            {categories.map((c) => <div key={c.label}><b>{c.icon}</b><span>{c.label}</span></div>)}
          </div>
          <aside><strong>נקודת מפתח</strong><span>לעיתים הערך מתאים לטווח סוכרת, אך עדיין נדרש אימות לפני קביעת אבחנה.</span></aside>
          <div className="interaction-hint"><span>לחיצה</span><i>או</i><span>גרירה</span> — שתי הדרכים זמינות בכל מסך</div>
          <button className="primary-button" onClick={() => { setScreen("game"); setCaseStartElapsed(elapsed); }}>
            <span>אני מוכן/ה לפענח</span><b>←</b>
          </button>
        </section>
      </main>
    </Shell>
  );

  if (playing) return (
    <Shell sound={sound} setSound={setSound}>
      <main className="game-stage">
        <section className="game-topbar">
          <div><span>{screen === "bonus" ? "תיק בונוס" : `תיק ${index + 1} מתוך 8`}</span><b>{screen === "bonus" ? "בדיקת שטח" : "פענוח נתונים"}</b></div>
          <div className="hud">
            <span><small>ניקוד</small><b>{score}</b></span>
            <span><small>זמן</small><b>{fmtTime(elapsed)}</b></span>
            <button onClick={() => { setHelp(true); setHelpUsed(true); }} aria-label="פתיחת עזרה">? עזרה</button>
          </div>
        </section>
        <div className="progress-track"><i style={{ width: `${((screen === "bonus" ? 9 : index + 1) / 9) * 100}%` }} /></div>

        <section className="workstation">
          <div className="side-monitor">
            <p>מערכת פענוח</p>
            <div className="monitor-ring">{screen === "bonus" ? "B" : String(index + 1).padStart(2, "0")}</div>
            <span>{screen === "bonus" ? "שלב נוסף" : `${8 - index} תיקים נותרו`}</span>
            <i className="mini-wave" />
          </div>

          <article
            className={`patient-card ${dragging ? "dragging" : ""} ${feedback ?? ""}`}
            draggable={!feedback}
            onDragStart={() => setDragging(true)}
            onDragEnd={() => setDragging(false)}
          >
            <div className="scan-sweep" />
            <div className={`patient-photo photo-${active.image}`} role="img" aria-label={`דמות מטופל/ת בדויה: ${active.name}`}>
              <div className="image-placeholder"><span>{active.name.slice(0, 1)}</span></div>
              {(active.image === 5 || active.image === 8) && <div className="ziv-gown-mark">זיו</div>}
              <div className="photo-badge">תיק בדוי</div>
            </div>
            <div className="patient-data">
              <header>
                <div><small>שם המטופל/ת</small><h2>{active.name}</h2></div>
                <div className="age"><small>גיל</small><strong>{active.age}</strong></div>
              </header>
              <div className="data-row"><span>סיבת הבדיקה</span><b>{active.reason}</b></div>
              {active.symptoms && <div className="data-row"><span>תסמינים</span><b>{active.symptoms}</b></div>}
              {active.background && <div className="data-row"><span>מידע נוסף</span><b>{active.background}</b></div>}
              {active.fasting && <div className="fasting-chip">◷ {active.fasting}</div>}
              <div className="lab-result">
                <div><small>סוג הבדיקה</small><b>{active.test}</b></div>
                <div><small>תוצאה</small><strong dir="ltr">{active.result}</strong></div>
              </div>
            </div>
          </article>

          <div className="decision-label"><span>בחרו את אזור הסיווג</span><small>לחצו או גררו את התיק</small></div>
          <div className="drop-grid">
            {categories.map((c) => (
              <button
                key={c.label}
                className={`drop-zone ${dragging ? "ready" : ""}`}
                onClick={() => choose(c.label)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); setDragging(false); choose(c.label); }}
                disabled={!!feedback}
              >
                <i>{c.icon}</i><span><b>{c.label}</b><small>{c.hint}</small></span>
              </button>
            ))}
          </div>
        </section>

        {feedback && (
          <div className={`feedback-panel ${feedback}`} role="status">
            {feedback === "wrong" ? (
              <><div className="feedback-icon">↻</div><div><h3>בדקו שוב את הנתונים</h3><p>התמקדו בסוג הבדיקה, בתסמינים ובהאם נדרש אימות. נותר ניסיון נוסף.</p></div></>
            ) : (
              <>
                <div className="feedback-icon">✓</div>
                <div><h3>{attempt === 2 && active.answer !== categories.find(c => c.label === active.answer)?.label ? "הפענוח הושלם" : active.answer}</h3><p>{active.feedback}</p><strong>{active.threshold}</strong>{active.stamp && <em>{active.stamp}</em>}</div>
                <button onClick={next}>לתיק הבא ←</button>
              </>
            )}
          </div>
        )}
        <Help open={help} close={() => setHelp(false)} />
      </main>
    </Shell>
  );

  if (screen === "summary") {
    const denom = bonusEarned ? 9 : 8;
    const pct = Math.round((correct / denom) * 100);
    return (
      <Shell sound={sound} setSound={setSound}>
        <main className="summary-stage">
          <section className="summary-card">
            <div className="completion-mark"><span>✓</span><i /></div>
            <p className="eyebrow">משימה הושלמה</p>
            <h2>הפענוח הושלם</h2>
            <div className="score-orbit"><strong>{score}</strong><span>מתוך 1,000 נקודות</span></div>
            <h3>{performance.title}</h3>
            <p className="performance-copy">{performance.text}</p>
            <div className="stats-grid">
              <div><b>{correct}/{denom}</b><span>תשובות נכונות</span></div>
              <div><b>{secondTry}</b><span>ניסיון נוסף</span></div>
              <div><b>{fmtTime(elapsed)}</b><span>זמן ביצוע</span></div>
              <div><b>{pct}%</b><span>דיוק קליני</span></div>
            </div>
            <div className="summary-actions">
              <button className="primary-button" onClick={reset}>משחק חוזר ↻</button>
              <button className="secondary-button" onClick={() => setScreen("map")}>צפייה במפת האבחון</button>
            </div>
            <p className="disclaimer">המשחק הוא כלי לימודי ואינו מחליף שיקול דעת קליני, נהלים מקומיים או הערכה רפואית מלאה.</p>
            <p className="source">מקור: ADA Standards of Care in Diabetes—2026 · Diagnosis and Classification of Diabetes</p>
          </section>
        </main>
      </Shell>
    );
  }

  return (
    <Shell sound={sound} setSound={setSound}>
      <main className="map-stage">
        <section className="diagnostic-map">
          <header><div><p className="eyebrow">לוח עזר קליני</p><h2>מפת האבחון</h2></div><button onClick={() => setScreen("summary")}>← חזרה לסיכום</button></header>
          <div className="map-columns">
            <MapColumn title="תקין" tone="normal" items={["HbA1c מתחת ל־5.7%", "גלוקוז בצום מתחת ל־100 mg/dL", "שעתיים לאחר העמסת 75 גרם: מתחת ל־140 mg/dL"]} />
            <MapColumn title="טרום־סוכרת" tone="pre" items={["HbA1c:‏ 5.7%–6.4%", "גלוקוז בצום: 100–125 mg/dL", "שעתיים לאחר העמסת 75 גרם: 140–199 mg/dL"]} />
            <MapColumn title="טווח המתאים לסוכרת" tone="diabetes" items={["HbA1c:‏ 6.5% ומעלה", "גלוקוז בצום: 126 mg/dL ומעלה", "שעתיים לאחר העמסת 75 גרם: 200 mg/dL ומעלה", "גלוקוז אקראי: 200 mg/dL ומעלה + תסמינים קלאסיים או משבר היפרגליקמי"]} />
          </div>
          <aside><strong>עקרון האימות</strong><p>בהיעדר היפרגליקמיה חד־משמעית, תסמינים קלאסיים או משבר היפרגליקמי, יש לאמת את האבחנה באמצעות תוצאה חריגה נוספת.</p></aside>
          <p className="source">American Diabetes Association Professional Practice Committee. Standards of Care in Diabetes—2026.</p>
        </section>
      </main>
    </Shell>
  );
}

function Shell({ children, sound, setSound }: { children: React.ReactNode; sound: boolean; setSound: (v: boolean) => void }) {
  return (
    <div className="app-shell" dir="rtl">
      <header className="global-header">
        <div className="brand-mark"><span>+</span></div>
        <div><small>בלשי הסוכר</small><b>סדרת המשחקים הקליניים</b></div>
        <button className="sound-button" onClick={() => setSound(!sound)} aria-label={sound ? "השתקת צלילים" : "הפעלת צלילים"}>{sound ? "◕" : "○"} <span>{sound ? "צליל פעיל" : "מושתק"}</span></button>
      </header>
      {children}
    </div>
  );
}

function Help({ open, close }: { open: boolean; close: () => void }) {
  if (!open) return null;
  return (
    <div className="help-overlay" onClick={close}>
      <section className="help-sheet" onClick={(e) => e.stopPropagation()}>
        <button className="close-help" onClick={close}>×</button>
        <p className="eyebrow">רמז קליני</p><h2>מפת ספים מקוצרת</h2>
        <div><b>HbA1c</b><span>תקין &lt;5.7% · טרום 5.7%–6.4% · טווח סוכרת ≥6.5%</span></div>
        <div><b>צום</b><span>תקין &lt;100 · טרום 100–125 · טווח סוכרת ≥126 mg/dL</span></div>
        <div><b>העמסה, שעתיים</b><span>תקין &lt;140 · טרום 140–199 · טווח סוכרת ≥200 mg/dL</span></div>
        <aside>ערך בטווח סוכרת אינו תמיד אבחנה מאומתת. בדקו תסמינים, משבר או תוצאה חריגה נוספת.</aside>
        <button className="primary-button" onClick={close}>חזרה לתיק</button>
      </section>
    </div>
  );
}

function MapColumn({ title, tone, items }: { title: string; tone: string; items: string[] }) {
  return <article className={`map-column ${tone}`}><h3>{title}</h3>{items.map((x) => <p key={x}>{x}</p>)}</article>;
}
