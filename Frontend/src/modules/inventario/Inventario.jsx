import { Fragment } from 'react';
import { S, bump } from '../../lib/store.js';
import { L, cfg, bod, bodegas, bodName, activos } from '../../lib/data.js';
import { isRealAdmin } from '../../lib/access.js';
import { stock, reservado, lotes, dispB, dispTotal } from '../../lib/inventory.js';
import { N, num, fd } from '../../lib/format.js';
import { go } from '../../lib/ui.js';
import { Head, Table, Empty } from '../../components/ui.jsx';
import { openAjuste } from './AjusteModal.jsx';
import { openEntradaIns } from './EntradaInsModal.jsx';

const verKardex = (b, clase, item) => e => { e.stopPropagation(); S.kx = { b, clase, item }; go('kardex'); };
const Bajo = () => <> <span className="chip bk">bajo</span></>;

function Todas({ prods }){
  const bs = bodegas();
  return <Table heads={['Producto', ...bs.map(x => [x.nombre, 'r']), ['Total disponible', 'r']]}
    rows={prods.map(p => (
      <tr key={p.id}>
        <td>{p.nombre}<div className="sub">{p.id}</div></td>
        {bs.map(x => { const d = dispB(x.id, p.id), m = N(p.stockMin?.[x.id]); return <td key={x.id} className="r">{m && d < m ? <><b>{num(d)}</b><Bajo /></> : num(d)}</td>; })}
        <td className="r"><b>{num(dispTotal(p.id))}</b></td>
      </tr>))} />;
}

function PorBodega({ b, prods }){
  const toggle = k => { S.invOpen.has(k) ? S.invOpen.delete(k) : S.invOpen.add(k); bump(); };
  const rows = prods.map(p => {
    const s = stock(b, 'pt', p.id), r = reservado(b, p.id), m = N(p.stockMin?.[b]), k = b + '|' + p.id, open = S.invOpen.has(k), lt = lotes(b, 'pt', p.id);
    return (
      <Fragment key={p.id}>
        <tr className="click" tabIndex={0} aria-expanded={open} onClick={() => toggle(k)} onKeyDown={e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); toggle(k); } }}>
          <td>{p.nombre}<div className="sub">{p.id}, {lt.length} {lt.length === 1 ? 'lote' : 'lotes'}</div></td>
          <td className="r">{num(s)}</td><td className="r">{num(r)}</td>
          <td className="r"><b>{num(s - r)}</b>{m && s - r < m ? <Bajo /> : null}</td>
          <td className="r">{m ? num(m) : '—'}</td>
          <td className="r"><button className="btn sm ghost" onClick={verKardex(b, 'pt', p.id)}>Kardex</button></td>
        </tr>
        {open && <tr className="lots"><td colSpan={6}>{lt.length
          ? <table><thead><tr><th>Lote</th><th>Primera entrada</th><th className="r">Unidades</th></tr></thead>
              <tbody>{lt.map(e => <tr key={e.lote}><td>{e.lote}</td><td>{isFinite(e.desde) ? fd(e.desde) : '—'}</td><td className="r">{num(e.cant)}</td></tr>)}</tbody></table>
          : <span className="sub">Sin lotes con stock.</span>}</td></tr>}
      </Fragment>
    );
  });
  return <Table heads={['Producto', ['Stock', 'r'], ['Reservado', 'r'], ['Disponible', 'r'], ['Mínimo', 'r'], '']} rows={rows} />;
}

function Empaque({ b }){
  const I = [...L('insumos')].sort((a, z) => (a.nombre || '').localeCompare(z.nombre || ''));
  return (<>
    <h3>Material de empaque</h3>
    {I.length ? <Table heads={['Insumo', 'Unidad', ['Stock', 'r'], ['Mínimo', 'r'], '']}
      rows={I.map(i => { const s = stock(b, 'in', i.id), m = N(i.stockMin); return (
        <tr key={i.id}><td>{i.nombre}</td><td>{i.unidad || 'unidad'}</td>
          <td className="r"><b>{num(s)}</b>{m && s < m ? <Bajo /> : null}</td><td className="r">{m ? num(m) : '—'}</td>
          <td className="r"><button className="btn sm ghost" onClick={verKardex(b, 'in', i.id)}>Kardex</button></td></tr>); })} />
      : <Empty>No hay insumos creados. Créalos en el catálogo.</Empty>}
  </>);
}

export default function Inventario({ c }){
  let b = c.rol === 'bodega' ? c.bodegaId : c.rol === 'planta' ? cfg().bodegaPlanta : (S.invBod || '__all');
  if(b !== '__all' && !bod(b)) b = '__all';
  const B = bod(b);
  const canEmp = B?.tieneInsumos && (isRealAdmin(c) || c.rol === 'planta' || (c.rol === 'bodega' && c.bodegaId === b));
  const prods = activos();

  return (<>
    <Head t={c.rol === 'planta' ? 'Inventario planta' : 'Inventario'}
      sub={b === '__all' ? 'Unidades disponibles por bodega. Disponible es el stock menos lo reservado para pedidos y traslados en curso.' : `${bodName(b)}. Toca un producto para ver sus lotes; el detalle de cada movimiento está en el Kardex.`}
      right={<>{isRealAdmin(c) && <button className="btn" onClick={openAjuste}>Registrar carga o ajuste</button>}{canEmp && <button className="btn" onClick={openEntradaIns}>Registrar entrada de empaque</button>}</>} />
    {c.rol === 'admin' && <div className="bar">
      <select value={b} onChange={e => { S.invBod = e.target.value; bump(); }} aria-label="Bodega">
        <option value="__all">Todas las bodegas</option>{bodegas().map(x => <option key={x.id} value={x.id}>{x.nombre}</option>)}
      </select></div>}
    {!prods.length ? <Empty>El catálogo está vacío.</Empty>
      : b === '__all' ? <Todas prods={prods} />
      : <><PorBodega b={b} prods={prods} />{B?.tieneInsumos && <Empaque b={b} />}</>}
  </>);
}
