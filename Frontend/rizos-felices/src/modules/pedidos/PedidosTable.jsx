import { Table, Pipe, EstChip } from '../../components/ui.jsx';
import { fd, money } from '../../lib/format.js';
import { cli, bodName } from '../../lib/data.js';
import { openPedido } from '../../lib/ui.js';

export default function PedidosTable({ list, c }){
  const showCli = c.rol !== 'distribuidor';
  return <Table heads={['Pedido', ...(showCli ? ['Cliente'] : []), 'Fecha', ['Total', 'r'], 'Estado', 'Bodega']}
    rows={list.map(p => (
      <tr key={p.id} className="click" tabIndex={0} onClick={() => openPedido(p.id)} onKeyDown={e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openPedido(p.id); } }}>
        <td className="nowrap"><b>{p.id}</b><div className="sub">{(p.items || []).length} referencias</div></td>
        {showCli && <td>{cli(p.clienteId)?.nombre || '—'}</td>}
        <td className="nowrap">{fd(p.fechas?.recibido)}</td><td className="r">{money(p.total)}</td>
        <td><Pipe estado={p.estado} /><EstChip e={p.estado} /></td><td>{bodName(p.bodega)}</td>
      </tr>))} />;
}
