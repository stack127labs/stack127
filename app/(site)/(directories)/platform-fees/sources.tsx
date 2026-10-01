"use client";

import { useState, type ReactNode } from 'react';
import { DetailDialog, DetailDialogClose } from '@/app/ui/detail-dialog';
import styles from './page.module.css';

export function FeeSources({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <>
    <details className={styles.sectionSources}>
      <summary onClick={event => { event.preventDefault(); setOpen(true); }}>Sources and dates</summary>
      {children}
    </details>
    {open && <DetailDialog ariaLabel="Sources and verification dates" onClose={close}>
      <div className={styles.sourceHeading}>
        <h2>Sources and verification dates</h2>
        <DetailDialogClose ariaLabel="Close sources" onClose={close} />
      </div>
      {children}
    </DetailDialog>}
  </>;
}
