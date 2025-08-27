// components/design-system/UserMenu.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { supabaseBrowser } from '@/lib/supabaseBrowser';
import { useLocale } from '@/lib/locale';
import { useToast } from './Toast';

type MenuItem = {
  label: string;
  href?: string;
  onClick?: () => void | Promise<void>;
  icon?: React.ReactNode;
};

export const UserMenu: React.FC<{
  userId: string;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  className?: string;
  items?: MenuItem[];          // You can pass Profile/Account items from Header
  onAvatarChange?: (url: string) => void; // callback after successful upload
  onSignOut?: () => void | Promise<void>;
  showEmail?: boolean;
}> = ({
  userId,
  email = null,
  name = null,
  avatarUrl = null,
  className = '',
  items,
  onAvatarChange,
  onSignOut,
  showEmail = true,
}) => {
  const { locale, setLocale, t } = useLocale();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localAvatar, setLocalAvatar] = useState<string | null>(avatarUrl ?? null);
  const { error: toastError } = useToast();

  const btnRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const itemRefs = useRef<Array<HTMLAnchorElement | HTMLButtonElement | null>>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => setLocalAvatar(avatarUrl ?? null), [avatarUrl]);

  const fallbackInitial = (name?.[0] || email?.[0] || 'U').toUpperCase();

  const defaultItems: MenuItem[] = useMemo(() => {
    const base: MenuItem[] = [
      { label: 'Profile', href: '/profile', icon: <i className="fas fa-id-badge" aria-hidden /> },
      { label: 'Account', href: '/account', icon: <i className="fas fa-user" aria-hidden /> },
    ];
    if (onSignOut) base.push({ label: 'Sign out', onClick: onSignOut, icon: <i className="fas fa-sign-out-alt" aria-hidden /> });
    return base;
  }, [onSignOut]);

  const _items = items?.length ? items : defaultItems;

  // close on outside click + Esc
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!open) return;
      const t = e.target as Node;
      if (btnRef.current?.contains(t)) return;
      if (listRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === 'Escape') {
        setOpen(false);
        btnRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const focusItem = (idx: number) => itemRefs.current[idx] && (itemRefs.current[idx] as HTMLElement).focus();

  const onButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
      setTimeout(() => focusItem(0), 0);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setTimeout(() => focusItem(_items.length - 1), 0);
    }
  };

  const onMenuKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIndex = itemRefs.current.findIndex((n) => n === document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      focusItem((currentIndex + 1) % _items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      focusItem((currentIndex - 1 + _items.length) % _items.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      focusItem(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      focusItem(_items.length - 1);
    }
  };

  const triggerUpload = () => fileRef.current?.click();

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toastError('Please select a JPG, PNG, or WEBP image.');
      return;
    }
    if (file.size > 3 * 1024 * 1024) {
      toastError('Image too large. Max 3 MB.');
      return;
    }

    setUploading(true);
    try {
      // Path like: <uid>/avatar-<timestamp>.<ext>
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${userId}/avatar-${Date.now()}.${ext}`;

      const { error: upErr } = await supabaseBrowser
        .storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (upErr) throw upErr;

      const { data: pub } = supabaseBrowser.storage.from('avatars').getPublicUrl(path);
      const publicUrl = pub.publicUrl;

      // Save to user metadata so Header/session can use it
      const { error: updErr } = await supabaseBrowser.auth.updateUser({ data: { avatar_url: publicUrl } });
      if (updErr) throw updErr;

      const { error: profErr } = await supabaseBrowser
        .from('user_profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', userId);
      if (profErr) throw profErr;

      setLocalAvatar(publicUrl);
      onAvatarChange?.(publicUrl);
    } catch (err: any) {
      console.error(err);
      toastError(err?.message || 'Could not upload image. Please try again.');
    } finally {
      setUploading(false);
      // keep menu open to show immediate change
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="user-menu"
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onButtonKeyDown}
        className="h-9 w-9 rounded-full bg-vibrantPurple/15 text-vibrantPurple font-semibold flex items-center justify-center hover:bg-vibrantPurple/25 focus:outline-none focus:ring-2 focus:ring-vibrantPurple"
        title={email ?? name ?? 'User'}
      >
        {localAvatar ? (
          // Using <img> here to avoid Next remote domain config issues
          // eslint-disable-next-line @next/next/no-img-element
          <img src={localAvatar} alt="" className="h-9 w-9 rounded-full object-cover" decoding="async" />
        ) : (
          fallbackInitial
        )}
      </button>

      {open && (
        <div
          id="user-menu"
          role="menu"
          ref={listRef}
          tabIndex={-1}
          onKeyDown={onMenuKeyDown}
          className="absolute right-0 mt-2 w-64 rounded-2xl border border-vibrantPurple/20 bg-lightBg dark:bg-dark shadow-lg overflow-hidden"
        >
          {showEmail && (email || name) && (
            <div className="px-4 py-3 text-small text-grayish dark:text-white/70 border-b border-vibrantPurple/15">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-vibrantPurple/15 flex items-center justify-center overflow-hidden">
                  {localAvatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={localAvatar} alt="" className="h-9 w-9 object-cover" decoding="async" />
                  ) : (
                    <span className="text-vibrantPurple font-semibold">{fallbackInitial}</span>
                  )}
                </div>
                <div>
                  <div className="font-medium text-lightText dark:text-white">{name ?? email}</div>
                  {email && name && <div className="opacity-80">{email}</div>}
                </div>
              </div>

              {/* Change photo action */}
              <div className="mt-3">
                <button
                  onClick={triggerUpload}
                  className="text-small px-3 py-2 rounded-ds bg-vibrantPurple/10 hover:bg-vibrantPurple/15 font-medium"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading…' : 'Change photo'}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleFile}
                />
              </div>
            </div>
          )}

          <div className="px-4 py-3 border-b border-vibrantPurple/15">
            <label className="block text-small mb-1">{t('userMenu.language')}</label>
            <select
              className="w-full rounded-md bg-lightBg dark:bg-dark border border-vibrantPurple/20 px-2 py-1"
              value={locale}
              onChange={async (e) => {
                const lang = e.target.value;
                setLocale(lang);
                await supabaseBrowser
                  .from('user_profiles')
                  .update({ preferred_language: lang })
                  .eq('user_id', userId);
              }}
            >
              <option value="en">English</option>
              <option value="ur">Urdu</option>
              <option value="ar">Arabic</option>
              <option value="hi">Hindi</option>
            </select>
          </div>

          <div className="py-1">
            {_items.map((it, idx) => {
              const common =
                'w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-vibrantPurple/10 focus:bg-vibrantPurple/10 focus:outline-none';
              if (it.href) {
                const isInternal = it.href.startsWith('/') || it.href.startsWith('#');
                return isInternal ? (
                  <Link
                    key={it.label}
                    href={it.href}
                    role="menuitem"
                    ref={(el) => (itemRefs.current[idx] = el)}
                    className={common}
                    onClick={() => setOpen(false)}
                  >
                    {it.icon} <span>{it.label}</span>
                  </Link>
                ) : (
                  <a
                    key={it.label}
                    href={it.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    ref={(el) => (itemRefs.current[idx] = el)}
                    className={common}
                    onClick={() => setOpen(false)}
                  >
                    {it.icon} <span>{it.label}</span>
                  </a>
                );
              }
              return (
                <button
                  key={it.label}
                  type="button"
                  role="menuitem"
                  ref={(el) => (itemRefs.current[idx] = el)}
                  className={common}
                  onClick={async () => {
                    await it.onClick?.();
                    setOpen(false);
                  }}
                >
                  {it.icon} <span>{it.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
