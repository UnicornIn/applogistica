import { S, bump } from '../lib/store.js';
import { PRESETS } from '../lib/constants.js';

/* Filtro de fechas: presets + desde/hasta. Comparte el rango (S.rango) con todos los módulos. */
export default function DateBar({ label = 'Fecha' }){
  const r = S.rango, custom = r.p === 'custom';
  const setPreset = p => { S.rango = { p, d: '', h: '' }; bump(); };
  const setDates = (d, h) => { S.rango = (d || h) ? { p: 'custom', d, h } : { p: 'todo', d: '', h: '' }; bump(); };
  return (
    <div className="bar datebar" role="group" aria-label="Filtro de fechas">
      <span className="sub">{label}</span>
      <div className="seg">
        {PRESETS.map(([k, t]) => <button key={k} className={r.p === k ? 'on' : ''} aria-pressed={r.p === k} onClick={() => setPreset(k)}>{t}</button>)}
      </div>
      <label className="mini">Desde <input type="date" value={custom ? r.d : ''} onChange={e => setDates(e.target.value, custom ? r.h : '')} /></label>
      <label className="mini">Hasta <input type="date" value={custom ? r.h : ''} onChange={e => setDates(custom ? r.d : '', e.target.value)} /></label>
    </div>
  );
}
