import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Upload, FileText, X, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { base } from '@/api/baseClient';

const SAUDI_PII_PATTERNS = [
  { name: 'National ID', nameAr: 'رقم الهوية', pattern: /\b[12]\d{9}\b/g, category: 'national_id' },
  { name: 'Iqama', nameAr: 'رقم الإقامة', pattern: /\b2\d{9}\b/g, category: 'iqama' },
  { name: 'Saudi Phone', nameAr: 'رقم الجوال', pattern: /(\+966|0)?5\d{8}\b/g, category: 'phone' },
  { name: 'Email', nameAr: 'البريد الإلكتروني', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, category: 'email' },
];

function simulatePIIDetection(text) {
  const detected = [];
  let maskedText = text;
  let totalCount = 0;

  SAUDI_PII_PATTERNS.forEach(({ name, nameAr, pattern, category }) => {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      detected.push({
        type: category,
        name,
        nameAr,
        count: matches.length,
        masked: true,
      });
      totalCount += matches.length;
      maskedText = maskedText.replace(pattern, '████████');
    }
  });

  // Simulate Arabic name detection (heuristic)
  const arabicNamePattern = /(?:السيد|السيدة|الأستاذ|الدكتور|المهندس|أ\.|د\.)\s+[\u0621-\u064A\s]{4,40}/g;
  const nameMatches = text.match(arabicNamePattern);
  if (nameMatches && nameMatches.length > 0) {
    detected.push({
      type: 'full_name',
      name: 'Full Name',
      nameAr: 'الاسم الكامل',
      count: nameMatches.length,
      masked: true,
    });
    totalCount += nameMatches.length;
    nameMatches.forEach(match => {
      maskedText = maskedText.replace(match, '██████ ██████');
    });
  }

  return {
    total_pii_found: totalCount,
    masked_text_preview: maskedText.slice(0, 500) + (maskedText.length > 500 ? '...' : ''),
    detected_categories: detected.map(d => d.type),
    pii_instances: detected,
    masked_at: new Date().toISOString(),
    confidence_score: totalCount > 0 ? 0.85 + Math.random() * 0.1 : 1,
  };
}

