import { L, prodName } from '../../lib/data.js';
import { inR } from '../../lib/rango.js';
import { num, fd, fdt } from '../../lib/format.js';
import { Head, Table, Empty, Uname } from '../../components/ui.jsx';
import DateBar from '../../components/DateBar.jsx';
import { OP_EST } from './helpers.js';
import { openOp } from './OrdenDetalle.jsx';

const fecha = o => o.fechas?.liberada || o.fechas?.rechazada || 0;

export default function Calidad(){
  const O = L('producciones');
  const cola = O.filter(o => o.estado === 'por_liberar').sort((a, b) => (a.fechas?.por_liberar || 0) - (b.fechas?.por_liberar || 0));
  const hist = O.filter(o => ['liberada', 'rechazada'].includes(o.estado) && inR(fecha(o))).sort((a, b) => fecha(b) - fecha(a));
  return (<>
    <Head t="Liberación de lotes" sub="Ningún lote se puede vender hasta que calidad lo libere." />
    {cola.length ? <Table heads={['Orden', 'Producto', 'Lote', ['Unidades', 'r'], 'Terminado']}
      rows={cola.map(o => (
        <tr key={o.id} className="click" tabIndex={0} onClick={() => openOp(o.id)} onKeyDown={e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openOp(o.id); } }}>
          <td><b>{o.id}</b></td><td>{prodName(o.sku)}</td><td>{o.lote}</td><td className="r">{num(o.cantidadReal)}</td><td>{fdt(o.fechas?.por_liberar)}</td>
        </tr>))} />
      : <Empty>No hay lotes esperando liberación.</Empty>}
    <h3>Historial</h3>
    <DateBar label="Fecha de revisión" />
    {hist.length ? <Table heads={['Lote', 'Producto', ['Unidades', 'r'], 'Resultado', 'Fecha', 'Por']}
      rows={hist.map(o => (
        <tr key={o.id}>
          <td>{o.lote}</td><td>{prodName(o.sku)}</td><td className="r">{num(o.cantidadLiberada ?? o.cantidadReal)}</td>
          <td><span className={'chip ' + (o.estado === 'liberada' ? 'pk' : 'ol')}>{OP_EST[o.estado]}</span></td>
          <td>{fd(fecha(o))}</td><td><Uname id={o.liberadoPor} /></td>
        </tr>))} />
      : <Empty>No hay lotes revisados en estas fechas.</Empty>}
  </>);
}
