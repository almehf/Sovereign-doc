import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base } from '@/api/baseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { FolderOpen, Plus, Edit, Trash2, FileText, Search } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';

export default function Collections() {
  const { lang, user, role } = useOutletContext();
  const [collections, setCollections] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [form, setForm] = useState({ name: '', name_ar: '', description: '', description_ar: '' });
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const t = {
    title: lang === 'ar' ? 'المجموعات المعرفية' : 'Knowledge Collections',
    search: lang === 'ar' ? 'بحث عن مجموعة...' : 'Search collections...',
    create: lang === 'ar' ? 'إنشاء مجموعة' : 'Create Collection',
    edit: lang === 'ar' ? 'تعديل المجموعة' : 'Edit Collection',
    newCollection: lang === 'ar' ? 'مجموعة جديدة' : 'New Collection',
    name: lang === 'ar' ? 'اسم المجموعة' : 'Collection Name',
    nameAr: lang === 'ar' ? 'الاسم العربي' : 'Arabic Name',
    desc: lang === 'ar' ? 'الوصف' : 'Description',
    descAr: lang === 'ar' ? 'الوصف العربي' : 'Arabic Description',
    save: lang === 'ar' ? 'حفظ' : 'Save',
    cancel: lang === 'ar' ? 'إلغاء' : 'Cancel',
    delete: lang === 'ar' ? 'حذف' : 'Delete',
    confirmDelete: lang === 'ar' ? 'هل أنت متأكد من حذف هذه المجموعة؟' : 'Are you sure you want to delete this collection?',
    noCollections: lang === 'ar' ? 'لا توجد مجموعات بعد' : 'No collections yet',
    createFirst: lang === 'ar' ? 'أنشئ أول مجموعة معرفية' : 'Create your first knowledge collection',
    docsCount: lang === 'ar' ? 'مستند' : 'documents',
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cols, docs] = await Promise.all([
        base.entities.Collection.list('-created_date', 100),
        base.entities.Document.list('-created_date', 200),
      ]);
      setCollections(cols);
      setDocuments(docs);
    } finally {
      setLoading(false);
    }
  };

  const getDocCount = (collectionId) => {
    return documents.filter(d => d.collection_id === collectionId).length;
  };

  const openCreate = () => {
    setEditingCollection(null);
    setForm({ name: '', name_ar: '', description: '', description_ar: '' });
    setDialogOpen(true);
  };

  const openEdit = (col) => {
    setEditingCollection(col);
    setForm({
      name: col.name || '',
      name_ar: col.name_ar || '',
      description: col.description || '',
      description_ar: col.description_ar || '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;

    try {
      if (editingCollection) {
        await base.entities.Collection.update(editingCollection.id, {
          ...form,
          document_count: getDocCount(editingCollection.id),
        });
        await base.entities.AuditLog.create({
          action_type: 'collection_updated',
          actor_id: user.id, actor_name: user.full_name || 'Unknown', actor_role: user.role,
          collection_id: editingCollection.id,
          details: { name: form.name },
          severity: 'info',
        });
      } else {
        const col = await base.entities.Collection.create({
          ...form,
          status: 'active',
          document_count: 0,
        });
        await base.entities.AuditLog.create({
          action_type: 'collection_created',
          actor_id: user.id, actor_name: user.full_name || 'Unknown', actor_role: user.role,
          collection_id: col.id,
          details: { name: form.name },
          severity: 'info',
        });
      }
      setDialogOpen(false);
      loadData();
    } catch (err) {}
  };

  const handleDelete = async (col) => {
    if (!window.confirm(t.confirmDelete)) return;
    await base.entities.Collection.delete(col.id);
    await base.entities.AuditLog.create({
      action_type: 'collection_deleted',
      actor_id: user.id, actor_name: user.full_name || 'Unknown', actor_role: user.role,
      collection_id: col.id,
      details: { name: col.name },
      severity: 'warning',
    });
    loadData();
  };

  const filtered = collections.filter(c => {
    if (!search) return true;
    return (
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.name_ar?.includes(search) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const isReadOnly = role === 'user';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-heading font-bold text-foreground">{t.title}</h1>
        {!isReadOnly && (
          <Button onClick={openCreate} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 ml-2" /> {t.create}
          </Button>
        )}
      </div>

      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.search}
          className="pr-10"
        />
      </div>

      {loading ? (
        <div className="grid md:grid-cols-2 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">{t.noCollections}</p>
          <p className="text-sm text-muted-foreground mt-1">{isReadOnly ? '' : t.createFirst}</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {filtered.map((col) => {
            const docCount = getDocCount(col.id);
            const isExpanded = expandedId === col.id;
            const colDocs = documents.filter(d => d.collection_id === col.id);

            return (
              <Card
                key={col.id}
                className={`border-border hover:shadow-sm transition-all ${isExpanded ? 'ring-2 ring-primary/20' : ''}`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <FolderOpen className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-heading">{col.name_ar || col.name}</CardTitle>
                        {col.name_ar && col.name !== col.name_ar && (
                          <p className="text-xs text-muted-foreground">{col.name}</p>
                        )}
                        {col.description_ar && (
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{col.description_ar}</p>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={col.status} lang={lang} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>{docCount} {t.docsCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : col.id)}
                        className="text-xs text-primary hover:underline px-2"
                      >
                        {isExpanded ? (lang === 'ar' ? 'إخفاء' : 'Hide') : `${docCount} ${t.docsCount}`}
                      </button>
                      {!isReadOnly && (
                        <>
                          <button onClick={() => openEdit(col)} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(col)} className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Expanded doc list */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-border space-y-1.5">
                      {colDocs.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-2">
                          {lang === 'ar' ? 'لا توجد مستندات في هذه المجموعة' : 'No documents in this collection'}
                        </p>
                      ) : (
                        colDocs.slice(0, 10).map(doc => (
                          <div key={doc.id} className="flex items-center gap-2 text-sm py-1">
                            <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-foreground truncate">{doc.title}</span>
                            <StatusBadge status={doc.status} lang={lang} className="scale-75" />
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading">
              {editingCollection ? t.edit : t.newCollection}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>{t.name}</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder={lang === 'ar' ? 'مثال: سياسات الموارد البشرية' : 'e.g. HR Policies'}
              />
            </div>
            <div>
              <Label>{t.nameAr}</Label>
              <Input
                value={form.name_ar}
                onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                placeholder="مثال: سياسات الموارد البشرية"
              />
            </div>
            <div>
              <Label>{t.desc}</Label>
              <Input
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder={lang === 'ar' ? 'وصف المجموعة' : 'Collection description'}
              />
            </div>
            <div>
              <Label>{t.descAr}</Label>
              <Input
                value={form.description_ar}
                onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
                placeholder="وصف المجموعة بالعربية"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t.cancel}</Button>
            <Button onClick={handleSave} className="bg-primary">{t.save}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}