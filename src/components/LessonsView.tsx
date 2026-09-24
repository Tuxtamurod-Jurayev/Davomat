import React, { useState, useMemo } from "react";
import { Icon } from "./Icons";
import type { Lesson, Group } from "../types";

interface LessonsViewProps {
  lessons: Lesson[];
  groups: Group[];
  onAddLesson: (lesson: Omit<Lesson, "id">) => Promise<boolean>;
  onUpdateLesson: (id: string, updates: Partial<Lesson>) => Promise<boolean>;
  onDeleteLesson: (id: string) => Promise<boolean>;
  searchTerm: string;
}

const DAYS = [
  "Dushanba",
  "Seshanba",
  "Chorshanba",
  "Payshanba",
  "Juma",
  "Shanba",
  "Yakshanba",
];

const SUBJECTS = [
  "General English",
  "IELTS Preparation",
  "English A1",
  "English A2",
  "Grammar & Writing",
  "Speaking & Listening",
  "Academic Reading",
  "Kids English",
  "CEFR B1-B2",
  "Matematika",
  "Dasturlash",
];

const TIME_SLOTS = [
  "08:00",
  "08:50",
  "09:00",
  "09:40",
  "10:30",
  "11:00",
  "11:20",
  "12:10",
  "13:00",
  "14:00",
  "14:40",
  "15:30",
  "16:20",
  "17:10",
  "18:00",
  "18:50",
];

