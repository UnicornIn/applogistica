import { S } from '../lib/store.js';
import { ICON, FLOW, EST } from '../lib/constants.js';
import { profiles } from '../services/auth.js';

export const Head = ({ t, sub, right }) => (
  <header className="ph"><div>{ICON[S.view] && <div className="pi" aria-hidden="true">{ICON[S.view]}</div>}<h1>{t}</h1>{sub && <p className="lede">{sub}</p>}</div>
    {right && <div className="btns" style={{ margin: 0 }}>{right}</div>}</header>
);
export const Table = ({ heads, rows, foot }) => (
  <div className="tw"><table><thead><tr>{heads.map((h, i) => typeof h === 'string' ? <th key={i}>{h}</th> : <th key={i} className={h[1]}>{h[0]}</th>)}</tr></thead><tbody>{rows}</tbody>{foot}</table></div>
);
export const Empty = ({ children, btn }) => <div className="empty">{children}{btn && <div>{btn}</div>}</div>;
export const Pipe = ({ estado, flow = FLOW, big }) => {
  const i = estado === 'cancelado' || estado === 'rechazada' ? -1 : flow.indexOf(estado === 'asignado' ? 'recibido' : estado);
  return <div className={'pipe ' + (big ? 'big' : '')}>{flow.map((_, k) => <span key={k} className={k < i ? 'on' : k === i ? 'cur' : ''} />)}</div>;
};
export const EstChip = ({ e }) => <span className={'chip ' + (e === 'facturado' ? 'pk' : e === 'cancelado' ? 'ol' : (e === 'recibido' || e === 'asignado') ? 'bk' : '')}>{EST[e] || e}</span>;
export const Uname = ({ id, fb = 'Usuario' }) => id ? <span>{profiles([id])[id]?.name || fb}</span> : '—';
