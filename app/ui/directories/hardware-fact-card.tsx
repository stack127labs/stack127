"use client";

import Image from "next/image";
import { useState } from "react";
import { BadgeCheck, Cable, List, Code, Cpu, ImageOff, Layers3, Network, Radio, ScanLine, Tag, Zap } from "lucide-react";
import { AppCardFacts } from "./app-fact-card";
import { hardwareCardName } from "@/lib/hardware-directories/card-name";
import styles from "./hardware-fact-card.module.css";

export const hardwareFactCardClassName = styles.card;

function factIcon(label: string) {
  if (/certif|support/i.test(label)) return BadgeCheck;
  if (/works with|local video|compatib/i.test(label)) return Network;
  if (/connection|transport/i.test(label)) return Cable;
  if (/radio|frequency/i.test(label)) return Radio;
  if (/driver|software|config/i.test(label)) return Code;
  if (/power|battery/i.test(label)) return Zap;
  if (/resolution/i.test(label)) return ScanLine;
  if (/type|category/i.test(label)) return Tag;
  if (/version/i.test(label)) return Layers3;
  if (/capabilit|feature/i.test(label)) return Cpu;
  return List;
}

export function HardwareFactCardContent({ name, image, facts }: {
  name: string;
  image: string | null;
  facts: { label: string; value: string }[];
}) {
  const [failedImage, setFailedImage] = useState<string | null>(null);
  return (
    <>
      <div className={styles.image} data-hardware-image data-missing={image && failedImage !== image ? "false" : "true"}>
        {image && failedImage !== image ? (
          <Image alt={name} src={image} width={600} height={400} loading="lazy"
            sizes="(max-width: 650px) calc(100vw - 44px), (max-width: 960px) 50vw, 33vw"
            onError={() => setFailedImage(image)} />
        ) : <span className={styles.missing}><ImageOff aria-hidden="true" size={22} />No product image</span>}
      </div>
      <h2>{name}</h2>
      <AppCardFacts facts={facts.map((fact) => ({ ...fact, icon: factIcon(fact.label) }))} />
    </>
  );
}
