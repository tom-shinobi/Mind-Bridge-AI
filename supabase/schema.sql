-- ==============================================================================
-- MINDBRIDGE AI: COMPREHENSIVE SUPABASE POSTGRESQL SCHEMA WITH ROW LEVEL SECURITY
-- ==============================================================================

-- 1. PROFILES TABLE (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Scholar',
  email TEXT,
  college TEXT DEFAULT '',
  course TEXT DEFAULT '',
  department TEXT DEFAULT '',
  specialization TEXT DEFAULT '',
  semester INT DEFAULT 1,
  cgpa NUMERIC(4,2) DEFAULT 0.00,
  target_cgpa NUMERIC(4,2) DEFAULT 9.00,
  daily_study_hours NUMERIC(3,1) DEFAULT 3.0,
  study_time_preference TEXT DEFAULT 'evening',
  explanation_style TEXT DEFAULT 'intuitive_visual',
  difficult_topics TEXT[] DEFAULT '{}',
  subjects TEXT[] DEFAULT '{}',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  onboarding_step INT DEFAULT 0,
  streak_days INT DEFAULT 1,
  total_xp INT DEFAULT 100,
  level INT DEFAULT 1,
  avatar_url TEXT,
  memory_summary JSONB DEFAULT '{
    "learningStyle": "Prefers intuitive analogies with step-by-step logic",
    "currentFocus": "Core Curriculum Diagnostics",
    "academicGoal": "Achieve 9.0+ CGPA",
    "studyPreferences": "Focused deep-work blocks with active practice",
    "difficultTopics": [],
    "strengths": [],
    "notes": "Initialized by MindBridge academic engine",
    "lastUpdated": ""
  }'::jsonb,
  biometric_enabled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. SYLLABUS TOPICS TABLE
CREATE TABLE IF NOT EXISTS public.syllabus_topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  module_name TEXT NOT NULL,
  topic TEXT NOT NULL,
  subtopics TEXT[] DEFAULT '{}',
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'mastered')),
  estimated_hours NUMERIC(4,1) DEFAULT 2.0,
  completed_hours NUMERIC(4,1) DEFAULT 0.0,
  mastery_percentage NUMERIC(5,2) DEFAULT 0.0,
  is_gap_remediation BOOLEAN DEFAULT FALSE,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. LEARNING GAPS TABLE
CREATE TABLE IF NOT EXISTS public.learning_gaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  module TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  mastery_score NUMERIC(5,2) DEFAULT 35.0,
  identified_from TEXT DEFAULT 'Diagnostic Assessment',
  root_cause TEXT DEFAULT 'Conceptual foundation needs reinforcement',
  recommended_hours NUMERIC(4,1) DEFAULT 3.0,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'in_remediation', 'resolved')),
  last_evaluated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. ACADEMIC RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.academic_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_code TEXT DEFAULT '',
  subject_name TEXT NOT NULL,
  semester INT NOT NULL DEFAULT 1,
  exam_type TEXT NOT NULL,
  score NUMERIC(6,2) NOT NULL,
  total_marks NUMERIC(6,2) NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  grade TEXT NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  topics_evaluated TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TIMETABLE BLOCKS TABLE
CREATE TABLE IF NOT EXISTS public.timetable_blocks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_of_week TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  block_type TEXT DEFAULT 'deep_work',
  is_adaptive BOOLEAN DEFAULT FALSE,
  adaptive_reason TEXT,
  completed BOOLEAN DEFAULT FALSE,
  date_string TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. TEST ATTEMPTS TABLE
CREATE TABLE IF NOT EXISTS public.test_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id TEXT NOT NULL,
  test_title TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  score NUMERIC(6,2) NOT NULL,
  total_questions INT NOT NULL,
  percentage NUMERIC(5,2) NOT NULL,
  user_answers JSONB DEFAULT '{}'::jsonb,
  time_spent_seconds INT DEFAULT 0,
  feedback TEXT,
  previous_mastery NUMERIC(5,2),
  new_mastery NUMERIC(5,2),
  gap_id TEXT,
  status TEXT DEFAULT 'passed',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. AUDIT LOG TABLE
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT now(),
  trigger_event TEXT NOT NULL,
  action_taken TEXT NOT NULL,
  category TEXT NOT NULL,
  impact_description TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. WEBAUTHN / PASSKEY CREDENTIALS TABLE
