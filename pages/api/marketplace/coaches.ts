// pages/api/marketplace/coaches.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import { supabaseServer } from '@/lib/supabaseServer';

const QuerySchema = z.object({
  q: z.string().trim().max(80).optional(),                  // free-text (name, tags)
  lang: z.string().trim().max(8).optional(),                // e.g., 'en', 'ur'
  minRating: z.coerce.number().min(0).max(5).optional(),    // 0..5
  maxPrice: z.coerce.number().min(0).optional(),            // hourly USD or PKR (your convention)
  tag: z.string().trim().max(24).optional(),                // filter by one tag
  page: z.coerce.number().min(1).default(1),
  pageSize: z.coerce.number().min(1).max(50).default(12),
  sort: z.enum(['rating', 'price', 'new']).default('rating'),
});

type CoachRow = {
  id: string;
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
  headline: string | null;
  bio: string | null;
  price_per_hour: number | null;
  languages: string[] | null;
  rating_avg: number | null;
  rating_count: number | null;
  tags: string[] | null;
  is_active: boolean | null;
};

type CoachCard = {
  id: string;
  name: string;
  avatarUrl: string | null;
  headline: string;
  pricePerHour: number;
  rating: { avg: number; count: number };
  languages: string[];
  tags: string[];
};

type CoachesResponse = {
  ok: true;
  items: CoachCard[];
  page: number;
  pageSize: number;
  total: number;
} | {
  ok: false;
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CoachesResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const parse = QuerySchema.safeParse(req.query);
  if (!parse.success) {
    return res.status(400).json({ ok: false, error: parse.error.message });
  }
  const { q, lang, minRating, maxPrice, tag, page, pageSize, sort } = parse.data;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const supabase = supabaseServer(req, res);

  // Base query: only active coaches
  let query = supabase
    .from<CoachRow>('coaches')
    .select('*', { count: 'exact' })
    .eq('is_active', true);

  // Filters
  if (lang) query = query.contains('languages', [lang]);
  if (minRating !== undefined) query = query.gte('rating_avg', minRating);
  if (maxPrice !== undefined) query = query.lte('price_per_hour', maxPrice);
  if (tag) query = query.contains('tags', [tag]);

  // Naive free-text match against name/headline/tags (requires proper indexes/tsvector in prod)
  if (q && q.length > 1) {
    // Using ilike across a few fields; optimize later with FTS.
    query = query.or(
      [
        `display_name.ilike.%${q}%`,
        `headline.ilike.%${q}%`,
        `tags.cs.{${q}}`, // contains
      ].join(',')
    );
  }

  // Sorting
  switch (sort) {
    case 'price':
      query = query.order('price_per_hour', { ascending: true, nullsFirst: false });
      break;
    case 'new':
      query = query.order('id', { ascending: false }); // replace with created_at if present
      break;
    default:
      query = query.order('rating_avg', { ascending: false, nullsFirst: false });
  }

  // Pagination
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) {
    return res.status(500).json({ ok: false, error: error.message });
  }

  const items: CoachCard[] = (data ?? []).map((r) => ({
    id: r.id,
    name: r.display_name ?? 'Coach',
    avatarUrl: r.avatar_url,
    headline: r.headline ?? '',
    pricePerHour: r.price_per_hour ?? 0,
    rating: { avg: r.rating_avg ?? 0, count: r.rating_count ?? 0 },
    languages: r.languages ?? [],
    tags: r.tags ?? [],
  }));

  return res.status(200).json({
    ok: true,
    items,
    page,
    pageSize,
    total: count ?? 0,
  });
}
