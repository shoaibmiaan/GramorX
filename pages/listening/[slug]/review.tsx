import { useRouter } from 'next/router';
import { Container } from '@/components/design-system/Container';
import ReviewScreen from '@/components/listening/ReviewScreen';

export default function ListeningReviewPage() {
  const { slug } = useRouter().query as { slug?: string };
  if (!slug) return null;
  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <ReviewScreen slug={slug} />
      </Container>
    </section>
  );
}

