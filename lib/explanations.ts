export async function translateExplanation(text: string, target: string): Promise<string> {
  if (!text || target === 'en') return text;
  try {
    const res = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target }),
    });
    if (!res.ok) throw new Error('Translation failed');
    const data = await res.json();
    return typeof data.text === 'string' ? data.text : text;
  } catch {
    return text;
  }
}
