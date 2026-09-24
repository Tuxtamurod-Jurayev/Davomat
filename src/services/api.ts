import { supabase } from "../lib/supabase";
import type { Student, Lesson, Group, AttendanceRecord } from "../types";

// ==========================================
// LOCAL STORAGE KEYS (Kesh va zaxira uchun)
// ==========================================
const STORAGE_KEYS = {
  STUDENTS: "davomat_cached_students",
  LESSONS: "davomat_cached_lessons",
  GROUPS: "davomat_cached_groups",
  ATTENDANCE: "davomat_cached_attendance",
};

// Yordamchi localStorage funksiyalari
function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn("localStorage saqlashda xato", e);
  }
}

// ==========================================
// O'QUVCHILAR (STUDENTS) API
// ==========================================
export async function fetchStudents(): Promise<Student[]> {
  try {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data) {
      console.warn("Supabase students xatosi, keshdan olinmoqda:", error);
      return getLocal<Student[]>(STORAGE_KEYS.STUDENTS, []);
    }

    setLocal(STORAGE_KEYS.STUDENTS, data);
    return data as Student[];
  } catch (err) {
    console.error("fetchStudents exception:", err);
    return getLocal<Student[]>(STORAGE_KEYS.STUDENTS, []);
  }
}

export async function addStudent(student: Omit<Student, "id">): Promise<Student | null> {
  try {
    const { data, error } = await supabase
      .from("students")
      .insert([student])
      .select()
      .single();

    if (error) {
      console.error("addStudent error:", error);
      // Mahalliy fallback yaratish
      const fallback: Student = {
        ...student,
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      };
      const list = getLocal<Student[]>(STORAGE_KEYS.STUDENTS, []);
      setLocal(STORAGE_KEYS.STUDENTS, [fallback, ...list]);
      return fallback;
    }

    // Keshni yangilash
    const list = getLocal<Student[]>(STORAGE_KEYS.STUDENTS, []);
    setLocal(STORAGE_KEYS.STUDENTS, [data, ...list]);
    return data as Student;
  } catch (err) {
    console.error("addStudent exception:", err);
    return null;
  }
}

export async function updateStudent(id: string, updates: Partial<Student>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("students")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("updateStudent error:", error);
    }

    // Keshni yangilash
    const list = getLocal<Student[]>(STORAGE_KEYS.STUDENTS, []);
    const updated = list.map((s) => (s.id === id ? { ...s, ...updates } : s));
    setLocal(STORAGE_KEYS.STUDENTS, updated);

    return true;
  } catch (err) {
    console.error("updateStudent exception:", err);
    return false;
  }
}

export async function deleteStudent(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("students").delete().eq("id", id);
    if (error) {
      console.error("deleteStudent error:", error);
    }
    const list = getLocal<Student[]>(STORAGE_KEYS.STUDENTS, []);
    setLocal(STORAGE_KEYS.STUDENTS, list.filter((s) => s.id !== id));
    return true;
  } catch (err) {
    console.error("deleteStudent exception:", err);
    return false;
  }
}

// ==========================================
// DARSLAR (LESSONS) API
// ==========================================
export async function fetchLessons(): Promise<Lesson[]> {
  try {
    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .order("start_time", { ascending: true });

    if (error || !data) {
      console.warn("Supabase lessons xatosi, keshdan olinmoqda:", error);
      return getLocal<Lesson[]>(STORAGE_KEYS.LESSONS, []);
    }

    setLocal(STORAGE_KEYS.LESSONS, data);
    return data as Lesson[];
  } catch (err) {
    console.error("fetchLessons exception:", err);
    return getLocal<Lesson[]>(STORAGE_KEYS.LESSONS, []);
  }
}

export async function addLesson(lesson: Omit<Lesson, "id">): Promise<Lesson | null> {
  try {
    const { data, error } = await supabase
      .from("lessons")
      .insert([lesson])
      .select()
      .single();

    if (error) {
      console.error("addLesson error:", error);
      const fallback: Lesson = {
        ...lesson,
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      };
      const list = getLocal<Lesson[]>(STORAGE_KEYS.LESSONS, []);
      setLocal(STORAGE_KEYS.LESSONS, [...list, fallback]);
      return fallback;
    }

    const list = getLocal<Lesson[]>(STORAGE_KEYS.LESSONS, []);
    setLocal(STORAGE_KEYS.LESSONS, [...list, data]);
    return data as Lesson;
  } catch (err) {
    console.error("addLesson exception:", err);
    return null;
  }
}

