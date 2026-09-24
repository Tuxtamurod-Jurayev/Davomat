export type PageType = "dashboard" | "lessons" | "students" | "groups" | "attendance";

export interface Student {
  id: string;
  name: string;
  phone: string;
  group_name: string;
  missed: number;
  total_lessons: number;
  status: "active" | "warning" | "danger";
  notes?: string;
  created_at?: string;
}

export interface Lesson {
  id: string;
  building: string;
  block: string;
  room: string;
  day: string;
  start_time: string;
  end_time: string;
  subject: string;
  group_name?: string;
  created_at?: string;
}

export interface Group {
  id: string;
  name: string;
  level: string;
  room?: string;
  schedule?: string;
  created_at?: string;
}

export interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  group_name: string;
  lesson_id?: string;
  date: string;
  status: "present" | "absent" | "late" | "excused";
  notes?: string;
  created_at?: string;
}
