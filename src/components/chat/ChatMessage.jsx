import ReactMarkdown from 'react-markdown';
import { ShieldCheck, Sparkles } from 'lucide-react';
import SourceCitation from './SourceCitation';
import { cn } from '@/lib/utils';

export default function ChatMessage({ message, lang = 'ar' }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  return (
    <div className={cn('flex gap-3 mb-4', isUser ? 'flex-row-reverse' : 'flex-row')}>
      {/* Avatar */}
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
        isUser ? 'bg-primary text-primary-foreground' : 'bg-accent text-accent-foreground'
      )}>
        {isUser ? (
          <span className="text-sm font-bold">؟</span>
        ) : (
          <Sparkles className="w-4 h-4" />
        )}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[80%]', isUser && 'flex flex-col items-end')}>
        <div className={cn(
          'rounded-2xl px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground rounded-tr-md'
            : 'bg-card border border-border rounded-tl-md shadow-sm'
        )}>
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          ) : (
            <ReactMarkdown
              className="text-sm prose prose-sm max-w-none dark:prose-invert [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
              components={{
                p: ({ children }) => <p className="my-1 leading-relaxed">{children}</p>,
                ul: ({ children }) => <ul className="my-1 mr-4 list-disc">{children}</ul>,
                ol: ({ children }) => <ol className="my-1 mr-4 list-decimal">{children}</ol>,
                li: ({ children }) => <li className="my-0.5">{children}</li>,
                strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                a: ({ children, ...props }) => (
                  <a {...props} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                    {children}
                  </a>
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          )}
        </div>

        {/* Source citations for assistant messages */}
        {isAssistant && message.sources?.length > 0 && (
          <SourceCitation sources={message.sources} lang={lang} />
        )}

        {/* Timestamp */}
        {message.timestamp && (
          <p className="text-xs text-muted-foreground mt-1 px-1">
            {new Date(message.timestamp).toLocaleTimeString(lang === 'ar' ? 'ar-SA' : 'en-US', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
}