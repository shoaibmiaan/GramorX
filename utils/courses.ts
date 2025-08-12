import { supabase } from '@/lib/supabaseClient';

export const REVALIDATE_SECONDS = 60;

// Course shapes your UI can consume safely (id-only)
export type CatalogCourse = {
  id: string;
  title: string;
  description?: string | null;
  category?: string | null;
  level?: string | null;
  is_featured?: boolean | null;
  band_target?: number | null;
  tags?: string[] | null;
  thumbnail_url?: string | null;
  hero_badge?: string | null; // keep if you have it
};

export type CourseDetail = CatalogCourse;

export type SyllabusItem = {
  id: string;
  title: string;
  order: number;
  durationMin: number | null;
  course_id: string;
  kind?: string | null;
  free_preview?: boolean | null;
  video_url?: string | null;
};

// List for /learning
export async function getCatalogCourses(): Promise<CatalogCourse[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
  // .order('created_at', { ascending: false }) // uncomment if you have created_at
  ;
  if (error) throw error;
  return (data ?? []) as CatalogCourse[];
}
export const listCourses = getCatalogCourses;

// ID-only helpers
export async function getAllCourseIds(): Promise<string[]> {
  const { data, error } = await supabase.from('courses').select('id');
  if (error) throw error;
  return (data ?? []).map(r => r.id);
}

export async function getCourseById(id: string): Promise<CourseDetail | null> {
  const { data, error } = await supabase.from('courses').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return (data as CourseDetail) ?? null;
}
export const getCourse = getCourseById;

export async function getLessonsByCourseId(courseId: string): Promise<SyllabusItem[]> {
  const { data, error } = await supabase
    .from('lessons')
    .select('id,title,order_index,duration_minutesutes,course_id,kind,free_preview,video_url')
    .eq('course_id', courseId)
    .order('order_index', { ascending: true });

  if (error) throw error;

  return (data ?? []).map((l: any) => ({
    id: l.id,
    title: l.title,
    order: l.order_index,
    durationMin: l.duration_minutesutes ?? null,
    course_id: l.course_id,
    kind: l.kind ?? null,
    free_preview: l.free_preview ?? null,
    video_url: l.video_url ?? null,
  }));
}
export const listLessons = getLessonsByCourseId;
