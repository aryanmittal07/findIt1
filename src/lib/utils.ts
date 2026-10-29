import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateReferenceId(type: 'ITEM' | 'COMPLAINT' = 'ITEM'): string {
  const prefix = type === 'ITEM' ? 'FID' : 'CMP';
  const year = new Date().getFullYear();
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-${year}-${randomNum}`;
}

export function formatDate(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'N/A';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function formatDateTime(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return 'N/A';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(date);
}

export function timeAgo(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '';
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return formatDate(date);
}

export function maskContact(value: string | null | undefined, type: 'email' | 'phone'): string {
  if (!value) return 'Protected';
  if (type === 'email') {
    const parts = value.split('@');
    if (parts.length < 2) return 'Protected';
    const user = parts[0];
    const domain = parts[1];
    const maskedUser = user.length > 2 ? `${user[0]}•••${user[user.length - 1]}` : `${user[0]}•••`;
    return `${maskedUser}@${domain}`;
  } else {
    // Phone
    const cleaned = value.replace(/\s+/g, ' ');
    if (cleaned.length <= 4) return '••••';
    return `••• ••• ${cleaned.slice(-4)}`;
  }
}

export function getStatusStyle(status: string) {
  switch (status.toUpperCase()) {
    case 'APPROVED':
    case 'ACTIVE':
    case 'RESOLVED':
    case 'ACCEPTED':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: status === 'APPROVED' ? 'Active / Approved' : status,
      };
    case 'LOST':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: 'Lost Item',
      };
    case 'FOUND':
      return {
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dot: 'bg-emerald-500',
        label: 'Found Item',
      };
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
    case 'PENDING':
    case 'INVESTIGATING':
      return {
        bg: 'bg-amber-50 text-amber-700 border-amber-200',
        dot: 'bg-amber-500',
        label: status.replace('_', ' '),
      };
    case 'MATCHED':
      return {
        bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        dot: 'bg-indigo-500',
        label: 'Potential Match',
      };
    case 'REJECTED':
    case 'DECLINED':
    case 'SUSPENDED':
      return {
        bg: 'bg-rose-50 text-rose-700 border-rose-200',
        dot: 'bg-rose-500',
        label: status,
      };
    case 'CLOSED':
    default:
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-200',
        dot: 'bg-slate-400',
        label: status,
      };
  }
}
