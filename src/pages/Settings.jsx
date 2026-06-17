import { useState, useEffect } from 'react';
import { useLayoutContext } from '@/hooks/useLayoutContext';
import { base } from '@/api/baseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, CheckCircle, Cpu, Globe, Shield } from 'lucide-react';

export default function SettingsPage() {
  const { lang, user } = useLayoutContext();
  const [settings, setSettings] = useState({});
  const [formData, setFormData] = useState({
    llmEndpoint: '',
    llmModel: '',
    embeddingEndpoint: '',
    embeddingModel: '',
    defaultLanguage: 'ar',
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  const t = {
    title: lang === 'ar' ? 'الإعدادات' : 'Settings',
    llmSection: lang === 'ar' ? 'إعدادات النموذج اللغوي' : 'LLM Settings',
    llmDesc: lang === 'ar' ? 'تكوين نقطة نهاية النموذج اللغوي المحلي' : 'Configure your local LLM endpoint',
    llmEndpoint: lang === 'ar' ? 'رابط API للنموذج اللغوي' : 'LLM API Endpoint',
    llmEndpointPlaceholder: lang === 'ar' ? 'مثال: http://localhost:11434/api/generate' : 'e.g. http://localhost:11434/api/generate',
    llmModel: lang === 'ar' ? 'اسم النموذج' : 'Model Name',
    llmModelPlaceholder: lang === 'ar' ? 'مثال: llama-3-arabic' : 'e.g. llama-3-arabic',
    embeddingSection: lang === 'ar' ? 'إعدادات التضمين' : 'Embedding Settings',
    embeddingDesc: lang === 'ar' ? 'تكوين نموذج التضمين للبحث الدلالي' : 'Configure embedding model for semantic search',
    embeddingEndpoint: lang === 'ar' ? 'رابط API للتضمين' : 'Embedding API Endpoint',
    embeddingEndpointPlaceholder: lang === 'ar' ? 'مثال: http://localhost:8080/embeddings' : 'e.g. http://localhost:8080/embeddings',
    embeddingModel: lang === 'ar' ? 'اسم نموذج التضمين' : 'Embedding Model Name',
    embeddingModelPlaceholder: lang === 'ar' ? 'مثال: bilingual-embedding-base' : 'e.g. bilingual-embedding-base',
    complianceSection: lang === 'ar' ? 'إعدادات الامتثال' : 'Compliance Settings',
    complianceDesc: lang === 'ar' ? 'إعدادات الامتثال لنظام حماية البيانات الشخصية' : 'PDPL compliance settings',
    defaultLang: lang === 'ar' ? 'اللغة الافتراضية' : 'Default Language',
    save: lang === 'ar' ? 'حفظ الإعدادات' : 'Save Settings',
    saved: lang === 'ar' ? 'تم حفظ الإعدادات بنجاح' : 'Settings saved successfully',
    saveAudit: lang === 'ar' ? 'تغيير إعدادات النظام' : 'System settings changed',
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await base.entities.OrganizationSettings.list('-created_date', 50);
      const settingsMap = {};
      data.forEach(s => {
        settingsMap[s.setting_key] = s.setting_value;
      });
      setSettings(settingsMap);
      setFormData({
        llmEndpoint: settingsMap.llm_endpoint || '',
        llmModel: settingsMap.llm_model || 'llama-3-arabic',
        embeddingEndpoint: settingsMap.embedding_endpoint || '',
        embeddingModel: settingsMap.embedding_model || 'bilingual-embedding-base',
        defaultLanguage: settingsMap.default_language || 'ar',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const entries = [
      { key: 'llm_endpoint', value: formData.llmEndpoint, group: 'llm', label: 'LLM Endpoint', labelAr: 'رابط النموذج اللغوي' },
      { key: 'llm_model', value: formData.llmModel, group: 'llm', label: 'LLM Model', labelAr: 'اسم النموذج اللغوي' },
      { key: 'embedding_endpoint', value: formData.embeddingEndpoint, group: 'embedding', label: 'Embedding Endpoint', labelAr: 'رابط التضمين' },
      { key: 'embedding_model', value: formData.embeddingModel, group: 'embedding', label: 'Embedding Model', labelAr: 'اسم نموذج التضمين' },
      { key: 'default_language', value: formData.defaultLanguage, group: 'general', label: 'Default Language', labelAr: 'اللغة الافتراضية' },
    ];

    for (const entry of entries) {
      const existing = Object.entries(settings).find(([key]) => key === entry.key);
      if (existing) {
        // Find the actual record to update
        const allSettings = await base.entities.OrganizationSettings.list('-created_date', 50);
        const record = allSettings.find(s => s.setting_key === entry.key);
        if (record) {
          await base.entities.OrganizationSettings.update(record.id, {
            setting_value: entry.value,
            setting_group: entry.group,
          });
        }
      } else {
        await base.entities.OrganizationSettings.create({
          setting_key: entry.key,
          setting_value: entry.value,
          setting_group: entry.group,
          label: entry.label,
          label_ar: entry.labelAr,
        });
      }
    }

    await base.entities.AuditLog.create({
      action_type: 'setting_changed',
      actor_id: user.id,
      actor_name: user.full_name || 'Unknown',
      actor_role: user.role,
      details: {
        changed_settings: entries.map(e => e.key),
      },
      severity: 'warning',
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    loadSettings();
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {loading ? (
        <p className="text-muted-foreground">{lang === 'ar' ? 'جاري التحميل...' : 'Loading settings...'}</p>
      ) : (
      <>
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">{t.title}</h1>
      </div>

      {/* LLM Settings */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-heading flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            {t.llmSection}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t.llmDesc}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t.llmEndpoint}</Label>
            <Input
              value={formData.llmEndpoint}
              onChange={(e) => setFormData({ ...formData, llmEndpoint: e.target.value })}
              placeholder={t.llmEndpointPlaceholder}
              dir="ltr"
              className="mt-1.5 font-mono text-sm"
            />
          </div>
          <div>
            <Label>{t.llmModel}</Label>
            <Input
              value={formData.llmModel}
              onChange={(e) => setFormData({ ...formData, llmModel: e.target.value })}
              placeholder={t.llmModelPlaceholder}
              dir="ltr"
              className="mt-1.5 font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Embedding Settings */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-heading flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            {t.embeddingSection}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t.embeddingDesc}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>{t.embeddingEndpoint}</Label>
            <Input
              value={formData.embeddingEndpoint}
              onChange={(e) => setFormData({ ...formData, embeddingEndpoint: e.target.value })}
              placeholder={t.embeddingEndpointPlaceholder}
              dir="ltr"
              className="mt-1.5 font-mono text-sm"
            />
          </div>
          <div>
            <Label>{t.embeddingModel}</Label>
            <Input
              value={formData.embeddingModel}
              onChange={(e) => setFormData({ ...formData, embeddingModel: e.target.value })}
              placeholder={t.embeddingModelPlaceholder}
              dir="ltr"
              className="mt-1.5 font-mono text-sm"
            />
          </div>
        </CardContent>
      </Card>

      {/* Compliance Settings */}
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg font-heading flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            {t.complianceSection}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t.complianceDesc}</p>
        </CardHeader>
        <CardContent>
          <div>
            <Label>{t.defaultLang}</Label>
            <div className="flex gap-3 mt-1.5">
              <button
                onClick={() => setFormData({ ...formData, defaultLanguage: 'ar' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  formData.defaultLanguage === 'ar'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-muted'
                }`}
              >
                العربية
              </button>
              <button
                onClick={() => setFormData({ ...formData, defaultLanguage: 'en' })}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  formData.defaultLanguage === 'en'
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border hover:bg-muted'
                }`}
              >
                English
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">
          <Save className="w-4 h-4 ml-2" /> {t.save}
        </Button>
        {saved && (
          <span className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            {t.saved}
          </span>
        )}
      </div>
      </>
      )}
    </div>
  );
}