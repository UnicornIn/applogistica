import { L, cfg, bodegas, activos, ins } from '../../lib/data.js';
import { isRealAdmin } from '../../lib/access.js';
import { stock, dispTotal } from '../../lib/inventory.js';
import { N, num } from '../../lib/format.js';
import { Head, Table, Empty } from '../../components/ui.jsx';
import { consumoDiario, enProduccion } from './helpers.js';
import { openNuevaOrden } from './NuevaOrden.jsx';

export default function Plan({ c }){
  const obj = N(cfg().objetivoDias) || 45;
  const rows = activos().map(p => {
    const st = bodegas().reduce((s, b) => s + stock(b.id, 'pt', p.id), 0);
    const disp = dispTotal(p.id), cd = consumoDiario(p.id), ep = enProduccion(p.id);
    return { p, st, disp, cd, ep, cob: cd > 0 ? disp / cd : null, sug: Math.max(0, Math.ceil(cd * obj - disp - ep)) };
  }).sort((a, b) => (a.cob ?? 9e9) - (b.cob ?? 9e9));
  const puede = isRealAdmin(c) || c.rol === 'planta';
  const head = <Head t="Plan de producción" sub={`Pronóstico con el consumo real de los últimos 90 días (pedidos despachados y ventas web). Objetivo: ${obj} días de cobertura; se cambia en Configuración.`} />;
  if(!rows.length) return <>{head}<Empty>El catálogo está vacío.</Empty></>;

  const pl = cfg().bodegaPlanta, need = {};
  rows.forEach(r => { if(r.sug) (r.p.bom || []).forEach(b => { need[b.insumo] = (need[b.insumo] || 0) + N(b.cant) * r.sug; }); });
  const ni = Object.entries(need);

  return (<>
    {head}
    <Table heads={['Producto', ['Stock total', 'r'], ['Disponible', 'r'], ['Consumo diario', 'r'], ['Cobertura', 'r'], ['En producción', 'r'], ['Sugerido', 'r'], '']}
      rows={rows.map(r => (
        <tr key={r.p.id}>
          <td>{r.p.nombre}<div className="sub">{r.p.id}</div></td>
          <td className="r">{num(r.st)}</td><td className="r">{num(r.disp)}</td>
          <td className="r">{r.cd ? num(Math.round(r.cd * 10) / 10) : '—'}</td>
          <td className="r">{r.cob === null ? <span className="sub">sin datos</span> : r.cob < obj / 2 ? <span className="chip bk">{Math.round(r.cob)} días</span> : `${Math.round(r.cob)} días`}</td>
          <td className="r">{num(r.ep)}</td><td className="r"><b>{r.sug ? num(r.sug) : '—'}</b></td>
          <td>{puede && <button className={'btn sm ' + (r.sug ? 'pk' : '')} onClick={() => openNuevaOrden(r.p.id, r.sug || '')}>Crear orden</button>}</td>
        </tr>))} />
    <h3>Empaque necesario para lo sugerido</h3>
    {ni.length ? <Table heads={['Insumo', ['Necesario', 'r'], ['En planta', 'r'], ['Falta', 'r']]}
      rows={ni.map(([id, q]) => { const s = pl ? stock(pl, 'in', id) : 0; return (
        <tr key={id}><td>{ins(id)?.nombre || id}</td><td className="r">{num(q)}</td><td className="r">{num(s)}</td><td className="r">{q > s ? <b>{num(q - s)}</b> : '—'}</td></tr>); })} />
      : <Empty>Sin necesidades de empaque. Define la fórmula de materiales de cada producto en el catálogo para ver este cálculo.</Empty>}
  </>);
}
