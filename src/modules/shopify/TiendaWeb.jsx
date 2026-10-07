import { S } from '../../lib/store.js';
import { L, cfg, bodName, prodName } from '../../lib/data.js';
import { stock } from '../../lib/inventory.js';
import { inR } from '../../lib/rango.js';
import { N, num, fdt } from '../../lib/format.js';
import { go } from '../../lib/ui.js';
import { Head, Table, Empty, Uname } from '../../components/ui.jsx';
import DateBar from '../../components/DateBar.jsx';
import { shopCfg, parseShopify, shopCancel, shopConfirm } from './shopify.js';

function Preview({ wb }){
  const sp = S.shopPreview;
  const rows = Object.entries(sp.porSku).map(([sku, q]) => ({ sku, q, s: stock(wb, 'pt', sku) }));
  return (<>
    <h3>Vista previa</h3>
    <div className="kv">
      <div><span>Pedidos nuevos</span><b>{sp.nuevos.length}</b></div><div><span>Ya descontados antes</span><b>{sp.repetidos}</b></div>
      <div><span>Cancelados o reembolsados (se omiten)</span><b>{sp.omitidos}</b></div>
    </div>
    {sp.desconocidos.length > 0 && <div className="err">Estos SKU no existen en el catálogo y no se descontarán: {sp.desconocidos.join(', ')}.</div>}
    {rows.length ? <Table heads={['Producto', ['Vendido', 'r'], ['Stock bodega web', 'r'], ['Queda', 'r']]}
      rows={rows.map(({ sku, q, s }) => <tr key={sku}><td>{prodName(sku)} <span className="sub">{sku}</span></td><td className="r">{num(q)}</td><td className="r">{num(s)}</td>
        <td className="r">{q > s ? <><b>{num(s - q)}</b> <span className="chip bk">sin stock</span></> : num(s - q)}</td></tr>)} />
      : <Empty>No hay unidades nuevas para descontar.</Empty>}
    <div className="btns">{sp.nuevos.length > 0 && rows.length > 0 && <button className="btn pk" onClick={shopConfirm}>Descontar del inventario</button>}<button className="btn" onClick={shopCancel}>Descartar</button></div>
  </>);
}

export default function TiendaWeb(){
  const wb = cfg().bodegaWeb;
  const head = <Head t="Tienda web" sub="Las ventas de Shopify descuentan inventario de la bodega web. Exporta los pedidos desde Shopify (Pedidos, Exportar, CSV) y súbelos aquí; cada pedido se descuenta una sola vez aunque subas el mismo archivo dos veces." />;
  const aviso = <div className="note bk">En este prototipo la sincronización es por archivo. La conexión automática con Shopify necesita un servidor propio y queda para la versión definitiva.</div>;
  if(!wb) return <>{head}{aviso}<div className="err">Falta definir cuál bodega abastece la tienda web.</div><button className="btn pk" onClick={() => go('config')}>Ir a Configuración</button></>;
  const hist = L('movimientos').filter(m => m.tipo === 'venta_web' && inR(m.fecha)).sort((a, b) => b.fecha - a.fecha);
  const onFile = e => { const f = e.target.files[0]; e.target.value = ''; if(f) parseShopify(f); };
  return (<>
    {head}{aviso}
    <p>Bodega web: <b>{bodName(wb)}</b>. Pedidos ya descontados: <b>{num((shopCfg().importados || []).length)}</b>.</p>
    <div className="btns" style={{ marginBottom: 18 }}><label className="btn pk" style={{ margin: 0 }}>Subir CSV de pedidos<input type="file" accept=".csv" hidden onChange={onFile} /></label></div>
    {S.shopPreview && <Preview wb={wb} />}
    <h3>Cargas anteriores</h3>
    <DateBar label="Fecha de carga" />
    {hist.length ? <Table heads={['Fecha', 'Pedidos', ['Unidades', 'r'], 'Usuario']}
      rows={hist.map(m => <tr key={m.id}><td>{fdt(m.fecha)}</td><td>{m.ref}</td><td className="r">{num(-(m.lineas || []).reduce((s, l) => s + N(l.cant), 0))}</td><td><Uname id={m.usuario} /></td></tr>)} />
      : <Empty>No hay cargas en estas fechas.</Empty>}
  </>);
}
