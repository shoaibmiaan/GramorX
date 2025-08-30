import { Container } from '@/components/design-system/Container';
import { SavedItems } from '@/components/dashboard/SavedItems';

export default function SavedPage() {
  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <SavedItems />
      </Container>
    </section>
  );
}
