import { L, prodName } from '../../lib/data.js';
import { isRealAdmin } from '../../lib/access.js';
import { inR } from '../../lib/rango.js';
import { num, fd } from '../../lib/format.js';
import { Head, Table, Empty } from '../../components/ui.jsx';
import DateBar from '../../components/DateBar.jsx';
import { OP_EST } from './helpers.js';
import { openOp } from './OrdenDetalle.jsx';
import { openNuevaOrden } from './NuevaOrden.jsx';

const chip = e => e === 'por_liberar' ? 'bk' : e === 'liberada' ? 'pk' : e === 'rechazada' ? 'ol' : '';

export default function Produccion({ c }){
  const O = L('producciones').filter(o => inR(o.fechas?.planeada)).sort((a, b) => (b.fechas?.planeada || 0) - (a.fechas?.planeada || 0));
  const puede = isRealAdmin(c) || c.rol === 'planta';
  return (<>
    <Head t="Órdenes de producción" sub="Al terminar una orden se descuenta el empaque de la planta. El producto entra al inventario cuando calidad libera el lote."
      right={puede ? <button className="btn pk" onClick={() => openNuevaOrden()}>Nueva orden</button> : null} />
    <DateBar label="Fecha de la orden" />
    {O.length ? <Table heads={['Orden', 'Producto', 'Lote', ['Planeado', 'r'], ['Real', 'r'], 'Estado']}
      rows={O.map(o => (
        <tr key={o.id} className="click" tabIndex={0} onClick={() => openOp(o.id)} onKeyDown={e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openOp(o.id); } }}>
          <td className="nowrap"><b>{o.id}</b><div className="sub">{fd(o.fechas?.planeada)}</div></td>
          <td>{prodName(o.sku)}</td><td>{o.lote}</td><td className="r">{num(o.cantidad)}</td><td className="r">{o.cantidadReal != null ? num(o.cantidadReal) : '—'}</td>
          <td><span className={'chip ' + chip(o.estado)}>{OP_EST[o.estado]}</span></td>
        </tr>))} />
      : <Empty btn={puede ? <button className="btn pk" onClick={() => openNuevaOrden()}>Crear una orden</button> : null}>No hay órdenes de producción con estos filtros.</Empty>}
  </>);
}
