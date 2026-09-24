import { useMemo } from "react";
import { Icon } from "./Icons";
import type { Student, Lesson, PageType } from "../types";

interface DashboardViewProps {
  students: Student[];
  lessons: Lesson[];
  onNavigate: (page: PageType) => void;
  searchTerm: string;
}

export function DashboardView({
  students,
  lessons,
  onNavigate,
  searchTerm,
}: DashboardViewProps) {
  // Filtrlangan o'quvchilar
  const filteredStudents = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return students;
    return students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.group_name.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q))
    );
  }, [students, searchTerm]);

  // Hisob-kitoblar va statistika
  const totalStudents = students.length;
  const dangerStudents = students.filter(
    (s) => s.missed >= 5 || s.status === "danger"
  );
  const totalMissed = students.reduce((acc, s) => acc + (s.missed || 0), 0);
  const totalPossible = students.reduce(
    (acc, s) => acc + (s.total_lessons || 16),
    0
  );
  const attendanceRate =
    totalPossible > 0
      ? Math.round(((totalPossible - totalMissed) / totalPossible) * 100)
      : 92;

  // Bugungi darslar
  const todayDayName = new Intl.DateTimeFormat("uz-UZ", { weekday: "long" })
    .format(new Date())
    .toLowerCase();

  // Bugungi kun darslarini olish yoki dushanba bo'yicha namunaviy darslar
  const todayLessons = useMemo(() => {
    const matched = lessons.filter(
      (l) => l.day.toLowerCase() === todayDayName
    );
    return matched.length > 0 ? matched : lessons.slice(0, 4);
  }, [lessons, todayDayName]);

  // Haftalik davomat ko'rsatkichlari
  const weeklyData = [
    { day: "Dush", value: 92 },
    { day: "Sesh", value: 88 },
    { day: "Chor", value: 95 },
    { day: "Pay", value: 90 },
    { day: "Juma", value: 94 },
    { day: "Shan", value: 84 },
  ];

  return (
    <div className="dashboard-view-container">
      {/* 1. WELCOME HERO BANNER */}
      <section className="dashboard-hero-banner">
        <div className="hero-content">
          <span className="hero-badge">Xush kelibsiz 👋</span>
          <h2>Assalomu alaykum, O‘qituvchi!</h2>
          <p>
            Bugun rejalashtirilgan <strong>{todayLessons.length} ta dars</strong>{" "}
            va <strong>{totalStudents} nafar o‘quvchi</strong> davomatini
            boshqaring.
          </p>
          <div className="hero-actions">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => onNavigate("attendance")}
            >
              <Icon name="check" size={18} />
              Bugungi davomatni olish
            </button>
            <button
              type="button"
              className="btn btn-glass"
              onClick={() => onNavigate("lessons")}
            >
              <Icon name="calendar" size={18} />
              Dars jadvalini ko‘rish
            </button>
          </div>
        </div>

        <div className="hero-quick-card">
          <div className="quick-card-icon">
            <Icon name="clock" size={24} />
          </div>
          <div className="quick-card-info">
            <span className="label">Navbatdagi dars</span>
            <strong className="title">
              {todayLessons[0]
                ? `${todayLessons[0].start_time} — ${todayLessons[0].subject}`
                : "Hozircha dars belgilanmagan"}
            </strong>
            <span className="location">
              {todayLessons[0]
                ? `${todayLessons[0].room}-xona (${todayLessons[0].group_name || "Guruh"})`
                : "Dars jadvalidan tekshiring"}
            </span>
          </div>
        </div>
      </section>

      {/* 2. STATS OVERVIEW CARDS */}
      <section className="stats-grid">
        <div className="stat-card stat-indigo">
          <div className="stat-icon-wrap">
            <Icon name="users" size={24} />
          </div>
          <div className="stat-data">
            <span className="stat-title">Jami o‘quvchilar</span>
            <div className="stat-num-row">
              <span className="stat-number">{totalStudents}</span>
              <span className="stat-pill pill-success">+12% bu oy</span>
            </div>
            <span className="stat-hint">Faol ta'lim oluvchilar</span>
          </div>
        </div>

        <div className="stat-card stat-emerald">
          <div className="stat-icon-wrap">
            <Icon name="check" size={24} />
          </div>
          <div className="stat-data">
            <span className="stat-title">O‘rtacha davomat</span>
            <div className="stat-num-row">
              <span className="stat-number">{attendanceRate}%</span>
              <span className="stat-pill pill-success">+3.2%</span>
            </div>
            <span className="stat-hint">Umumiy ko‘rsatkich</span>
          </div>
        </div>

        <div className="stat-card stat-amber">
          <div className="stat-icon-wrap">
            <Icon name="calendar" size={24} />
          </div>
          <div className="stat-data">
            <span className="stat-title">Bugungi darslar</span>
            <div className="stat-num-row">
              <span className="stat-number">{todayLessons.length}</span>
              <span className="stat-pill pill-info">Jadval bo‘yicha</span>
            </div>
            <span className="stat-hint">
              {todayLessons.length > 0 ? "Darslar boshlangan" : "Dars mavjud emas"}
            </span>
          </div>
        </div>

        <div className="stat-card stat-rose">
          <div className="stat-icon-wrap">
            <Icon name="alert" size={24} />
          </div>
          <div className="stat-data">
            <span className="stat-title">Xavf ostidagilar</span>
            <div className="stat-num-row">
              <span className="stat-number">{dangerStudents.length}</span>
              <span className="stat-pill pill-danger">5+ dars qoldirgan</span>
            </div>
            <span className="stat-hint">E'tibor va nazorat talab</span>
          </div>
        </div>
      </section>

      {/* 3. CHARTS & ANALYTICS ROW */}
      <section className="analytics-grid">
        {/* ATTENDANCE DYNAMICS LINE CHART */}
        <div className="panel-card chart-panel">
          <div className="panel-header">
            <div>
              <h3>Davomat dinamikasi</h3>
              <p>So‘nggi haftadagi darsga qatnash ko‘rsatkichi</p>
            </div>
            <span className="badge-tag">Haftalik monitoring</span>
          </div>

          <div className="chart-canvas-container">
            <div className="chart-y-legend">
              <span>100%</span>
              <span>75%</span>
              <span>50%</span>
              <span>25%</span>
              <span>0%</span>
            </div>

            <div className="chart-svg-wrapper">
              <div className="chart-horizontal-grids">
                <span />
                <span />
                <span />
                <span />
                <span />
              </div>

              <svg
                className="chart-smooth-line"
                viewBox="0 0 700 220"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                <path
                  d="M 20 85 Q 130 55, 240 90 T 460 45 T 680 50 L 680 220 L 20 220 Z"
                  fill="url(#lineGrad)"
                />

                <polyline
                  points="20,85 130,55 240,90 350,40 460,45 570,30 680,50"
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {[
                  { cx: 20, cy: 85 },
                  { cx: 130, cy: 55 },
                  { cx: 240, cy: 90 },
                  { cx: 350, cy: 40 },
                  { cx: 460, cy: 45 },
                  { cx: 570, cy: 30 },
                  { cx: 680, cy: 50 },
                ].map((p, i) => (
                  <circle
                    key={i}
                    cx={p.cx}
                    cy={p.cy}
                    r="5"
                    fill="#4f46e5"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                  />
                ))}
              </svg>

              <div className="chart-x-labels">
                <span>Dushanba</span>
                <span>Seshanba</span>
                <span>Chorshanba</span>
                <span>Payshanba</span>
                <span>Juma</span>
                <span>Shanba</span>
                <span>Yakshanba</span>
              </div>
            </div>
          </div>
        </div>

        {/* MONTHLY SUMMARY RING */}
        <div className="panel-card ring-panel">
          <div className="panel-header">
            <div>
              <h3>Umumiy nisbat</h3>
              <p>Joriy oy qatnovi</p>
            </div>
          </div>

          <div className="ring-center-wrapper">
            <div
              className="conic-ring-glow"
              style={{
                background: `conic-gradient(
                  #6366f1 0deg ${attendanceRate * 3.6}deg,
                  #f43f5e ${attendanceRate * 3.6}deg ${(attendanceRate + 7) * 3.6}deg,
                  #f59e0b ${(attendanceRate + 7) * 3.6}deg 360deg
                )`,
              }}
            >
              <div className="conic-ring-cutout">
                <span className="big-rate">{attendanceRate}%</span>
                <span className="rate-sub">Davomat</span>
              </div>
            </div>
          </div>

          <div className="ring-legend-list">
            <div className="legend-row">
              <span className="legend-label">
                <i className="dot dot-present" /> Kelgan
              </span>
              <strong>{attendanceRate}%</strong>
            </div>
            <div className="legend-row">
              <span className="legend-label">
                <i className="dot dot-absent" /> Kelmagan
              </span>
              <strong>7%</strong>
            </div>
            <div className="legend-row">
              <span className="legend-label">
                <i className="dot dot-late" /> Kechikkan
              </span>
              <strong>{100 - attendanceRate - 7}%</strong>
            </div>
          </div>
        </div>
      </section>

      {/* 4. TODAY'S LESSONS & WEEKLY BARS */}
      <section className="two-col-grid">
        {/* TODAY LESSONS */}
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h3>Bugungi darslar jadvali</h3>
              <p>O‘tiladigan darslar ro‘yxati</p>
            </div>
            <button
              type="button"
              className="btn btn-outline btn-sm"
              onClick={() => onNavigate("lessons")}
            >
              Barcha darslar <Icon name="arrow" size={14} />
            </button>
          </div>

          {todayLessons.length === 0 ? (
            <div className="empty-panel-state">
              <Icon name="calendar" size={36} />
              <p>Bugun darslar mavjud emas</p>
            </div>
          ) : (
            <div className="today-lessons-flow">
              {todayLessons.map((lesson, idx) => (
                <div key={lesson.id || idx} className="lesson-flow-item">
                  <div className="lesson-time-pill">
                    <span className="t-start">{lesson.start_time}</span>
                    <span className="t-end">{lesson.end_time}</span>
                  </div>

                  <div className="lesson-v-line" />

                  <div className="lesson-content-block">
                    <div className="lesson-primary-row">
                      <strong className="subject-title">
                        {lesson.subject}
                      </strong>
                      <span className="group-badge">
                        {lesson.group_name || "Guruh"}
                      </span>
                    </div>
                    <div className="lesson-meta-row">
                      <span>
                        <Icon name="building" size={14} />
                        {lesson.building} ({lesson.block}-blok)
                      </span>
                      <span>{lesson.room}-xona</span>
                    </div>
                  </div>

                  <div className="lesson-action-block">
                    <button
                      type="button"
                      className="btn btn-primary btn-xs"
                      onClick={() => onNavigate("attendance")}
                      title="Ushbu dars uchun davomat olish"
                    >
                      <Icon name="check" size={14} />
                      Davomat
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* WEEKLY BARS GRAPH */}
        <div className="panel-card">
          <div className="panel-header">
            <div>
              <h3>Haftalik kunlik ko‘rsatkich</h3>
              <p>Kunlar kesimidagi davomat foizi</p>
            </div>
          </div>

          <div className="weekly-bar-chart">
            {weeklyData.map((item) => (
              <div key={item.day} className="bar-column-wrap">
                <span className="bar-rate-text">{item.value}%</span>
                <div className="bar-track">
                  <div
                    className="bar-fill"
                    style={{ height: `${item.value}%` }}
                  />
                </div>
                <span className="bar-day-name">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TOP ABSENT STUDENTS TABLE */}
      <section className="panel-card">
        <div className="panel-header">
          <div>
            <h3>Eng ko‘p dars qoldirgan o‘quvchilar</h3>
            <p>Davomat nazorati va profilaktika talab etiladigan o‘quvchilar</p>
          </div>
          <button
            type="button"
            className="btn btn-outline btn-sm"
            onClick={() => onNavigate("students")}
          >
            Barcha o‘quvchilar <Icon name="arrow" size={14} />
          </button>
        </div>

        <div className="modern-table-responsive">
          <table className="modern-table">
            <thead>
              <tr>
                <th>O‘quvchi</th>
                <th>Telefon</th>
                <th>Guruh</th>
                <th>Qoldirgan</th>
                <th>Jami dars</th>
                <th>Davomat %</th>
                <th>Holat</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.slice(0, 6).map((student) => {
                const total = student.total_lessons || 16;
                const missed = student.missed || 0;
                const pct = Math.round(((total - missed) / total) * 100);
                const initials = student.name
                  .split(" ")
                  .map((p) => p[0])
                  .join("")
                  .slice(0, 2);

                return (
                  <tr key={student.id}>
                    <td>
                      <div className="table-user-cell">
                        <div className="table-avatar">{initials}</div>
                        <strong>{student.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted">
                        {student.phone || "—"}
                      </span>
                    </td>
                    <td>
                      <span className="group-pill">{student.group_name}</span>
                    </td>
                    <td>
                      <span
                        className={`missed-badge ${
                          missed >= 5 ? "high" : missed >= 3 ? "medium" : "low"
                        }`}
                      >
                        {missed} ta dars
                      </span>
                    </td>
                    <td>{total}</td>
                    <td>
                      <div className="table-progress-cell">
                        <span>{pct}%</span>
                        <div className="table-mini-bar">
                          <div
                            className={`mini-bar-fill ${
                              pct < 70
                                ? "danger"
                                : pct < 85
                                ? "warning"
                                : "success"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          missed >= 5
                            ? "status-danger"
                            : missed >= 3
                            ? "status-warning"
                            : "status-active"
                        }`}
                      >
                        {missed >= 5
                          ? "Xavf ostida"
                          : missed >= 3
                          ? "Ogohlantirish"
                          : "Faol"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
