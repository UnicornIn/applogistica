import { S } from '../../lib/store.js';
import { L, bodName, prodName } from '../../lib/data.js';
import { ctx, isRealAdmin } from '../../lib/access.js';
import { addMov, pick } from '../../lib/inventory.js';
import { db } from '../../services/db.js';
import { N, num, fdt } from '../../lib/format.js';
import { openModal, closeModal, toast, run } from '../../lib/ui.js';
import { Table } from '../../components/ui.jsx';
import { TR_EST } from './constants.js';

const upd = (id, data) => db.doc('traslados/' + id).update(data);

async function despachar(t){
  if(!t || t.estado !== 'pendiente') return;
  const picks = (t.items || []).map(i => pick(t.origen, 'pt', i.sku, i.cant));
  if(picks.some(r => r.faltante > 0)){ toast('No hay stock suficiente en el origen.', true); return; }
  const lineas = picks.flatMap(r => r.lineas);
  if(await run(async () => { await addMov('traslado_salida', t.origen, lineas.map(l => ({ ...l, cant: -l.cant })), t.id); await upd(t.id, { estado: 'en_transito', lineas, fechas: { en_transito: Date.now() } }); }, 'Traslado despachado.')) closeModal();
}
async function recibir(t){
  if(!t || t.estado !== 'en_transito') return;
  if(await run(async () => { await addMov('traslado_entrada', t.destino, t.lineas || [], t.id); await upd(t.id, { estado: 'recibido', fechas: { recibido: Date.now() } }); }, 'Traslado recibido.')) closeModal();
}
const cancelar = async t => { if(await run(() => upd(t.id, { estado: 'cancelado', fechas: { cancelado: Date.now() } }), 'Traslado cancelado.')) closeModal(); };

function Detalle({ id }){
  const t = L('traslados').find(x => x.id === id); if(!t) return null;
  const c = ctx();
  const canO = isRealAdmin(c) || (c.rol === 'bodega' && c.bodegaId === t.origen);
  const canD = isRealAdmin(c) || (c.rol === 'bodega' && c.bodegaId === t.destino);
  const pk = t.estado === 'pendiente' && canO ? (t.items || []).map(i => pick(t.origen, 'pt', i.sku, i.cant)) : [];
  const falta = pk.some(r => r.faltante > 0);
  return (<>
    <div className="kv">
      <div><span>Desde</span><b>{bodName(t.origen)}</b></div><div><span>Hacia</span><b>{bodName(t.destino)}</b></div>
      <div><span>Estado</span><b>{TR_EST[t.estado]}</b></div><div><span>Creado</span><b>{fdt(t.fechas?.creado)}</b></div>
    </div>
    {t.nota && <div className="note">{t.nota}</div>}
    {t.lineas?.length
      ? <Table heads={['Producto', 'Lote', ['Unidades', 'r']]} rows={t.lineas.map((l, i) => <tr key={i}><td>{prodName(l.item)}</td><td>{l.lote}</td><td className="r">{num(l.cant)}</td></tr>)} />
      : <Table heads={['Producto', ['Unidades', 'r']]} rows={(t.items || []).map(i => <tr key={i.sku}><td>{prodName(i.sku)}</td><td className="r">{num(i.cant)}</td></tr>)} />}
    {t.estado === 'pendiente' && canO && (<>
      <h3>Alistamiento</h3>
      <Table heads={['Producto', 'Lote', ['Unidades', 'r']]} rows={pk.flatMap((r, a) => r.lineas.map((l, b) => <tr key={a + '-' + b}><td>{prodName(l.item)}</td><td><b>{l.lote}</b></td><td className="r">{num(l.cant)}</td></tr>))} />
      {falta ? <div className="err">No hay stock suficiente en el origen para este traslado.</div>
        : <div className="btns"><button className="btn pk" onClick={() => despachar(t)}>Despachar traslado</button></div>}
    </>)}
    {t.estado === 'en_transito' && canD && <div className="btns"><button className="btn pk" onClick={() => recibir(t)}>Confirmar recepción</button></div>}
    {t.estado === 'pendiente' && isRealAdmin(c) && <div className="btns"><button className="btn ghost" onClick={() => cancelar(t)}>Cancelar traslado</button></div>}
  </>);
}
export const openTras = id => { if(L('traslados').some(x => x.id === id)) openModal(`Traslado ${id}`, <Detalle id={id} />, { wide: true }); };
