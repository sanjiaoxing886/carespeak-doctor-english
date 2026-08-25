"use client";

import { useEffect, useRef, useState } from "react";

type View = "home" | "scenes" | "vocabulary" | "review" | "stats" | "course";
type LessonStep = "brief" | "words" | "phrases" | "simulation" | "result";

type WordItem = {
  term: string;
  phonetic: string;
  meaning: string;
  patient: string;
  clinician: string;
  example: string;
};

type PhraseItem = { en: string; zh: string; tag: string };
type SimTurn = {
  patient: string;
  intent: string;
  ideal: string;
  keys: string[][];
  followup: string;
  safety?: boolean;
};

type Course = {
  id: string;
  unit: string;
  title: string;
  subtitle: string;
  level: string;
  minutes: number;
  color: string;
  tint: string;
  icon: string;
  caseSummary: string;
  goal: string;
  objectives: string[];
  words: WordItem[];
  phrases: PhraseItem[];
  turns: SimTurn[];
};

const courses: Course[] = [
  {
    id: "chest-pain",
    unit: "急诊 · 心血管",
    title: "胸痛与呼吸困难",
    subtitle: "Chest pain assessment",
    level: "B1–B2",
    minutes: 14,
    color: "#e85d35",
    tint: "#fff1eb",
    icon: "ECG",
    caseSummary: "52 岁男性，步行上班时突发胸部压迫感，休息后缓解，伴出汗和恶心。",
    goal: "完成胸痛时间线、疼痛特征、伴随症状和危险因素问诊，并清楚解释下一步检查。",
    objectives: ["从开放式问题进入聚焦追问", "询问部位、性质、放射与活动关系", "筛查关键伴随症状", "避免检查前作确定诊断"],
    words: [
      { term: "pressure", phonetic: "/ˈpreʃər/", meaning: "压迫感", patient: "It feels like something heavy is sitting on my chest.", clinician: "a pressure-like discomfort", example: "Does it feel like pressure, tightness, or a sharp pain?" },
      { term: "radiate", phonetic: "/ˈreɪdieɪt/", meaning: "放射（专业）", patient: "It goes into my left arm.", clinician: "The pain radiates to the left arm.", example: "Does the pain spread to your arm, jaw, back, or shoulder?" },
      { term: "exertion", phonetic: "/ɪɡˈzɜːrʃən/", meaning: "活动、用力", patient: "It gets worse when I walk upstairs.", clinician: "worse on exertion", example: "Is it worse with activity or exertion?" },
      { term: "come and go", phonetic: "/kʌm ən ɡoʊ/", meaning: "间歇出现", patient: "It comes and goes.", clinician: "intermittent episodes", example: "How long does each episode last?" },
      { term: "short of breath", phonetic: "/ʃɔːrt əv breθ/", meaning: "呼吸困难", patient: "I can’t catch my breath.", clinician: "shortness of breath / dyspnea", example: "Do you feel short of breath?" },
      { term: "pass out", phonetic: "/pæs aʊt/", meaning: "晕厥（通俗）", patient: "I nearly passed out.", clinician: "syncope / near-syncope", example: "Did you faint or feel as if you were going to faint?" },
    ],
    phrases: [
      { en: "Tell me what happened from the beginning.", zh: "请从一开始告诉我发生了什么。", tag: "开放提问" },
      { en: "When did you first notice the discomfort?", zh: "您最早什么时候注意到这种不适？", tag: "时间线" },
      { en: "Can you point with one finger to where it hurts most?", zh: "请用一根手指指出最痛的位置。", tag: "部位" },
      { en: "What were you doing when it started?", zh: "开始时您正在做什么？", tag: "诱因" },
      { en: "Does the pain spread anywhere else?", zh: "疼痛会扩散到其他部位吗？", tag: "放射" },
      { en: "Because of your symptoms, I’d like to assess you promptly.", zh: "鉴于这些症状，我想尽快为您评估。", tag: "安全沟通" },
    ],
    turns: [
      { patient: "I started having this heavy feeling in my chest on my way to work.", intent: "询问何时开始，以及当时在做什么。", ideal: "When did it start, and what were you doing at the time?", keys: [["when", "how long", "start"], ["doing", "activity", "walking"]], followup: "It started about forty minutes ago while I was walking uphill." },
      { patient: "It eased when I stopped, but I can still feel a little pressure.", intent: "询问严重度，以及疼痛是否扩散。", ideal: "How severe is it now, and does the pain spread anywhere else?", keys: [["severe", "scale", "zero", "ten"], ["spread", "arm", "jaw", "back", "shoulder"]], followup: "It’s about four out of ten now. Earlier it went down my left arm." },
      { patient: "I felt sweaty and a little sick as well.", intent: "筛查呼吸困难、晕厥等伴随症状。", ideal: "Did you feel short of breath, dizzy, or as if you were going to faint?", keys: [["short of breath", "breath", "breathing"], ["faint", "pass out", "dizzy"]], followup: "I was short of breath, but I didn’t pass out.", safety: true },
      { patient: "Doctor, is this a heart attack?", intent: "承认担忧，表达不确定性并解释需尽快检查。", ideal: "There are several possible causes. We need to rule out a heart problem promptly, so we’ll start with an ECG and blood tests.", keys: [["possible", "several", "not sure", "rule out"], ["ECG", "electrocardiogram"], ["blood test", "blood tests", "promptly", "quickly"]], followup: "Okay. Thank you for explaining that." , safety: true},
    ],
  },
  {
    id: "abdominal-pain",
    unit: "门诊 · 消化系统",
    title: "腹痛、恶心与排便变化",
    subtitle: "Abdominal pain history",
    level: "B1–B2",
    minutes: 13,
    color: "#287c70",
    tint: "#e9f6f2",
    icon: "GI",
    caseSummary: "29 岁女性，右下腹痛 12 小时，伴恶心和食欲下降；需要在隐私环境下询问妊娠可能。",
    goal: "完成疼痛定位、迁移、消化道及泌尿生殖症状问诊，并礼貌处理敏感问题。",
    objectives: ["澄清腹痛最初和当前部位", "询问排便、呕吐与尿路症状", "中性地询问妊娠可能", "查体前解释并获得配合"],
    words: [
      { term: "bloating", phonetic: "/ˈbloʊtɪŋ/", meaning: "腹胀", patient: "I feel bloated.", clinician: "abdominal distension", example: "Have you noticed any bloating or swelling?" },
      { term: "crampy", phonetic: "/ˈkræmpi/", meaning: "痉挛样的", patient: "It feels crampy.", clinician: "cramping pain", example: "Is it cramping, sharp, burning, or dull?" },
      { term: "move", phonetic: "/muːv/", meaning: "移动、迁移", patient: "It moved to the right side.", clinician: "migration of pain", example: "Has the pain moved since it began?" },
      { term: "bowel movement", phonetic: "/ˈbaʊəl ˈmuːvmənt/", meaning: "排便", patient: "I haven’t opened my bowels for three days.", clinician: "constipation", example: "When was your last bowel movement?" },
      { term: "loose stools", phonetic: "/luːs stuːlz/", meaning: "稀便", patient: "I’ve had loose stools.", clinician: "diarrhea", example: "How often have you had diarrhea? Any blood or mucus?" },
      { term: "burning", phonetic: "/ˈbɜːrnɪŋ/", meaning: "灼烧感", patient: "It burns when I pee.", clinician: "dysuria", example: "Do you have pain or burning when you urinate?" },
    ],
    phrases: [
      { en: "Where did the pain start, and where is it now?", zh: "疼痛从哪里开始，现在在哪里？", tag: "迁移" },
      { en: "Is the pain constant, or does it come and go?", zh: "疼痛是持续的还是间歇的？", tag: "性质" },
      { en: "Have you been able to eat or drink?", zh: "您还能吃东西或喝水吗？", tag: "摄入" },
      { en: "When was your last bowel movement?", zh: "您最后一次排便是什么时候？", tag: "排便" },
      { en: "Is there any chance you could be pregnant?", zh: "是否有怀孕的可能？", tag: "敏感问题" },
      { en: "Please tell me if anything feels tender or painful.", zh: "如果有压痛或疼痛，请告诉我。", tag: "查体" },
    ],
    turns: [
      { patient: "The pain is mostly on the lower right side now.", intent: "询问最初部位以及疼痛是否迁移。", ideal: "Where did the pain start, and has it moved since it began?", keys: [["where", "start", "begin"], ["move", "moved", "spread"]], followup: "It started around my belly button last night and then moved to the right." },
      { patient: "It’s constant and getting worse. I didn’t want breakfast.", intent: "询问呕吐、发热和排便变化。", ideal: "Have you vomited, had a fever, or noticed any change in your bowel movements?", keys: [["vomit", "vomited", "sick"], ["fever", "temperature"], ["bowel", "stool", "diarrhea", "constipation"]], followup: "I vomited once. I haven’t had diarrhea, and I’m not constipated." },
      { patient: "No, urinating feels normal.", intent: "解释提问原因，并中性询问妊娠可能。", ideal: "I ask everyone with these symptoms this question: is there any chance you could be pregnant?", keys: [["ask everyone", "routine", "need to ask"], ["chance", "possible", "pregnant", "pregnancy"]], followup: "There is a small chance, yes. My period is a few days late.", safety: true },
      { patient: "What happens next?", intent: "说明腹部检查和进一步检查，不武断诊断。", ideal: "I’d like to examine your abdomen and arrange some tests to help us work out the cause. I’ll explain each step first.", keys: [["examine", "examination", "abdomen", "tummy"], ["test", "tests", "cause"], ["explain", "step", "permission"]], followup: "All right. Please let me know before you press on the painful area." },
    ],
  },
  {
    id: "results-discharge",
    unit: "住院 · 安全闭环",
    title: "检查结果与出院指导",
    subtitle: "Results & safety-netting",
    level: "B2",
    minutes: 15,
    color: "#5b61a8",
    tint: "#f0f0fb",
    icon: "DC",
    caseSummary: "患者因咳嗽发热就诊，目前结果未提示需要立即住院；需解释局限、居家计划和危险信号。",
    goal: "用通俗且不过度确定的语言解释结果，给出可执行计划，并通过 teach-back 确认理解。",
    objectives: ["先回应患者最担心的问题", "区分令人安心与绝对排除", "给出具体危险信号", "使用非责备式 teach-back"],
    words: [
      { term: "reassuring", phonetic: "/ˌriːəˈʃʊrɪŋ/", meaning: "令人安心的", patient: "So the results look okay?", clinician: "reassuring findings", example: "The results are reassuring overall." },
      { term: "rule out", phonetic: "/ruːl aʊt/", meaning: "排除", patient: "Does that mean it definitely isn’t serious?", clinician: "cannot completely rule out", example: "These tests do not rule out every possible cause." },
      { term: "monitor", phonetic: "/ˈmɑːnɪtər/", meaning: "观察、监测", patient: "What should I watch for?", clinician: "monitor symptoms", example: "Please continue to monitor your symptoms." },
      { term: "follow-up", phonetic: "/ˈfɑːloʊ ʌp/", meaning: "随访、复诊", patient: "Do I need to see anyone again?", clinician: "outpatient follow-up", example: "Please arrange a follow-up appointment within a week." },
      { term: "seek urgent help", phonetic: "/siːk ˈɜːrdʒənt help/", meaning: "紧急求助", patient: "When should I come back?", clinician: "safety-netting advice", example: "Please seek urgent help if your breathing gets worse." },
      { term: "teach-back", phonetic: "/tiːtʃ bæk/", meaning: "复述确认", patient: "Let me tell you what I’ll do at home.", clinician: "confirm understanding", example: "Can you tell me the plan in your own words?" },
    ],
    phrases: [
      { en: "Before I explain the results, what is your main concern?", zh: "解释结果前，您现在最担心什么？", tag: "患者议程" },
      { en: "The results are reassuring overall.", zh: "总体而言，检查结果令人安心。", tag: "结果" },
      { en: "These tests do not rule out every possible cause.", zh: "这些检查不能排除所有可能原因。", tag: "局限" },
      { en: "For now, the safest plan is to manage your symptoms at home.", zh: "目前最安全的方案是在家处理症状。", tag: "计划" },
      { en: "Please seek urgent help if your symptoms get rapidly worse.", zh: "如果症状迅速恶化，请立即就医。", tag: "安全网" },
      { en: "Can you tell me the plan in your own words?", zh: "您能用自己的话复述一下计划吗？", tag: "Teach-back" },
    ],
    turns: [
      { patient: "I’m worried this could be pneumonia and get worse overnight.", intent: "先回应担忧，再概括当前结果。", ideal: "I understand why you’re worried. The results are reassuring overall, and the chest X-ray has not shown signs of pneumonia.", keys: [["understand", "worry", "concern"], ["reassuring", "x-ray", "pneumonia"]], followup: "That is reassuring. Does it mean I’m definitely fine?" },
      { patient: "Does it mean I’m definitely fine?", intent: "解释检查局限，避免绝对保证。", ideal: "The results are reassuring, but these tests do not rule out every possible cause, so we still need to monitor your symptoms.", keys: [["reassuring"], ["not rule out", "cannot rule out", "not every", "possible"], ["monitor", "watch"]], followup: "All right. What should I do when I get home?", safety: true },
      { patient: "What should I do when I get home?", intent: "用少量重点说明居家计划和随访。", ideal: "Take the prescribed medicine as directed, drink enough fluids, and arrange follow-up if you are not improving.", keys: [["medicine", "medication", "prescribed"], ["fluid", "drink", "hydrated"], ["follow-up", "follow up", "not improving"]], followup: "And when should I seek urgent help?" },
      { patient: "When should I seek urgent help?", intent: "给出具体危险信号，并使用 teach-back。", ideal: "Seek urgent help for difficulty breathing, severe chest pain, confusion, or rapidly worsening symptoms. To make sure I explained it clearly, can you tell me the plan in your own words?", keys: [["breathing", "short of breath"], ["chest pain", "confusion", "worse", "worsening"], ["own words", "tell me", "plan"]], followup: "I’ll monitor my symptoms, follow the treatment plan, and get urgent help if my breathing or chest pain gets worse.", safety: true },
    ],
  },
];

