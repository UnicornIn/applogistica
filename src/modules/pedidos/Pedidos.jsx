import { S, bump } from '../../lib/store.js';
import { ACTIVE } from '../../lib/constants.js';
import { L } from '../../lib/data.js';
import { inR } from '../../lib/rango.js';
import { N, money } from '../../lib/format.js';
import { go } from '../../lib/ui.js';
import { Head, Empty } from '../../components/ui.jsx';
import DateBar from '../../components/DateBar.jsx';
import PedidosTable from './PedidosTable.jsx';

const FILTROS = {
  activos:    ['En curso',    p => ACTIVE.includes(p.estado)],
  despachado: ['Despachados', p => p.estado === 'despachado'],
  facturado:  ['Facturados',  p => p.estado === 'facturado'],
  cancelado:  ['Cancelados',  p => p.estado === 'cancelado'],
  todos:      ['Todos',       () => true]
};

export default function Pedidos({ c }){
  const esDist = c.rol === 'distribuidor';
  let P = L('pedidos').filter(p => inR(p.fechas?.recibido));
  if(esDist) P = P.filter(p => p.clienteId === c.clienteId);

  const f = FILTROS[S.pedFiltro] ? S.pedFiltro : 'activos';
  const list = P.filter(FILTROS[f][1]).sort((a, b) => (b.fechas?.recibido || 0) - (a.fechas?.recibido || 0));
  const total = list.reduce((s, p) => s + N(p.total), 0);
  const nuevo = (txt) => <button className="btn pk" onClick={() => go('nuevo')}>{txt}</button>;

  return (<>
    <Head t={esDist ? 'Mis pedidos' : 'Pedidos'} sub={c.rol === 'admin' ? 'Cada pedido llega directo a la bodega asignada al cliente.' : ''} right={esDist ? nuevo('Nuevo pedido') : null} />
    <DateBar label="Fecha del pedido" />
    <div className="tabs" role="tablist">
      {Object.entries(FILTROS).map(([k, [t, fn]]) => (
        <button key={k} role="tab" aria-selected={k === f} className={k === f ? 'on' : ''} onClick={() => { S.pedFiltro = k; bump(); }}>
          {t} <span className="sub">{P.filter(fn).length}</span>
        </button>
      ))}
    </div>
    {list.length > 0 && <p className="sub">{list.length} pedidos por {money(total)}</p>}
    {list.length ? <PedidosTable list={list} c={c} /> : <Empty btn={esDist ? nuevo('Hacer un pedido') : null}>No hay pedidos con estos filtros.</Empty>}
  </>);
}
