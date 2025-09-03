import { useEffect, useState } from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Input } from '@/components/design-system/Input';
import { Textarea } from '@/components/design-system/Textarea';
import { Button } from '@/components/design-system/Button';
import { useToast } from '@/components/design-system/Toaster';
import { Section } from '@/components/design-system/Section';
import { supabaseBrowser as supabase } from '@/lib/supabaseBrowser';

interface Review {
  id: number;
  content: string;
  created_at: string;
  comments: { id: number; content: string }[];
}

export default function PeerReviewPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState('');
  const [comment, setComment] = useState<Record<number, string>>({});
  const { error: toastError, success: toastSuccess } = useToast();

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    const { data } = await supabase
      .from<Review>('peer_reviews')
      .select('id, content, created_at, comments:peer_review_comments(id, content)')
      .order('created_at', { ascending: false });
    setReviews((data as any) || []);
  }

  async function submitReview() {
    if (!newReview) return;
    const { error } = await supabase.from('peer_reviews').insert({ content: newReview });
    if (error) return toastError('Could not submit review');
    setNewReview('');
    toastSuccess('Review shared');
    fetchReviews();
  }

  async function submitComment(reviewId: number) {
    const text = comment[reviewId];
    if (!text) return;
    await supabase.from('peer_review_comments').insert({ review_id: reviewId, content: text });
    setComment((c) => ({ ...c, [reviewId]: '' }));
    fetchReviews();
  }

  return (
    <Section>
      <Container>
        <Card className="p-6 mb-6 space-y-2">
          <Textarea value={newReview} onChange={(e) => setNewReview(e.target.value)} placeholder="Share your work for review" />
          <Button onClick={submitReview} fullWidth className="px-4 py-3 text-base">
            Share
          </Button>
        </Card>
        {reviews.map((r) => (
          <Card key={r.id} className="p-4 mb-4 space-y-2">
            <p className="whitespace-pre-wrap">{r.content}</p>
            <div className="space-y-1">
              {r.comments?.map((c) => (
                <div key={c.id} className="text-sm text-muted-foreground">{c.content}</div>
              ))}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                value={comment[r.id] || ''}
                onChange={(e) => setComment({ ...comment, [r.id]: e.target.value })}
                placeholder="Add a comment"
              />
              <Button
                onClick={() => submitComment(r.id)}
                fullWidth
                className="px-4 py-3 text-base sm:w-auto"
              >
                Comment
              </Button>
            </div>
          </Card>
        ))}
      </Container>
    </Section>
  );
}
