import React from 'react';
import Head from 'next/head';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content_md: string;
  category: string;
  tags: string[];
  read_min: number;
  likes: number;
  published_at: string | null;
  hero_image_url: string | null;
};

type Props = { ok: boolean; post?: Post | null };

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const slug = String(ctx.params?.slug || '');
  const proto = (ctx.req.headers['x-forwarded-proto'] as string) || 'http';
  const host = (ctx.req.headers['x-forwarded-host'] as string) || ctx.req.headers.host || 'localhost:3000';
  const origin = `${proto}://${host}`;

  try {
    const resp = await fetch(`${origin}/api/blog/${encodeURIComponent(slug)}`);
    const json = await resp.json();
    if (!resp.ok || !json.ok) return { props: { ok: false } };
    return { props: { ok: true, post: json.post } };
  } catch {
    return { props: { ok: false } };
  }
};

export default function BlogPostPage({ ok, post }: Props) {
  return (
    <>
      <Head>
        <title>{ok && post ? `${post.title} — GramorX Blog` : 'Blog — GramorX'}</title>
        {ok && post ? <meta name="description" content={post.excerpt} /> : null}
      </Head>

      <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
        <Container>
          {!ok || !post ? (
            <Card className="p-8 rounded-ds-2xl">
              <h1 className="font-slab text-h1">Article not found</h1>
              <p className="text-grayish mt-2">The post you’re looking for doesn’t exist (yet).</p>
              <div className="mt-6">
                <Link className="underline" href="/blog">Back to Blog</Link>
              </div>
            </Card>
          ) : (
            <>
              <div className="max-w-3xl">
                <Link href="/blog" className="underline">← Back to Blog</Link>
                <h1 className="font-slab text-display mt-3 text-gradient-primary">{post.title}</h1>
                <div className="text-grayish mt-2">
                  {post.published_at ? new Date(post.published_at).toLocaleDateString() : ''} • {post.read_min} min read
                </div>
              </div>

              <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
                {/* Content */}
                <Card className="p-6 rounded-ds-2xl">
                  <div className="aspect-video rounded-ds bg-gradient-to-br from-primary/15 to-accent/15 mb-6 overflow-hidden">
                    {post.hero_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={post.hero_image_url}
                        alt={post.title ? `${post.title} hero image` : 'Blog hero image'}
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                  </div>
                  <article className="prose prose-neutral dark:prose-invert max-w-none">
                    {/* Minimal markdown display (paragraph split) to avoid extra deps */}
                    {post.content_md.split(/\n{2,}/).map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </article>
                </Card>

                {/* Sidebar */}
                <div className="space-y-4">
                  <Card className="p-5 rounded-ds-2xl">
                    <div className="font-semibold mb-1">Continue learning</div>
                    <div className="flex flex-wrap gap-2">
                      <Link className="underline" href="/reading">Reading drills</Link>
                      <Link className="underline" href="/listening">Listening tests</Link>
                      <Link className="underline" href="/pricing">Go Premium</Link>
                    </div>
                  </Card>
                  {!!post.tags?.length && (
                    <Card className="p-5 rounded-ds-2xl">
                      <div className="font-semibold mb-2">Tags</div>
                      <div className="flex flex-wrap gap-2">
                        {post.tags.map(t => <span key={t} className="px-2 py-1 rounded-ds bg-white/60 dark:bg-white/10 text-small">#{t}</span>)}
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            </>
          )}
        </Container>
      </section>
    </>
  );
}
