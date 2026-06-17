import { Card, CardContent } from '@/components/ui/card';
import { FileText, ShieldCheck, Calendar, User, Layers } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { format } from 'date-fns';
import { arSA } from 'date-fns/locale';

export default function DocumentCard({ document: doc, lang = 'ar', onClick }) {
  const t = {
    pages: lang === 'ar' ? 'صفحات' : 'pages',
    uploaded: lang === 'ar' ? 'تم الرفع' : 'Uploaded',
    by: lang === 'ar' ? 'بواسطة' : 'by',
    collection: lang === 'ar' ? 'المجموعة' : 'Collection',
    piiFound: lang === 'ar' ? 'بيانات شخصية مكتشفة' : 'PII items detected',
    noPII: lang === 'ar' ? 'لا توجد بيانات شخصية' : 'No PII detected',
    reviewStatus: lang === 'ar' ? 'حالة المراجعة' : 'Review status',
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'dd MMM yyyy', { locale: lang === 'ar' ? arSA : undefined });
    } catch {
      return dateStr;
    }
  };

  const piiCount = doc.pii_report?.total_pii_found || 0;

  return (
    <Card
      className="border-border hover:border-primary/30 hover:shadow-sm transition-all cursor-pointer group"
      onClick={() => onClick?.(doc)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
              piiCount > 0 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
            }`}>
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-heading font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {doc.title}
              </h3>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {formatDate(doc.created_date)}
                </span>
                {doc.page_count && (
                  <span className="flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    {doc.page_count} {t.pages}
                  </span>
                )}
                {doc.collection_name && (
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {doc.collection_name}
                  </span>
                )}
              </div>
            </div>
          </div>
          <StatusBadge status={doc.status} lang={lang} />
        </div>

        {piiCount > 0 && (
          <div className="mt-3 flex items-center gap-2 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-amber-600 dark:text-amber-400 font-medium">
              {piiCount} {t.piiFound}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}