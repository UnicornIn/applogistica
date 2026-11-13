import { prod, ins, cfg } from '../../lib/data.js';
import { stock } from '../../lib/inventory.js';
import { N, num } from '../../lib/format.js';
import { Table } from '../../components/ui.jsx';

/* Empaque requerido según la fórmula (BOM) del producto. */
export default function OpReq({ sku, cant }){
  const bom = prod(sku)?.bom || [], pl = cfg().bodegaPlanta, q = N(cant);
  if(!bom.length) return <div className="note">Este producto no tiene fórmula de materiales. La orden se puede crear, pero no descontará empaque. Defínela en el catálogo.</div>;
  return (<><label>Empaque requerido</label>
    <Table heads={['Insumo', ['Por unidad', 'r'], ['Total', 'r'], ['En planta', 'r']]}
      rows={bom.map(b => { const t = N(b.cant) * q, s = pl ? stock(pl, 'in', b.insumo) : 0; return (
        <tr key={b.insumo}><td>{ins(b.insumo)?.nombre || b.insumo}</td><td className="r">{num(b.cant)}</td><td className="r">{num(t)}</td>
          <td className="r">{t > s ? <><b>{num(s)}</b> <span className="chip bk">falta</span></> : num(s)}</td></tr>); })} /></>);
}
