import * as React from 'react'
import Link from 'next/link'
import { BellIcon } from '@/lib/icons'
import { useNotifications } from '@/components/notifications/NotificationProvider'

export const NotificationBell: React.FC = () => {
  const [open, setOpen] = React.useState(false)
  const { notifications, unread, markRead } = useNotifications()
  const buttonRef = React.useRef<HTMLButtonElement|null>(null)
  const popoverRef = React.useRef<HTMLDivElement|null>(null)
  const itemsRef = React.useRef<Array<HTMLAnchorElement|HTMLButtonElement|null>>([])

  React.useEffect(()=>{ if(!open) return
    const onDocClick=(e:MouseEvent)=>{ const t=e.target as Node; if(buttonRef.current?.contains(t)) return; if(popoverRef.current?.contains(t)) return; setOpen(false) }
    const onKey=(e:KeyboardEvent)=>{ if(e.key==='Escape'){ setOpen(false); buttonRef.current?.focus() } }
    document.addEventListener('mousedown',onDocClick); document.addEventListener('keydown',onKey)
    return ()=>{ document.removeEventListener('mousedown',onDocClick); document.removeEventListener('keydown',onKey) }
  },[open])

  React.useEffect(()=>{ if(!open) return
    const focusable = itemsRef.current.filter(Boolean) as HTMLElement[]; if(focusable[0]) focusable[0].focus()
    const onKey=(e:KeyboardEvent)=>{ if(!popoverRef.current?.contains(document.activeElement)) return
      const idx = focusable.indexOf(document.activeElement as HTMLElement)
      if(e.key==='ArrowDown'){ e.preventDefault(); focusable[(idx+1)%focusable.length]?.focus() }
      else if(e.key==='ArrowUp'){ e.preventDefault(); focusable[(idx-1+focusable.length)%focusable.length]?.focus() }
      else if(e.key==='Enter' && document.activeElement instanceof HTMLElement){ (document.activeElement as HTMLElement).click() }
    }
    document.addEventListener('keydown',onKey); return ()=>document.removeEventListener('keydown',onKey)
  },[open,notifications])

  const markAllAsRead = async ()=>{ await Promise.all(notifications.filter(n=>!n.read_at).map(n=>markRead(n.id))) }

  return (
    <div className="relative">
      <button ref={buttonRef} type="button" aria-label="Notifications" aria-haspopup="menu" aria-expanded={open} aria-controls="notification-menu"
        onClick={()=>setOpen(v=>!v)}
        className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background">
        <BellIcon className="h-5 w-5" aria-hidden="true"/>
        {unread>0 && <span aria-live="polite" className="absolute -top-1 -right-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-sunsetRed px-1 text-[10px] leading-none text-foreground">{unread}</span>}
      </button>

      {open && (
        <div ref={popoverRef} className="absolute right-0 mt-2 w-80 rounded-ds-2xl border border-border bg-card text-card-foreground shadow-lg z-50">
          <div className="flex items-center justify-between border-b border-border px-3 py-2">
            <span className="text-sm font-semibold">Notifications</span>
            {unread>0 && (
              <button onClick={markAllAsRead}
                className="text-xs text-foreground/70 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-ds px-1.5 py-0.5">
                Mark all as read
              </button>
            )}
          </div>
          <ul id="notification-menu" role="menu" className="max-h-72 overflow-auto text-sm">
            {notifications.map((n,i)=>{
              const isInternal = n.url?.startsWith('/')
              const common = 'flex items-start gap-2 px-3 py-2 hover:bg-muted/60 focus:bg-muted/60 rounded-none'
              const row =
                <div className={n.read_at?'opacity-60':'' + ''}>
                  <div className="font-medium">{n.title}</div>
                  {n.body && <div className="text-sm text-muted-foreground">{n.body}</div>}
                </div>
              return (
                <li key={n.id} role="none">
                  {n.url ? (isInternal ? (
                    <Link href={n.url} role="menuitem" ref={el=>itemsRef.current[i]=el as any} className={common}
                      onClick={()=>{ markRead(n.id); setOpen(false) }}>{row}</Link>
                  ) : (
                    <a href={n.url!} target="_blank" rel="noreferrer" role="menuitem" ref={el=>itemsRef.current[i]=el as any}
                       className={common} onClick={()=>{ markRead(n.id); setOpen(false) }}>{row}</a>
                  )) : (
                    <button role="menuitem" ref={el=>itemsRef.current[i]=el as any}
                      className={common + ' w-full text-left'} onClick={()=>markRead(n.id)}>{row}</button>
                  )}
                </li>
              )
            })}
            {notifications.length===0 && <li className="px-3 py-3 text-muted-foreground">No notifications</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
export default NotificationBell
