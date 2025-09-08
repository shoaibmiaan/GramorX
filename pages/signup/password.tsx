{err === 'user_exists' || err?.toLowerCase().includes('already') ? (
  <>
    Account already exists. Try{' '}
    <Link href="/login" className="underline">
      logging in
    </Link>
    .
  </>
) : (
  err
)}