export async function updateLesson(id: string, updates: Partial<Lesson>): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("lessons")
      .update(updates)
      .eq("id", id);

    if (error) {
      console.error("updateLesson error:", error);
    }

    const list = getLocal<Lesson[]>(STORAGE_KEYS.LESSONS, []);
    setLocal(
      STORAGE_KEYS.LESSONS,
      list.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
    return true;
  } catch (err) {
    console.error("updateLesson exception:", err);
    return false;
  }
}

export async function deleteLesson(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("lessons").delete().eq("id", id);
    if (error) {
      console.error("deleteLesson error:", error);
    }
    const list = getLocal<Lesson[]>(STORAGE_KEYS.LESSONS, []);
    setLocal(STORAGE_KEYS.LESSONS, list.filter((l) => l.id !== id));
    return true;
  } catch (err) {
    console.error("deleteLesson exception:", err);
    return false;
  }
}

// ==========================================
// GURUHLAR (GROUPS) API
// ==========================================
export async function fetchGroups(): Promise<Group[]> {
  try {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .order("name", { ascending: true });

    if (error || !data) {
      return getLocal<Group[]>(STORAGE_KEYS.GROUPS, []);
    }

    setLocal(STORAGE_KEYS.GROUPS, data);
    return data as Group[];
  } catch (err) {
    console.error("fetchGroups exception:", err);
    return getLocal<Group[]>(STORAGE_KEYS.GROUPS, []);
  }
}

export async function addGroup(group: Omit<Group, "id">): Promise<Group | null> {
  try {
    const { data, error } = await supabase
      .from("groups")
      .insert([group])
      .select()
      .single();

    if (error) {
      console.error("addGroup error:", error);
      const fallback: Group = {
        ...group,
        id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      };
      const list = getLocal<Group[]>(STORAGE_KEYS.GROUPS, []);
      setLocal(STORAGE_KEYS.GROUPS, [...list, fallback]);
      return fallback;
    }

    const list = getLocal<Group[]>(STORAGE_KEYS.GROUPS, []);
    setLocal(STORAGE_KEYS.GROUPS, [...list, data]);
    return data as Group;
  } catch (err) {
    console.error("addGroup exception:", err);
    return null;
  }
}

export async function deleteGroup(id: string): Promise<boolean> {
  try {
    await supabase.from("groups").delete().eq("id", id);
    const list = getLocal<Group[]>(STORAGE_KEYS.GROUPS, []);
    setLocal(STORAGE_KEYS.GROUPS, list.filter((g) => g.id !== id));
    return true;
  } catch {
    return false;
  }
}

// ==========================================
// DAVOMAT (ATTENDANCE) API
// ==========================================
export async function fetchAttendance(date: string, groupName?: string): Promise<AttendanceRecord[]> {
  try {
    let query = supabase.from("attendance").select("*").eq("date", date);
    if (groupName && groupName !== "Barchasi") {
      query = query.eq("group_name", groupName);
    }
    const { data, error } = await query;
    if (error || !data) {
      return getLocal<AttendanceRecord[]>(`${STORAGE_KEYS.ATTENDANCE}_${date}`, []);
    }
    setLocal(`${STORAGE_KEYS.ATTENDANCE}_${date}`, data);
    return data as AttendanceRecord[];
  } catch {
    return getLocal<AttendanceRecord[]>(`${STORAGE_KEYS.ATTENDANCE}_${date}`, []);
  }
}

export async function saveAttendanceRecord(
  student: Student,
  date: string,
  status: "present" | "absent" | "late" | "excused"
): Promise<boolean> {
  try {
    // 1. Shu o'quvchi va sana uchun davomat bor-yo'qligini tekshirish
    const { data: existing } = await supabase
      .from("attendance")
      .select("id, status")
      .eq("student_id", student.id)
      .eq("date", date)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("attendance")
        .update({ status })
        .eq("id", existing.id);
    } else {
      await supabase.from("attendance").insert([
        {
          student_id: student.id,
          student_name: student.name,
          group_name: student.group_name,
          date,
          status,
        },
      ]);
    }

    // 2. Agar o'quvchi 'absent' bo'lsa va avval boshqa holatda bo'lgan bo'lsa, student missed countini oshirish
    if (status === "absent" && (!existing || existing.status !== "absent")) {
      const newMissed = (student.missed || 0) + 1;
      await updateStudent(student.id, {
        missed: newMissed,
        status: newMissed >= 5 ? "danger" : newMissed >= 3 ? "warning" : "active",
      });
    } else if (existing && existing.status === "absent" && status !== "absent") {
      const newMissed = Math.max(0, (student.missed || 0) - 1);
      await updateStudent(student.id, {
        missed: newMissed,
        status: newMissed >= 5 ? "danger" : newMissed >= 3 ? "warning" : "active",
      });
    }

    return true;
  } catch (err) {
    console.error("saveAttendanceRecord error:", err);
    return false;
  }
}
