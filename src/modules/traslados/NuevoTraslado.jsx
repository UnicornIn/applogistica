import { useState } from 'react';
import { bodegas, activos, prodName } from '../../lib/data.js';
import { dispB } from '../../lib/inventory.js';
import { db } from '../../services/db.js';
import { S } from '../../lib/store.js';
import { N, num, rid } from '../../lib/format.js';
import { openModal, closeModal, toast, run } from '../../lib/ui.js';
import { Table } from '../../components/ui.jsx';

function Form(){
  const bs = bodegas();
  const [origen, setOrigen] = useState(bs[0].id);
  const [destino, setDestino] = useState(bs[1].id);
  const [q, setQ] = useState({}); const [nota, setNota] = useState('');
  const cambiarOrigen = v => { setOrigen(v); setQ({}); };
  const submit = async e => {
    e.preventDefault();
    if(origen === destino){ toast('El origen y el destino deben ser distintos.', true); return; }
    const items = activos().map(p => ({ sku: p.id, cant: Math.floor(N(q[p.id])) })).filter(i => i.cant > 0);
    if(!items.length){ toast('Agrega al menos un producto.', true); return; }
    const over = items.find(i => i.cant > dispB(origen, i.sku)); if(over){ toast(`No hay suficiente ${prodName(over.sku)} en el origen.`, true); return; }
    const id = rid('T');
    if(await run(() => db.doc('traslados/' + id).set({ origen, destino, items, nota: nota.trim(), estado: 'pendiente', fechas: { creado: Date.now() }, creadoPor: S.me?.id || '' }), 'Traslado creado. La bodega de origen ya lo ve en su cola.')) closeModal();
  };
  return (
    <form onSubmit={submit}>
      <div className="grid2">
        <div><label htmlFor="tr-o">Desde</label><select id="tr-o" value={origen} onChange={e => cambiarOrigen(e.target.value)}>{bs.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}</select></div>
        <div><label htmlFor="tr-d">Hacia</label><select id="tr-d" value={destino} onChange={e => setDestino(e.target.value)}>{bs.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}</select></div>
      </div>
      <div>
        <label>Productos</label>
        <Table heads={['Producto', ['Disponible en origen', 'r'], ['Trasladar', 'r']]}
          rows={activos().map(p => { const d = Math.max(0, Math.floor(dispB(origen, p.id))); return (
            <tr key={p.id}><td>{p.nombre}</td><td className="r">{num(d)}</td>
              <td className="r"><input type="number" min="0" max={d} disabled={!d} value={q[p.id] ?? ''} onChange={e => setQ({ ...q, [p.id]: e.target.value })} aria-label={'Trasladar ' + p.nombre} /></td></tr>); })} />
      </div>
      <label htmlFor="tr-n">Nota</label><input id="tr-n" value={nota} onChange={e => setNota(e.target.value)} />
      <div className="btns"><button className="btn pk" type="submit">Crear traslado</button></div>
    </form>
  );
}
export function openNuevoTraslado(){
  if(bodegas().length < 2){ toast('Necesitas al menos dos bodegas.', true); return; }
  openModal('Nuevo traslado', <Form />, { wide: true });
}
