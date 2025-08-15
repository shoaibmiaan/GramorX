import React from 'react';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Badge } from '@/components/design-system/Badge';
import { Button } from '@/components/design-system/Button';

export default function AdminHome() {
  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <h1 className="font-slab text-4xl mb-3 text-gradient-primary">Admin Dashboard</h1>
        <p className="text-grayish max-w-2xl mb-10">Manage roles, content, and billing.</p>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="p-6 rounded-ds-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-h3 font-semibold">Users</h3>
              <Badge variant="info">Roles</Badge>
            </div>
            <p className="text-grayish mb-4">View users & set roles.</p>
            <Button as="a" href="/admin/users" variant="primary">Open</Button>
          </Card>

          <Card className="p-6 rounded-ds-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-h3 font-semibold">Content</h3>
              <Badge variant="success">Tests</Badge>
            </div>
            <p className="text-grayish mb-4">Approve/curate tests & lessons.</p>
            <Button as="a" href="/admin/content" variant="secondary">Open</Button>
          </Card>

          <Card className="p-6 rounded-ds-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-h3 font-semibold">Billing</h3>
              <Badge variant="warning">Subscriptions</Badge>
            </div>
            <p className="text-grayish mb-4">Manage plans & discounts.</p>
            <Button as="a" href="/admin/billing" variant="secondary">Open</Button>
          </Card>
        </div>
      </Container>
    </section>
  );
}
