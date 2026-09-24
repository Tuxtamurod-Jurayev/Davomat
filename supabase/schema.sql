-- Davomat tizimi uchun Supabase jadvallari

-- 1. Guruhlar jadvali
CREATE TABLE IF NOT EXISTS public.groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    level TEXT DEFAULT 'General',
    room TEXT,
    schedule TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Darslar jadvali
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building TEXT NOT NULL DEFAULT 'Yangi bino',
    block TEXT NOT NULL DEFAULT 'A',
    room TEXT NOT NULL,
    day TEXT NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    subject TEXT NOT NULL,
    group_name TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. O'quvchilar jadvali
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    phone TEXT,
    group_name TEXT NOT NULL,
    missed INTEGER NOT NULL DEFAULT 0,
    total_lessons INTEGER NOT NULL DEFAULT 16,
    status TEXT NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Davomat jadvali
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    student_name TEXT NOT NULL,
    group_name TEXT NOT NULL,
    lesson_id UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status TEXT NOT NULL DEFAULT 'present' CHECK (status IN ('present', 'absent', 'late', 'excused')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS sozlamalari (Anon va Authenticated foydalanuvchilarga to'liq ruxsat)
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Public access to groups" ON public.groups;
    CREATE POLICY "Public access to groups" ON public.groups FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to lessons" ON public.lessons;
    CREATE POLICY "Public access to lessons" ON public.lessons FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to students" ON public.students;
    CREATE POLICY "Public access to students" ON public.students FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Public access to attendance" ON public.attendance;
    CREATE POLICY "Public access to attendance" ON public.attendance FOR ALL USING (true) WITH CHECK (true);
END $$;

-- Boshlang'ich namunaviy ma'lumotlar (Seed Data)
INSERT INTO public.groups (name, level, room, schedule)
VALUES 
    ('English A1', 'Beginner', '301-xona', 'Dush-Chor-Juma 09:00'),
    ('English A2', 'Elementary', '302-xona', 'Dush-Chor-Juma 11:00'),
    ('IELTS Foundation', 'Intermediate', '303-xona', 'Sesh-Pay-Shan 14:00'),
    ('Speaking Club', 'Advanced', '304-xona', 'Shanba 16:00')
ON CONFLICT (name) DO NOTHING;

INSERT INTO public.lessons (building, block, room, day, start_time, end_time, subject, group_name)
VALUES
    ('Yangi bino', 'A', '301', 'Dushanba', '09:00', '09:50', 'General English', 'English A1'),
    ('Yangi bino', 'A', '302', 'Dushanba', '11:00', '11:50', 'General English', 'English A2'),
    ('Yangi bino', 'B', '303', 'Dushanba', '14:00', '14:50', 'IELTS Preparation', 'IELTS Foundation'),
    ('Yangi bino', 'A', '301', 'Chorshanba', '09:00', '09:50', 'General English', 'English A1'),
    ('Yangi bino', 'A', '302', 'Chorshanba', '11:00', '11:50', 'General English', 'English A2'),
    ('Eski bino', 'C', '204', 'Juma', '15:30', '16:20', 'Speaking & Listening', 'Speaking Club');

INSERT INTO public.students (name, phone, group_name, missed, total_lessons, status, notes)
VALUES
    ('Aliyev Azizbek', '+998 90 123 45 67', 'English A1', 1, 16, 'active', 'Aktiv o‘quvchi'),
    ('Karimova Madina', '+998 93 234 56 78', 'English A2', 3, 16, 'active', 'Uyga vazifalarni vaqtida topshiradi'),
    ('Rahimov Javohir', '+998 94 345 67 89', 'IELTS Foundation', 5, 18, 'warning', 'Ko‘p dars qoldirgan, ogohlantirilgan'),
    ('Usmonova Zilola', '+998 91 456 78 90', 'English A1', 2, 16, 'active', 'Yaxshi natija ko‘rsatmoqda'),
    ('Tursunov Bekzod', '+998 99 567 89 01', 'IELTS Foundation', 6, 18, 'danger', 'Ota-onasi bilan bog‘lanish kerak'),
    ('Nazarov Rustam', '+998 97 678 90 12', 'English A2', 0, 16, 'active', 'Davomat 100%'),
    ('Sodiqova Nilufar', '+998 90 789 01 23', 'Speaking Club', 1, 12, 'active', 'Faol ishtirokchi');
