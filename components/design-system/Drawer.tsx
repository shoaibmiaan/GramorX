import * as React from 'react'

export type DrawerProps = { open: boolean; onClose: () => void; side?: 'left'|'right'|'top'|'bottom'; title?: string; children?: React.ReactNode; className?: string; }

export const Drawer: React.FC<DrawerProps> = ({ open, onClose, side='right', title, children, className='' }) => {
  const titleId = React.useId(); const [mounted,setMounted]=React.useState(false)
  React.useEffect(()=>{ if(!open) return; const onKey=(e:KeyboardEvent)=>{ if(e.key==='Escape') onClose() }
    document.addEventListener('keydown',onKey); const prev=document.body.style.overflow; document.body.style.overflow='hidden'; setMounted(true)
    return ()=>{ document.removeEventListener('keydown',onKey); document.body.style.overflow=prev; setMounted(false) }},[open,onClose])
  if(!open) return null
  const pos = side==='right'?'inset-y-0 right-0':side==='left'?'inset-y-0 left-0':side==='top'?'inset-x-0 top-0':'inset-x-0 bottom-0'
  const size = (side==='top'||side==='bottom')?'h-[70vh] max-h-[90vh] w-full':'w-[420px] max-w-[90vw] h-full'
  const start = side==='right'?'translate-x-full':side==='left'?'-translate-x-full':side==='top'?'-translate-y-full':'translate-y-full'
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} aria-hidden="true"/>
      <div role="dialog" aria-modal="true" aria-labelledby={title?titleId:undefined}
        className={['absolute border border-border bg-card text-card-foreground shadow-xl', pos, size, className, 'transition-transform duration-300', mounted?'translate-x-0 translate-y-0':start].join(' ')}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div id={titleId} className="font-semibold">{title}</div>
          <button onClick={onClose} className="rounded-ds p-2 hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background" aria-label="Close">
            <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true"><path fill="currentColor" d="M18.3 5.7 12 12l6.3 6.3-1.4 1.4L10.6 13.4 4.3 19.7 2.9 18.3 9.2 12 2.9 5.7 4.3 4.3l6.3 6.3 6.3-6z"/></svg>
          </button>
        </div>
        <div className="p-5 overflow-auto h-full">{children}</div>
      </div>
    </div>
  )
}
export default Drawer
