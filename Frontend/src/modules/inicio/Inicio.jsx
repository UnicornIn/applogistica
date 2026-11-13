import { Head, Table, Empty } from '../../components/ui.jsx';
import PedidosTable from '../pedidos/PedidosTable.jsx';
import { L, bodegas, bod, bodName } from '../../lib/data.js';
import { alertasStock } from '../../lib/inventory.js';
import { num } from '../../lib/format.js';
import { go } from '../../lib/ui.js';

export default function Inicio({ c }){
  const P = L('pedidos'), D = L('devoluciones');
  const st = [
    ['pedidos', 'Pedidos nuevos', P.filter(p => p.estado === 'recibido' || p.estado === 'asignado').length],
    ['pedidos', 'En preparación', P.filter(p => p.estado === 'preparacion').length],
    ['facturacion', 'Despachados por facturar', P.filter(p => p.estado === 'despachado').length],
    ['calidad', 'Lotes por liberar', L('producciones').filter(o => o.estado === 'por_liberar').length],
    ['devoluciones', 'Devoluciones por aprobar', D.filter(d => d.estado === 'solicitada').length],
    ['facturacion', 'Notas crédito por emitir', D.filter(d => d.estado === 'recibida').length]
  ];
  const sinB = L('clientes').filter(x => x.activo !== false && !bod(x.bodegaId));
  const al = alertasStock();
  const rec = [...P].sort((a, b) => (b.fechas?.recibido || 0) - (a.fechas?.recibido || 0)).slice(0, 6);
  return (<>
    <Head t="Inicio" sub="Lo que está esperando una acción hoy." />
    {!bodegas().length && <div className="note">Todavía no hay bodegas configuradas. <button className="btn sm" onClick={() => go('config')}>Configurar bodegas</button></div>}
    {!L('productos').length && <div className="note">El catálogo está vacío. Súbelo desde Shopify o créalo a mano. <button className="btn sm" onClick={() => go('catalogo')}>Ir al catálogo</button></div>}
    {sinB.length > 0 && <div className="note">{sinB.length === 1 ? 'Un cliente no tiene' : `${sinB.length} clientes no tienen`} bodega de despacho y no puede{sinB.length === 1 ? '' : 'n'} hacer pedidos: {sinB.slice(0, 5).map(x => x.nombre).join(', ')}{sinB.length > 5 ? '…' : ''}. <button className="btn sm" onClick={() => go('clientes')}>Ir a clientes</button></div>}
    <div className="stats">{st.map(([v, t, n], i) => <button key={i} className={'stat ' + (n ? 'hot' : '')} onClick={() => go(v)}><b>{n}</b><span>{t}</span></button>)}</div>
    <h3>Stock por debajo del mínimo</h3>
    {al.length ? <Table heads={['Bodega', 'Producto o insumo', ['Disponible', 'r'], ['Mínimo', 'r']]} rows={al.map((a, i) => <tr key={i}><td>{bodName(a.bodega)}</td><td>{a.nombre} <span className="sub">{a.clase === 'in' ? 'empaque' : a.sku}</span></td><td className="r"><b>{num(a.disp)}</b></td><td className="r">{num(a.min)}</td></tr>)} />
      : <Empty>Todo está por encima del mínimo. Los mínimos se definen por producto y bodega en el catálogo.</Empty>}
    <h3>Últimos pedidos</h3>
    {rec.length ? <PedidosTable list={rec} c={c} /> : <Empty>Aún no hay pedidos.</Empty>}
  </>);
}
