#!/usr/bin/env python3
"""Reject empty or implausibly small production snapshots before publication."""
import argparse,re,sys
from pathlib import Path

MINIMUM_ROWS = {'stack127_pages': 1, 'ad_network_publishers': 1000}

def validate(toc, stream):
    entries = set(re.findall(r'^\d+; \d+ \d+ TABLE DATA public (\w+) ', toc, re.M))
    if not MINIMUM_ROWS.keys() <= entries:
        raise ValueError('Required core TABLE DATA entries are missing')
    counts = {}
    current = None
    for line in stream:
        if current is not None:
            if line.rstrip(b'\r\n') == b'\\.':
                current = None
            else:
                counts[current] += 1
        elif line.startswith(b'COPY public.'):
            match = re.match(rb'COPY public\.(\w+) \(', line)
            if not match or match[1].decode() not in MINIMUM_ROWS:
                raise ValueError('Unexpected COPY payload in backup content check')
            current = match[1].decode()
            if current in counts:
                raise ValueError('Duplicate core COPY payload')
            counts[current] = 0
    if current is not None or any(counts.get(name, 0) < minimum for name, minimum in MINIMUM_ROWS.items()):
        raise ValueError('Core data missing or below safety floor (pages >= 1, publishers >= 1000)')
    return counts

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--toc', type=Path, required=True)
    args = parser.parse_args()
    try:
        counts = validate(args.toc.read_text(), sys.stdin.buffer)
    except ValueError as error:
        raise SystemExit('BACKUP REFUSED: ' + str(error))
    print('Backup content verified: pages=%d, publishers=%d' % (counts['stack127_pages'], counts['ad_network_publishers']))
