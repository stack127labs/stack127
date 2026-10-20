#!/usr/bin/env python3
"""Open a GitHub issue when a database backup job fails, close it when the job works again.

Usage: backup-alert.py --env-file FILE JOB fail|ok
Reads only GITHUB_ALERT_TOKEN from FILE. One open issue per job, found by title.
"""
import argparse
import json
import socket
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone

REPO = 'https://api.github.com/repos/stack127labs/stack127'


def read_token(path):
    for line in open(path, encoding='utf-8'):
        key, sep, value = line.strip().removeprefix('export ').partition('=')
        if sep and key.strip() == 'GITHUB_ALERT_TOKEN':
            return value.strip().strip('"\'')
    raise SystemExit(f'GITHUB_ALERT_TOKEN missing from {path}')


def request(token, path, method='GET', body=None, attempts=4):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(REPO + path, data=data, method=method, headers={
        'Authorization': f'Bearer {token}',
        'Accept': 'application/vnd.github+json',
        'Content-Type': 'application/json',
    })
    # Retry briefly, so a short GitHub or network outage does not lose an alert.
    for attempt in range(attempts):
        try:
            with urllib.request.urlopen(req, timeout=20) as response:
                return json.load(response)
        except urllib.error.HTTPError as error:
            if error.code < 500 or attempt == attempts - 1:
                raise SystemExit(f'Backup alert HTTP {error.code}') from None
        except (urllib.error.URLError, TimeoutError) as error:
            if attempt == attempts - 1:
                raise SystemExit(f'Backup alert network error: {type(error).__name__}') from None
        time.sleep(30 * (attempt + 1))


def open_issues(token, title):
    issues, page = [], 1
    while rows := request(token, f'/issues?state=open&per_page=100&page={page}'):
        issues += [row for row in rows if row['title'] == title and 'pull_request' not in row]
        page += 1
    return issues


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--env-file', required=True)
    parser.add_argument('job')
    parser.add_argument('result', choices=['fail', 'ok'])
    args = parser.parse_args()
    token = read_token(args.env_file)
    title = f'Database backup failed: {args.job}'
    issues = open_issues(token, title)
    if args.result == 'ok':
        for issue in issues:
            request(token, f'/issues/{issue["number"]}', 'PATCH', {'state': 'closed'})
        return
    host = socket.gethostname()
    now = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')
    body = {'title': title, 'body': (
        f'`{args.job}` failed on `{host}` at {now}.\n\n'
        f'Check the log there with `journalctl -u {args.job}.service`.\n\n'
        'This issue closes by itself after the next good run.'
    )}
    # Never repeat a create blindly: GitHub may have made the issue before a timeout.
    for attempt in range(4):
        if issues:
            return
        try:
            request(token, '/issues', 'POST', body, attempts=1)
            return
        except SystemExit:
            if attempt == 3:
                raise
        time.sleep(30 * (attempt + 1))
        issues = open_issues(token, title)


if __name__ == '__main__':
    sys.exit(main())
