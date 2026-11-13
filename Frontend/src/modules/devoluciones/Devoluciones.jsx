import { S, bump } from '../../lib/store.js';
import { L, cli, bodName } from '../../lib/data.js';
import { inR } from '../../lib/rango.js';
import { N, num, fd } from '../../lib/format.js';
import { Head, Table, Empty, Pipe } from '../../components/ui.jsx';
import DateBar from '../../components/DateBar.jsx';
import { DEV_FLOW, DEV_EST, DEV_PASOS } from './constants.js';
import DevProceso from './DevProceso.jsx';
import { openDev } from './DevolucionDetalle.jsx';
import { openDevNueva } from './SolicitarDevolucion.jsx';

export default function Devoluciones({ c }){
  const esDist = c.rol === 'distribuidor';
  let D = L('devoluciones').filter(d => inR(d.fechas?.solicitada));
  if(esDist) D = D.filter(d => d.clienteId === c.clienteId);
  if(c.rol === 'bodega') D = D.filter(d => d.bodega === c.bodegaId && ['aprobada', 'recibida', 'cerrada'].includes(d.estado));
  if(c.rol === 'facturacion') D = D.filter(d => ['recibida', 'cerrada'].includes(d.estado));

  const f = S.devFiltro;
  const list = [...D].filter(d => f === 'todas' || d.estado === f).sort((a, b) => (b.fechas?.solicitada || 0) - (a.fechas?.solicitada || 0));
  const tabs = [['todas', 'Todas'], ...DEV_FLOW.map(e => [e, DEV_PASOS.find(p => p[0] === e)[1]]), ['rechazada', 'Rechazadas']];
  const chip = e => e === 'solicitada' ? 'bk' : e === 'cerrada' ? 'pk' : e === 'rechazada' ? 'ol' : '';

  return (<>
    <Head t="Devoluciones" sub="Así se genera una devolución, de la solicitud a la nota crédito. Toca un paso para ver las que están en él."
      right={esDist ? <button className="btn pk" onClick={openDevNueva}>Solicitar devolución</button> : null} />
    <DevProceso D={D} interactive />
    <DateBar label="Fecha de solicitud" />
    <div className="tabs" role="tablist">
      {tabs.map(([k, t]) => (
        <button key={k} role="tab" aria-selected={k === f} className={k === f ? 'on' : ''} onClick={() => { S.devFiltro = k; bump(); }}>
          {t} <span className="sub">{k === 'todas' ? D.length : D.filter(d => d.estado === k).length}</span>
        </button>))}
    </div>
    {list.length ? <Table heads={['Devolución', ...(!esDist ? ['Cliente'] : []), 'Pedido', 'Motivo', ['Unidades', 'r'], 'Paso', 'Bodega']}
      rows={list.map(d => (
        <tr key={d.id} className="click" tabIndex={0} onClick={() => openDev(d.id)} onKeyDown={e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openDev(d.id); } }}>
          <td className="nowrap"><b>{d.id}</b><div className="sub">{fd(d.fechas?.solicitada)}</div></td>
          {!esDist && <td>{cli(d.clienteId)?.nombre || '—'}</td>}
          <td>{d.pedidoId}</td><td>{d.motivo}</td>
          <td className="r">{num((d.items || []).reduce((s, i) => s + N(i.cant), 0))}</td>
          <td>{d.estado !== 'rechazada' && <Pipe estado={d.estado} flow={DEV_FLOW} />}<span className={'chip ' + chip(d.estado)}>{DEV_EST[d.estado] || d.estado}</span></td>
          <td>{d.bodega ? bodName(d.bodega) : '—'}</td>
        </tr>))} />
      : <Empty>No hay devoluciones con estos filtros.</Empty>}
  </>);
}
