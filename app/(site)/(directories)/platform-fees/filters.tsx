"use client";
import { useState } from 'react';
import { UiButton, UiSearchField } from '@/app/ui/controls';
import styles from './page.module.css';
export function FeeFilters({ query, action = '/platform-fees' }: { query: string; action?: string }) {
  const [search, setSearch] = useState(query);
  return <form action={action} role="search" className={styles.filters}>
    <UiSearchField label="Search platforms" name="q" placeholder="Platform or service name" value={search} onChange={setSearch} />
    <UiButton type="submit">Search</UiButton>
  </form>;
}
