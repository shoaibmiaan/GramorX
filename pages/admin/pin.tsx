// pages/admin/pin.tsx
import React from 'react';
import dynamic from 'next/dynamic';
import type { GetServerSideProps } from 'next';
import { isAdminEmail } from '@/lib/admin';
import { getUserServer } from '@/lib/authServer'; // you already use this elsewhere

const AdminPinReset = dynamic(() => import('@/components/premium-ui/AdminPinReset'), { ssr: false });

export default function AdminPinPage() {
  return (
    <main className="pr-min-h-screen pr-flex pr-items-center pr-justify-center pr-bg-neutral-900 pr-text-white">
      <AdminPinReset />
    </main>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const user = await getUserServer(ctx); // must return { id, email } or null
  if (!user) {
    return {
      redirect: { destination: '/login?next=/admin/pin', permanent: false },
    };
  }
  if (!isAdminEmail(user.email)) {
    return {
      redirect: { destination: '/403', permanent: false },
    };
  }
  return { props: {} };
};
