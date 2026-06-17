import { Card, CardContent } from '@/components/ui/card';
import {
  FileText, ShieldCheck, MessageSquare, UserPlus, Settings, FolderOpen,
  AlertTriangle, CheckCircle, XCircle, Clock, ArrowUpRight, Search
} from 'lucide-react';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

const actionIcons = {
  document_upload: FileText,
  pii_detected: ShieldCheck,
  pii_masked: ShieldCheck,
  document_approved: CheckCircle,
  document_flagged: AlertTriangle,
  document_rejected: XCircle,
  document_indexed: FileText,
  user_query: MessageSquare,
  user_invited: UserPlus,
  user_role_changed: UserPlus,
  setting_changed: Settings,
  collection_created: FolderOpen,
  collection_updated: FolderOpen,
  collection_deleted: FolderOpen,
};

const actionLabels = {
  document_upload: { ar: 'رفع مستند', en: 'Document Upload' },
  pii_detected: { ar: 'اكتشاف بيانات شخصية', en: 'PII Detected' },
  pii_masked: { ar: 'إخفاء بيانات شخصية', en: 'PII Masked' },
  document_approved: { ar: 'اعتماد مستند', en: 'Document Approved' },
  document_flagged: { ar: 'تعليق مستند', en: 'Document Flagged' },
  document_rejected: { ar: 'رفض مستند', en: 'Document Rejected' },
  document_indexed: { ar: 'فهرسة مستند', en: 'Document Indexed' },
  user_query: { ar: 'استعلام مستخدم', en: 'User Query' },
  user_invited: { ar: 'دعوة مستخدم', en: 'User Invited' },
  user_role_changed: { ar: 'تغيير صلاحية', en: 'Role Changed' },
  setting_changed: { ar: 'تغيير إعدادات', en: 'Settings Changed' },
  collection_created: { ar: 'إنشاء مجموعة', en: 'Collection Created' },
  collection_updated: { ar: 'تحديث مجموعة', en: 'Collection Updated' },
  collection_deleted: { ar: 'حذف مجموعة', en: 'Collection Deleted' },
};

const severityStyles = {
  info: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-500' },
  warning: { bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-500' },
  critical: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800', dot: 'bg-red-500' },
};

export default function AuditTimeline({ logs = [], lang = 'ar' }) {
  const t = {
    auditLog: lang === 'ar' ? 'سجل التدقيق' : 'Audit Log',
    noEvents: lang === 'ar' ? 'لا توجد أحداث حتى الآن' : 'No events yet',
    by: lang === 'ar' ? 'بواسطة' : 'by',
    document: lang === 'ar' ? 'المستند' : 'Document',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy HH:mm', { locale: lang === 'ar' ? arSA : undefined });
    } catch {
      return dateStr;
    }
  };

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <h3 className="text-lg font-heading font-bold text-foreground mb-4 flex items-center gap-2">
          <Search className="w-5 h-5 text-primary" />
          {t.auditLog}
        </h3>

        {logs.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Clock className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>{t.noEvents}</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute right-[19px] top-2 bottom-2 w-0.5 bg-border" />

            <div className="space-y-3">
              {logs.map((log, idx) => {
                const Icon = actionIcons[log.action_type] || FileText;
                const s = severityStyles[log.severity] || severityStyles.info;
                const label = actionLabels[log.action_type]?.[lang] || log.action_type;

                return (
                  <div key={log.id || idx} className="relative flex gap-4">
                    {/* Icon dot */}
                    <div className={`relative z-10 w-10 h-10 rounded-full ${s.bg} border ${s.border} flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>

                    {/* Content */}
                    <div className={`flex-1 rounded-xl p-4 border ${s.border} ${s.bg}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-foreground text-sm">{label}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {t.by} <strong>{log.actor_name || '—'}</strong>
                            {log.actor_role && (
                              <span className="text-muted-foreground"> ({lang === 'ar'
                                ? { admin: 'مدير', compliance_officer: 'امتثال', user: 'مستخدم' }[log.actor_role]
                                : log.actor_role})</span>
                            )}
                          </p>
                          {log.document_title && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {t.document}: {log.document_title}
                            </p>
                          )}
                        </div>
                        <time className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(log.created_date)}
                        </time>
                      </div>

                      {/* Details JSON preview */}
                      {log.details && Object.keys(log.details).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-primary cursor-pointer hover:underline">
                            {lang === 'ar' ? 'تفاصيل' : 'Details'}
                          </summary>
                          <pre className="mt-2 text-xs bg-background rounded-lg p-3 overflow-x-auto font-mono text-muted-foreground max-h-32">
                            {JSON.stringify(log.details, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}