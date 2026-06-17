import { useState, useEffect } from 'react';
import { useLayoutContext } from '@/hooks/useLayoutContext';
import { base } from '@/api/baseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Mail, Shield, CheckCircle } from 'lucide-react';

export default function UsersPage() {
  const { lang, user: currentUser } = useLayoutContext();
  const [users, setUsers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('user');
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const t = {
    title: lang === 'ar' ? 'إدارة المستخدمين' : 'User Management',
    invite: lang === 'ar' ? 'دعوة مستخدم' : 'Invite User',
    inviteDialog: lang === 'ar' ? 'دعوة مستخدم جديد' : 'Invite New User',
    email: lang === 'ar' ? 'البريد الإلكتروني' : 'Email Address',
    emailPlaceholder: lang === 'ar' ? 'أدخل البريد الإلكتروني' : 'Enter email address',
    role: lang === 'ar' ? 'الصلاحية' : 'Role',
    admin: lang === 'ar' ? 'مدير النظام' : 'Admin',
    complianceOfficer: lang === 'ar' ? 'مسؤول الامتثال' : 'Compliance Officer',
    userRole: lang === 'ar' ? 'مستخدم' : 'User',
    sendInvite: lang === 'ar' ? 'إرسال الدعوة' : 'Send Invitation',
    cancel: lang === 'ar' ? 'إلغاء' : 'Cancel',
    invited: lang === 'ar' ? 'تم إرسال الدعوة بنجاح' : 'Invitation sent successfully',
    noUsers: lang === 'ar' ? 'لا يوجد مستخدمون بعد' : 'No users yet',
    inviteFirst: lang === 'ar' ? 'ادعُ أول مستخدم للبدء' : 'Invite your first user',
    totalUsers: lang === 'ar' ? 'إجمالي المستخدمين' : 'Total Users',
  };

  const roleLabels = {
    admin: { ar: 'مدير النظام', en: 'Admin' },
    compliance_officer: { ar: 'مسؤول الامتثال', en: 'Compliance Officer' },
    user: { ar: 'مستخدم', en: 'User' },
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await base.entities.User.list('-created_date', 100);
      setUsers(data);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      await base.auth.inviteUser(inviteEmail, inviteRole);
      await base.entities.AuditLog.create({
        action_type: 'user_invited',
        actor_id: currentUser.id,
        actor_name: currentUser.full_name || 'Unknown',
        actor_role: currentUser.role,
        details: {
          invited_email: inviteEmail,
          invited_role: inviteRole,
        },
        severity: 'info',
      });
      setInviteSuccess(true);
      setTimeout(() => {
        setDialogOpen(false);
        setInviteEmail('');
        setInviteRole('user');
        setInviteSuccess(false);
        loadUsers();
      }, 1500);
    } catch (err) {} finally {
      setInviting(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">{t.title}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {users.length} {t.totalUsers}
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="bg-primary hover:bg-primary/90">
          <UserPlus className="w-4 h-4 ml-2" /> {t.invite}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">{t.noUsers}</p>
          <p className="text-sm text-muted-foreground mt-1">{t.inviteFirst}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {users.map((u) => (
            <Card key={u.id} className="border-border hover:border-primary/20 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center">
                      <span className="text-sidebar-foreground text-sm font-medium">
                        {getInitials(u.full_name || u.email)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {u.full_name || u.email?.split('@')[0]}
                      </p>
                      <p className="text-sm text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      u.role === 'admin'
                        ? 'bg-primary/10 text-primary'
                        : u.role === 'compliance_officer'
                        ? 'bg-accent/20 text-accent-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {roleLabels[u.role]?.[lang] || u.role}
                    </span>
                    {u.id === currentUser?.id && (
                      <span className="text-xs text-muted-foreground">
                        {lang === 'ar' ? 'أنت' : 'You'}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Invite Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-heading flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              {t.inviteDialog}
            </DialogTitle>
          </DialogHeader>

          {inviteSuccess ? (
            <div className="text-center py-6">
              <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <p className="text-emerald-600 dark:text-emerald-400 font-medium">{t.invited}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label>{t.email}</Label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder={t.emailPlaceholder}
                  dir="ltr"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label>{t.role}</Label>
                <Select value={inviteRole} onValueChange={setInviteRole}>
                  <SelectTrigger className="mt-1.5">
                    <Shield className="w-4 h-4 ml-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">{t.admin}</SelectItem>
                    <SelectItem value="compliance_officer">{t.complianceOfficer}</SelectItem>
                    <SelectItem value="user">{t.userRole}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={inviting}>
              {t.cancel}
            </Button>
            {!inviteSuccess && (
              <Button onClick={handleInvite} disabled={!inviteEmail.trim() || inviting} className="bg-primary">
                {inviting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2" />
                ) : (
                  <Mail className="w-4 h-4 ml-2" />
                )}
                {t.sendInvite}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}