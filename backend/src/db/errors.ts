export function isDbUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const message = String((error as any).message ?? '');
  const code = String((error as any).code ?? '');

  return (
    message.includes('DATABASE_URL is not configured') ||
    code === 'ECONNREFUSED' ||
    code === 'ENOTFOUND' ||
    code === 'ETIMEDOUT' ||
    message.includes('ECONNREFUSED') ||
    message.includes('ENOTFOUND') ||
    message.includes('ETIMEDOUT')
  );
}
