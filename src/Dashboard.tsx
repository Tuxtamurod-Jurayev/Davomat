import { useState, useEffect, useCallback } from "react";
import type { PageType, Student, Lesson, Group } from "./types";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { DashboardView } from "./components/DashboardView";
import { LessonsView } from "./components/LessonsView";
import { StudentsView } from "./components/StudentsView";
import { GroupsView } from "./components/GroupsView";
import { AttendanceView } from "./components/AttendanceView";
import {
  fetchStudents,
  addStudent,
  updateStudent,
  deleteStudent,
  fetchLessons,
  addLesson,
  updateLesson,
  deleteLesson,
  fetchGroups,
  addGroup,
  deleteGroup,
} from "./services/api";
import { checkSupabaseConnection } from "./lib/supabase";
import "./Dashboard.css";

export default function Dashboard() {
  const [activePage, setActivePage] = useState<PageType>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("davomat_dark_mode") === "true";
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(true);

  // Asosiy ma'lumotlar holatlari
  const [students, setStudents] = useState<Student[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Barcha ma'lumotlarni Supabase dan yuklash
  const loadAllData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const isOnline = await checkSupabaseConnection();
      setSupabaseConnected(isOnline);

      const [stList, lsList, grList] = await Promise.all([
        fetchStudents(),
        fetchLessons(),
        fetchGroups(),
      ]);

      setStudents(stList);
      setLessons(lsList);
      setGroups(grList);
    } catch (err) {
      console.error("Ma'lumotlarni yuklashda xatolik:", err);
      setSupabaseConnected(false);
    } finally {
      setIsRefreshing(false);
      setLoadingInitial(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Tema o'zgarishi
  const toggleTheme = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("davomat_dark_mode", String(next));
      return next;
    });
  };

  // ==========================================
  // O'QUVCHILAR HANDLERLARI
  // ==========================================
  const handleAddStudent = async (studentData: Omit<Student, "id">): Promise<boolean> => {
    const created = await addStudent(studentData);
    if (created) {
      setStudents((prev) => [created, ...prev]);
      return true;
    }
    return false;
  };

  const handleUpdateStudent = async (id: string, updates: Partial<Student>): Promise<boolean> => {
    const ok = await updateStudent(id, updates);
    if (ok) {
      setStudents((prev) =>
        prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
      );
      return true;
    }
    return false;
  };

  const handleDeleteStudent = async (id: string): Promise<boolean> => {
    const ok = await deleteStudent(id);
    if (ok) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
      return true;
    }
    return false;
  };

  // ==========================================
  // DARSLAR HANDLERLARI
  // ==========================================
  const handleAddLesson = async (lessonData: Omit<Lesson, "id">): Promise<boolean> => {
    const created = await addLesson(lessonData);
    if (created) {
      setLessons((prev) => [...prev, created]);
      return true;
    }
    return false;
  };

  const handleUpdateLesson = async (id: string, updates: Partial<Lesson>): Promise<boolean> => {
    const ok = await updateLesson(id, updates);
    if (ok) {
      setLessons((prev) =>
        prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
      );
      return true;
    }
    return false;
  };

  const handleDeleteLesson = async (id: string): Promise<boolean> => {
    const ok = await deleteLesson(id);
    if (ok) {
      setLessons((prev) => prev.filter((l) => l.id !== id));
      return true;
    }
    return false;
  };

  // ==========================================
  // GURUHLAR HANDLERLARI
  // ==========================================
  const handleAddGroup = async (groupData: Omit<Group, "id">): Promise<boolean> => {
    const created = await addGroup(groupData);
    if (created) {
      setGroups((prev) => [...prev, created]);
      return true;
    }
    return false;
  };

  const handleDeleteGroup = async (id: string): Promise<boolean> => {
    const ok = await deleteGroup(id);
    if (ok) {
      setGroups((prev) => prev.filter((g) => g.id !== id));
      return true;
    }
    return false;
  };

  return (
    <div className={`app-root ${darkMode ? "dark-theme" : "light-theme"}`}>
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((p) => !p)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        studentCount={students.length}
        lessonCount={lessons.length}
        supabaseConnected={supabaseConnected}
      />

      <div className={`app-workspace ${sidebarCollapsed ? "sidebar-is-collapsed" : ""}`}>
        <Header
          activePage={activePage}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          darkMode={darkMode}
          onToggleTheme={toggleTheme}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onRefresh={loadAllData}
          isRefreshing={isRefreshing}
          supabaseConnected={supabaseConnected}
        />

        <main className="app-main-content">
          {loadingInitial ? (
            <div className="initial-loading-container">
              <div className="loading-spinner-circle" />
              <h3>Davomat yuklanmoqda...</h3>
              <p>Supabase ma'lumotlar bazasi bilan aloqa o‘rnatilmoqda</p>
            </div>
          ) : (
            <>
              {activePage === "dashboard" && (
                <DashboardView
                  students={students}
                  lessons={lessons}
                  onNavigate={setActivePage}
                  searchTerm={searchTerm}
                />
              )}

              {activePage === "lessons" && (
                <LessonsView
                  lessons={lessons}
                  groups={groups}
                  onAddLesson={handleAddLesson}
                  onUpdateLesson={handleUpdateLesson}
                  onDeleteLesson={handleDeleteLesson}
                  searchTerm={searchTerm}
                />
              )}

              {activePage === "students" && (
                <StudentsView
                  students={students}
                  groups={groups}
                  onAddStudent={handleAddStudent}
                  onUpdateStudent={handleUpdateStudent}
                  onDeleteStudent={handleDeleteStudent}
                  searchTerm={searchTerm}
                />
              )}

              {activePage === "groups" && (
                <GroupsView
                  groups={groups}
                  students={students}
                  onAddGroup={handleAddGroup}
                  onDeleteGroup={handleDeleteGroup}
                  searchTerm={searchTerm}
                />
              )}

              {activePage === "attendance" && (
                <AttendanceView
                  students={students}
                  groups={groups}
                  searchTerm={searchTerm}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}