import { cfg, bodegas } from '../../lib/data.js';
import { db } from '../../services/db.js';
import { N, safeId } from '../../lib/format.js';
import { run } from '../../lib/ui.js';
import { Head, Table } from '../../components/ui.jsx';

export default function Configuracion(){
  const g = cfg(), B = bodegas();
  const submit = async ev => {
    ev.preventDefault(); const e = ev.currentTarget.elements;
    const lista = B.map((_, i) => ({ id: e['bid_' + i].value, nombre: e['bn_' + i].value.trim(), tieneInsumos: e['bi_' + i].checked }));
    const nn = e.bn_new.value.trim();
    if(nn) lista.push({ id: safeId(nn.toLowerCase()).slice(0, 40) + '-' + Math.random().toString(36).slice(2, 5), nombre: nn, tieneInsumos: e.bi_new.checked });
    const { id, ...rest } = g;
    await run(() => db.doc('config/general').set({ ...rest, bodegas: lista, bodegaPlanta: e.bodegaPlanta.value, bodegaWeb: e.bodegaWeb.value, correoFacturacion: e.correoFacturacion.value.trim(), objetivoDias: N(e.objetivoDias.value) || 45 }), 'Configuración guardada.');
  };
  const opciones = B.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>);
  return (<>
    <Head t="Configuración" sub="Bodegas, correo de facturación y parámetros de planeación." />
    {/* key: al guardar, el formulario se reinicia (limpia el campo de nueva bodega) */}
    <form key={JSON.stringify(g)} onSubmit={submit}>
      <h3>Bodegas</h3>
      <Table heads={['Nombre', ['Maneja empaque', 'r']]}
        rows={[...B.map((b, i) => (
          <tr key={b.id}>
            <td><input name={'bn_' + i} defaultValue={b.nombre} required aria-label="Nombre de bodega" /><input type="hidden" name={'bid_' + i} defaultValue={b.id} /></td>
            <td className="r"><input type="checkbox" name={'bi_' + i} defaultChecked={!!b.tieneInsumos} aria-label="Maneja empaque" /></td>
          </tr>)),
          <tr key="new"><td><input name="bn_new" placeholder="Agregar otra bodega" aria-label="Nueva bodega" /></td><td className="r"><input type="checkbox" name="bi_new" aria-label="Maneja empaque" /></td></tr>]} />
      <div className="grid2">
        <div><label htmlFor="cg-p">Bodega de la planta</label>
          <select id="cg-p" name="bodegaPlanta" defaultValue={g.bodegaPlanta || ''}><option value="">—</option>{opciones}</select>
          <div className="help">Donde entra lo producido y se descuenta el empaque.</div></div>
        <div><label htmlFor="cg-w">Bodega de la tienda web</label>
          <select id="cg-w" name="bodegaWeb" defaultValue={g.bodegaWeb || ''}><option value="">—</option>{opciones}</select>
          <div className="help">De aquí se descuentan las ventas de Shopify.</div></div>
        <div><label htmlFor="cg-e">Correo de tesorería para facturar</label><input id="cg-e" type="email" name="correoFacturacion" defaultValue={g.correoFacturacion || ''} placeholder="tesoreria@rizosfelices.co" /></div>
        <div><label htmlFor="cg-o">Días de cobertura objetivo</label><input id="cg-o" type="number" min="7" name="objetivoDias" defaultValue={g.objetivoDias || 45} /><div className="help">Cuántos días de venta debe cubrir el inventario.</div></div>
      </div>
      <div className="btns"><button className="btn pk" type="submit">Guardar configuración</button></div>
    </form>
  </>);
}
