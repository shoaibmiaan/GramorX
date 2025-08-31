import React, { useEffect, useMemo, useState } from 'react';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { RoleGuard } from '@/components/auth/RoleGuard';
import { Container } from '@/components/design-system/Container';
import { Card } from '@/components/design-system/Card';
import { Button } from '@/components/design-system/Button';
import { Badge } from '@/components/design-system/Badge';
import { Input } from '@/components/design-system/Input';
import { Modal } from '@/components/design-system/Modal';
import type { Profile } from '@/types/profile';

const ROLES: Profile['role'][] = ['student','teacher','admin'];

function AdminUsers() {
  const [loading, setLoading] = useState(true);
  const [changingId, setChangingId] = useState<string | null>(null);
  const [rows, setRows] = useState<Profile[]>([]);
  const [q, setQ] = useState('');
  const [pinEmail, setPinEmail] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [pinBusy, setPinBusy] = useState(false);
  const [pinMsg, setPinMsg] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabaseBrowser
      .from('profiles')
      .select('id, full_name, role, email')
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

  const openPin = (email: string | null) => {
    setPinEmail(email);
    setPin('');
    setPinMsg(null);
  };

  const closePin = () => {
    setPinEmail(null);
    setPin('');
    setPinMsg(null);
  };

  const generatePin = () => {
    const len = Math.floor(Math.random() * 3) + 4; // 4-6
    let s = '';
    for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
    setPin(s);
  };

  const callPinApi = async (path: string, body: any) => {
    if (!pinEmail) return;
    setPinBusy(true);
    setPinMsg(null);
    try {
      const { data } = await supabaseBrowser.auth.getSession();
      const tok = data?.session?.access_token;
      if (!tok) {
        setPinMsg('No session');
        return;
      }
      const r = await fetch(path, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${tok}`,
        },
        body: JSON.stringify(body),
      });
      const j = await r.json();
      if (j?.ok) setPinMsg('Success');
      else setPinMsg(j?.error || j?.reason || 'Failed');
    } catch (e: any) {
      setPinMsg(e?.message || 'Error');
    } finally {
      setPinBusy(false);
    }
  };

  const savePin = () => callPinApi('/api/admin/premium/set-pin', { email: pinEmail, newPin: pin });
  const clearPin = () => callPinApi('/api/admin/premium/clear-pin', { email: pinEmail });

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
                  <th className="px-5 py-3 text-xs uppercase tracking-wider">Premium PIN</th>
                  <th className="px-5 py-3 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td className="px-5 py-4" colSpan={5}>
                      <div className="animate-pulse h-5 w-40 bg-gray-200 dark:bg-white/10 rounded" />
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td className="px-5 py-6 text-grayish" colSpan={5}>No users found.</td>
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
                        <Button
                          variant="secondary"
                          onClick={() => openPin(u.email ?? null)}
                          disabled={!u.email}
                        >
                          Manage
                        </Button>
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
        <Modal
          open={!!pinEmail}
          onClose={closePin}
          title="Manage Premium PIN"
          footer={
            <div className="flex justify-between items-center gap-2">
              <Button variant="ghost" onClick={clearPin} disabled={pinBusy}>Clear PIN</Button>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={generatePin} disabled={pinBusy}>Generate</Button>
                <Button onClick={savePin} disabled={!/^\d{4,6}$/.test(pin) || pinBusy} loading={pinBusy}>Save</Button>
              </div>
            </div>
          }
        >
          <Input
            label="New PIN"
            value={pin}
            onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            type="password"
            placeholder="4-6 digits"
          />
          {pinMsg && <p className="mt-2 text-sm">{pinMsg}</p>}
        </Modal>
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