const navItems: { id: View; label: string; short: string }[] = [
  { id: "home", label: "今日训练", short: "今" },
  { id: "scenes", label: "临床场景", short: "景" },
  { id: "vocabulary", label: "词汇库", short: "Aa" },
  { id: "review", label: "复习队列", short: "复" },
  { id: "stats", label: "能力报告", short: "图" },
];

const stepLabels: { id: LessonStep; label: string }[] = [
  { id: "brief", label: "病例任务" },
  { id: "words", label: "临床词块" },
  { id: "phrases", label: "必会句式" },
  { id: "simulation", label: "模拟接诊" },
  { id: "result", label: "学习反馈" },
];

const normalize = (value: string) => value.toLowerCase().replace(/[’']/g, "'").replace(/[^a-z0-9\s'-]/g, " ").replace(/\s+/g, " ").trim();

export default function Home() {
  const [view, setView] = useState<View>("home");
  const [selectedId, setSelectedId] = useState(courses[0].id);
  const [lessonStep, setLessonStep] = useState<LessonStep>("brief");
  const [knownWords, setKnownWords] = useState<string[]>([]);
  const [reviewWords, setReviewWords] = useState<string[]>([]);
  const [completed, setCompleted] = useState<string[]>([]);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [streak, setStreak] = useState(4);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const selected = courses.find((course) => course.id === selectedId) ?? courses[0];

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      try {
        const saved = JSON.parse(localStorage.getItem("carespeak-progress") || "{}");
        setKnownWords(saved.knownWords || []);
        setReviewWords(saved.reviewWords || []);
        setCompleted(saved.completed || []);
        setScores(saved.scores || {});
        setStreak(saved.streak || 4);
      } catch { /* use fresh progress */ }
      setHydrated(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem("carespeak-progress", JSON.stringify({ knownWords, reviewWords, completed, scores, streak }));
  }, [knownWords, reviewWords, completed, scores, streak, hydrated]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 2200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const openCourse = (id: string, step: LessonStep = "brief") => {
    setSelectedId(id);
    setLessonStep(step);
    setView("course");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const navigate = (next: View) => {
    setView(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const markKnown = (term: string) => {
    setKnownWords((items) => items.includes(term) ? items.filter((item) => item !== term) : [...items, term]);
    setReviewWords((items) => items.filter((item) => item !== term));
  };

  const markReview = (term: string) => {
    setReviewWords((items) => items.includes(term) ? items.filter((item) => item !== term) : [...items, term]);
    setKnownWords((items) => items.filter((item) => item !== term));
  };

  const finishCourse = (id: string, score: number) => {
    setScores((items) => ({ ...items, [id]: Math.max(score, items[id] || 0) }));
    setCompleted((items) => items.includes(id) ? items : [...items, id]);
    setStreak((value) => Math.max(value, 5));
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate("home")} aria-label="返回首页">
          <span className="brand-mark"><i /><i /><i /></span>
          <span><b>CareSpeak</b><small>Clinical English</small></span>
        </button>
        <nav className="side-nav" aria-label="主要导航">
          {navItems.map((item) => (
            <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => navigate(item.id)}>
              <span className="nav-icon">{item.short}</span><span>{item.label}</span>
              {item.id === "review" && reviewWords.length > 0 && <em>{reviewWords.length}</em>}
            </button>
          ))}
        </nav>
        <div className="side-card">
          <span className="side-card-kicker">本周目标</span>
          <strong>{Math.min(completed.length, 3)} / 3 个场景</strong>
          <div className="mini-progress"><i style={{ width: `${Math.min(completed.length / 3 * 100, 100)}%` }} /></div>
          <small>再完成 {Math.max(3 - completed.length, 0)} 个场景即可达标</small>
        </div>
        <div className="profile-chip"><span>陈</span><div><b>陈医生</b><small>综合临床 · B1–B2</small></div><i>···</i></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-brand" onClick={() => navigate("home")}><span className="brand-mark"><i /><i /><i /></span>CareSpeak</button>
          <div className="today-label"><span>{new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" })}</span><b>为下一次接诊做好准备</b></div>
          <div className="top-actions"><button className="streak-pill" onClick={() => setToast("连续训练会帮助表达从记忆变成反应")}>⌁ <b>{streak}</b> 天连续训练</button><button className="avatar-button" aria-label="个人资料">陈</button></div>
        </header>

        {view === "home" && <Dashboard completed={completed} scores={scores} knownCount={knownWords.length} reviewCount={reviewWords.length} openCourse={openCourse} setView={navigate} />}
        {view === "scenes" && <Scenes completed={completed} scores={scores} openCourse={openCourse} />}
        {view === "vocabulary" && <Vocabulary knownWords={knownWords} reviewWords={reviewWords} markKnown={markKnown} markReview={markReview} />}
        {view === "review" && <ReviewQueue reviewWords={reviewWords} markKnown={markKnown} openCourse={openCourse} />}
        {view === "stats" && <Stats completed={completed} scores={scores} knownCount={knownWords.length} />}
        {view === "course" && <CourseView key={selected.id} course={selected} step={lessonStep} setStep={setLessonStep} knownWords={knownWords} reviewWords={reviewWords} markKnown={markKnown} markReview={markReview} finishCourse={finishCourse} bestScore={scores[selected.id]} back={() => navigate("scenes")} />}

        <footer className="app-footer"><span>CareSpeak 医生英语训练</span><span>仅用于语言学习，不替代临床指南或医院流程</span></footer>
      </main>

      <nav className="mobile-nav" aria-label="移动端导航">
        {navItems.slice(0, 4).map((item) => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => navigate(item.id)}><span>{item.short}</span>{item.label}</button>)}
      </nav>
      {toast && <div className="toast" role="status">✓ {toast}</div>}
    </div>
  );
}

function Dashboard({ completed, scores, knownCount, reviewCount, openCourse, setView }: { completed: string[]; scores: Record<string, number>; knownCount: number; reviewCount: number; openCourse: (id: string, step?: LessonStep) => void; setView: (v: View) => void }) {
  const nextCourse = courses.find((course) => !completed.includes(course.id)) || courses[0];
  const completedPercent = Math.round(completed.length / courses.length * 100);
  return <div className="page dashboard-page">
    <section className="hero-grid">
      <div className="hero-copy">
        <span className="eyebrow"><i /> TODAY’S CLINICAL DRILL</span>
        <h1>今天练一次，<br /><em>接诊时少停顿一次。</em></h1>
        <p>围绕真实临床任务开口练习。重点不是像母语者，而是让患者听懂、让沟通闭环。</p>
        <div className="hero-actions"><button className="primary-button" onClick={() => openCourse(nextCourse.id, "brief")}>开始今日训练 <span>→</span></button><button className="text-button" onClick={() => setView("scenes")}>浏览全部场景</button></div>
        <div className="hero-proof"><span>约 {nextCourse.minutes} 分钟</span><span>医生真实句式</span><span>自动记录薄弱项</span></div>
      </div>
      <div className="today-card">
        <div className="today-card-head"><span>今日处方</span><b>01</b></div>
        <span className="course-unit" style={{ color: nextCourse.color }}>{nextCourse.unit}</span>
        <h2>{nextCourse.title}</h2><p>{nextCourse.caseSummary}</p>
        <div className="case-metrics"><div><small>LEVEL</small><b>{nextCourse.level}</b></div><div><small>TIME</small><b>{nextCourse.minutes} min</b></div><div><small>SKILLS</small><b>问诊 · 解释</b></div></div>
        <div className="today-card-bottom"><span className="course-symbol" style={{ background: nextCourse.tint, color: nextCourse.color }}>{nextCourse.icon}</span><button onClick={() => openCourse(nextCourse.id, "brief")}>进入病例 <span>↗</span></button></div>
      </div>
    </section>

    <section className="section-block">
      <div className="section-heading"><div><span className="eyebrow">PROGRESS SNAPSHOT</span><h2>你正在建立临床反应速度</h2></div><button className="text-button" onClick={() => setView("stats")}>查看完整报告 →</button></div>
      <div className="metric-grid">
        <article><span className="metric-icon coral">景</span><div><small>已完成场景</small><strong>{completed.length}<em> / {courses.length}</em></strong></div><span className="trend">{completedPercent}%</span></article>
        <article><span className="metric-icon teal">Aa</span><div><small>已掌握词块</small><strong>{knownCount}<em> 个</em></strong></div><span className="trend">持续积累</span></article>
        <article><span className="metric-icon purple">复</span><div><small>今日待复习</small><strong>{reviewCount}<em> 项</em></strong></div><button onClick={() => setView("review")}>去复习</button></article>
        <article><span className="metric-icon amber">✓</span><div><small>最佳场景得分</small><strong>{Math.max(0, ...Object.values(scores))}<em> 分</em></strong></div><span className="trend">安全沟通优先</span></article>
      </div>
    </section>

    <section className="section-block">
      <div className="section-heading"><div><span className="eyebrow">PRACTICAL SCENARIOS</span><h2>从接诊流程，而不是语法章节开始</h2></div><button className="text-button" onClick={() => setView("scenes")}>全部场景 →</button></div>
      <div className="course-row">{courses.map((course, index) => <CourseCard key={course.id} course={course} index={index} completed={completed.includes(course.id)} score={scores[course.id]} onClick={() => openCourse(course.id)} />)}</div>
    </section>
  </div>;
}

function CourseCard({ course, index, completed, score, onClick }: { course: Course; index: number; completed: boolean; score?: number; onClick: () => void }) {
  return <button className="course-card" onClick={onClick} style={{ "--accent": course.color, "--tint": course.tint } as React.CSSProperties}>
    <div className="course-card-top"><span>{String(index + 1).padStart(2, "0")}</span>{completed ? <em>已完成 {score ? `· ${score}分` : ""}</em> : <em>{course.minutes} MIN</em>}</div>
    <span className="course-symbol">{course.icon}</span><small>{course.unit}</small><h3>{course.title}</h3><p>{course.subtitle}</p>
    <div className="card-link">开始训练 <span>→</span></div>
  </button>;
}

function Scenes({ completed, scores, openCourse }: { completed: string[]; scores: Record<string, number>; openCourse: (id: string) => void }) {
  return <div className="page inner-page">
    <PageIntro eyebrow="SCENARIO LIBRARY" title="按真实诊疗流程练习" description="每个场景同时训练患者会说的话、医生对患者的清晰表达，以及医生之间的专业表达。" />
    <div className="filter-strip"><button className="active">全部场景</button><button>门诊</button><button>急诊</button><button>住院</button><button>交接</button></div>
    <div className="scene-list">{courses.map((course, index) => <article className="scene-item" key={course.id} style={{ "--accent": course.color, "--tint": course.tint } as React.CSSProperties}>
      <div className="scene-number">{String(index + 1).padStart(2, "0")}</div><div className="scene-icon">{course.icon}</div>
      <div className="scene-copy"><span>{course.unit}</span><h2>{course.title}</h2><p>{course.goal}</p><div>{course.objectives.slice(0, 3).map((objective) => <em key={objective}>✓ {objective}</em>)}</div></div>
      <div className="scene-meta"><span>{course.level}</span><span>{course.minutes} 分钟</span>{completed.includes(course.id) && <strong>已完成 · {scores[course.id]}分</strong>}<button onClick={() => openCourse(course.id)}>{completed.includes(course.id) ? "再次练习" : "开始场景"} →</button></div>
    </article>)}</div>
    <section className="coming-soon"><div><span className="eyebrow">NEXT MODULES</span><h2>下一批临床场景</h2></div><div><span>头痛、眩晕与意识丧失</span><span>发热与感染相关症状</span><span>完整用药核对</span><span>急诊 ISBAR 交接</span></div></section>
  </div>;
}

function Vocabulary({ knownWords, reviewWords, markKnown, markReview }: { knownWords: string[]; reviewWords: string[]; markKnown: (term: string) => void; markReview: (term: string) => void }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const allWords = courses.flatMap((course) => course.words.map((word) => ({ ...word, course })));
  const words = allWords.filter((item) => {
    const matchesSearch = normalize(`${item.term} ${item.meaning} ${item.patient} ${item.clinician}`).includes(normalize(search));
    const matchesFilter = filter === "all" || (filter === "known" && knownWords.includes(item.term)) || (filter === "review" && reviewWords.includes(item.term));
    return matchesSearch && matchesFilter;
  });
  return <div className="page inner-page">
    <PageIntro eyebrow="CLINICAL PHRASE BANK" title="记词块，不记孤立术语" description="每个词都绑定患者说法、临床表达和能直接开口的完整句子。" />
    <div className="word-toolbar"><label><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="搜索词汇、中文含义或表达…" /></label><div><button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>全部 {allWords.length}</button><button className={filter === "known" ? "active" : ""} onClick={() => setFilter("known")}>已掌握 {knownWords.length}</button><button className={filter === "review" ? "active" : ""} onClick={() => setFilter("review")}>待复习 {reviewWords.length}</button></div></div>
    <div className="word-list">{words.map((item) => <article className="word-item" key={`${item.course.id}-${item.term}`}>
      <div className="word-term"><span style={{ background: item.course.tint, color: item.course.color }}>{item.course.icon}</span><div><h3>{item.term}</h3><small>{item.phonetic}</small></div></div>
      <div className="word-meaning"><strong>{item.meaning}</strong><small>{item.course.title}</small></div>
      <div className="word-contrast"><p><em>PATIENT</em>{item.patient}</p><p><em>CLINICIAN</em>{item.clinician}</p></div>
      <div className="word-actions"><button aria-label={`播放 ${item.term}`} onClick={() => speak(item.example)}>▶</button><button className={reviewWords.includes(item.term) ? "review active" : "review"} onClick={() => markReview(item.term)}>再练</button><button className={knownWords.includes(item.term) ? "known active" : "known"} onClick={() => markKnown(item.term)}>掌握</button></div>
    </article>)}</div>
    {words.length === 0 && <EmptyState icon="Aa" title="没有找到匹配词汇" text="换个关键词或清除筛选条件再试试。" />}
  </div>;
}

function ReviewQueue({ reviewWords, markKnown, openCourse }: { reviewWords: string[]; markKnown: (term: string) => void; openCourse: (id: string, step?: LessonStep) => void }) {
  const items = courses.flatMap((course) => course.words.map((word) => ({ ...word, course }))).filter((item) => reviewWords.includes(item.term));
  const [flipped, setFlipped] = useState<string[]>([]);
  return <div className="page inner-page">
    <PageIntro eyebrow="SPACED REVIEW" title="只复习真正卡住你的内容" description="队列以可复用词块为单位。先尝试说出来，再查看答案并标记掌握。" />
    {items.length > 0 ? <><div className="review-summary"><div><span>今天</span><strong>{items.length}</strong><small>个待复习词块</small></div><p>建议用时 <b>{Math.max(3, items.length * 1)} 分钟</b><br />完成后会自动移出队列。</p></div><div className="review-grid">{items.map((item, index) => {
      const isFlipped = flipped.includes(item.term);
      return <article className={`flashcard ${isFlipped ? "flipped" : ""}`} key={item.term} onClick={() => setFlipped((values) => values.includes(item.term) ? values.filter((value) => value !== item.term) : [...values, item.term])}>
        <div className="flashcard-top"><span>{String(index + 1).padStart(2, "0")}</span><em>{item.course.title}</em></div><small>看到中文，先开口说</small><h2>{item.meaning}</h2>{isFlipped ? <div className="flash-answer"><strong>{item.term}</strong><p>{item.example}</p><button onClick={(event) => { event.stopPropagation(); speak(item.example); }}>▶ 听标准表达</button></div> : <button className="reveal">点击查看答案</button>}<div className="flashcard-actions"><button onClick={(event) => { event.stopPropagation(); openCourse(item.course.id, "words"); }}>回到课程</button><button onClick={(event) => { event.stopPropagation(); markKnown(item.term); }}>我已掌握 ✓</button></div>
      </article>;
    })}</div></> : <EmptyState icon="✓" title="今天的复习队列已经清空" text="在词汇库中标记“再练”，或完成模拟接诊后，薄弱词块会自动出现在这里。" action="去练一个场景" onAction={() => openCourse(courses.find((course) => !course.id)?.id || courses[0].id)} />}
  </div>;
}

function Stats({ completed, scores, knownCount }: { completed: string[]; scores: Record<string, number>; knownCount: number }) {
  const avg = completed.length ? Math.round(completed.reduce((sum, id) => sum + (scores[id] || 0), 0) / completed.length) : 0;
  const competencies = [{ label: "临床任务完成度", value: Math.min(88, avg + 8) }, { label: "清晰与自然", value: Math.min(84, avg + 4) }, { label: "安全沟通", value: Math.min(91, avg + 11) }, { label: "互动与同理心", value: Math.min(82, avg + 2) }, { label: "流利度", value: Math.min(78, avg) }];
  return <div className="page inner-page">
    <PageIntro eyebrow="CLINICAL COMMUNICATION REPORT" title="你的能力，不只是一条总分" description="报告区分临床任务、患者可懂度和安全沟通，帮助你找到最值得练的下一步。" />
    <div className="report-grid">
      <article className="score-panel"><span>综合沟通得分</span><div className="score-ring" style={{ "--score": `${avg || 0}%` } as React.CSSProperties}><strong>{avg || "—"}</strong><small>{avg ? "/ 100" : "完成课程后生成"}</small></div><p>{avg >= 80 ? "表达清楚，安全闭环表现稳定。" : avg ? "继续练习解释与复述确认，会有明显提升。" : "完成一次模拟接诊后，这里会生成反馈。"}</p></article>
      <article className="competency-panel"><div className="panel-title"><h2>能力分布</h2><span>基于已完成场景</span></div>{competencies.map((item) => <div className="competency" key={item.label}><span>{item.label}</span><div><i style={{ width: `${completed.length ? item.value : 0}%` }} /></div><b>{completed.length ? item.value : "—"}</b></div>)}</article>
    </div>
    <div className="report-cards"><article><span className="metric-icon teal">Aa</span><small>已掌握词块</small><strong>{knownCount}</strong><p>建议目标：每周 12 个可直接开口的词块</p></article><article><span className="metric-icon coral">景</span><small>已完成场景</small><strong>{completed.length}</strong><p>下一步优先补齐未练场景</p></article><article><span className="metric-icon purple">盾</span><small>安全闭环</small><strong>{completed.length ? Math.min(91, avg + 11) : "—"}</strong><p>身份、红旗、复诊和 teach-back 单独评分</p></article></div>
    <section className="history-panel"><div className="panel-title"><h2>场景记录</h2><span>最佳成绩</span></div>{courses.map((course) => <div className="history-row" key={course.id}><span className="course-symbol" style={{ background: course.tint, color: course.color }}>{course.icon}</span><div><strong>{course.title}</strong><small>{course.unit}</small></div><span>{completed.includes(course.id) ? "已完成" : "未开始"}</span><b>{scores[course.id] ? `${scores[course.id]} 分` : "—"}</b></div>)}</section>
  </div>;
}

function CourseView({ course, step, setStep, knownWords, reviewWords, markKnown, markReview, finishCourse, bestScore, back }: { course: Course; step: LessonStep; setStep: (step: LessonStep) => void; knownWords: string[]; reviewWords: string[]; markKnown: (term: string) => void; markReview: (term: string) => void; finishCourse: (id: string, score: number) => void; bestScore?: number; back: () => void }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [turnIndex, setTurnIndex] = useState(0);
  const [messages, setMessages] = useState<{ role: "patient" | "doctor"; text: string }[]>([{ role: "patient", text: course.turns[0].patient }]);
  const [draft, setDraft] = useState("");
  const [turnScores, setTurnScores] = useState<number[]>([]);
  const [lastFeedback, setLastFeedback] = useState<{ score: number; missing: number; ideal: string } | null>(null);
  const [finished, setFinished] = useState(false);
  const [hint, setHint] = useState(false);
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<{ stop?: () => void } | null>(null);
  const word = course.words[wordIndex];
  const lessonProgress = (stepLabels.findIndex((item) => item.id === step) + 1) / stepLabels.length * 100;

  const goNext = () => {
    const index = stepLabels.findIndex((item) => item.id === step);
    if (index < stepLabels.length - 1) setStep(stepLabels[index + 1].id);
  };

  const submitTurn = () => {
    if (!draft.trim() || finished) return;
    const turn = course.turns[turnIndex];
    const answer = normalize(draft);
    const matched = turn.keys.filter((group) => group.some((key) => answer.includes(normalize(key)))).length;
    const score = Math.max(35, Math.round(matched / turn.keys.length * 100));
    const newScores = [...turnScores, score];
    setTurnScores(newScores);
    setMessages((items) => [...items, { role: "doctor", text: draft }, { role: "patient", text: turn.followup }]);
    setLastFeedback({ score, missing: turn.keys.length - matched, ideal: turn.ideal });
    setDraft(""); setHint(false);
    if (turnIndex >= course.turns.length - 1) {
      const finalScore = Math.round(newScores.reduce((sum, value) => sum + value, 0) / newScores.length);
      setFinished(true);
      finishCourse(course.id, finalScore);
    } else {
      setTurnIndex((value) => value + 1);
    }
  };

  const resetSimulation = () => {
    setTurnIndex(0); setMessages([{ role: "patient", text: course.turns[0].patient }]); setDraft(""); setTurnScores([]); setLastFeedback(null); setFinished(false); setHint(false);
  };

  const toggleSpeechInput = () => {
    if (recording) { recognitionRef.current?.stop?.(); setRecording(false); return; }
    const SpeechRecognitionCtor = (window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognitionLike }).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) { setRecording(false); setDraft((value) => value || "请在支持语音识别的浏览器中使用麦克风，或在这里输入英文回答。"); return; }
    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "en-US"; recognition.interimResults = true; recognition.continuous = false;
    recognition.onresult = (event) => { const transcript = Array.from({ length: event.results.length }, (_, index) => event.results[index][0].transcript).join(" "); setDraft(transcript); };
    recognition.onend = () => setRecording(false); recognition.onerror = () => setRecording(false);
    recognitionRef.current = recognition; recognition.start(); setRecording(true);
  };

  const finalScore = turnScores.length ? Math.round(turnScores.reduce((sum, value) => sum + value, 0) / turnScores.length) : (bestScore || 0);

  return <div className="course-page" style={{ "--accent": course.color, "--tint": course.tint } as React.CSSProperties}>
    <div className="course-header"><button onClick={back}>← 返回场景库</button><div><span>{course.unit}</span><h1>{course.title}</h1><p>{course.subtitle}</p></div><div className="course-header-meta"><span>{course.level}</span><span>{course.minutes} 分钟</span>{bestScore && <strong>最佳 {bestScore} 分</strong>}</div></div>
    <div className="lesson-progress"><i style={{ width: `${lessonProgress}%` }} /></div>
    <nav className="lesson-tabs">{stepLabels.map((item, index) => <button key={item.id} className={step === item.id ? "active" : ""} onClick={() => setStep(item.id)}><span>{index + 1}</span>{item.label}</button>)}</nav>

    <div className="lesson-content">
      {step === "brief" && <section className="brief-layout"><div className="case-file"><span className="eyebrow">CASE FILE / 病例卡</span><div className="case-id"><span className="course-symbol">{course.icon}</span><div><small>场景病例</small><strong>{course.caseSummary}</strong></div></div><div className="case-warning"><b>训练边界</b><p>本病例只用于语言练习。你需要完成沟通任务，不需要在 App 中作最终诊断或真实处置。</p></div></div><div className="mission-card"><span className="eyebrow">YOUR MISSION</span><h2>本课要完成什么</h2><p>{course.goal}</p><div>{course.objectives.map((objective) => <span key={objective}>✓ {objective}</span>)}</div><button className="primary-button" onClick={goNext}>开始学习词块 →</button></div></section>}

      {step === "words" && <section><div className="lesson-section-head"><div><span className="eyebrow">CLINICAL CHUNKS · {wordIndex + 1}/{course.words.length}</span><h2>一个概念，两种说法</h2><p>先听患者怎么说，再练医生如何清楚追问。</p></div><div className="lesson-section-actions"><button className={reviewWords.includes(word.term) ? "active" : ""} onClick={() => markReview(word.term)}>＋ 加入复习</button></div></div><div className="word-stage"><button className="stage-arrow" disabled={wordIndex === 0} onClick={() => setWordIndex((value) => Math.max(0, value - 1))}>←</button><article className="featured-word"><div className="featured-term"><span>{word.phonetic}</span><h2>{word.term}</h2><p>{word.meaning}</p><button onClick={() => speak(word.term)}>▶ 听发音</button></div><div className="expression-compare"><div><span>PATIENT MAY SAY</span><p>“{word.patient}”</p></div><div><span>CLINICIAN LANGUAGE</span><p>{word.clinician}</p></div></div><div className="direct-use"><span>可直接开口</span><strong>{word.example}</strong><button onClick={() => speak(word.example)}>▶</button></div><div className="master-actions"><button className={reviewWords.includes(word.term) ? "active" : ""} onClick={() => markReview(word.term)}>还不熟</button><button className={knownWords.includes(word.term) ? "active" : ""} onClick={() => markKnown(word.term)}>我掌握了 ✓</button></div></article><button className="stage-arrow" disabled={wordIndex === course.words.length - 1} onClick={() => setWordIndex((value) => Math.min(course.words.length - 1, value + 1))}>→</button></div><div className="word-dots">{course.words.map((item, index) => <button key={item.term} className={index === wordIndex ? "active" : ""} onClick={() => setWordIndex(index)} aria-label={`查看第 ${index + 1} 个词`} />)}</div><div className="lesson-bottom-action"><button className="primary-button" onClick={goNext}>继续学习句式 →</button></div></section>}

      {step === "phrases" && <section><div className="lesson-section-head"><div><span className="eyebrow">READY-TO-USE LANGUAGE</span><h2>接诊时可以直接使用的句子</h2><p>先听，再跟读；关注意群和礼貌程度，不必追求母语口音。</p></div></div><div className="phrase-stack">{course.phrases.map((phrase, index) => <article key={phrase.en}><span>{String(index + 1).padStart(2, "0")}</span><div><em>{phrase.tag}</em><h3>{phrase.en}</h3><p>{phrase.zh}</p></div><button onClick={() => speak(phrase.en)} aria-label={`播放句子 ${phrase.en}`}>▶</button></article>)}</div><div className="plain-language-note"><span>LANGUAGE NOTE</span><p>对患者优先使用短句和通俗词。专业表达用于团队沟通，不代表对患者说得越专业越好。</p></div><div className="lesson-bottom-action"><button className="primary-button" onClick={goNext}>进入模拟接诊 →</button></div></section>}

      {step === "simulation" && <section className="simulation-layout"><div className="sim-main"><div className="sim-head"><div><span className="live-dot" /> LIVE ROLEPLAY</div><span>你是接诊医生 · 第 {Math.min(turnIndex + 1, course.turns.length)} / {course.turns.length} 轮</span></div><div className="chat-window">{messages.map((message, index) => <div className={`message ${message.role}`} key={`${message.role}-${index}`}><span>{message.role === "patient" ? "PT" : "DR"}</span><div><small>{message.role === "patient" ? "Patient" : "You"}</small><p>{message.text}</p>{message.role === "patient" && <button onClick={() => speak(message.text)}>▶ 播放</button>}</div></div>)}<div className="typing-prompt"><span>轮到你回应</span><p>{finished ? "本轮模拟已完成，可以查看反馈或重新练习。" : course.turns[turnIndex].intent}</p></div></div>{lastFeedback && <div className={`inline-feedback ${lastFeedback.score >= 75 ? "good" : "needs-work"}`}><strong>{lastFeedback.score >= 75 ? "✓ 本轮沟通有效" : "△ 还可以更完整"} · {lastFeedback.score} 分</strong><span>{lastFeedback.missing === 0 ? "关键任务已覆盖。" : `还有 ${lastFeedback.missing} 组关键信息未覆盖。`}</span><details><summary>查看推荐表达</summary><p>{lastFeedback.ideal}</p></details></div>}<div className="response-box"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Type or speak your response in English…" disabled={finished} /><div><button className={recording ? "mic recording" : "mic"} onClick={toggleSpeechInput} disabled={finished}>{recording ? "■ 正在听…" : "● 语音回答"}</button><button onClick={() => setHint((value) => !value)} disabled={finished}>提示</button><button className="send" onClick={submitTurn} disabled={!draft.trim() || finished}>发送回答 ↑</button></div>{hint && !finished && <p className="hint">中文意图：{course.turns[turnIndex].intent}</p>}</div></div><aside className="sim-sidebar"><div className="patient-card"><span className="course-symbol">PT</span><h3>模拟患者</h3><p>{course.caseSummary}</p><div><span>情绪</span><b>{course.id === "results-discharge" ? "担忧" : "轻度焦虑"}</b></div><div><span>表达</span><b>自然口语</b></div></div><div className="task-checklist"><h3>本轮沟通任务</h3>{course.objectives.map((objective, index) => <span key={objective} className={turnIndex > index || finished ? "done" : ""}><i>{turnIndex > index || finished ? "✓" : index + 1}</i>{objective}</span>)}</div>{finished && <button className="primary-button full" onClick={() => setStep("result")}>查看学习反馈 →</button>}</aside></section>}

      {step === "result" && <section className="result-layout"><div className="result-hero"><span className="eyebrow">SESSION COMPLETE</span><div className="result-score"><strong>{finalScore || "—"}</strong><span>/ 100</span></div><h2>{finalScore >= 85 ? "沟通清楚，安全闭环稳定" : finalScore >= 70 ? "临床任务完成，继续打磨自然度" : finalScore ? "已完成接诊，建议针对漏问项再练一次" : "完成模拟接诊后生成反馈"}</h2><p>{finalScore ? `你的最佳成绩已保存。系统按照临床任务、患者可懂度和安全沟通评分。` : "进入模拟接诊并完成所有轮次，即可获得本场景的能力分析。"}</p><div><button className="primary-button" onClick={() => setStep("simulation")}>{finalScore ? "再次挑战" : "开始模拟"} →</button>{finalScore > 0 && <button className="text-button" onClick={resetSimulation}>清空本次对话</button>}</div></div><div className="result-detail"><h3>本课能力反馈</h3>{[{ label: "临床任务完成度", value: Math.min(95, finalScore + 7) }, { label: "清晰与自然", value: Math.min(91, finalScore + 2) }, { label: "安全沟通", value: Math.min(96, finalScore + 9) }, { label: "互动与同理心", value: Math.min(89, finalScore) }, { label: "发音可懂度", value: finalScore ? Math.min(88, finalScore - 2) : 0 }].map((item) => <div className="result-bar" key={item.label}><span>{item.label}</span><div><i style={{ width: `${item.value || 0}%` }} /></div><b>{item.value || "—"}</b></div>)}<div className="feedback-note"><b>下一次重点</b><p>{course.id === "chest-pain" ? "继续练习在不武断诊断的前提下，迅速解释为什么需要立即检查。" : course.id === "abdominal-pain" ? "敏感问题前先解释提问原因，语气会更自然、更尊重患者。" : "把危险信号说得具体，并让患者用自己的话复述计划。"}</p></div></div></section>}
    </div>
  </div>;
}

type SpeechRecognitionLike = {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: (event: { results: { [key: number]: { [key: number]: { transcript: string } }; length: number } }) => void;
  onend: () => void; onerror: () => void; start: () => void; stop: () => void;
};

function PageIntro({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <header className="page-intro"><span className="eyebrow"><i /> {eyebrow}</span><h1>{title}</h1><p>{description}</p></header>;
}

function EmptyState({ icon, title, text, action, onAction }: { icon: string; title: string; text: string; action?: string; onAction?: () => void }) {
  return <div className="empty-state"><span>{icon}</span><h2>{title}</h2><p>{text}</p>{action && <button className="primary-button" onClick={onAction}>{action} →</button>}</div>;
}

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US"; utterance.rate = 0.88; utterance.pitch = 1;
  window.speechSynthesis.speak(utterance);
}
