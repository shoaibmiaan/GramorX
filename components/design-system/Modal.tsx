import * as React from 'react'
export type ModalProps = { open: boolean; onClose: () => void; title?: string; children?: React.ReactNode; footer?: React.ReactNode; className?: string; }

export const Modal: React.FC<ModalProps> = ({ open, onClose, title, children, footer, className='' }) => {
  const titleId = React.useId(); const [mounted,setMounted]=React.useState(false)
  React.useEffect(()=>{ if(!open) return; const onKey=(e:KeyboardEvent)=>{ if(e.key==='Escape') onClose() }
    document.addEventListener('keydown',onKey); const prev=document.body.style.overflow; document.body.style.overflow='hidden'; setMounted(true)
    return ()=>{ document.removeEventListener('keydown',onKey); document.body.style.overflow=prev; setMounted(false) }},[open,onClose])
  if(!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true"/>
      <div role="dialog" aria-modal="true" aria-labelledby={title?titleId:undefined}
        className={['relative w-full max-w-lg border border-border bg-card text-card-foreground rounded-ds-2xl shadow-xl transition duration-200', mounted?'opacity-100 scale-100':'opacity-0 scale-95', className].join(' ')}>
        {title && <div id={titleId} className="px-6 pt-5 pb-3 border-b border-border text-h3 font-semibold">{title}</div>}
        <div className="px-6 py-5">{children}</div>
        {footer && <div className="px-6 pt-3 pb-5 border-t border-border">{footer}</div>}
        <button onClick={onClose} className="absolute top-3 right-3 rounded-ds p-2 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" aria-label="Close">
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6z"/></svg>
        </button>
      </div>
    </div>
  )
}
export default Modal
