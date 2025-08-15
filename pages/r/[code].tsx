import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ params, res }) => {
  const code = params?.code as string;
  res.setHeader('Set-Cookie', `ref=${code}; Path=/; Max-Age=${60 * 60 * 24 * 14}`);
  return { redirect: { destination: '/#waitlist', permanent: false } };
};

export default function Referral() { return null; }
