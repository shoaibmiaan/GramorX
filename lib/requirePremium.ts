import type { GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function requirePremium(
  ctx: GetServerSidePropsContext
): Promise<GetServerSidePropsResult<Record<string, never>>> {
  const supabase = createSupabaseServerClient({ req: ctx.req as any });
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    return {
      redirect: {
        destination: `/login?next=${encodeURIComponent(ctx.resolvedUrl)}`,
        permanent: false,
      },
    };
  }

  const { data } = await supabase
    .from('subscriptions')
    .select('id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  if (!data) {
    return {
      redirect: {
        destination: `/pricing?next=${encodeURIComponent(ctx.resolvedUrl)}`,
        permanent: false,
      },
    };
  }

  return { props: {} };
}
