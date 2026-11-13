import { useState } from 'react';
import { S } from '../../lib/store.js';
import { ROLES } from '../../lib/constants.js';
import { L, bodegas } from '../../lib/data.js';
import { db } from '../../services/db.js';
import { search } from '../../services/auth.js';
import { safeId } from '../../lib/format.js';
import { openModal, closeModal, toast, run } from '../../lib/ui.js';
import { Uname } from '../../components/ui.jsx';

function Form({ id }){
  const u = L('usuarios').find(x => x.id === id) || {};
  const [hits, setHits] = useState(null); const [picked, setPicked] = useState({ id: '', name: '' });
  const buscar = q => setHits(search(q));
  const submit = async ev => {
    ev.preventDefault(); const e = ev.currentTarget.elements;
    const uid = (id || picked.id || e.code?.value || '').trim();
    if(!uid){ toast('Busca a la persona o pega su código.', true); return; }
    const rol = e.rol.value;
    if(rol === 'bodega' && !e.bodegaId.value){ toast('Elige la bodega.', true); return; }
    if(rol === 'distribuidor' && !e.clienteId.value){ toast('Elige el cliente.', true); return; }
    if(safeId(uid) !== uid){ toast('El código no es válido.', true); return; }
    const ok = await run(async () => {
      await db.doc('usuarios/' + uid).set({ rol, bodegaId: rol === 'bodega' ? e.bodegaId.value : '', clienteId: rol === 'distribuidor' ? e.clienteId.value : '', etiqueta: e.etiqueta.value.trim(), activo: e.activo.checked, asignadoPor: S.me?.id || '', fecha: Date.now() });
      if(L('solicitudes').some(s => s.id === uid)) await db.doc('solicitudes/' + uid).delete();
    }, 'Acceso guardado.');
    if(ok) closeModal();
  };
  return (
    <form onSubmit={submit}>
      {id ? <p>Persona: <b><Uname id={id} /></b></p> : (<>
        <label htmlFor="u-s">Buscar en tu organización</label>
        <input id="u-s" placeholder="Nombre o correo" autoComplete="off" onFocus={e => { if(!e.target.value) buscar(''); }} onChange={e => buscar(e.target.value)} />
        <div className="ures">
          {hits && !hits.length && <p className="sub">Sin resultados en tu organización. Usa el código de la persona.</p>}
          {hits && hits.map(h => <button key={h.id} type="button" onClick={() => { setPicked(h); setHits(null); }}><b>{h.name}</b></button>)}
        </div>
        <label htmlFor="u-code">O pega el código que ve la persona</label><input id="u-code" name="code" placeholder="u_…" />
        <p className="sub">{picked.name && 'Seleccionado: ' + picked.name}</p></>)}
      <div className="grid2">
        <div><label htmlFor="u-r">Rol</label><select id="u-r" name="rol" defaultValue={u.rol}>{Object.entries(ROLES).map(([k, t]) => <option key={k} value={k}>{t}</option>)}</select></div>
        <div><label htmlFor="u-e">Etiqueta (opcional)</label><input id="u-e" name="etiqueta" defaultValue={u.etiqueta || ''} placeholder="Cargo o empresa" /></div>
        <div><label htmlFor="u-b">Bodega (solo rol Bodega)</label><select id="u-b" name="bodegaId" defaultValue={u.bodegaId || ''}><option value="">—</option>{bodegas().map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}</select></div>
        <div><label htmlFor="u-c">Cliente (solo rol Distribuidor)</label><select id="u-c" name="clienteId" defaultValue={u.clienteId || ''}><option value="">—</option>{L('clientes').map(x => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select></div>
      </div>
      <label className="inline"><input type="checkbox" name="activo" defaultChecked={u.activo !== false} /> Acceso activo</label>
      <p className="help">Los roles Super admin y Configuración requieren que la persona también sea Editora del artifact en el menú Compartir.</p>
      <div className="btns"><button className="btn pk" type="submit">Guardar acceso</button></div>
    </form>
  );
}
export const openUsuario = id => openModal(id ? 'Acceso de usuario' : 'Agregar usuario', <Form id={id || ''} />);
