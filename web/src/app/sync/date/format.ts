import { format, formatDistanceToNow, isAfter, isMatch, parse, subDays } from 'date-fns';

const FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSSSSXXX";

export const f = (date: Date) => format(date, FORMAT);

export const p = (date: string) => {
  console.log('trying to parse the date', date);
  return parse(date, FORMAT, new Date());
};

export const v = (date: string) => isMatch(date, FORMAT);

export function formatDate(date: Date | string | number): string {
  return format(new Date(date), 'MMM d, yyyy');
}

export function formatDateTime(date: Date | string | number): string {
  return format(new Date(date), 'MMM d, yyyy, h:mm a');
}

export function formatRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const commentDate = new Date(date);

  if (isAfter(commentDate, subDays(now, 1))) {
    return formatDistanceToNow(commentDate, { addSuffix: true });
  }

  return formatDate(commentDate);
}
