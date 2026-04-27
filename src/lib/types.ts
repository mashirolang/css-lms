export type UserRole = "admin" | "faculty" | "student";

export type StudentStatus = "pending" | "enrolled" | "inactive";

export type ActivityType = "assignment" | "quiz" | "exam";

export type SubmissionStatus = "not_started" | "submitted" | "graded";

export type NotificationType = "activity" | "grade" | "schedule" | "system" | "enrollment";

export interface User {
  id: string;
  email: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  force_password_change: boolean;
  created_at: string;
}

export interface Student extends User {
  role: "student";
  status: StudentStatus;
  course_id: string;
  year_level: number;
  section: string;
  student_number: string;
}

export interface Faculty extends User {
  role: "faculty";
  department: string;
  is_active: boolean;
}

export interface Course {
  id: string;
  name: string;
  code: string;
  description?: string;
  year_levels: number[];
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  course_id: string;
  year_level: number;
  section: string;
  faculty_id?: string;
  faculty?: Faculty;
  student_count?: number;
  schedule?: ScheduleSlot[];
}

export interface ScheduleSlot {
  id: string;
  subject_id: string;
  day: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday";
  start_time: string;
  end_time: string;
  room: string;
}

export interface Activity {
  id: string;
  subject_id: string;
  title: string;
  type: ActivityType;
  description?: string;
  file_url?: string;
  due_date: string;
  created_at: string;
  created_by: string;
}

export interface Submission {
  id: string;
  activity_id: string;
  student_id: string;
  file_url?: string;
  submitted_at: string;
  score?: number;
  remarks?: string;
  status: SubmissionStatus;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  created_at: string;
  link?: string;
}

export interface AttendanceRecord {
  id: string;
  subject_id: string;
  student_id: string;
  date: string;
  present: boolean;
}

// ─── Student Profiling ────────────────────────────────────────────────────

export interface ExtendedProfile {
  student_id: string;
  phone?: string;
  address?: string;
  birth_date?: string;
  gender?: 'male' | 'female' | 'non_binary' | 'prefer_not_to_say';
  guardian_name?: string;
  guardian_phone?: string;
  guardian_relation?: string;
  updated_at?: string;
}

export type SkillCategory = 'programming' | 'hardware' | 'software' | 'other';
export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

export interface StudentSkill {
  id: string;
  student_id: string;
  category: SkillCategory;
  name: string;
  proficiency: ProficiencyLevel;
  notes?: string;
  created_at: string;
}

export type CoCurricularType = 'club' | 'competition' | 'org_role' | 'volunteer' | 'other';

export interface CoCurricular {
  id: string;
  student_id: string;
  type: CoCurricularType;
  organization: string;
  role: string;
  description?: string;
  start_date: string;
  end_date?: string;
  created_at: string;
}

export interface SubjectGrade {
  subject_id: string;
  subject_name: string;
  subject_code: string;
  units: number;
  weighted_avg: number;
  grade_point: number | null;
  letter_grade: string;
  descriptor: string;
  has_grades: boolean;
}

export interface GPASummary {
  gpa: number | null;
  total_units: number;
  graded_units: number;
  subjects_count: number;
}

export interface CollegeStats {
  total_students: number;
  enrolled_students: number;
  avg_gpa: number | null;
  students_by_year: { year_level: number; count: number }[];
}

export interface SkillDistribution {
  category: string;
  count: number;
}

export interface SubjectPerformance {
  subject_code: string;
  avg_weighted_score: number;
}