function calculateEndTime(startTime: string): string {
  if (!startTime) return "";
  const [h, m] = startTime.split(":").map(Number);
  if (isNaN(h) || isNaN(m)) return "";

  const d = new Date();
  d.setHours(h);
  d.setMinutes(m + 50);

  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function LessonsView({
  lessons,
  groups,
  onAddLesson,
  onUpdateLesson,
  onDeleteLesson,
  searchTerm,
}: LessonsViewProps) {
  const [selectedDay, setSelectedDay] = useState<string>("Barchasi");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [building, setBuilding] = useState("Yangi bino");
  const [block, setBlock] = useState("A");
  const [room, setRoom] = useState("");
  const [day, setDay] = useState("Dushanba");
  const [startTime, setStartTime] = useState("09:00");
  const [subject, setSubject] = useState("General English");
  const [groupName, setGroupName] = useState("");
  const [customSubject, setCustomSubject] = useState("");

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const endTime = useMemo(() => calculateEndTime(startTime), [startTime]);

  // Filtrlangan darslar
  const filteredLessons = useMemo(() => {
    return lessons.filter((l) => {
      const matchDay = selectedDay === "Barchasi" || l.day === selectedDay;
      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        l.subject.toLowerCase().includes(q) ||
        (l.group_name && l.group_name.toLowerCase().includes(q)) ||
        l.room.toLowerCase().includes(q) ||
        l.building.toLowerCase().includes(q);
      return matchDay && matchSearch;
    });
  }, [lessons, selectedDay, searchTerm]);

  // Formani tozalash
  const resetForm = () => {
    setBuilding("Yangi bino");
    setBlock("A");
    setRoom("");
    setDay("Dushanba");
    setStartTime("09:00");
    setSubject("General English");
    setCustomSubject("");
    setGroupName(groups[0]?.name || "");
    setEditingId(null);
    setFormError("");
    setShowModal(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (lesson: Lesson) => {
    setEditingId(lesson.id);
    setBuilding(lesson.building);
    setBlock(lesson.block);
    setRoom(lesson.room);
    setDay(lesson.day);
    setStartTime(lesson.start_time);
    if (SUBJECTS.includes(lesson.subject)) {
      setSubject(lesson.subject);
      setCustomSubject("");
    } else {
      setSubject("Boshqa");
      setCustomSubject(lesson.subject);
    }
    setGroupName(lesson.group_name || "");
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!room.trim()) {
      setFormError("Iltimos, xona raqamini kiriting.");
      return;
    }

    const finalSubject = subject === "Boshqa" ? customSubject.trim() : subject;
    if (!finalSubject) {
      setFormError("Iltimos, fanni tanlang yoki kiriting.");
      return;
    }

    // Xona va vaqt to'qnashuvini tekshirish
    const conflict = lessons.find(
      (l) =>
        l.id !== editingId &&
        l.day === day &&
        l.building === building &&
        l.block === block &&
        l.room.trim().toLowerCase() === room.trim().toLowerCase() &&
        l.start_time === startTime
    );

    if (conflict) {
      setFormError(
        `Diqqat: Ushbu vaqtda ${building}, ${block}-blok ${room}-xonada allaqachon "${conflict.subject}" darsi kiritilgan!`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const lessonPayload = {
        building,
        block,
        room: room.trim(),
        day,
        start_time: startTime,
        end_time: endTime,
        subject: finalSubject,
        group_name: groupName || (groups[0]?.name ?? "Guruh"),
      };

      if (editingId) {
        await onUpdateLesson(editingId, lessonPayload);
      } else {
        await onAddLesson(lessonPayload);
      }

      resetForm();
    } catch {
      setFormError("Saqlashda xatolik yuz berdi. Qayta urinib ko'ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Haqiqatan ham bu darsni o‘chirmoqchimisiz?")) {
      await onDeleteLesson(id);
    }
  };

  return (
    <div className="view-container">
      {/* HEADER SECTION */}
      <div className="view-header-row">
        <div>
          <h2>Dars jadvali boshqaruvi</h2>
          <p>Barcha binolar, xonalar va vaqt slotlari bo‘yicha darslar</p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenCreate}
        >
          <Icon name="plus" size={18} />
          Yangi dars qo‘shish
        </button>
      </div>

      {/* FILTER PILLS */}
      <div className="filter-pill-bar">
        <button
          type="button"
          className={`filter-pill ${
            selectedDay === "Barchasi" ? "active" : ""
          }`}
          onClick={() => setSelectedDay("Barchasi")}
        >
          Barcha kunlar ({lessons.length})
        </button>

        {DAYS.map((d) => {
          const count = lessons.filter((l) => l.day === d).length;
          return (
            <button
              key={d}
              type="button"
              className={`filter-pill ${selectedDay === d ? "active" : ""}`}
              onClick={() => setSelectedDay(d)}
            >
              {d} {count > 0 && <span className="pill-counter">{count}</span>}
            </button>
          );
        })}
      </div>

      {/* LESSONS LIST */}
      {filteredLessons.length === 0 ? (
        <div className="panel-card empty-card">
          <div className="empty-state-content">
            <div className="empty-icon-circle">
              <Icon name="calendar" size={32} />
            </div>
            <h3>Darslar topilmadi</h3>
            <p>
              {selectedDay !== "Barchasi"
                ? `${selectedDay} kuni uchun hali dars rejalashtirilmagan.`
                : "Hozircha tizimda darslar mavjud emas. Yangi dars qo‘shing."}
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenCreate}
            >
              <Icon name="plus" size={16} />
              Dars qo‘shish
            </button>
          </div>
        </div>
      ) : (
        <div className="lessons-grid">
          {filteredLessons.map((lesson) => (
            <div key={lesson.id} className="lesson-card">
              <div className="lesson-card-top">
                <span className="lesson-day-tag">{lesson.day}</span>
                <div className="lesson-actions">
                  <button
                    type="button"
                    className="action-icon-btn edit"
                    onClick={() => handleOpenEdit(lesson)}
                    title="Tahrirlash"
                  >
                    <Icon name="edit" size={16} />
                  </button>
                  <button
                    type="button"
                    className="action-icon-btn delete"
                    onClick={() => handleDelete(lesson.id)}
                    title="O‘chirish"
                  >
                    <Icon name="trash" size={16} />
                  </button>
                </div>
              </div>

              <div className="lesson-card-body">
                <div className="lesson-time-display">
                  <Icon name="clock" size={16} />
                  <strong>
                    {lesson.start_time} — {lesson.end_time}
                  </strong>
                  <span className="duration-tag">50 daq</span>
                </div>

                <h3 className="lesson-card-subject">{lesson.subject}</h3>

                {lesson.group_name && (
                  <div className="lesson-card-group">
                    <Icon name="users" size={14} />
                    <span>{lesson.group_name}</span>
                  </div>
                )}

                <div className="lesson-card-location">
                  <span className="location-pill">
                    <Icon name="building" size={14} />
                    {lesson.building} • {lesson.block}-blok
                  </span>
                  <span className="room-pill">{lesson.room}-xona</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="modal-backdrop" onClick={resetForm}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Icon name="calendar" size={20} />
                <h3>
                  {editingId ? "Darsni tahrirlash" : "Yangi dars rejalashtirish"}
                </h3>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={resetForm}
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              {formError && (
                <div className="alert-box alert-danger">
                  <Icon name="alert" size={18} />
                  <span>{formError}</span>
                </div>
              )}

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>
                    <Icon name="building" size={14} /> Bino
                  </label>
                  <select
                    value={building}
                    onChange={(e) => setBuilding(e.target.value)}
                  >
                    <option value="Yangi bino">Yangi bino</option>
                    <option value="Eski bino">Eski bino</option>
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label>Blok</label>
                  <select
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                  >
                    <option value="A">A blok</option>
                    <option value="B">B blok</option>
                    <option value="C">C blok</option>
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label>Xona raqami *</label>
                  <input
                    type="text"
                    placeholder="Masalan: 301"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>
                    <Icon name="calendar" size={14} /> Hafta kuni
                  </label>
                  <select
                    value={day}
                    onChange={(e) => setDay(e.target.value)}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label>
                    <Icon name="clock" size={14} /> Boshlanish vaqti
                  </label>
                  <select
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  >
                    {TIME_SLOTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group flex-1">
                  <label>Tugash vaqti (avtomatik)</label>
                  <div className="auto-calc-box">{endTime || "--:--"}</div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>
                    <Icon name="book" size={14} /> Fan / Kurs
                  </label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    {SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    <option value="Boshqa">Boshqa fan...</option>
                  </select>
                </div>

                {subject === "Boshqa" && (
                  <div className="form-group flex-1">
                    <label>Fan nomi</label>
                    <input
                      type="text"
                      placeholder="Fan nomini yozing"
                      value={customSubject}
                      onChange={(e) => setCustomSubject(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="form-group flex-1">
                  <label>
                    <Icon name="users" size={14} /> Biriktirilgan guruh
                  </label>
                  <select
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                  >
                    <option value="">Guruhni tanlang</option>
                    {groups.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name} ({g.level})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Saqlanmoqda..."
                  ) : editingId ? (
                    "O‘zgarishlarni saqlash"
                  ) : (
                    "Darsni qo‘shish"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
