import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function LanguageToggle({ className = '' }) {
  const [lang, setLang] = useState(() => localStorage.getItem('mawthiq-lang') || 'ar');

  useEffect(() => {
    localStorage.setItem('mawthiq-lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
    window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
  }, [lang]);

  const toggle = () => setLang(prev => prev === 'ar' ? 'en' : 'ar');

  return (
    <button
      onClick={toggle}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-card hover:bg-muted text-sm font-medium transition-colors ${className}`}
    >
      <Globe className="w-4 h-4" />
      <span>{lang === 'ar' ? 'EN' : 'عربي'}</span>
    </button>
  );
}