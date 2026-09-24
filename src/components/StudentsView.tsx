import React, { useState, useMemo } from "react";
import { Icon } from "./Icons";
import type { Student, Group } from "../types";

interface StudentsViewProps {
  students: Student[];
  groups: Group[];
  onAddStudent: (student: Omit<Student, "id">) => Promise<boolean>;
  onUpdateStudent: (id: string, updates: Partial<Student>) => Promise<boolean>;
  onDeleteStudent: (id: string) => Promise<boolean>;
  searchTerm: string;
}

export function StudentsView({
  students,
  groups,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  searchTerm,
}: StudentsViewProps) {
  const [selectedGroup, setSelectedGroup] = useState<string>("Barchasi");
  const [selectedStatus, setSelectedStatus] = useState<string>("Barchasi");

  const [showModal, setShowModal] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+998 ");
  const [groupName, setGroupName] = useState("");
  const [missed, setMissed] = useState<number>(0);
  const [totalLessons, setTotalLessons] = useState<number>(16);
  const [status, setStatus] = useState<"active" | "warning" | "danger">("active");
  const [notes, setNotes] = useState("");

  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtrlash
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchGroup =
        selectedGroup === "Barchasi" || s.group_name === selectedGroup;
      const matchStatus =
        selectedStatus === "Barchasi" || s.status === selectedStatus;
      const q = searchTerm.trim().toLowerCase();
      const matchSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        (s.phone && s.phone.includes(q)) ||
        s.group_name.toLowerCase().includes(q);

      return matchGroup && matchStatus && matchSearch;
    });
  }, [students, selectedGroup, selectedStatus, searchTerm]);

  const resetForm = () => {
    setName("");
    setPhone("+998 ");
    setGroupName(groups[0]?.name || "English A1");
    setMissed(0);
    setTotalLessons(16);
    setStatus("active");
    setNotes("");
    setEditingId(null);
    setFormError("");
    setShowModal(false);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowModal(true);
  };

  const handleOpenEdit = (student: Student) => {
    setEditingId(student.id);
    setName(student.name);
    setPhone(student.phone || "+998 ");
    setGroupName(student.group_name);
    setMissed(student.missed || 0);
    setTotalLessons(student.total_lessons || 16);
    setStatus(student.status || "active");
    setNotes(student.notes || "");
    setFormError("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!name.trim()) {
      setFormError("Iltimos, o‘quvchining to‘liq ismini kiriting.");
      return;
    }

    if (!groupName) {
      setFormError("Iltimos, guruhni tanlang.");
      return;
    }

    // Holatni avtomatik aniqlash (agar manual tanlanmagan bo'lsa)
    let autoStatus = status;
    if (missed >= 5) {
      autoStatus = "danger";
    } else if (missed >= 3) {
      autoStatus = "warning";
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        phone: phone.trim(),
        group_name: groupName,
        missed: Number(missed),
        total_lessons: Number(totalLessons),
        status: autoStatus,
        notes: notes.trim(),
      };

      if (editingId) {
        await onUpdateStudent(editingId, payload);
      } else {
        await onAddStudent(payload);
      }

      resetForm();
    } catch {
      setFormError("Xatolik yuz berdi. Qayta urinib ko‘ring.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Rostdan ham ushbu o‘quvchini tizimdan o‘chirmoqchimisiz?")) {
      await onDeleteStudent(id);
    }
  };

  const handleQuickMissed = async (student: Student, delta: number) => {
    const newMissed = Math.max(0, (student.missed || 0) + delta);
    const newStatus =
      newMissed >= 5 ? "danger" : newMissed >= 3 ? "warning" : "active";
    await onUpdateStudent(student.id, {
      missed: newMissed,
      status: newStatus,
    });
  };

  return (
    <div className="view-container">
      {/* HEADER SECTION */}
      <div className="view-header-row">
        <div>
          <h2>O‘quvchilar ro‘yxati</h2>
          <p>
            Jami {students.length} nafar o‘quvchi ro‘yxatga olingan
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleOpenCreate}
        >
          <Icon name="plus" size={18} />
          Yangi o‘quvchi qo‘shish
        </button>
      </div>

      {/* FILTER CONTROLS */}
      <div className="filters-bar-grid">
        <div className="filter-group">
          <label>Guruh bo‘yicha:</label>
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

        <div className="filter-group">
          <label>Davomat holati:</label>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="Barchasi">Barcha holatlar</option>
            <option value="active">Faol (yaxshi qatnov)</option>
            <option value="warning">Ogohlantirish (3-4 qoldirgan)</option>
            <option value="danger">Xavf ostida (5+ qoldirgan)</option>
          </select>
        </div>
      </div>

      {/* STUDENTS TABLE & LIST */}
      {filteredStudents.length === 0 ? (
        <div className="panel-card empty-card">
          <div className="empty-state-content">
            <div className="empty-icon-circle">
              <Icon name="users" size={32} />
            </div>
            <h3>O‘quvchi topilmadi</h3>
            <p>
              Qidiruv yoki tanlangan filtrlarga mos keluvchi o‘quvchi mavjud
              emas.
            </p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleOpenCreate}
            >
              <Icon name="plus" size={16} />
              O‘quvchi qo‘shish
            </button>
          </div>
        </div>
      ) : (
        <div className="panel-card table-panel-card">
          <div className="modern-table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>F.I.SH.</th>
                  <th>Telefon</th>
                  <th>Guruh</th>
                  <th>Qoldirgan</th>
                  <th>Jami dars</th>
                  <th>Davomat %</th>
                  <th>Holat</th>
                  <th>Tezkor amal</th>
                  <th>Boshqarish</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => {
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
                          <div>
                            <strong className="user-primary-name">
                              {student.name}
                            </strong>
                            {student.notes && (
                              <span className="user-sub-note">
                                {student.notes}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="phone-cell">
                          <Icon name="phone" size={14} className="text-muted" />
                          <span>{student.phone || "—"}</span>
                        </div>
                      </td>

                      <td>
                        <span className="group-pill">{student.group_name}</span>
                      </td>

                      <td>
                        <span
                          className={`missed-badge ${
                            missed >= 5
                              ? "high"
                              : missed >= 3
                              ? "medium"
                              : "low"
                          }`}
                        >
                          {missed} ta
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
                            student.status === "danger"
                              ? "status-danger"
                              : student.status === "warning"
                              ? "status-warning"
                              : "status-active"
                          }`}
                        >
                          {student.status === "danger"
                            ? "Xavf ostida"
                            : student.status === "warning"
                            ? "Ogohlantirish"
                            : "Faol"}
                        </span>
                      </td>

                      <td>
                        <div className="quick-missed-counter">
                          <button
                            type="button"
                            className="counter-btn minus"
                            onClick={() => handleQuickMissed(student, -1)}
                            title="Qoldirishni kamaytirish"
                          >
                            -
                          </button>
                          <span className="counter-val">{missed}</span>
                          <button
                            type="button"
                            className="counter-btn plus"
                            onClick={() => handleQuickMissed(student, 1)}
                            title="Dars qoldirdi (+1)"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      <td>
                        <div className="table-action-btns">
                          <button
                            type="button"
                            className="action-icon-btn edit"
                            onClick={() => handleOpenEdit(student)}
                            title="Tahrirlash"
                          >
                            <Icon name="edit" size={16} />
                          </button>
                          <button
                            type="button"
                            className="action-icon-btn delete"
                            onClick={() => handleDelete(student.id)}
                            title="O‘chirish"
                          >
                            <Icon name="trash" size={16} />
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

      {/* CREATE / EDIT STUDENT MODAL */}
      {showModal && (
        <div className="modal-backdrop" onClick={resetForm}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Icon name="users" size={20} />
                <h3>
                  {editingId
                    ? "O‘quvchi ma'lumotlarini tahrirlash"
                    : "Yangi o‘quvchi qo‘shish"}
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

              <div className="form-group">
                <label>F.I.SH. (Familiya Ism Sharif) *</label>
                <input
                  type="text"
                  placeholder="Masalan: Karimova Madina"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Telefon raqam</label>
                  <input
                    type="text"
                    placeholder="+998 90 123 45 67"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group flex-1">
                  <label>Guruh *</label>
                  <select
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    required
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.name}>
                        {g.name} ({g.level})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Qoldirilgan darslar soni</label>
                  <input
                    type="number"
                    min="0"
                    max={totalLessons}
                    value={missed}
                    onChange={(e) => setMissed(Number(e.target.value))}
                  />
                </div>

                <div className="form-group flex-1">
                  <label>Jami darslar soni</label>
                  <input
                    type="number"
                    min="1"
                    value={totalLessons}
                    onChange={(e) => setTotalLessons(Number(e.target.value))}
                  />
                </div>

                <div className="form-group flex-1">
                  <label>Holat</label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as "active" | "warning" | "danger")
                    }
                  >
                    <option value="active">Faol</option>
                    <option value="warning">Ogohlantirish</option>
                    <option value="danger">Xavf ostida</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Qo‘shimcha izoh / Qaydlar</label>
                <textarea
                  rows={2}
                  placeholder="O‘quvchi haqida qo‘shimcha eslatma..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
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
                    "O‘quvchini saqlash"
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
