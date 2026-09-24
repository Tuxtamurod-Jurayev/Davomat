import React, { useState } from "react";
import { Icon } from "./Icons";
import type { Group, Student } from "../types";

interface GroupsViewProps {
  groups: Group[];
  students: Student[];
  onAddGroup: (group: Omit<Group, "id">) => Promise<boolean>;
  onDeleteGroup: (id: string) => Promise<boolean>;
  searchTerm: string;
}

export function GroupsView({
  groups,
  students,
  onAddGroup,
  onDeleteGroup,
  searchTerm,
}: GroupsViewProps) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [level, setLevel] = useState("Elementary");
  const [room, setRoom] = useState("301-xona");
  const [schedule, setSchedule] = useState("Dush-Chor-Juma 09:00");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredGroups = groups.filter((g) => {
    const q = searchTerm.trim().toLowerCase();
    return (
      !q ||
      g.name.toLowerCase().includes(q) ||
      (g.level && g.level.toLowerCase().includes(q)) ||
      (g.room && g.room.toLowerCase().includes(q))
    );
  });

  const resetForm = () => {
    setName("");
    setLevel("Elementary");
    setRoom("301-xona");
    setSchedule("Dush-Chor-Juma 09:00");
    setError("");
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Iltimos, guruh nomini kiriting.");
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddGroup({
        name: name.trim(),
        level,
        room,
        schedule,
      });
      resetForm();
    } catch {
      setError("Guruhni saqlashda xatolik.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, groupName: string) => {
    const count = students.filter((s) => s.group_name === groupName).length;
    if (
      window.confirm(
        `"${groupName}" guruhini o‘chirmoqchimisiz? (${count} nafar o‘quvchi biriktirilgan)`
      )
    ) {
      await onDeleteGroup(id);
    }
  };

  return (
    <div className="view-container">
      <div className="view-header-row">
        <div>
          <h2>Guruhlar boshqaruvi</h2>
          <p>Mavjud guruhlar va kurs darajalari</p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() => setShowModal(true)}
        >
          <Icon name="plus" size={18} />
          Yangi guruh qo‘shish
        </button>
      </div>

      <div className="groups-cards-grid">
        {filteredGroups.map((group) => {
          const groupStudents = students.filter(
            (s) => s.group_name === group.name
          );
          const studentCount = groupStudents.length;
          const avgMissed =
            studentCount > 0
              ? (
                  groupStudents.reduce((acc, s) => acc + (s.missed || 0), 0) /
                  studentCount
                ).toFixed(1)
              : "0";

          return (
            <div key={group.id} className="group-card">
              <div className="group-card-top">
                <div className="group-icon-wrap">
                  <Icon name="group" size={22} />
                </div>
                <button
                  type="button"
                  className="action-icon-btn delete"
                  onClick={() => handleDelete(group.id, group.name)}
                  title="Guruhni o‘chirish"
                >
                  <Icon name="trash" size={15} />
                </button>
              </div>

              <h3 className="group-card-title">{group.name}</h3>
              <span className="group-level-badge">{group.level}</span>

              <div className="group-meta-list">
                <div className="group-meta-item">
                  <Icon name="building" size={15} />
                  <span>{group.room || "Xona belgilanmagan"}</span>
                </div>
                <div className="group-meta-item">
                  <Icon name="calendar" size={15} />
                  <span>{group.schedule || "Kunlar belgilanmagan"}</span>
                </div>
              </div>

              <div className="group-footer-stats">
                <div className="stat-pill-sm">
                  <Icon name="users" size={14} />
                  <strong>{studentCount} nafar</strong> o‘quvchi
                </div>
                <div className="stat-pill-sm">
                  <span>O‘rtacha qoldirish: <strong>{avgMissed}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="modal-backdrop" onClick={resetForm}>
          <div
            className="modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="modal-title-wrap">
                <Icon name="group" size={20} />
                <h3>Yangi guruh ochish</h3>
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
              {error && (
                <div className="alert-box alert-danger">
                  <Icon name="alert" size={18} />
                  <span>{error}</span>
                </div>
              )}

              <div className="form-group">
                <label>Guruh nomi *</label>
                <input
                  type="text"
                  placeholder="Masalan: IELTS Band 7+"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label>Daraja / Kurs</label>
                  <input
                    type="text"
                    placeholder="Masalan: Intermediate B2"
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                  />
                </div>

                <div className="form-group flex-1">
                  <label>Xona</label>
                  <input
                    type="text"
                    placeholder="301-xona"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Dars jadvali / Vaqti</label>
                <input
                  type="text"
                  placeholder="Dush-Chor-Juma 09:00"
                  value={schedule}
                  onChange={(e) => setSchedule(e.target.value)}
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
                  {isSubmitting ? "Saqlanmoqda..." : "Guruhni saqlash"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
