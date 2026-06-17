import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Paperclip } from 'lucide-react';

export default function ChatInput({ onSend, isLoading, lang = 'ar', placeholder }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const defaultPlaceholder = lang === 'ar'
    ? 'اكتب سؤالك هنا...'
    : 'Type your question here...';

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const adjustHeight = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  return (
    <div className="border-t border-border bg-card p-4">
      <div className="max-w-3xl mx-auto flex items-end gap-3">
        <Textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || defaultPlaceholder}
          rows={1}
          className="resize-none min-h-[44px] max-h-[200px] bg-muted border-border rounded-xl px-4 py-2.5 text-sm"
          disabled={isLoading}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || isLoading}
          size="icon"
          className="h-11 w-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
    </div>
  );
}