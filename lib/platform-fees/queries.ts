import 'server-only';
import { cache } from 'react';
import { getPool } from '@/lib/db';
import { validateDirectory, type FeeDirectory, type FeeEntry, type FeeSection } from './model';

export const getFeeDirectory = cache(async (): Promise<FeeDirectory> => {
  const pool = getPool();
  const [sections, entries] = await Promise.all([
    pool.query<FeeSection>('select * from public.platform_fee_sections order by sort_order'),
    pool.query<FeeEntry>("select *, to_char(checked_at, 'YYYY-MM-DD') as checked_at from public.platform_fee_entries order by sort_order, name"),
  ]);
  const data = {
    sections: sections.rows,
    entries: entries.rows.map(entry => ({ ...entry, fee_percent: entry.fee_percent === null ? null : Number(entry.fee_percent) })),
  };
  validateDirectory(data);
  return data;
});
