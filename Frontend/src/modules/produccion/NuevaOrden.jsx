import { useState } from 'react';
import { S } from '../../lib/store.js';
import { activos } from '../../lib/data.js';
import { db } from '../../services/db.js';
import { N, rid } from '../../lib/format.js';
import { openModal, closeModal, toast, run, go } from '../../lib/ui.js';
import OpReq from './OpReq.jsx';
import { defLote } from './helpers.js';

function Form({ sku0, q0 }){
  const ps = activos();
  const [sku, setSku] = useState(sku0); const [cantidad, setCantidad] = useState(q0 || '');
  const [lote, setLote] = useState(defLote(sku0)); const [nota, setNota] = useState('');
  const cambiarSku = v => { setSku(v); setLote(defLote(v)); };
  const submit = async e => {
    e.preventDefault(); const id = rid('OP');
    if(await run(() => db.doc('producciones/' + id).set({ sku, cantidad: Math.floor(N(cantidad)), lote: lote.trim(), nota: nota.trim(), estado: 'planeada', fechas: { planeada: Date.now() }, creadoPor: S.me?.id || '' }), 'Orden creada.')){
      closeModal(); if(S.view !== 'produccion') go('produccion');
    }
  };
  return (
    <form onSubmit={submit}>
      <label htmlFor="op-s">Producto</label>
      <select id="op-s" value={sku} onChange={e => cambiarSku(e.target.value)}>{ps.map(p => <option key={p.id} value={p.id}>{p.nombre} ({p.id})</option>)}</select>
      <div className="grid2">
        <div><label htmlFor="op-q">Cantidad</label><input id="op-q" type="number" min="1" value={cantidad} onChange={e => setCantidad(e.target.value)} required /></div>
        <div><label htmlFor="op-l">Lote</label><input id="op-l" value={lote} onChange={e => setLote(e.target.value)} required /></div>
      </div>
      <div><OpReq sku={sku} cant={cantidad} /></div>
      <label htmlFor="op-n">Nota</label><input id="op-n" value={nota} onChange={e => setNota(e.target.value)} />
      <div className="btns"><button className="btn pk" type="submit">Crear orden</button></div>
    </form>
  );
}
export function openNuevaOrden(sku, q){
  const ps = activos(); if(!ps.length){ toast('El catálogo está vacío.', true); return; }
  openModal('Nueva orden de producción', <Form sku0={sku || ps[0].id} q0={q} />, { wide: true });
}
