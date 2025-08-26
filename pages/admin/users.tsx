import React, { useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Input } from '@/components/design-system/Input';

type Profile = {
  id: string;
  full_name?: string | null;
  role: 'student' | 'teacher' | 'admin';
};

const ROLES: Profile['role'][] = ['student','teacher','admin'];

function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [changingId, setChangingId] = useState<string | null>(null);
  const [rows, setRows] = useState<Profile[]>([]);
  const [q, setQ] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabaseBrowser
      .from('profiles')
      .select('id, full_name, role')
      .order('full_name', { ascending: true, nullsFirst: true });

    if (error) {
      console.error(error);
      setRows([]);
    } else {
      setRows(data as Profile[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter(r =>
      (r.full_name ?? '').toLowerCase().includes(needle) ||
      r.id.toLowerCase().includes(needle) ||
      r.role.toLowerCase().includes(needle)
    );
  }, [rows, q]);

  const changeRole = async (id: string, newRole: Profile['role']) => {
    try {
      setChangingId(id);
      const { error } = await supabaseBrowser.rpc('admin_set_role', {
        target: id,
        new_role: newRole,
      });
      if (error) throw error;
      // Optimistic update
      setRows(prev => prev.map(p => (p.id === id ? { ...p, role: newRole } : p)));
    } catch (e) {
      console.error(e);
      alert('Failed to change role. Ensure you are admin and RPC/RLS are set.');
    } finally {
      setChangingId(null);
    }
  };

  return (
    <section className="py-24 bg-lightBg dark:bg-gradient-to-br dark:from-dark/80 dark:to-darker/90">
      <Container>
        <div className="mb-8">
          <h1 className="font-slab text-4xl mb-2 text-gradient-primary">Users</h1>
          <p className="text-grayish">View all users and set roles.</p>
        </div>

        <Card className="p-6 rounded-ds-2xl mb-6">
          <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="info">{rows.length} total</Badge>
              <Badge variant="secondary">{filtered.length} shown</Badge>
            </div>
            <div className="flex gap-3">
              <Input
                value={q}
                onChange={e => setQ(e.target.value)}
                placeholder="Search by name, id, or role"
              />
              <Button onClick={fetchUsers} variant="secondary">Refresh</Button>
            </div>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden rounded-ds-2xl">
          <div className="w-full overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="border-b border-black/5 dark:border-white/10">
                  <th className="px-5 py-3 text-xs uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider">User ID</th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider">Role</th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-5 py-4" colSpan={4}>
                      <div className="animate-pulse h-5 w-40 bg-gray-200 dark:bg-white/10 rounded" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td className="px-5 py-6 text-grayish" colSpan={4}>No users found.</td>
                  </tr>
                ) : (
                  filtered.map(u => (
                    <tr key={u.id} className="border-t border-black/5 dark:border-white/10">
                      <td className="px-5 py-4 font-medium">{u.full_name ?? '–'}</td>
                      <td className="px-5 py-4 text-sm text-grayish">{u.id}</td>
                      <td className="px-5 py-4">
                        <Badge variant={u.role === 'admin' ? 'warning' : u.role === 'teacher' ? 'info' : 'secondary'}>
                          {u.role}
                        </Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            className="px-3 py-2 rounded-ds border border-black/10 dark:border-white/10 bg-white dark:bg-dark"
                            value={u.role}
                            onChange={e => changeRole(u.id, e.target.value as Profile['role'])}
                            disabled={changingId === u.id}
                          >
                            {ROLES.map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                          <Button
                            onClick={() => fetchUsers()}
                            variant="ghost"
                            disabled={changingId === u.id}
                          >
                            Reload
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </Container>
    </section>
  );
}

export default function AdminUsersPage() {
  return (
    <RoleGuard allow="admin">
      <AdminUsers />
    </RoleGuard>
  );
}
