import { S, bump } from '../../lib/store.js';
import { DEV_PASOS } from './constants.js';

/* Los 4 pasos del proceso. Con `interactive`, cada paso filtra la lista. */
export default function DevProceso({ D, interactive }){
  const toggle = e => { S.devFiltro = S.devFiltro === e ? 'todas' : e; bump(); };
  return (
    <ol className="proc">
      {DEV_PASOS.map(([e, t, d, who], k) => {
        const n = D.filter(x => x.estado === e).length, on = S.devFiltro === e;
        const inner = <><span className="pn">{k + 1}</span><b>{t}</b><span className="pw">{who}</span><span className="pd">{d}</span>
          {interactive && <span className="pc">{n} {e === 'cerrada' ? 'cerradas' : 'en este paso'}</span>}</>;
        return <li key={e}>{interactive
          ? <button className={'pstep ' + (on ? 'on' : '')} aria-pressed={on} onClick={() => toggle(e)}>{inner}</button>
          : <div className={'pstep ' + (on ? 'on' : '')}>{inner}</div>}</li>;
      })}
    </ol>
  );
}
