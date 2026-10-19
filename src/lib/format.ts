import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { GOVERNORATE_RATES } from '../data/mockData';

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

export const formatNumber = (value: number) => value.toLocaleString('en-US');
export const formatMoney = (value: number) => `${formatNumber(value)} ج.م`;

const pad = (n: number) => String(n).padStart(2, '0');

/** Local timestamp in `YYYY-MM-DD HH:mm` */
export const stamp = (d = new Date()) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

export const today = () => stamp().slice(0, 10);
export const formatDate = (iso: string) => iso.slice(0, 10);

let seq = 0;
export const uid = (prefix: string) => `${prefix}-${Date.now().toString(36)}${(seq++).toString(36)}`;
export const serial = (prefix: string) => `${prefix}-2026-${Math.floor(1000 + Math.random() * 9000)}`;

export const isValidEgyptianPhone = (phone: string) => /^01[0125]\d{8}$/.test(phone.trim());

export const calcShippingFee = (governorate: string, discountPercent: number) => {
  const base = GOVERNORATE_RATES[governorate] ?? 65;
  return Math.round(base * (1 - discountPercent / 100));
};

export const maskName = (name: string) => {
  const [first, second] = name.split(' ');
  return second ? `${first} ${second[0]}***` : `${name.slice(0, 3)}***`;
};

export const downloadCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
  const escape = (v: string | number) => `"${String(v).replace(/"/g, '""')}"`;
  const body = [headers, ...rows].map((r) => r.map(escape).join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + body], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
