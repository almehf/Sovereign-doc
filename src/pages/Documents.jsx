import { useState, useEffect } from 'react';
import { useLayoutContext } from '@/hooks/useLayoutContext';
import { base } from '@/api/baseClient';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Upload, FileText } from 'lucide-react';
import DocumentUpload from '@/components/documents/DocumentUpload';
import DocumentCard from '@/components/documents/DocumentCard';
import PIIReport from '@/components/pii/PIIReport';

export default function Documents() {
  const { lang, user } = useLayoutContext();
  const [documents, setDocuments] = useState([]);
  const [collections, setCollections] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  const t = {
    title: lang === 'ar' ? 'المستندات' : 'Documents',
    search: lang === 'ar' ? 'بحث عن مستند...' : 'Search documents...',
    allStatus: lang === 'ar' ? 'جميع الحالات' : 'All Statuses',
    uploadNew: lang === 'ar' ? 'رفع مستند جديد' : 'Upload New Document',
    noDocs: lang === 'ar' ? 'لا توجد مستندات بعد' : 'No documents yet',
    uploadFirst: lang === 'ar' ? 'ارفع أول مستند للبدء' : 'Upload your first document to get started',
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [docs, cols] = await Promise.all([
        base.entities.Document.list('-created_date', 100),
        base.entities.Collection.filter({ status: 'active' }, '-created_date', 50),
      ]);
      setDocuments(docs);
      setCollections(cols);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = (doc) => {
    setDocuments(prev => [doc, ...prev]);
    setSelectedDoc(doc);
  };

  const handleApprove = async (doc) => {
    await base.entities.Document.update(doc.id, { status: 'approved', reviewed_by_id: user.id, reviewed_by_name: user.full_name || user.email, reviewed_at: new Date().toISOString() });
    await base.entities.AuditLog.create({
      action_type: 'document_approved',
      actor_id: user.id, actor_name: user.full_name || 'Unknown', actor_role: user.role,
      document_id: doc.id, document_title: doc.title,
      details: { previous_status: doc.status },
      severity: 'info',
    });
    // Simulate indexing
    setTimeout(async () => {
      await base.entities.Document.update(doc.id, { status: 'indexed', indexed_at: new Date().toISOString() });
      await base.entities.AuditLog.create({
        action_type: 'document_indexed',
        actor_id: user.id, actor_name: user.full_name || 'Unknown', actor_role: user.role,
        document_id: doc.id, document_title: doc.title,
        severity: 'info',
      });
      loadData();
    }, 2000);
    loadData();
  };

  const handleFlag = async (doc) => {
    await base.entities.Document.update(doc.id, { status: 'flagged', reviewed_by_id: user.id, reviewed_by_name: user.full_name || user.email, reviewed_at: new Date().toISOString() });
    await base.entities.AuditLog.create({
      action_type: 'document_flagged',
      actor_id: user.id, actor_name: user.full_name || 'Unknown', actor_role: user.role,
      document_id: doc.id, document_title: doc.title,
      severity: 'warning',
    });
    loadData();
  };

  const handleReject = async (doc) => {
    await base.entities.Document.update(doc.id, { status: 'rejected', reviewed_by_id: user.id, reviewed_by_name: user.full_name || user.email, reviewed_at: new Date().toISOString() });
    await base.entities.AuditLog.create({
      action_type: 'document_rejected',
      actor_id: user.id, actor_name: user.full_name || 'Unknown', actor_role: user.role,
      document_id: doc.id, document_title: doc.title,
      severity: 'critical',
    });
    loadData();
  };

  const filtered = documents.filter(d => {
    const matchSearch = !search || d.title?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-heading font-bold text-foreground">{t.title}</h1>
        <button
          onClick={() => { setShowUpload(!showUpload); setSelectedDoc(null); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Upload className="w-4 h-4" />
          {t.uploadNew}
        </button>
      </div>

      {showUpload && (
        <DocumentUpload
          lang={lang}
          collections={collections}
          onUploadComplete={handleUploadComplete}
        />
      )}

      {/* Selected document detail / PII report */}
      {selectedDoc && !showUpload && (
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

      {/* Search & filters */}
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Filter className="w-4 h-4 ml-2" />
            <SelectValue placeholder={t.allStatus} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allStatus}</SelectItem>
            <SelectItem value="uploaded">{lang === 'ar' ? 'تم الرفع' : 'Uploaded'}</SelectItem>
            <SelectItem value="pii_detected">{lang === 'ar' ? 'اكتشاف بيانات' : 'PII Detected'}</SelectItem>
            <SelectItem value="approved">{lang === 'ar' ? 'معتمد' : 'Approved'}</SelectItem>
            <SelectItem value="flagged">{lang === 'ar' ? 'معلق' : 'Flagged'}</SelectItem>
            <SelectItem value="rejected">{lang === 'ar' ? 'مرفوض' : 'Rejected'}</SelectItem>
            <SelectItem value="indexed">{lang === 'ar' ? 'مفهرس' : 'Indexed'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Document grid */}
      {loading ? (
        <div className="grid gap-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-24 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">{t.noDocs}</p>
          <p className="text-sm text-muted-foreground mt-1">{t.uploadFirst}</p>
        </div>
      ) : (
        <div className="grid gap-3">
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