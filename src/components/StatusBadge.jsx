import { cn } from '@/lib/utils';

const variants = {
  uploaded: { bg: 'bg-muted text-muted-foreground', label: { ar: 'تم الرفع', en: 'Uploaded' } },
  processing: { bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: { ar: 'قيد المعالجة', en: 'Processing' } },
  pii_detected: { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: { ar: 'تم اكتشاف بيانات', en: 'PII Detected' } },
  approved: { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: { ar: 'معتمد', en: 'Approved' } },
  flagged: { bg: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400', label: { ar: 'معلق', en: 'Flagged' } },
  rejected: { bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: { ar: 'مرفوض', en: 'Rejected' } },
  indexed: { bg: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground', label: { ar: 'مفهرس', en: 'Indexed' } },
  active: { bg: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', label: { ar: 'نشط', en: 'Active' } },
  inactive: { bg: 'bg-muted text-muted-foreground', label: { ar: 'غير نشط', en: 'Inactive' } },
  archived: { bg: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400', label: { ar: 'مؤرشفة', en: 'Archived' } },
  info: { bg: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', label: { ar: 'معلومات', en: 'Info' } },
  warning: { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: { ar: 'تحذير', en: 'Warning' } },
  critical: { bg: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', label: { ar: 'حرج', en: 'Critical' } },
  pending: { bg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', label: { ar: 'قيد الانتظار', en: 'Pending' } },
};

export default function StatusBadge({ status, lang = 'ar', className }) {
  const v = variants[status] || variants.uploaded;
  return (
    <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium', v.bg, className)}>
      {status === 'processing' && <span className="w-1.5 h-1.5 rounded-full bg-current status-pulse" />}
      {v.label[lang] || v.label.en}
    </span>
  );
}