import { L, bodName } from '../../lib/data.js';
import { isRealAdmin } from '../../lib/access.js';
import { inR } from '../../lib/rango.js';
import { N, num, fd } from '../../lib/format.js';
import { Head, Table, Empty } from '../../components/ui.jsx';
import DateBar from '../../components/DateBar.jsx';
import { TR_EST } from './constants.js';
import { openTras } from './TrasladoDetalle.jsx';
import { openNuevoTraslado } from './NuevoTraslado.jsx';

export default function Traslados({ c }){
  let T = L('traslados').filter(t => inR(t.fechas?.creado)).sort((a, b) => (b.fechas?.creado || 0) - (a.fechas?.creado || 0));
  if(c.rol === 'bodega') T = T.filter(t => t.origen === c.bodegaId || t.destino === c.bodegaId);
  return (<>
    <Head t="Traslados" sub="Mueven producto entre bodegas en dos pasos: la bodega de origen despacha y la de destino confirma que recibió."
      right={isRealAdmin(c) ? <button className="btn pk" onClick={openNuevoTraslado}>Nuevo traslado</button> : null} />
    <DateBar label="Fecha de creación" />
    {T.length ? <Table heads={['Traslado', 'De', 'A', ['Unidades', 'r'], 'Estado', 'Creado']}
      rows={T.map(t => (
        <tr key={t.id} className="click" tabIndex={0} onClick={() => openTras(t.id)} onKeyDown={e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openTras(t.id); } }}>
          <td><b>{t.id}</b></td><td>{bodName(t.origen)}</td><td>{bodName(t.destino)}</td>
          <td className="r">{num((t.items || []).reduce((s, i) => s + N(i.cant), 0))}</td>
          <td><span className={'chip ' + (t.estado === 'recibido' ? 'pk' : t.estado === 'pendiente' ? 'bk' : '')}>{TR_EST[t.estado]}</span></td>
          <td className="nowrap">{fd(t.fechas?.creado)}</td>
        </tr>))} />
      : <Empty>No hay traslados con estos filtros.</Empty>}
  </>);
}
