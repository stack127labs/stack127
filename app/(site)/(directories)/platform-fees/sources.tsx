"use client";

import { useState, type ReactNode } from 'react';
import { DetailDialog, DetailDialogClose } from '@/app/ui/detail-dialog';
import type { FeeCardView } from './card-view';
import styles from './page.module.css';
import cardStyles from './fee-card.module.css';

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

// Each card already lists its sources, so this list adds only what the cards do not show:
// every fact with its source link, and the date it was checked.
export function FeeSourceList({ cards, fields }: { cards: FeeCardView[]; fields: string[] }) {
  return <div className={`${styles.sourceList} ${cardStyles.links}`}>{cards.map(card => <section key={card.id}>
    <h3>{card.name}</h3>
    <p>{card.checked ? <>Checked <time dateTime={card.checked.iso}>{card.checked.label}</time></> : 'Not checked'}</p>
    <dl>{card.facts.map((fact, index) => <div key={index}>
      <dt>{fields[index]}</dt>
      <dd>{fact.value}{fact.source !== undefined && <> <a href={card.sources[fact.source].url} target="_blank" rel="noopener noreferrer">Source</a></>}</dd>
    </div>)}</dl>
  </section>)}</div>;
}
