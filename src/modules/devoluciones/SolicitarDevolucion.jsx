import { useState } from 'react';
import { S } from '../../lib/store.js';
import { L, prodName } from '../../lib/data.js';
import { ctx } from '../../lib/access.js';
import { db } from '../../services/db.js';
import { N, num, fd, money, rid } from '../../lib/format.js';
import { openModal, closeModal, toast, run } from '../../lib/ui.js';
import { Table } from '../../components/ui.jsx';

const MOTIVOS = ['Producto dañado', 'Sin rotación', 'Error en el pedido', 'Otro'];

function Form({ peds }){
  const [pedido, setPedido] = useState(''); const [q, setQ] = useState({});
  const [motivo, setMotivo] = useState(MOTIVOS[0]); const [nota, setNota] = useState('');
  const p = L('pedidos').find(x => x.id === pedido);
  const submit = async e => {
    e.preventDefault();
    if(!p){ toast('Elige el pedido.', true); return; }
    const items = (p.items || []).map(i => ({ sku: i.sku, precio: N(i.precio), cant: Math.min(N(i.cant), Math.floor(N(q[i.sku]))) })).filter(i => i.cant > 0);
    if(!items.length){ toast('Indica cuántas unidades devuelves.', true); return; }
    const id = rid('D');
    if(await run(() => db.doc('devoluciones/' + id).set({ clienteId: ctx().clienteId, pedidoId: p.id, items, motivo, nota: nota.trim(), estado: 'solicitada', fechas: { solicitada: Date.now() }, creadoPor: S.me?.id || '' }), 'Solicitud enviada. Rizos Felices te confirmará a qué bodega enviarla.')) closeModal();
  };
  return (<>
    <p className="sub">Paso 1 de 4. Rizos Felices la revisa y te indica a qué bodega enviar el producto.</p>
    <form onSubmit={submit}>
      <label htmlFor="dv-p">Pedido</label>
      <select id="dv-p" value={pedido} onChange={e => { setPedido(e.target.value); setQ({}); }} required>
        <option value="">Elige el pedido</option>{peds.map(x => <option key={x.id} value={x.id}>{x.id} ({fd(x.fechas?.despachado)}, {money(x.total)})</option>)}
      </select>
      <div>{p && <><label>Unidades a devolver</label>
        <Table heads={['Producto', ['Pedidas', 'r'], ['Devolver', 'r']]}
          rows={(p.items || []).map(i => <tr key={i.sku}><td>{i.nombre || prodName(i.sku)}</td><td className="r">{num(i.cant)}</td>
            <td className="r"><input type="number" min="0" max={N(i.cant)} value={q[i.sku] ?? ''} onChange={e => setQ({ ...q, [i.sku]: e.target.value })} aria-label={'Unidades a devolver de ' + (i.nombre || i.sku)} /></td></tr>)} /></>}</div>
      <label htmlFor="dv-m">Motivo</label>
      <select id="dv-m" value={motivo} onChange={e => setMotivo(e.target.value)} required>{MOTIVOS.map(m => <option key={m}>{m}</option>)}</select>
      <label htmlFor="dv-n">Detalle</label>
      <textarea id="dv-n" value={nota} onChange={e => setNota(e.target.value)} placeholder="Cuéntanos qué pasó" />
      <div className="btns"><button className="btn pk" type="submit">Enviar solicitud</button></div>
    </form>
  </>);
}
export function openDevNueva(){
  const c = ctx();
  const peds = L('pedidos').filter(p => p.clienteId === c.clienteId && ['despachado', 'facturado'].includes(p.estado)).sort((a, b) => (b.fechas?.despachado || 0) - (a.fechas?.despachado || 0));
  if(!peds.length){ toast('Solo puedes devolver producto de pedidos ya despachados.', true); return; }
  openModal('Solicitar devolución', <Form peds={peds} />);
}
