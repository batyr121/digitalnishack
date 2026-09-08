import { cookies } from 'next/headers';
import { dictionaries, type Locale } from '@/locales';
export async function locale() {
  const value = (await cookies()).get('locale')?.value;
  const lang: Locale = value === 'kz' ? value : 'ru';
  return { lang, t: dictionaries[lang] };
}
