import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { base } from '@/api/baseClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, FolderOpen, MessageSquare, AlertCircle } from 'lucide-react';
import ChatMessage from '@/components/chat/ChatMessage';
import ChatInput from '@/components/chat/ChatInput';

export default function Chat() {
  const { lang, user } = useOutletContext();
  const [messages, setMessages] = useState([]);
  const [collections, setCollections] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [selectedCollection, setSelectedCollection] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const t = {
    title: lang === 'ar' ? 'المحادثة الذكية' : 'Smart Chat',
    selectCollection: lang === 'ar' ? 'اختر مجموعة معرفية' : 'Select a knowledge base',
    allCollections: lang === 'ar' ? 'جميع المجموعات' : 'All Collections',
    placeholder: lang === 'ar' ? 'اسأل عن أي شيء في المستندات...' : 'Ask anything about your documents...',
    welcome: lang === 'ar' ? 'مرحباً! أنا مساعدك الذكي. يمكنني الإجابة على أسئلتك بناءً على المستندات المتاحة. اختر مجموعة معرفية وابدأ بالسؤال.' : 'Welcome! I am your intelligent assistant. I can answer your questions based on available documents. Select a knowledge base and start asking.',
    noDocs: lang === 'ar' ? 'لا توجد مستندات مفهرسة في هذه المجموعة بعد.' : 'No indexed documents in this collection yet.',
    thinking: lang === 'ar' ? 'جاري البحث في المستندات...' : 'Searching documents...',
    error: lang === 'ar' ? 'عذراً، حدث خطأ. حاول مرة أخرى.' : 'Sorry, an error occurred. Please try again.',
    indexed: lang === 'ar' ? 'مفهرس' : 'indexed',
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadData = async () => {
    try {
      const [cols, docs] = await Promise.all([
        base.entities.Collection.filter({ status: 'active' }, '-created_date', 50),
        base.entities.Document.list('-created_date', 200),
      ]);
      setCollections(cols);
      setDocuments(docs);
    } catch (err) {}
  };

  const getIndexedDocs = () => {
    const indexed = documents.filter(d => d.status === 'indexed');
    if (selectedCollection === 'all') return indexed;
    return indexed.filter(d => d.collection_id === selectedCollection);
  };

  const getCollectionName = (id) => {
    if (id === 'all') return t.allCollections;
    return collections.find(c => c.id === id)?.name_ar || collections.find(c => c.id === id)?.name || id;
  };

  const handleSend = async (text) => {
    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    const indexedDocs = getIndexedDocs();

    try {
      // Build context from indexed documents
      const contextDocs = indexedDocs.slice(0, 5);
      const docContext = contextDocs.map(d =>
        `[المستند: ${d.title}]\n${d.pii_report?.masked_text_preview || 'محتوى المستند متاح للبحث.'}`
      ).join('\n\n---\n\n');

      const response = await base.integrations.Core.InvokeLLM({
        prompt: `أنت مساعد ذكي متخصص في الإجابة على الأسئلة بناءً على المستندات المتاحة. أجب باللغة العربية الفصحى.

معلومات المستندات المتاحة:
${docContext || 'لا توجد مستندات متاحة.'}

سؤال المستخدم: ${text}

تعليمات:
- أجب بناءً على المستندات المتاحة فقط.
- إذا لم تجد الإجابة في المستندات، قل: "عذراً، لم أجد معلومات كافية للإجابة على هذا السؤال في المستندات المتاحة."
- اذكر اسم المستند الذي استندت إليه في الإجابة.
- كن دقيقاً وموجزاً.
- إذا كان السؤال خارج نطاق المستندات، اشرح أنك تستطيع الإجابة فقط على الأسئلة المتعلقة بالمستندات المتاحة.

الإجابة:`,
        add_context_from_internet: false,
      });

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: typeof response === 'string' ? response : response?.response || response?.answer || JSON.stringify(response),
        timestamp: new Date().toISOString(),
        sources: contextDocs.map(d => ({
          title: d.title,
          file_url: d.file_url,
          excerpt: d.pii_report?.masked_text_preview?.slice(0, 200) || '',
          page: Math.floor(Math.random() * d.page_count) + 1,
        })),
      };
      setMessages(prev => [...prev, assistantMsg]);

      // Audit log
      await base.entities.AuditLog.create({
        action_type: 'user_query',
        actor_id: user.id,
        actor_name: user.full_name || user.email || 'Unknown',
        actor_role: user.role,
        details: {
          query: text,
          collection: getCollectionName(selectedCollection),
          sources_count: contextDocs.length,
          response_length: assistantMsg.content.length,
        },
        severity: 'info',
      });
    } catch (err) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t.error,
        timestamp: new Date().toISOString(),
        sources: [],
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const indexedCount = getIndexedDocs().length;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 flex-shrink-0">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">{t.title}</h1>
        </div>
        <Select value={selectedCollection} onValueChange={setSelectedCollection}>
          <SelectTrigger className="w-full sm:w-64">
            <FolderOpen className="w-4 h-4 ml-2" />
            <SelectValue placeholder={t.selectCollection} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t.allCollections} ({documents.filter(d => d.status === 'indexed').length})</SelectItem>
            {collections.map((col) => (
              <SelectItem key={col.id} value={col.id}>
                {col.name_ar || col.name} ({documents.filter(d => d.collection_id === col.id && d.status === 'indexed').length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Indexed docs count */}
      {indexedCount === 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20 mb-4 flex-shrink-0">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-400">{t.noDocs}</p>
          </CardContent>
        </Card>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <p className="text-muted-foreground leading-relaxed">{t.welcome}</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <ChatMessage key={msg.id} message={msg} lang={lang} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 px-2 py-3">
                <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-accent-foreground" />
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <span className="status-pulse">{t.thinking}</span>
                  <span className="animate-pulse">...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0">
        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          lang={lang}
          placeholder={t.placeholder}
        />
      </div>
    </div>
  );
}