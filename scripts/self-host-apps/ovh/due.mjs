// Latest scheduled occurrence, rather than a wall-clock equality: cron can catch up after downtime.
export function scheduledAt(job, now = new Date()) {
  const date = new Date(now);
  date.setUTCSeconds(0, 0);
  const schedules = {
    'self-host-discovery-github': [7, 2],
    'self-host-refresh-github': [7, 6],
    'self-host-discovery-lists': [8, 10, 0],
    'self-host-discovery-catalogs': [9, 14, 0],
    'self-host-discovery-directories': [10, 18, 'month'],
    'self-host-refresh-source-hosts': [11, 22],
    'self-host-refresh-technical': [12, 26, 1],
    'self-host-awesome-list': [14, 2, 1],
  };
  const schedule = schedules[job];
  if (!schedule) throw new Error(`Unknown job: ${job}`);
  const [hour, minute, day] = schedule;
  date.setUTCHours(hour, minute, 0, 0);
  if (day === 'month') {
    date.setUTCDate(1);
    if (date > now) date.setUTCMonth(date.getUTCMonth() - 1);
  } else if (typeof day === 'number') {
    date.setUTCDate(date.getUTCDate() - (date.getUTCDay() - day + 7) % 7);
    if (date > now) date.setUTCDate(date.getUTCDate() - 7);
  } else if (job === 'self-host-refresh-github') {
    if (now.getUTCHours() >= 19) date.setUTCHours(19);
    if (date > now) date.setUTCHours(date.getUTCHours() - 12);
  } else if (date > now) date.setUTCDate(date.getUTCDate() - 1);
  return date.getTime();
}