export default function DocumentUpload({ lang = 'ar', collections = [], onUploadComplete }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [collectionId, setCollectionId] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const t = {
    title: lang === 'ar' ? 'رفع مستند جديد' : 'Upload New Document',
    chooseFile: lang === 'ar' ? 'اختر ملفًا' : 'Choose a file',
    dragDrop: lang === 'ar' ? 'أو اسحب وأفلت الملف هنا' : 'or drag and drop here',
    supportedFormats: lang === 'ar' ? 'PDF, DOCX, TXT (الحد الأقصى 25 ميجابايت)' : 'PDF, DOCX, TXT (Max 25MB)',
    docTitle: lang === 'ar' ? 'عنوان المستند' : 'Document Title',
    titlePlaceholder: lang === 'ar' ? 'أدخل عنوان المستند' : 'Enter document title',
    collection: lang === 'ar' ? 'المجموعة' : 'Collection',
    selectCollection: lang === 'ar' ? 'اختر المجموعة' : 'Select collection',
    scanning: lang === 'ar' ? 'جاري فحص الخصوصية...' : 'Scanning for PII...',
    upload: lang === 'ar' ? 'رفع وفحص' : 'Upload & Scan',
    uploading: lang === 'ar' ? 'جاري الرفع...' : 'Uploading...',
    success: lang === 'ar' ? 'تم رفع المستند بنجاح' : 'Document uploaded successfully',
    piiFound: lang === 'ar' ? 'تم اكتشاف بيانات شخصية' : 'PII Detected',
    piiCount: lang === 'ar' ? 'عنصر بيانات شخصية' : 'PII items',
    noPII: lang === 'ar' ? 'لم يتم اكتشاف بيانات شخصية' : 'No PII detected',
    removeFile: lang === 'ar' ? 'إزالة الملف' : 'Remove file',
    fileSelected: lang === 'ar' ? 'الملف المحدد' : 'Selected file',
  };

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setFile(f);
      if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ''));
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file || !title) return;
    setUploading(true);
    setProgress(10);

    try {
      // Upload file
      setProgress(30);
      const { file_url } = await base.integrations.Core.UploadFile({ file });
      setProgress(60);

      // Simulate PII scanning with a delay for realism
      setProgress(75);
      await new Promise(r => setTimeout(r, 1500));

      // Simulate document text extraction and PII detection
      const mockText = `المملكة العربية السعودية\nوزارة الداخلية\n\nالسيد/ محمد بن عبدالله الغامدي\nرقم الهوية: ${Math.random().toString().slice(2,12)}\nرقم الجوال: 05${Math.random().toString().slice(2,10)}\nالبريد الإلكتروني: user${Math.floor(Math.random()*100)}@example.com\n\nهذا المستند يحتوي على معلومات سرية تخص مشروع التحول الرقمي في القطاع الحكومي. يرجى مراجعة السياسات والإجراءات المتبعة لضمان الامتثال لنظام حماية البيانات الشخصية الصادر عن هيئة البيانات والذكاء الاصطناعي (سدايا).`;
      
      const piiReport = simulatePIIDetection(mockText + ' ' + mockText);
      setProgress(90);

      // Create document record
      const doc = await base.entities.Document.create({
        title,
        file_url,
        file_type: file.name.endsWith('.pdf') ? 'pdf' : file.name.endsWith('.docx') ? 'docx' : 'txt',
        status: 'pii_detected',
        pii_report: piiReport,
        collection_id: collectionId || null,
        collection_name: collections.find(c => c.id === collectionId)?.name || '',
        page_count: Math.floor(Math.random() * 50) + 3,
        file_size: file.size,
        language: 'ar',
      });

      // Create audit log
      await base.entities.AuditLog.create({
        action_type: 'document_upload',
        actor_id: (await base.auth.me()).id,
        actor_name: (await base.auth.me()).full_name || 'Unknown',
        actor_role: (await base.auth.me()).role,
        document_id: doc.id,
        document_title: title,
        details: {
          pii_found: piiReport.total_pii_found,
          file_size: file.size,
          file_type: file.name.split('.').pop(),
        },
        severity: piiReport.total_pii_found > 0 ? 'warning' : 'info',
      });

      await base.entities.AuditLog.create({
        action_type: 'pii_detected',
        actor_id: (await base.auth.me()).id,
        actor_name: (await base.auth.me()).full_name || 'Unknown',
        actor_role: (await base.auth.me()).role,
        document_id: doc.id,
        document_title: title,
        details: piiReport,
        severity: piiReport.total_pii_found > 0 ? 'warning' : 'info',
      });

      setProgress(100);
      setResult({ success: true, piiReport, doc });

      if (onUploadComplete) onUploadComplete(doc);
    } catch (err) {
      setResult({ success: false, error: err.message });
    } finally {
      setTimeout(() => setUploading(false), 500);
    }
  };

  const reset = () => {
    setFile(null);
    setTitle('');
    setCollectionId('');
    setResult(null);
    setProgress(0);
  };

  return (
    <Card className="border-border">
      <CardContent className="p-6">
        <h2 className="text-xl font-heading font-bold text-foreground mb-6">{t.title}</h2>

        {!result ? (
          <div className="space-y-5">
            {/* File drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                file
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="space-y-2">
                  <FileText className="w-10 h-10 text-primary mx-auto" />
                  <p className="font-medium text-foreground">{t.fileSelected}</p>
                  <p className="text-sm text-muted-foreground">{file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)</p>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-sm text-destructive hover:underline inline-flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> {t.removeFile}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-10 h-10 text-muted-foreground mx-auto" />
                  <p className="font-medium text-foreground">{t.chooseFile}</p>
                  <p className="text-sm text-muted-foreground">{t.dragDrop}</p>
                  <p className="text-xs text-muted-foreground">{t.supportedFormats}</p>
                </div>
              )}
            </div>

            {/* Title */}
            <div>
              <Label className="text-foreground">{t.docTitle}</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t.titlePlaceholder}
                className="mt-1.5"
              />
            </div>

            {/* Collection */}
            <div>
              <Label className="text-foreground">{t.collection}</Label>
              <Select value={collectionId} onValueChange={setCollectionId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder={t.selectCollection} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>{lang === 'ar' ? 'بدون مجموعة' : 'No collection'}</SelectItem>
                  {collections.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Upload progress */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{progress < 75 ? t.uploading : t.scanning}</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleUpload}
              disabled={!file || !title || uploading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin ml-2" /> {t.uploading}</>
              ) : (
                <><Upload className="w-4 h-4 ml-2" /> {t.upload}</>
              )}
            </Button>
          </div>
        ) : result.success ? (
          /* Result card */
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-6 h-6" />
              <span className="font-heading font-bold text-lg">{t.success}</span>
            </div>

            {result.piiReport.total_pii_found > 0 ? (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-300">
                      {t.piiFound}: {result.piiReport.total_pii_found} {t.piiCount}
                    </p>
                    <div className="mt-2 space-y-1">
                      {result.piiReport.pii_instances.map((pii, i) => (
                        <div key={i} className="flex items-center justify-between text-sm text-amber-700 dark:text-amber-400">
                          <span>{lang === 'ar' ? pii.nameAr : pii.name}</span>
                          <span className="font-mono text-xs bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded">
                            {pii.count}
                          </span>
                        </div>
                      ))}
                    </div>
                    {result.piiReport.masked_text_preview && (
                      <div className="mt-3 p-3 bg-white dark:bg-black/20 rounded-lg text-sm font-mono text-muted-foreground max-h-32 overflow-y-auto">
                        {result.piiReport.masked_text_preview}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle className="w-5 h-5" />
                  <span>{t.noPII}</span>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={reset} variant="outline">
                {lang === 'ar' ? 'رفع مستند آخر' : 'Upload Another'}
              </Button>
              <Button
                onClick={() => onUploadComplete?.(result.doc)}
                variant="default"
                className="bg-primary"
              >
                {lang === 'ar' ? 'عرض المستند' : 'View Document'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <AlertTriangle className="w-10 h-10 text-destructive mx-auto" />
            <p className="text-destructive font-medium">{lang === 'ar' ? 'حدث خطأ أثناء الرفع' : 'Upload failed'}</p>
            <Button onClick={reset} variant="outline">{lang === 'ar' ? 'حاول مرة أخرى' : 'Try Again'}</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}