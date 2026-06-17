import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base } from '@/api/baseClient';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Search, Filter, Download, FileText } from 'lucide-react';
import AuditTimeline from '@/components/audit/AuditTimeline';

export default function AuditLog() {
  const { lang } = useOutletContext();
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const t = {
    title: lang === 'ar' ? 'سجل التدقيق' : 'Audit Log',
    search: lang === 'ar' ? 'بحث في السجل...' : 'Search audit log...',
    allActions: lang === 'ar' ? 'جميع الإجراءات' : 'All Actions',
    allSeverities: lang === 'ar' ? 'جميع المستويات' : 'All Severities',
    export: lang === 'ar' ? 'تصدير التقرير' : 'Export Report',
    exporting: lang === 'ar' ? 'جاري التصدير...' : 'Exporting...',
    info: lang === 'ar' ? 'معلومات' : 'Info',
    warning: lang === 'ar' ? 'تحذير' : 'Warning',
    critical: lang === 'ar' ? 'حرج' : 'Critical',
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await base.entities.AuditLog.list('-created_date', 500);
      setLogs(data);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const actionTypes = [...new Set(logs.map(l => l.action_type))];

  const filtered = logs.filter(log => {
    const matchSearch = !search || (
      log.actor_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.document_title?.toLowerCase().includes(search.toLowerCase()) ||
      log.action_type?.toLowerCase().includes(search.toLowerCase())
    );
    const matchAction = actionFilter === 'all' || log.action_type === actionFilter;
    const matchSeverity = severityFilter === 'all' || log.severity === severityFilter;
    return matchSearch && matchAction && matchSeverity;
  });

  const handleExport = async () => {
    try {
      // Generate a simple CSV-like report
      const header = 'Timestamp,Actor,Role,Action,Document,Severity,Details\n';
      const rows = filtered.map(l => {
        const details = JSON.stringify(l.details || {}).replace(/,/g, ';');
        return `${l.created_date},${l.actor_name},${l.actor_role},${l.action_type},${l.document_title || ''},${l.severity},${details}`;
      }).join('\n');

      const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {}
  };

  const actionLabels = {
    document_upload: { ar: 'رفع مستند', en: 'Document Upload' },
    pii_detected: { ar: 'اكتشاف بيانات', en: 'PII Detected' },
    pii_masked: { ar: 'إخفاء بيانات', en: 'PII Masked' },
    document_approved: { ar: 'اعتماد مستند', en: 'Approved' },
    document_flagged: { ar: 'تعليق مستند', en: 'Flagged' },
    document_rejected: { ar: 'رفض مستند', en: 'Rejected' },
    document_indexed: { ar: 'فهرسة مستند', en: 'Indexed' },
    user_query: { ar: 'استعلام', en: 'Query' },
    user_invited: { ar: 'دعوة', en: 'Invited' },
    user_role_changed: { ar: 'تغيير صلاحية', en: 'Role Changed' },
    setting_changed: { ar: 'تغيير إعدادات', en: 'Settings Changed' },
    collection_created: { ar: 'إنشاء مجموعة', en: 'Collection Created' },
    collection_updated: { ar: 'تحديث مجموعة', en: 'Collection Updated' },
    collection_deleted: { ar: 'حذف مجموعة', en: 'Collection Deleted' },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-heading font-bold text-foreground">{t.title}</h1>
        <Button
          onClick={handleExport}
          variant="outline"
          className="border-border"
          disabled={filtered.length === 0}
        >
          <Download className="w-4 h-4 ml-2" />
          {t.export}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
            className="pr-10"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 ml-2" />
            <SelectValue placeholder={t.allActions} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allActions}</SelectItem>
            {actionTypes.map(type => (
              <SelectItem key={type} value={type}>
                {actionLabels[type]?.[lang] || type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={severityFilter} onValueChange={setSeverityFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <Filter className="w-4 h-4 ml-2" />
            <SelectValue placeholder={t.allSeverities} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allSeverities}</SelectItem>
            <SelectItem value="info">{t.info}</SelectItem>
            <SelectItem value="warning">{t.warning}</SelectItem>
            <SelectItem value="critical">{t.critical}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        {filtered.length} {lang === 'ar' ? 'حدث' : 'events'}
        {filtered.length !== logs.length && ` ${lang === 'ar' ? 'من' : 'of'} ${logs.length}`}
      </p>

      {/* Timeline */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <AuditTimeline logs={filtered} lang={lang} />
      )}
    </div>
  );
}