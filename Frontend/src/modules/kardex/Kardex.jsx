import { S, bump } from '../../lib/store.js';
import { MOV } from '../../lib/constants.js';
import { L, cfg, bod, bodegas, activos, itemName } from '../../lib/data.js';
import { rango, inR } from '../../lib/rango.js';
import { N, num, fdt } from '../../lib/format.js';
import { go, openPedido } from '../../lib/ui.js';
import { Head, Table, Empty, Uname } from '../../components/ui.jsx';
import DateBar from '../../components/DateBar.jsx';
import { openTras } from '../traslados/TrasladoDetalle.jsx';

const MAX = 400;
/* Módulos aún no portados: mientras tanto el enlace lleva a su lista. */
const openDev = () => go('devoluciones');
const openOp = () => go('produccion');

function Ref({ m }){
  if(!m.ref) return <>{m.nota || '—'}</>;
  const link = fn => <button className="lnk" onClick={() => fn(m.ref)}>{m.ref}</button>;
  if(m.tipo === 'despacho_pedido' && L('pedidos').some(p => p.id === m.ref)) return link(openPedido);
  if(m.tipo.startsWith('traslado') && L('traslados').some(t => t.id === m.ref)) return link(openTras);
  if(m.tipo === 'devolucion' && L('devoluciones').some(d => d.id === m.ref)) return link(openDev);
  if((m.tipo === 'produccion_entrada' || m.tipo === 'consumo_insumos') && L('producciones').some(o => o.id === m.ref)) return link(openOp);
  return <>{m.ref}</>;
}

const set = (k, v) => { S.kx[k] = v; if(k !== 'item') S.kx.item = ''; bump(); };

export default function Kardex({ c }){
  const fixed = c.rol === 'bodega' ? c.bodegaId : c.rol === 'planta' ? cfg().bodegaPlanta : null;
  const b = fixed || (bod(S.kx.b) ? S.kx.b : bodegas()[0]?.id);
  const B = bod(b);
  if(!B) return <><Head t="Kardex" /><Empty>Configura las bodegas primero.</Empty></>;

  const clase = B.tieneInsumos ? (S.kx.clase || 'pt') : 'pt';
  const items = clase === 'in' ? [...L('insumos')].sort((a, z) => (a.nombre || '').localeCompare(z.nombre || '')) : activos();
  const item = items.some(i => i.id === S.kx.item) ? S.kx.item : '';

  const [desde] = rango();
  const movs = L('movimientos').filter(m => m.bodega === b).sort((a, z) => a.fecha - z.fecha);
  let saldo = 0, ent = 0, sal = 0; const rows = [];
  for(const m of movs) for(const l of m.lineas || []){
    if(l.clase !== clase || (item && l.item !== item)) continue;
    const q = N(l.cant);
    if(m.fecha < desde){ saldo += q; continue; }
    if(!inR(m.fecha)) continue;
    saldo += q; if(q > 0) ent += q; else sal += -q;
    rows.push({ m, l, q, saldo });
  }
  const inicial = rows.length ? rows[0].saldo - rows[0].q : saldo;
  const show = rows.slice().reverse().slice(0, MAX);

  return (<>
    <Head t="Kardex" sub="Cada entrada y salida de inventario, con quién la hizo y por qué. Elige un producto para ver el saldo después de cada movimiento." />
    <div className="bar">
      {fixed ? <span className="chip">{B.nombre}</span>
        : <select value={b} onChange={e => set('b', e.target.value)} aria-label="Bodega">{bodegas().map(x => <option key={x.id} value={x.id}>{x.nombre}</option>)}</select>}
      {B.tieneInsumos && <select value={clase} onChange={e => set('clase', e.target.value)} aria-label="Tipo"><option value="pt">Producto terminado</option><option value="in">Material de empaque</option></select>}
      <select value={item} onChange={e => set('item', e.target.value)} aria-label="Producto">
        <option value="">Todos los {clase === 'in' ? 'insumos' : 'productos'}</option>{items.map(i => <option key={i.id} value={i.id}>{i.nombre}</option>)}
      </select>
    </div>
    <DateBar label="Fecha del movimiento" />
    <div className="kv">
      <div><span>Entradas en el periodo</span><b>{num(ent)}</b></div><div><span>Salidas en el periodo</span><b>{num(sal)}</b></div>
      {item && <><div><span>Saldo inicial</span><b>{num(inicial)}</b></div><div><span>Saldo final</span><b>{num(saldo)}</b></div></>}
    </div>
    {!rows.length ? <Empty>No hay movimientos con estos filtros.</Empty> : (<>
      <Table heads={['Fecha', 'Movimiento', ...(item ? [] : ['Producto']), 'Referencia', 'Lote', ['Entrada', 'r'], ['Salida', 'r'], ...(item ? [['Saldo', 'r']] : []), 'Usuario']}
        rows={show.map(({ m, l, q, saldo }, i) => (
          <tr key={i}>
            <td className="nowrap">{fdt(m.fecha)}</td>
            <td>{MOV[m.tipo] || m.tipo}{m.nota && m.ref ? <div className="sub">{m.nota}</div> : null}</td>
            {!item && <td>{itemName(l.clase, l.item)}</td>}
            <td><Ref m={m} /></td><td>{l.lote || '—'}</td>
            <td className="r">{q > 0 ? num(q) : ''}</td><td className="r">{q < 0 ? num(-q) : ''}</td>
            {item && <td className="r"><b>{num(saldo)}</b></td>}
            <td><Uname id={m.usuario} /></td>
          </tr>))} />
      {rows.length > MAX && <p className="sub">Se muestran los 400 movimientos más recientes. Acota las fechas para ver el resto.</p>}
    </>)}
  </>);
}
