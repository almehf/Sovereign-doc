import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldCheck, AlertTriangle, CheckCircle, XCircle, Eye, EyeOff, ScrollText } from 'lucide-react';
import { useState } from 'react';

export default function PIIReport({ document: doc, lang = 'ar', onApprove, onFlag, onReject }) {
  const [showMasked, setShowMasked] = useState(false);

  const t = {
    reportTitle: lang === 'ar' ? 'تقرير فحص الخصوصية' : 'PII Scan Report',
    totalFound: lang === 'ar' ? 'إجمالي البيانات المكتشفة' : 'Total PII Found',
    confidence: lang === 'ar' ? 'نسبة الثقة' : 'Confidence',
    maskedAt: lang === 'ar' ? 'تاريخ الإخفاء' : 'Masked at',
    preview: lang === 'ar' ? 'معاينة النص المُخفى' : 'Masked Text Preview',
    showMasked: lang === 'ar' ? 'إظهار النص المُخفى' : 'Show masked text',
    hideMasked: lang === 'ar' ? 'إخفاء النص المُخفى' : 'Hide masked text',
    approve: lang === 'ar' ? 'اعتماد وفهرسة' : 'Approve & Index',
    flag: lang === 'ar' ? 'تعليق للمراجعة' : 'Flag for Review',
    reject: lang === 'ar' ? 'رفض المستند' : 'Reject Document',
    detectedCategories: lang === 'ar' ? 'فئات البيانات المكتشفة' : 'Detected PII Categories',
    noPII: lang === 'ar' ? 'لم يتم اكتشاف أي بيانات شخصية في هذا المستند.' : 'No PII was detected in this document.',
    safeToIndex: lang === 'ar' ? 'يمكن فهرسة المستند بأمان.' : 'Document is safe to index.',
  };

  const report = doc?.pii_report;
  if (!report) return null;

  const categoryLabels = {
    national_id: { ar: 'رقم الهوية', en: 'National ID' },
    iqama: { ar: 'رقم الإقامة', en: 'Iqama' },
    phone: { ar: 'رقم الجوال', en: 'Phone Number' },
    email: { ar: 'البريد الإلكتروني', en: 'Email' },
    full_name: { ar: 'الاسم الكامل', en: 'Full Name' },
    address: { ar: 'العنوان', en: 'Address' },
    dob: { ar: 'تاريخ الميلاد', en: 'Date of Birth' },
    bank_account: { ar: 'حساب بنكي', en: 'Bank Account' },
  };

  const severityColor = (count) => {
    if (count >= 10) return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    if (count >= 3) return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
  };

  return (
    <div className="space-y-4">
      <Card className="border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-heading flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            {t.reportTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {report.pii_instances?.length > 0 ? (
            <>
              {/* Summary stats */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{report.total_pii_found}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.totalFound}</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round((report.confidence_score || 0.9) * 100)}%
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{t.confidence}</p>
                </div>
                <div className="bg-muted rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-foreground">{report.pii_instances.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">{t.detectedCategories}</p>
                </div>
              </div>

              {/* Category list */}
              <div className="space-y-2">
                {report.pii_instances.map((pii, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span className="text-sm font-medium text-foreground">
                        {lang === 'ar' ? (categoryLabels[pii.type]?.ar || pii.type) : (categoryLabels[pii.type]?.en || pii.type)}
                      </span>
                    </div>
                    <Badge className={severityColor(pii.count)}>
                      {pii.count}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Masked text preview */}
              {report.masked_text_preview && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowMasked(!showMasked)}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
                  >
                    {showMasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {showMasked ? t.hideMasked : t.showMasked}
                  </button>
                  {showMasked && (
                    <div className="bg-muted rounded-lg p-4 text-sm font-mono text-muted-foreground max-h-48 overflow-y-auto whitespace-pre-wrap border border-border">
                      {report.masked_text_preview}
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-6">
              <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <p className="text-foreground font-medium">{t.noPII}</p>
              <p className="text-sm text-muted-foreground mt-1">{t.safeToIndex}</p>
            </div>
          )}

          {/* Action buttons */}
          {(doc.status === 'pii_detected' || doc.status === 'flagged') && (
            <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-border">
              <Button
                onClick={() => onApprove?.(doc)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <CheckCircle className="w-4 h-4 ml-2" />
                {t.approve}
              </Button>
              <Button
                onClick={() => onFlag?.(doc)}
                variant="outline"
                className="border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950"
              >
                <AlertTriangle className="w-4 h-4 ml-2" />
                {t.flag}
              </Button>
              <Button
                onClick={() => onReject?.(doc)}
                variant="outline"
                className="border-red-300 text-red-700 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-950"
              >
                <XCircle className="w-4 h-4 ml-2" />
                {t.reject}
              </Button>
            </div>
          )}

          {/* Already approved/indexed badge */}
          {(doc.status === 'approved' || doc.status === 'indexed') && (
            <div className="mt-5 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {doc.status === 'indexed'
                    ? (lang === 'ar' ? 'تمت الفهرسة' : 'Indexed')
                    : (lang === 'ar' ? 'تم الاعتماد' : 'Approved')}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}