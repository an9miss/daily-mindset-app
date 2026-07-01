"use client";

import { useEffect, useMemo, useState } from "react";

type Goal = {
  id: string;
  text: string;
  completed: boolean;
};

type DailyRecord = {
  quote: string;
  goals: Goal[];
};

type Records = Record<string, DailyRecord>;

const STORAGE_KEY = "daily-mindset-records-v1";
const MAX_GOALS = 3;
const quotes = [
  "今天先溫柔地開始，完成一小步也值得被看見。",
  "你不需要一次做到完美，只要比昨天更靠近自己。",
  "慢慢來也沒關係，穩定前進就是一種力量。",
  "把注意力放回此刻，你已經在路上了。",
  "願今天的你，用三件小事照顧未來的自己。",
  "每一次勾選完成，都是你守住承諾的證明。",
  "你可以柔軟，也可以很有力量。",
];

const dateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const displayDate = (key: string) =>
  new Intl.DateTimeFormat("zh-Hant", { month: "long", day: "numeric", weekday: "long" }).format(new Date(`${key}T12:00:00`));

const quoteForKey = (key: string) => {
  const sum = key.split("").reduce((total, char) => total + char.charCodeAt(0), 0);
  return quotes[sum % quotes.length];
};

const createRecord = (key: string): DailyRecord => ({ quote: quoteForKey(key), goals: [] });

const getCompletion = (record?: DailyRecord) => {
  if (!record || record.goals.length === 0) return 0;
  return Math.round((record.goals.filter((goal) => goal.completed).length / MAX_GOALS) * 100);
};

