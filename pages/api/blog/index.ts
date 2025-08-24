// pages/api/blog/index.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

/** ===== Types ===== */
type Category = 'Listening' | 'Reading' | 'Writing' | 'Speaking' | 'Study Plan' | 'Product';
type Sort = 'newest' | 'popular';

export interface BlogListItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: Category;
  tags: string[];
  read_min: number;
  likes: number;
  published_at: string | null;
  hero_image_url: string | null;
}
export interface BlogListResponse {
  ok: boolean;
  items: BlogListItem[];
  pageInfo: { page: number; pageSize: number; total: number; totalPages: number };
  tagCloud: string[];
  message?: string;
}

export interface BlogCreateRequest {
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  category: Category;
  tags?: string[];
  hero_image_url?: string | null;
  read_min?: number;
  author_user_id?: string | null; // optional, attach auth id later
  submit?: boolean;               // if true -> status 'submitted', else 'draft'
}
export interface BlogCreateResponse {
  ok: boolean;
  id?: string;
  status?: 'draft' | 'submitted';
  message?: string;
  errors?: Record<string, string>;
}

/** ===== Helpers ===== */
function bad(
  res: NextApiResponse,
  code: number,
  message: string,
  errors?: Record<string, string>
) {
  return res.status(code).json({ ok: false, message, ...(errors ? { errors } : {}) });
}

function parseGetQuery(req: NextApiRequest) {
  const q = String(req.query.q ?? '').trim();
  const category = String(req.query.category ?? '').trim() as Category | '';
  const tag = String(req.query.tag ?? '').trim();
  const sort = (String(req.query.sort ?? 'newest') as Sort) || 'newest';
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
  const pageSize = Math.min(24, Math.max(1, parseInt(String(req.query.pageSize ?? '6'), 10) || 6));
  const cats: Category[] = ['Listening', 'Reading', 'Writing', 'Speaking', 'Study Plan', 'Product'];
  const cat = cats.includes(category as Category) ? (category as Category) : undefined;
  const srt: Sort = sort === 'popular' ? 'popular' : 'newest';
  return { q, cat, tag, sort: srt, page, pageSize };
}

function validateCreate(
  b: unknown
): { ok: true; data: BlogCreateRequest } | { ok: false; errors: Record<string, string> } {
  const e: Record<string, string> = {};
  const x = b as Partial<BlogCreateRequest> | undefined;
  const cats: Category[] = ['Listening', 'Reading', 'Writing', 'Speaking', 'Study Plan', 'Product'];

  if (!x || typeof x !== 'object') return { ok: false, errors: { body: 'Invalid JSON' } };
  if (!x.slug || typeof x.slug !== 'string' || !/^[a-z0-9-]{3,100}$/.test(x.slug))
    e.slug = 'Slug must be kebab-case, 3–100 chars.';
  if (!x.title || typeof x.title !== 'string' || x.title.trim().length < 5)
    e.title = 'Title must be ≥ 5 chars.';
  if (!x.excerpt || typeof x.excerpt !== 'string' || x.excerpt.trim().length < 20)
    e.excerpt = 'Excerpt must be ≥ 20 chars.';
  if (!x.content_md || typeof x.content_md !== 'string' || x.content_md.trim().length < 50)
    e.content_md = 'Content must be ≥ 50 chars.';
  if (!x.category || typeof x.category !== 'string' || !cats.includes(x.category as Category))
    e.category = `Category must be one of ${cats.join(', ')}.`;
  if (x.tags && !Array.isArray(x.tags)) e.tags = 'Tags must be an array of strings.';
  if (x.read_min != null && (typeof x.read_min !== 'number' || x.read_min < 1 || x.read_min > 90))
    e.read_min = 'read_min 1–90.';
  if (x.author_user_id != null && typeof x.author_user_id !== 'string')
    e.author_user_id = 'author_user_id must be a string uuid.';
  if (x.submit != null && typeof x.submit !== 'boolean') e.submit = 'submit must be boolean.';
  if (Object.keys(e).length) return { ok: false, errors: e };

  return {
    ok: true,
    data: {
      slug: x.slug!,
      title: x.title!.trim(),
      excerpt: x.excerpt!.trim(),
      content_md: x.content_md!,
      category: x.category as Category,
      tags: (x.tags ?? []).map((s) => String(s)),
      hero_image_url: x.hero_image_url ?? null,
      read_min: x.read_min ?? 5,
      author_user_id: x.author_user_id ?? null,
      submit: !!x.submit,
    },
  };
}

/** ===== Handler ===== */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<BlogListResponse | BlogCreateResponse>
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return bad(res, 500, 'Server misconfigured: missing Supabase env.');

  const supa = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  if (req.method === 'GET') {
    const { q, cat, tag, sort, page, pageSize } = parseGetQuery(req);

    let qb = supa
      .from('blog_posts')
      .select('id,slug,title,excerpt,category,tags,read_min,likes,published_at,hero_image_url', {
        count: 'exact',
      })
      .eq('status', 'published');

    if (cat) qb = qb.eq('category', cat);
    if (q) qb = qb.or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`);
    if (tag) qb = qb.contains('tags', [tag]);

    qb =
      sort === 'popular'
        ? qb.order('likes', { ascending: false }).order('published_at', { ascending: false })
        : qb.order('published_at', { ascending: false });

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    qb = qb.range(from, to);

    const { data, error, count } = await qb;
    if (error) return bad(res, 500, 'Failed to fetch posts');

    // Tag cloud from all published posts
    const { data: tagsRows } = await supa
      .from('blog_posts')
      .select('tags')
      .eq('status', 'published')
      .limit(1000);

    const tagCloud = (tagsRows ?? [])
      .flatMap((r) => (Array.isArray(r.tags) ? r.tags : []))
      .filter((v, i, a) => a.indexOf(v) === i)
      .sort((a, b) => a.localeCompare(b));

    const total = count ?? 0;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return res.status(200).json({
      ok: true,
      items: (data ?? []) as BlogListItem[],
      pageInfo: { page, pageSize, total, totalPages },
      tagCloud,
    });
  }

  if (req.method === 'POST') {
    const parsed = validateCreate(req.body as unknown);
    if (!parsed.ok) return bad(res, 400, 'Validation failed', parsed.errors);

    const initialStatus: 'draft' | 'submitted' = parsed.data.submit ? 'submitted' : 'draft';
    const submittedAt: string | null = parsed.data.submit ? new Date().toISOString() : null;

    const insertPayload = {
      slug: parsed.data.slug,
      title: parsed.data.title,
      excerpt: parsed.data.excerpt,
      content_md: parsed.data.content_md,
      category: parsed.data.category,
      tags: parsed.data.tags ?? [],
      hero_image_url: parsed.data.hero_image_url,
      read_min: parsed.data.read_min,
      status: initialStatus,
      submitted_at: submittedAt,
      author_user_id: parsed.data.author_user_id ?? null,
    };

    const { data, error } = await supa
      .from('blog_posts')
      .insert(insertPayload)
      .select('id')
      .single();

    if (error) return bad(res, 500, 'Failed to create post');
    return res
      .status(200)
      .json({ ok: true, id: (data as { id: string }).id, status: initialStatus, message: 'Saved.' });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return bad(res, 405, 'Method Not Allowed');
}

/** Optional: increase body size (for long content) */
export const config = { api: { bodyParser: { sizeLimit: '1mb' } } };
