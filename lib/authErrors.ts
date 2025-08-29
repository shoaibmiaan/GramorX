export function getAuthErrorMessage(error: { code?: string; message: string } | null): string {
  if (!error) return '';
  if (error.code === 'user_banned') return 'Account disabled. Contact support.';
  return error.message;
}
