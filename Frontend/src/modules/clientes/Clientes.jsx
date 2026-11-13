import { L, bod, bodName } from '../../lib/data.js';
import { N, money } from '../../lib/format.js';
import { go } from '../../lib/ui.js';
import { Head, Table, Empty } from '../../components/ui.jsx';
import { openClienteNuevo } from './ClienteForm.jsx';

export default function Clientes(){
  const C = [...L('clientes')].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
  const nuevo = <button className="btn pk" onClick={openClienteNuevo}>Nuevo cliente</button>;
  return (<>
    <Head t="Clientes" sub="Distribuidores, peluquerías, centros y tiendas. Cada cliente tiene su bodega de despacho, su lista de precios y su pedido mínimo." right={nuevo} />
    {C.length ? <Table heads={['Cliente', 'Tipo', 'Ciudad', 'Bodega', ['Descuento', 'r'], ['Mínimo', 'r'], ['Pedidos', 'r'], 'Estado']}
      rows={C.map(x => (
        <tr key={x.id} className="click" tabIndex={0} onClick={() => go('cliente', x.id)} onKeyDown={e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); go('cliente', x.id); } }}>
          <td><b>{x.nombre}</b><div className="sub">NIT {x.nit || '—'}</div></td><td>{x.tipo || '—'}</td><td>{x.ciudad || '—'}</td>
          <td>{bod(x.bodegaId) ? bodName(x.bodegaId) : <span className="chip bk">Sin bodega</span>}</td>
          <td className="r">{N(x.descuento)}%</td><td className="r">{x.pedidoMinimo ? money(x.pedidoMinimo) : '—'}</td>
          <td className="r">{L('pedidos').filter(p => p.clienteId === x.id).length}</td>
          <td>{x.activo === false ? <span className="chip ol">Inactivo</span> : <span className="chip">Activo</span>}</td>
        </tr>))} />
      : <Empty btn={<button className="btn pk" onClick={openClienteNuevo}>Crear el primero</button>}>Todavía no hay clientes.</Empty>}
  </>);
}
