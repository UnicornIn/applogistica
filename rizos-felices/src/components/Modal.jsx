import { useEffect, useRef } from 'react';
import { S } from '../lib/store.js';
import { closeModal } from '../lib/ui.js';

export function Modal(){
  const m = S.modal, ref = useRef(null);
  useEffect(() => { if(!m) return; const onKey = e => { if(e.key === 'Escape') closeModal(); }; document.addEventListener('keydown', onKey);
    ref.current?.querySelector('.mb input:not([type=hidden]):not([readonly]), .mb select, .mb textarea, .x')?.focus();
    return () => document.removeEventListener('keydown', onKey); }, [m]);
  if(!m) return null;
  return (
    <div className="ov" onClick={e => { if(e.target === e.currentTarget) closeModal(); }}>
      <div className={'md ' + (m.wide ? 'wide' : '')} role="dialog" aria-modal="true" aria-labelledby="md-t" ref={ref}>
        <div className="mh"><h2 id="md-t">{m.title}</h2><button className="x" aria-label="Cerrar" onClick={closeModal}>×</button></div>
        <div className="mb">{m.body}</div>
      </div>
    </div>
  );
}
export const Toasts = () => <div id="toast" aria-live="polite">{S.toasts.map(t => <div key={t.id} className={'t' + (t.bad ? ' bad' : '')}>{t.msg}</div>)}</div>;