export default function Home() {
  const todayKey = useMemo(() => dateKey(new Date()), []);
  const yesterdayKey = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    return dateKey(date);
  }, []);
  const [records, setRecords] = useState<Records>({});
  const [newGoal, setNewGoal] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const today = records[todayKey] ?? createRecord(todayKey);
  const completedCount = today.goals.filter((goal) => goal.completed).length;
  const completion = getCompletion(today);
  const canAddGoal = today.goals.length < MAX_GOALS;

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? (JSON.parse(saved) as Records) : {};
    setRecords({ ...parsed, [todayKey]: parsed[todayKey] ?? createRecord(todayKey) });
  }, [todayKey]);

  useEffect(() => {
    if (Object.keys(records).length > 0) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    }
  }, [records]);

  useEffect(() => {
    if (today.goals.length === MAX_GOALS && completedCount === MAX_GOALS) {
      setShowCelebration(true);
      const timer = window.setTimeout(() => setShowCelebration(false), 2400);
      return () => window.clearTimeout(timer);
    }
  }, [completedCount, today.goals.length]);

  const addGoal = () => {
    const text = newGoal.trim();
    if (!text || !canAddGoal) return;
    setRecords((current) => {
      const record = current[todayKey] ?? createRecord(todayKey);
      return {
        ...current,
        [todayKey]: {
          ...record,
          goals: [...record.goals, { id: crypto.randomUUID(), text, completed: false }],
        },
      };
    });
    setNewGoal("");
  };

  const toggleGoal = (id: string) => {
    setRecords((current) => {
      const record = current[todayKey] ?? createRecord(todayKey);
      return {
        ...current,
        [todayKey]: {
          ...record,
          goals: record.goals.map((goal) => (goal.id === id ? { ...goal, completed: !goal.completed } : goal)),
        },
      };
    });
  };

  const weekSummary = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      const key = dateKey(date);
      return { key, label: new Intl.DateTimeFormat("zh-Hant", { weekday: "short" }).format(date), percent: getCompletion(records[key]) };
    });
  }, [records]);

  return (
    <main className="safe-shell mx-auto flex w-full max-w-[430px] flex-col gap-5">
      {showCelebration && (
        <div className="celebration" aria-live="polite">
          <div className="confetti">{Array.from({ length: 12 }, (_, index) => <span key={index} style={{ "--i": index } as React.CSSProperties} />)}</div>
          <div className="celebration-card rounded-[2rem] bg-[#fffaf2] px-8 py-7 text-center shadow-2xl">
            <p className="text-4xl">✨</p>
            <p className="mt-2 text-xl font-semibold text-[#6f523d]">三個目標都完成了</p>
            <p className="mt-1 text-sm text-[#9b7658]">今天的你，真的很棒。</p>
          </div>
        </div>
      )}

      <header className="pt-2">
        <p className="text-sm font-medium tracking-[0.28em] text-[#9b7658]">DAILY MINDSET</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-[-0.04em] text-[#4b3a2d]">今日提醒</h1>
        <p className="mt-2 text-sm text-[#8a6c52]">{displayDate(todayKey)}</p>
      </header>

      <section className="glass-card rounded-[2rem] p-6">
        <p className="text-sm font-medium text-[#9b7658]">給自己的鼓勵</p>
        <blockquote className="mt-4 text-2xl font-semibold leading-snug tracking-[-0.03em]">「{today.quote}」</blockquote>
      </section>

      <section className="glass-card rounded-[2rem] p-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[#9b7658]">今日三個小目標</p>
            <h2 className="mt-1 text-2xl font-semibold">完成率 {completion}%</h2>
          </div>
          <div className="grid h-16 w-16 place-items-center rounded-full bg-[#d8bfa3]/35 text-lg font-semibold text-[#6f523d]">{completedCount}/{MAX_GOALS}</div>
        </div>
        <div className="mt-4 h-2 rounded-full bg-[#eadfce]">
          <div className="h-full rounded-full bg-[#9b7658] transition-all duration-500" style={{ width: `${completion}%` }} />
        </div>

        <div className="mt-5 space-y-3">
          {today.goals.map((goal) => (
            <button key={goal.id} onClick={() => toggleGoal(goal.id)} className="flex w-full items-center gap-3 rounded-2xl border border-[#6f523d]/10 bg-white/55 p-4 text-left active:scale-[0.99]">
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border ${goal.completed ? "check-pop border-[#9b7658] bg-[#9b7658] text-white" : "border-[#cdb498]"}`}>{goal.completed ? "✓" : ""}</span>
              <span className={goal.completed ? "text-[#8a6c52] line-through" : "text-[#4b3a2d]"}>{goal.text}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 flex gap-2">
          <input value={newGoal} onChange={(event) => setNewGoal(event.target.value)} onKeyDown={(event) => event.key === "Enter" && addGoal()} disabled={!canAddGoal} placeholder={canAddGoal ? "新增一個溫柔小目標" : "今天的三個目標已滿"} className="min-h-12 flex-1 rounded-2xl border border-[#6f523d]/10 bg-[#fffaf2] px-4 outline-none focus:border-[#9b7658] disabled:opacity-60" />
          <button onClick={addGoal} disabled={!canAddGoal || !newGoal.trim()} className="min-h-12 rounded-2xl bg-[#4b3a2d] px-5 font-medium text-white disabled:opacity-35">新增</button>
        </div>
      </section>

      <section className="glass-card rounded-[2rem] p-5">
        <p className="text-sm font-medium text-[#9b7658]">回顧</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-3xl bg-white/55 p-4">
            <p className="text-sm text-[#8a6c52]">昨天</p>
            <p className="mt-2 text-3xl font-semibold">{getCompletion(records[yesterdayKey])}%</p>
          </div>
          <div className="rounded-3xl bg-white/55 p-4">
            <p className="text-sm text-[#8a6c52]">本週平均</p>
            <p className="mt-2 text-3xl font-semibold">{Math.round(weekSummary.reduce((sum, day) => sum + day.percent, 0) / 7)}%</p>
          </div>
        </div>
        <div className="mt-5 flex h-28 items-end justify-between gap-2">
          {weekSummary.map((day) => (
            <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-20 w-full items-end rounded-full bg-[#eadfce] p-1">
                <div className="w-full rounded-full bg-[#d8bfa3] transition-all duration-500" style={{ height: `${Math.max(day.percent, 6)}%` }} />
              </div>
              <span className="text-[11px] text-[#8a6c52]">{day.label}</span>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
