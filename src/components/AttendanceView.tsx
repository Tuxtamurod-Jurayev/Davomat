import { useState, useEffect, useMemo, useCallback } from "react";
import { Icon } from "./Icons";
import type { Student, Group } from "../types";
import { fetchAttendance, saveAttendanceRecord } from "../services/api";

interface AttendanceViewProps {
  students: Student[];
  groups: Group[];
  searchTerm: string;
}

export function AttendanceView({
  students,
  groups,
  searchTerm,
}: AttendanceViewProps) {
  const todayStr = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedGroup, setSelectedGroup] = useState<string>(
    groups[0]?.name || "Barchasi"
  );
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, "present" | "absent" | "late" | "excused">
  >({});
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Yuklash
  const loadAttendance = useCallback(async () => {
    setLoading(true);
    try {
      const records = await fetchAttendance(selectedDate, selectedGroup);
      const map: Record<string, "present" | "absent" | "late" | "excused"> = {};
      records.forEach((r) => {
        if (r.student_id) {
          map[r.student_id] = r.status;
        }
      });
      setAttendanceMap(map);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedGroup]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  // Guruh bo'yicha saralangan o'quvchilar
  const currentStudents = useMemo(() => {
    return students.filter((s) => {
      const matchGroup =
        selectedGroup === "Barchasi" || s.group_name === selectedGroup;
      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q));
      return matchGroup && matchSearch;
    });
  }, [students, selectedGroup, searchTerm]);

  // Holatni belgilash
  const handleMark = async (
    student: Student,
    status: "present" | "absent" | "late" | "excused"
  ) => {
    setAttendanceMap((prev) => ({ ...prev, [student.id]: status }));
    const success = await saveAttendanceRecord(student, selectedDate, status);
    if (success) {
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2000);
    }
  };

  // Barchasiga "Keldi" belgilash
  const handleMarkAllPresent = async () => {
    const newMap = { ...attendanceMap };
    for (const student of currentStudents) {
      newMap[student.id] = "present";
      await saveAttendanceRecord(student, selectedDate, "present");
    }
    setAttendanceMap(newMap);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Statistika hisobi
  const totalInList = currentStudents.length;
  const presentCount = currentStudents.filter(
    (s) => (attendanceMap[s.id] || "present") === "present"
  ).length;
  const absentCount = currentStudents.filter(
    (s) => attendanceMap[s.id] === "absent"
  ).length;
  const lateCount = currentStudents.filter(
    (s) => attendanceMap[s.id] === "late"
  ).length;
  const excusedCount = currentStudents.filter(
    (s) => attendanceMap[s.id] === "excused"
  ).length;

  const currentPercent =
    totalInList > 0 ? Math.round((presentCount / totalInList) * 100) : 0;

  return (
    <div className="view-container">
      {/* HEADER SECTION */}
      <div className="view-header-row">
        <div>
          <h2>Jonli Davomat olish</h2>
          <p>Darsga qatnashgan o‘quvchilarni bir marta bosish orqali belgilang</p>
        </div>

        <div className="header-actions-group">
          {savedSuccess && (
            <span className="save-success-tag">
              <Icon name="check" size={14} /> Saqlandi!
            </span>
          )}
          <button
            type="button"
            className="btn btn-outline"
            onClick={handleMarkAllPresent}
            disabled={loading || totalInList === 0}
          >
            <Icon name="user-check" size={18} />
            Barchasiga "Keldi" belgilash
          </button>
        </div>
      </div>

      {/* FILTER & DATE CONTROLS */}
      <div className="filters-bar-grid">
        <div className="filter-group">
          <label>
            <Icon name="calendar" size={14} /> Sana tanlang:
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>
            <Icon name="group" size={14} /> Guruhni tanlang:
          </label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
          >
            <option value="Barchasi">Barcha guruhlar</option>
            {groups.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* LIVE STATS COUNTER BAR */}
      <div className="attendance-stats-ribbon">
        <div className="ribbon-card ribbon-total">
          <span className="ribbon-num">{totalInList}</span>
          <span className="ribbon-label">Jami o‘quvchi</span>
        </div>
        <div className="ribbon-card ribbon-present">
          <span className="ribbon-num">{presentCount}</span>
          <span className="ribbon-label">Kelgan</span>
        </div>
        <div className="ribbon-card ribbon-absent">
          <span className="ribbon-num">{absentCount}</span>
          <span className="ribbon-label">Kelmagan</span>
        </div>
        <div className="ribbon-card ribbon-late">
          <span className="ribbon-num">{lateCount}</span>
          <span className="ribbon-label">Kechikkan</span>
        </div>
        <div className="ribbon-card ribbon-excused">
          <span className="ribbon-num">{excusedCount}</span>
          <span className="ribbon-label">Sababli</span>
        </div>
        <div className="ribbon-card ribbon-rate">
          <span className="ribbon-num">{currentPercent}%</span>
          <span className="ribbon-label">Davomat foizi</span>
        </div>
      </div>

      {/* ATTENDANCE SHEET */}
      {loading ? (
        <div className="panel-card empty-card">
          <div className="empty-state-content">
            <Icon name="refresh" size={30} className="spin" />
            <p>Davomat ma'lumotlari yuklanmoqda...</p>
          </div>
        </div>
      ) : currentStudents.length === 0 ? (
        <div className="panel-card empty-card">
          <div className="empty-state-content">
            <Icon name="users" size={32} />
            <h3>Bu guruhda o‘quvchilar yo‘q</h3>
            <p>O‘quvchilar bo‘limidan yangi o‘quvchi biriktiring.</p>
          </div>
        </div>
      ) : (
        <div className="panel-card table-panel-card">
          <div className="modern-table-responsive">
            <table className="modern-table attendance-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>O‘quvchi</th>
                  <th>Guruh</th>
                  <th>Qoldirganlar</th>
                  <th>Davomat holati</th>
                </tr>
              </thead>
              <tbody>
                {currentStudents.map((student, idx) => {
                  const currentStatus = attendanceMap[student.id] || "present";
                  const initials = student.name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2);

                  return (
                    <tr key={student.id}>
                      <td className="row-num">{idx + 1}</td>
                      <td>
                        <div className="table-user-cell">
                          <div className="table-avatar">{initials}</div>
                          <div>
                            <strong>{student.name}</strong>
                            <small className="user-sub-phone">
                              {student.phone}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="group-pill">{student.group_name}</span>
                      </td>
                      <td>
                        <span
                          className={`missed-badge ${
                            student.missed >= 5
                              ? "high"
                              : student.missed >= 3
                              ? "medium"
                              : "low"
                          }`}
                        >
                          {student.missed} ta
                        </span>
                      </td>
                      <td>
                        <div className="attendance-buttons-group">
                          <button
                            type="button"
                            className={`att-btn att-present ${
                              currentStatus === "present" ? "active" : ""
                            }`}
                            onClick={() => handleMark(student, "present")}
                          >
                            <Icon name="check" size={14} /> Keldi
                          </button>
                          <button
                            type="button"
                            className={`att-btn att-absent ${
                              currentStatus === "absent" ? "active" : ""
                            }`}
                            onClick={() => handleMark(student, "absent")}
                          >
                            <Icon name="close" size={14} /> Kelmadi
                          </button>
                          <button
                            type="button"
                            className={`att-btn att-late ${
                              currentStatus === "late" ? "active" : ""
                            }`}
                            onClick={() => handleMark(student, "late")}
                          >
                            <Icon name="clock" size={14} /> Kechikdi
                          </button>
                          <button
                            type="button"
                            className={`att-btn att-excused ${
                              currentStatus === "excused" ? "active" : ""
                            }`}
                            onClick={() => handleMark(student, "excused")}
                          >
                            <Icon name="shield" size={14} /> Sababli
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
