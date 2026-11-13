import { S, bump } from '../lib/store.js';
import { ICON, ROLES } from '../lib/constants.js';
import { NAV, badge } from '../lib/access.js';
import { L, bodegas, bodName, cli } from '../lib/data.js';
import { go, closeModal } from '../lib/ui.js';

export default function Shell({ c, a, onLogout, children }){
  const cur = S.view === 'cliente' ? 'clientes' : S.view === 'pedido' ? (S.back || 'pedidos') : S.view;
  const curP = S.preview ? `${S.preview.rol}:${S.preview.bodegaId || S.preview.clienteId || ''}` : 'admin:';
  const onPreview = e => { const [rol, id] = e.target.value.split(':'); S.preview = rol === 'admin' ? null : { rol, bodegaId: rol === 'bodega' ? id : '', clienteId: rol === 'distribuidor' ? id : '' }; S.cart = {}; S.view = null; S.modal = null; window.scrollTo(0, 0); bump(); };
  const exitPreview = () => { S.preview = null; S.cart = {}; go('inicio'); };
  return (
    <div className="shell">
      <aside className="side">
        <div className="brand"><span className="ws" aria-hidden="true">RF</span><span><span className="bn">Rizos Felices</span><span className="bs">Operaciones Colombia</span></span></div>
        <nav className="nav" aria-label="Secciones">
          {(NAV[c.rol] || []).map(([g, items], gi) => (
            <div key={gi} style={{ display: 'contents' }}>
              {g && <div className="grp">{g}</div>}
              {items.map(([v, t]) => { const n = badge(v, c); return (
                <button key={v} className={cur === v ? 'on' : ''} onClick={() => go(v)}>
                  <span className="lft"><span className="ni" aria-hidden="true">{ICON[v] || ''}</span><span>{t}</span></span>{n ? <span className="badge">{n}</span> : null}
                </button>); })}
            </div>
          ))}
        </nav>
        <div className="who">
          <b>{ROLES[a.rol]}</b>{a.bodegaId ? bodName(a.bodegaId) : ''}{a.clienteId ? (cli(a.clienteId)?.nombre || '') : ''}
          {a.rol === 'admin' && (
            <select value={curP} onChange={onPreview} aria-label="Ver la plataforma como">
              <option value="admin:">Ver como: super admin</option>
              <optgroup label="Distribuidor">{L('clientes').filter(x => x.activo !== false).map(x => <option key={x.id} value={'distribuidor:' + x.id}>{x.nombre}</option>)}</optgroup>
              <optgroup label="Bodega">{bodegas().map(b => <option key={b.id} value={'bodega:' + b.id}>{b.nombre}</option>)}</optgroup>
              <optgroup label="Otros"><option value="planta:">Planta</option><option value="calidad:">Calidad</option><option value="facturacion:">Facturación</option></optgroup>
            </select>
          )}
          <button className="btn ghost sm" style={{ marginTop: 8 }} onClick={onLogout}>Cerrar sesión</button>
        </div>
      </aside>
      <main className="main" id="main">
        {c.preview && <div className="preview"><span>Estás viendo la plataforma como {ROLES[c.rol]}{c.bodegaId ? ' de ' + bodName(c.bodegaId) : ''}{c.clienteId ? ': ' + (cli(c.clienteId)?.nombre || '') : ''}.</span><button className="btn sm" onClick={exitPreview}>Volver a super admin</button></div>}
        {children}
      </main>
    </div>
  );
}