CREATE TABLE IF NOT EXISTS public.webauthn_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  credential_id TEXT UNIQUE NOT NULL,
  public_key TEXT NOT NULL,
  counter BIGINT DEFAULT 0,
  device_name TEXT DEFAULT 'Browser Authenticator',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. USER FACE BIOMETRIC CREDENTIALS TABLE (Apple-style Face ID Server Verification)
CREATE TABLE IF NOT EXISTS public.user_face_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  face_descriptor_hash TEXT NOT NULL,
  biometric_data JSONB NOT NULL,
  similarity_threshold NUMERIC(4,2) DEFAULT 0.80,
  device_name TEXT DEFAULT 'Face ID Sensor',
  enrolled_at TIMESTAMPTZ DEFAULT now(),
  last_verified_at TIMESTAMPTZ,
  verification_count INT DEFAULT 0,
  CONSTRAINT unique_user_face UNIQUE (user_id)
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.syllabus_topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webauthn_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_face_credentials ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- DEFINE ROW LEVEL SECURITY POLICIES (Users can only access their own data)
-- ==============================================================================

-- Profiles
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Syllabus Topics
DROP POLICY IF EXISTS "Users can CRUD own syllabus topics" ON public.syllabus_topics;
CREATE POLICY "Users can CRUD own syllabus topics" ON public.syllabus_topics FOR ALL USING (auth.uid() = user_id);

-- Learning Gaps
DROP POLICY IF EXISTS "Users can CRUD own learning gaps" ON public.learning_gaps;
CREATE POLICY "Users can CRUD own learning gaps" ON public.learning_gaps FOR ALL USING (auth.uid() = user_id);

-- Academic Records
DROP POLICY IF EXISTS "Users can CRUD own academic records" ON public.academic_records;
CREATE POLICY "Users can CRUD own academic records" ON public.academic_records FOR ALL USING (auth.uid() = user_id);

-- Timetable Blocks
DROP POLICY IF EXISTS "Users can CRUD own timetable blocks" ON public.timetable_blocks;
CREATE POLICY "Users can CRUD own timetable blocks" ON public.timetable_blocks FOR ALL USING (auth.uid() = user_id);

-- Test Attempts
DROP POLICY IF EXISTS "Users can CRUD own test attempts" ON public.test_attempts;
CREATE POLICY "Users can CRUD own test attempts" ON public.test_attempts FOR ALL USING (auth.uid() = user_id);

-- Audit Log
DROP POLICY IF EXISTS "Users can CRUD own audit logs" ON public.audit_log;
CREATE POLICY "Users can CRUD own audit logs" ON public.audit_log FOR ALL USING (auth.uid() = user_id);

-- WebAuthn Credentials
DROP POLICY IF EXISTS "Users can CRUD own passkey credentials" ON public.webauthn_credentials;
CREATE POLICY "Users can CRUD own passkey credentials" ON public.webauthn_credentials FOR ALL USING (auth.uid() = user_id);

-- User Face Biometric Credentials
DROP POLICY IF EXISTS "Users can CRUD own face credentials" ON public.user_face_credentials;
CREATE POLICY "Users can CRUD own face credentials" ON public.user_face_credentials FOR ALL USING (auth.uid() = user_id);

-- ==============================================================================
-- PROFILE MANAGEMENT: Managed client-side via Supabase JS SDK upon signup
-- (No triggers on auth.users needed to avoid foreign key transaction race conditions)
-- ==============================================================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- ==============================================================================
-- STORAGE BUCKET CONFIGURATION FOR SYLLABUS FILES
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('syllabuses', 'syllabuses', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "User syllabus storage access" ON storage.objects;
CREATE POLICY "User syllabus storage access" ON storage.objects
FOR ALL USING (
  bucket_id = 'syllabuses' AND auth.uid()::text = (storage.foldername(name))[1]
);
