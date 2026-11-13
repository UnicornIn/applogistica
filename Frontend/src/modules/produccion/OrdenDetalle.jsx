import { useState } from 'react';
import { S } from '../../lib/store.js';
import { L, cfg, bodName, prodName, prod, itemName } from '../../lib/data.js';
import { ctx, isRealAdmin } from '../../lib/access.js';
import { addMov, stock } from '../../lib/inventory.js';
import { db } from '../../services/db.js';
import { N, num, fdt } from '../../lib/format.js';
import { openModal, closeModal, toast, run } from '../../lib/ui.js';
import OpReq from './OpReq.jsx';
import { OP_EST } from './helpers.js';

const upd = (id, data) => db.doc('producciones/' + id).update(data);

async function iniciar(o){ if(await run(() => upd(o.id, { estado: 'en_proceso', fechas: { en_proceso: Date.now() } }), 'Producción iniciada.')) closeModal(); }
async function cancelar(o){ if(await run(() => upd(o.id, { estado: 'cancelada', fechas: { cancelada: Date.now() } }), 'Orden cancelada.')) closeModal(); }

function Terminar({ o }){
  const [real, setReal] = useState(N(o.cantidad));
  const submit = async e => {
    e.preventDefault();
    const n = Math.floor(N(real)), pl = cfg().bodegaPlanta;
    if(!pl){ toast('Configura la bodega de la planta.', true); return; }
    const cons = (prod(o.sku)?.bom || []).map(b => ({ clase: 'in', item: b.insumo, lote: '-', cant: -N(b.cant) * n })).filter(l => l.cant);
    const falta = cons.find(l => stock(pl, 'in', l.item) < -l.cant);
    if(await run(async () => { await addMov('consumo_insumos', pl, cons, o.id); await upd(o.id, { estado: 'por_liberar', cantidadReal: n, fechas: { por_liberar: Date.now() } }); },
      falta ? `Producción terminada. Ojo: el empaque de ${itemName('in', falta.item)} quedó en negativo; registra la entrada que falta.` : 'Producción terminada. El lote pasa a calidad.')) closeModal();
  };
  return (
    <form onSubmit={submit}>
      <label htmlFor="ot-q">Unidades producidas</label>
      <input id="ot-q" type="number" min="0" value={real} onChange={e => setReal(e.target.value)} required />
      <div className="help">Se descuenta el empaque según la fórmula y el lote pasa a calidad.</div>
      <OpReq sku={o.sku} cant={o.cantidad} />
      <div className="btns"><button className="btn pk" type="submit">Terminar producción</button></div>
    </form>
  );
}

function Liberar({ o }){
  const [cant, setCant] = useState(N(o.cantidadReal)); const [obs, setObs] = useState('');
  const liberar = async e => {
    e.preventDefault();
    const q = Math.floor(N(cant)), pl = cfg().bodegaPlanta;
    if(!pl){ toast('Configura la bodega de la planta.', true); return; }
    if(await run(async () => { await addMov('produccion_entrada', pl, [{ clase: 'pt', item: o.sku, lote: o.lote, cant: q }], o.id, obs.trim()); await upd(o.id, { estado: 'liberada', cantidadLiberada: q, observacion: obs.trim(), liberadoPor: S.me?.id || '', fechas: { liberada: Date.now() } }); },
      `Lote ${o.lote} liberado: ${num(q)} unidades en ${bodName(pl)}.`)) closeModal();
  };
  const rechazar = async () => {
    const m = obs.trim(); if(!m){ toast('Escribe el motivo del rechazo en Observación.', true); document.getElementById('ol-r')?.focus(); return; }
    if(await run(() => upd(o.id, { estado: 'rechazada', motivoRechazo: m, liberadoPor: S.me?.id || '', fechas: { rechazada: Date.now() } }), 'Lote rechazado. No entra al inventario.')) closeModal();
  };
  return (<><h3>Liberación del lote</h3>
    <form onSubmit={liberar}>
      <div className="grid2">
        <div><label htmlFor="ol-q">Unidades que se liberan</label><input id="ol-q" type="number" min="0" value={cant} onChange={e => setCant(e.target.value)} required /><div className="help">Entran a {bodName(cfg().bodegaPlanta)}.</div></div>
        <div><label htmlFor="ol-r">Observación o motivo de rechazo</label><input id="ol-r" value={obs} onChange={e => setObs(e.target.value)} /></div>
      </div>
      <div className="btns"><button className="btn pk" type="submit">Liberar lote</button><button className="btn" type="button" onClick={rechazar}>Rechazar lote</button></div>
    </form></>);
}

function Detalle({ id }){
  const o = L('producciones').find(x => x.id === id); if(!o) return null;
  const c = ctx(), puede = isRealAdmin(c) || c.rol === 'planta', cal = isRealAdmin(c) || c.rol === 'calidad', f = o.fechas || {};
  return (<>
    <div className="kv">
      <div><span>Producto</span><b>{prodName(o.sku)}</b></div><div><span>Lote</span><b>{o.lote}</b></div>
      <div><span>Estado</span><b>{OP_EST[o.estado]}</b></div><div><span>Planeado</span><b>{num(o.cantidad)}</b></div>
      {o.cantidadReal != null && <div><span>Producido</span><b>{num(o.cantidadReal)}</b></div>}
      {o.cantidadLiberada != null && <div><span>Liberado</span><b>{num(o.cantidadLiberada)}</b></div>}
    </div>
    {o.nota && <div className="note">{o.nota}</div>}
    {o.motivoRechazo && <div className="err">Rechazado: {o.motivoRechazo}</div>}
    <p className="sub">Planeada {fdt(f.planeada)}{f.en_proceso ? `. Inicio ${fdt(f.en_proceso)}` : ''}{f.por_liberar ? `. Terminada ${fdt(f.por_liberar)}` : ''}{f.liberada ? `. Liberada ${fdt(f.liberada)}` : ''}</p>
    {puede && o.estado === 'planeada' && <div className="btns"><button className="btn pk" onClick={() => iniciar(o)}>Iniciar producción</button><button className="btn ghost" onClick={() => cancelar(o)}>Cancelar orden</button></div>}
    {puede && o.estado === 'en_proceso' && <Terminar o={o} />}
    {cal && o.estado === 'por_liberar' && <Liberar o={o} />}
  </>);
}
export const openOp = id => { if(L('producciones').some(x => x.id === id)) openModal(`Orden ${id}`, <Detalle id={id} />, { wide: true }); };
