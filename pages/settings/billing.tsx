import { GetServerSideProps } from 'next';
import { createServerSupabaseClient } from '@supabase/auth-helpers-nextjs';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { stripe } from '@/lib/payments';

interface Invoice {
  id: string;
  amount_paid: number;
  hosted_invoice_url: string | null;
  status: string | null;
}

interface Props {
  plan: string | null;
  invoices: Invoice[];
  customerId: string | null;
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const supabase = createServerSupabaseClient(ctx);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      redirect: { destination: '/login', permanent: false },
    };
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_subscription_id')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  let plan: string | null = null;
  let invoices: Invoice[] = [];
  let customerId: string | null = null;

  if (sub?.stripe_subscription_id) {
    const subscription = await stripe.subscriptions.retrieve(
      sub.stripe_subscription_id,
    );
    plan =
      subscription.items.data[0]?.price?.nickname ||
      (subscription.items.data[0]?.price?.id as string);
    customerId = subscription.customer as string;
    const inv = await stripe.invoices.list({ customer: customerId, limit: 10 });
    invoices = inv.data.map((i) => ({
      id: i.id,
      amount_paid: i.amount_paid ?? 0,
      hosted_invoice_url: i.hosted_invoice_url,
      status: i.status ?? null,
    }));
  }

  return {
    props: { plan, invoices, customerId },
  };
};

export default function BillingPage({ plan, invoices, customerId }: Props) {
  const manageBilling = async () => {
    if (!customerId) return;
    const res = await fetch('/api/stripe/portal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId }),
    });
    const data = await res.json();
    if (data.url) window.location.href = data.url as string;
  };

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="p-6 rounded-ds-2xl">
            <h1 className="font-slab text-display mb-4">Billing</h1>
            <p className="mb-4">Current plan: {plan || 'Free'}</p>
            {customerId ? (
              <Button onClick={manageBilling}>Manage billing</Button>
            ) : (
              <Button href="/pricing">Upgrade</Button>
            )}
          </Card>

          {invoices.length > 0 && (
            <Card className="p-6 rounded-ds-2xl">
              <h2 className="font-slab text-title mb-4">Invoices</h2>
              <ul className="space-y-2">
                {invoices.map((inv) => (
                  <li key={inv.id}>
                    <a
                      href={inv.hosted_invoice_url || '#'}
                      className="text-vibrantPurple underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {inv.id} - ${(inv.amount_paid / 100).toFixed(2)} - {inv.status}
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      </Container>
    </section>
  );
}
