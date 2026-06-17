import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base } from '@/api/baseClient';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, ShieldCheck, AlertTriangle } from 'lucide-react';
import DocumentCard from '@/components/documents/DocumentCard';
import PIIReport from '@/components/pii/PIIReport';

export default function PIIReview() {
  const { lang, user } = useOutletContext();
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState('pending');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  const t = {
    title: lang === 'ar' ? 'مراجعة الخصوصية' : 'PII Review',
    search: lang === 'ar' ? 'بحث عن مستند...' : 'Search documents...',
    pending: lang === 'ar' ? 'قيد المراجعة' : 'Pending',
    approved: lang === 'ar' ? 'معتمدة' : 'Approved',
    flagged: lang === 'ar' ? 'معلقة' : 'Flagged',
    rejected: lang === 'ar' ? 'مرفوضة' : 'Rejected',
    all: lang === 'ar' ? 'الكل' : 'All',
    noDocs: lang === 'ar' ? 'لا توجد مستندات' : 'No documents found',
    complianceDashboard: lang === 'ar' ? 'لوحة الامتثال' : 'Compliance Dashboard',
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    try {
      const docs = await base.entities.Document.list('-created_date', 200);
      setDocuments(docs);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (doc) => {
    await base.entities.Document.update(doc.id, {
      status: 'approved',
      reviewed_by_id: user.id,
      reviewed_by_name: user.full_name || user.email,
      reviewed_at: new Date().toISOString(),
    });
    await base.entities.AuditLog.create({
      action_type: 'document_approved',
      actor_id: user.id, actor_name: user.full_name || 'Unknown', actor_role: user.role,
      document_id: doc.id, document_title: doc.title,
      details: { previous_status: doc.status, pii_masked_count: doc.pii_report?.total_pii_found || 0 },
      severity: 'info',
    });
    setTimeout(async () => {
      await base.entities.Document.update(doc.id, { status: 'indexed', indexed_at: new Date().toISOString() });
      await base.entities.AuditLog.create({
        action_type: 'document_indexed',
        actor_id: user.id, actor_name: user.full_name || 'Unknown', actor_role: user.role,
        document_id: doc.id, document_title: doc.title,
        severity: 'info',
      });
      loadDocuments();
    }, 2000);
    loadDocuments();
  };

  const handleFlag = async (doc) => {
    await base.entities.Document.update(doc.id, {
      status: 'flagged',
      reviewed_by_id: user.id,
      reviewed_by_name: user.full_name || user.email,
      reviewed_at: new Date().toISOString(),
    });
    await base.entities.AuditLog.create({
      action_type: 'document_flagged',
      actor_id: user.id, actor_name: user.full_name || 'Unknown', actor_role: user.role,
      document_id: doc.id, document_title: doc.title,
      severity: 'warning',
    });
    loadDocuments();
  };

  const handleReject = async (doc) => {
    await base.entities.Document.update(doc.id, {
      status: 'rejected',
      reviewed_by_id: user.id,
      reviewed_by_name: user.full_name || user.email,
      reviewed_at: new Date().toISOString(),
    });
    await base.entities.AuditLog.create({
      action_type: 'document_rejected',
      actor_id: user.id, actor_name: user.full_name || 'Unknown', actor_role: user.role,
      document_id: doc.id, document_title: doc.title,
      severity: 'critical',
    });
    loadDocuments();
  };

  const getFilteredDocs = () => {
    let filtered = documents;
    if (tab === 'pending') filtered = documents.filter(d => d.status === 'pii_detected');
    else if (tab === 'approved') filtered = documents.filter(d => d.status === 'approved' || d.status === 'indexed');
    else if (tab === 'flagged') filtered = documents.filter(d => d.status === 'flagged');
    else if (tab === 'rejected') filtered = documents.filter(d => d.status === 'rejected');

    if (search) {
      filtered = filtered.filter(d => d.title?.toLowerCase().includes(search.toLowerCase()));
    }
    return filtered;
  };

  const filtered = getFilteredDocs();
  const pendingCount = documents.filter(d => d.status === 'pii_detected').length;
  const flaggedCount = documents.filter(d => d.status === 'flagged').length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">{t.title}</h1>
        <p className="text-muted-foreground mt-1">{t.complianceDashboard}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <p className="text-2xl font-bold text-amber-700 dark:text-amber-400">{pendingCount}</p>
              <p className="text-sm text-amber-600 dark:text-amber-500">{t.pending}</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-2xl font-bold text-orange-700 dark:text-orange-400">{flaggedCount}</p>
              <p className="text-sm text-orange-600 dark:text-orange-500">{t.flagged}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Selected document detail */}
      {selectedDoc && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-heading font-bold text-foreground">{selectedDoc.title}</h2>
            <button
              onClick={() => setSelectedDoc(null)}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              {lang === 'ar' ? 'إغلاق' : 'Close'}
            </button>
          </div>
          <PIIReport
            document={selectedDoc}
            lang={lang}
            onApprove={handleApprove}
            onFlag={handleFlag}
            onReject={handleReject}
          />
        </div>
      )}

      {/* Search & tabs */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="pending">{t.pending} ({pendingCount})</TabsTrigger>
            <TabsTrigger value="flagged">{t.flagged} ({flaggedCount})</TabsTrigger>
            <TabsTrigger value="approved">{t.approved}</TabsTrigger>
            <TabsTrigger value="rejected">{t.rejected}</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
            className="pr-10"
          />
        </div>
      </div>

      {/* Document list */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <ShieldCheck className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground">{t.noDocs}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((doc) => (
            <DocumentCard
              key={doc.id}
              document={doc}
              lang={lang}
              onClick={(d) => setSelectedDoc(d)}
            />
          ))}
        </div>
      )}
    </div>
  );
}