import { format, isMatch, parse } from 'date-fns';

const FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSSSSSXXX";

export const f = (date: Date) => format(date, FORMAT);

export const p = (date: string) => {
  console.log('trying to parse the date', date);
  return parse(date, FORMAT, new Date());
};

export const v = (date: string) => isMatch(date, FORMAT);
