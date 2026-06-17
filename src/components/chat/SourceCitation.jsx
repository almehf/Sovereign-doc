import { Card, CardContent } from '@/components/ui/card';
import { FileText, ExternalLink, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function SourceCitation({ sources = [], lang = 'ar' }) {
  const [expanded, setExpanded] = useState({});

  const t = {
    sources: lang === 'ar' ? 'المصادر' : 'Sources',
    page: lang === 'ar' ? 'صفحة' : 'Page',
    excerpt: lang === 'ar' ? 'مقتطف' : 'Excerpt',
    viewDocument: lang === 'ar' ? 'عرض المستند' : 'View document',
  };

  if (!sources.length) return null;

  const toggleExpand = (idx) => {
    setExpanded(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="mt-3">
      <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1.5">
        <FileText className="w-3 h-3" />
        {t.sources}
      </p>
      <div className="space-y-2">
        {sources.map((source, idx) => (
          <Card key={idx} className="border-border bg-muted/30">
            <CardContent className="p-3">
              <button
                onClick={() => toggleExpand(idx)}
                className="flex items-center justify-between w-full text-sm"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="font-medium text-foreground truncate">{source.title}</span>
                  {source.page && (
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {t.page} {source.page}
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded[idx] ? 'rotate-180' : ''}`} />
              </button>
              {expanded[idx] && source.excerpt && (
                <div className="mt-2 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-1">{t.excerpt}:</p>
                  <div className="text-sm text-foreground bg-background rounded-lg p-3 font-body leading-relaxed">
                    {source.excerpt}
                  </div>
                  {source.file_url && (
                    <a
                      href={source.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {t.viewDocument}
                    </a>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}