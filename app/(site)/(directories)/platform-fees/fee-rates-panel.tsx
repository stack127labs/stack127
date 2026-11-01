"use client";

import { useRef, useState, type ReactNode } from 'react';
import { DetailDialog, DetailDialogClose } from '@/app/ui/detail-dialog';
import styles from './fee-card.module.css';

// The card's name, rates, and lines are copied from its server-rendered markup,
// so the page data does not carry a second copy of every card for the panel.
function cardParts(from: Element | null) {
  const card = from?.closest('article');
  const html = (className: string) => card?.querySelector(`:scope > .${className}, :scope > * > .${className}`)?.outerHTML ?? '';
  return { heading: html(styles.identity), top: html(styles.top) + html(styles.lines) };
}

// The rates stay inside <details> in the HTML. With JavaScript, the summary opens the shared side panel instead.
export function FeeRatesPanel({ summary, label, children }: {
  summary: string;
  label: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDetailsElement>(null);
  const [parts, setParts] = useState<{ heading: string; top: string } | null>(null);
  const close = () => setParts(null);
  return <>
    <details ref={ref} className={styles.more}>
      <summary onClick={event => { event.preventDefault(); setParts(cardParts(ref.current)); }}>{summary}</summary>
      {children}
    </details>
    {parts && <DetailDialog ariaLabel={label} onClose={close}>
      <div className={styles.panel}>
        <div className={styles.panelHeading}><div className={styles.contents} dangerouslySetInnerHTML={{ __html: parts.heading }} /><DetailDialogClose ariaLabel="Close rates" onClose={close} /></div>
        <div className={styles.contents} dangerouslySetInnerHTML={{ __html: parts.top }} />
        {children}
      </div>
    </DetailDialog>}
  </>;
}
