"use client";

import { useState, type ReactNode } from 'react';
import { DetailDialog, DetailDialogClose } from '@/app/ui/detail-dialog';
import styles from './fee-card.module.css';

// The rates stay inside <details> in the HTML. With JavaScript, the summary opens the shared side panel instead.
export function FeeRatesPanel({ summary, label, heading, top, children }: {
  summary: string;
  label: string;
  heading: ReactNode;
  top: ReactNode;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return <>
    <details className={styles.more}>
      <summary onClick={event => { event.preventDefault(); setOpen(true); }}>{summary}</summary>
      {children}
    </details>
    {open && <DetailDialog ariaLabel={label} onClose={close}>
      <div className={styles.panel}>
        <div className={styles.panelHeading}>{heading}<DetailDialogClose ariaLabel="Close rates" onClose={close} /></div>
        {top}
        {children}
      </div>
    </DetailDialog>}
  </>;
}
