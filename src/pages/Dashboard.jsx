import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLayoutContext } from '@/hooks/useLayoutContext';
import { base } from '@/api/baseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, ShieldCheck, FolderOpen, MessageSquare, ScrollText, ArrowUpRight, AlertTriangle } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import AuditTimeline from '@/components/audit/AuditTimeline';

export default function Dashboard() {
  const { lang, user, role } = useLayoutContext();
  const [stats, setStats] = useState(null);
  const [recentLogs, setRecentLogs] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);

  const t = {
    welcome: lang === 'ar' ? 'أهلاً بك' : 'Welcome',
    dashboardTitle: lang === 'ar' ? 'لوحة التحكم' : 'Dashboard',
    totalDocs: lang === 'ar' ? 'إجمالي المستندات' : 'Total Documents',
    piiReviews: lang === 'ar' ? 'قيد المراجعة' : 'Pending Review',
    activeCollections: lang === 'ar' ? 'المجموعات النشطة' : 'Active Collections',
    queriesToday: lang === 'ar' ? 'استعلامات اليوم' : 'Queries Today',
    recentActivity: lang === 'ar' ? 'آخر النشاطات' : 'Recent Activity',
    quickActions: lang === 'ar' ? 'إجراءات سريعة' : 'Quick Actions',
    uploadDoc: lang === 'ar' ? 'رفع مستند' : 'Upload Document',
    reviewPII: lang === 'ar' ? 'مراجعة الخصوصية' : 'Review PII',
    manageCollections: lang === 'ar' ? 'إدارة المجموعات' : 'Manage Collections',
    viewAudit: lang === 'ar' ? 'سجل التدقيق' : 'Audit Log',
    chatNow: lang === 'ar' ? 'بدء المحادثة' : 'Start Chat',
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [docs, collections, logs] = await Promise.all([
        base.entities.Document.list('-created_date', 50),
        base.entities.Collection.filter({ status: 'active' }, '-created_date', 20),
        base.entities.AuditLog.list('-created_date', 20),
      ]);

      const pendingReview = docs.filter(d => d.status === 'pii_detected' || d.status === 'flagged');
      const indexed = docs.filter(d => d.status === 'indexed' || d.status === 'approved');

      setStats({
        totalDocs: docs.length,
        pendingReview: pendingReview.length,
        activeCollections: collections.length,
        queriesToday: logs.filter(l => l.action_type === 'user_query').length,
        indexedDocs: indexed.length,
      });

      setPendingReviews(pendingReview.slice(0, 5));
      setRecentLogs(logs);
    } catch (err) {
      // ignore errors on initial load with no data
    }
  };

  const statCards = [
    { icon: FileText, value: stats?.totalDocs || 0, label: t.totalDocs, color: 'bg-blue-500' },
    { icon: ShieldCheck, value: stats?.pendingReview || 0, label: t.piiReviews, color: 'bg-amber-500' },
    { icon: FolderOpen, value: stats?.activeCollections || 0, label: t.activeCollections, color: 'bg-emerald-500' },
    { icon: MessageSquare, value: stats?.queriesToday || 0, label: t.queriesToday, color: 'bg-primary' },
  ];

  const quickActions = [
    { icon: FileText, label: t.uploadDoc, path: '/documents', roles: ['admin'] },
    { icon: ShieldCheck, label: t.reviewPII, path: '/pii-review', roles: ['admin', 'compliance_officer'] },
    { icon: FolderOpen, label: t.manageCollections, path: '/collections', roles: ['admin'] },
    { icon: ScrollText, label: t.viewAudit, path: '/audit-log', roles: ['admin', 'compliance_officer'] },
    { icon: MessageSquare, label: t.chatNow, path: '/chat', roles: ['admin', 'compliance_officer', 'user'] },
  ];

  const userQuickActions = quickActions.filter(a => a.roles.includes(role));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-heading font-bold text-foreground">{t.dashboardTitle}</h1>
        <p className="text-muted-foreground mt-1">
          {t.welcome}، {user?.full_name || user?.email || ''}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-border hover:shadow-sm transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.color} bg-opacity-10 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color.replace('bg-', 'text-')}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="border-border lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg font-heading">{t.quickActions}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {userQuickActions.map((action, i) => (
              <Link
                key={i}
                to={action.path}
                className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <action.icon className="w-5 h-5 text-primary" />
                  <span className="font-medium text-foreground text-sm">{action.label}</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Pending reviews (admin/compliance) */}
        {(role === 'admin' || role === 'compliance_officer') && pendingReviews.length > 0 && (
          <Card className="border-border lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-heading flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                {t.piiReviews}
              </CardTitle>
              <Link to="/pii-review" className="text-sm text-primary hover:underline flex items-center gap-1">
                {lang === 'ar' ? 'عرض الكل' : 'View all'}
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pendingReviews.map((doc) => (
                  <Link
                    key={doc.id}
                    to="/pii-review"
                    className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground truncate">{doc.title}</span>
                    </div>
                    <StatusBadge status={doc.status} lang={lang} />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent audit log for admin/compliance */}
        {(role === 'admin' || role === 'compliance_officer') && (
          <div className="lg:col-span-full">
            <AuditTimeline logs={recentLogs} lang={lang} />
          </div>
        )}
      </div>
    </div>
  );
}