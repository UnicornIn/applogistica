import { S } from '../../lib/store.js';
import { L, prod } from '../../lib/data.js';
import { N, num, money, safeId } from '../../lib/format.js';
import { Head, Table, Empty } from '../../components/ui.jsx';
import { openProductoNuevo, openProductoEditar } from './ProductoForm.jsx';
import { openInsumoNuevo, openInsumoEditar } from './InsumoForm.jsx';
import { parseCatalog, catCancel, catConfirm } from './importCatalogo.js';

const Fila = ({ onOpen, children }) => <tr className="click" tabIndex={0} onClick={onOpen} onKeyDown={e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); onOpen(); } }}>{children}</tr>;

function Preview(){
  const cp = S.catPreview;
  return (<>
    <div className="note"><b>{cp.length} productos listos para importar.</b> Los que ya existen actualizan nombre y PVP.
      <div className="btns"><button className="btn pk" onClick={catConfirm}>Importar</button><button className="btn" onClick={catCancel}>Descartar</button></div></div>
    <Table heads={['SKU', 'Producto', ['PVP', 'r'], '']} rows={cp.slice(0, 60).map(r => (
      <tr key={r.sku}><td>{r.sku}</td><td>{r.nombre}</td><td className="r">{money(r.pvp)}</td>
        <td>{prod(safeId(r.sku)) ? <span className="chip">actualiza</span> : <span className="chip pk">nuevo</span>}</td></tr>))} />
  </>);
}

export default function Catalogo(){
  const P = [...L('productos')].sort((a, b) => (a.linea || '').localeCompare(b.linea || '') || (a.nombre || '').localeCompare(b.nombre || ''));
  const I = [...L('insumos')].sort((a, b) => (a.nombre || '').localeCompare(b.nombre || ''));
  const onFile = e => { const file = e.target.files[0]; e.target.value = ''; if(file) parseCatalog(file); };
  return (<>
    <Head t="Catálogo" sub="Los mismos productos individuales de la tienda web. El SKU debe ser idéntico al de Shopify para que las ventas web descuenten bien."
      right={<><label className="btn" style={{ margin: 0 }}>Importar productos de Shopify (CSV)<input type="file" accept=".csv" hidden onChange={onFile} /></label><button className="btn pk" onClick={openProductoNuevo}>Nuevo producto</button></>} />
    {S.catPreview && <Preview />}
    {P.length ? <Table heads={['SKU', 'Producto', 'Línea', ['PVP web', 'r'], 'Fórmula', 'Mínimos', 'Estado']}
      rows={P.map(p => (
        <Fila key={p.id} onOpen={() => openProductoEditar(p.id)}>
          <td className="nowrap"><b>{p.id}</b></td><td>{p.nombre}<div className="sub">{p.presentacion || ''}</div></td><td>{p.linea || '—'}</td><td className="r">{money(p.pvp)}</td>
          <td>{(p.bom || []).length ? `${p.bom.length} insumos` : <span className="sub">sin definir</span>}</td>
          <td>{Object.values(p.stockMin || {}).some(v => N(v)) ? 'Sí' : <span className="sub">no</span>}</td>
          <td>{p.activo === false ? <span className="chip ol">Inactivo</span> : <span className="chip">Activo</span>}</td>
        </Fila>))} />
      : <Empty>No hay productos. Importa el CSV de productos de Shopify o créalos uno por uno.</Empty>}
    <header className="ph" style={{ marginTop: 34 }}>
      <div><h2>Material de empaque</h2><p className="lede">Envases, tapas, etiquetas y cajas. Solo se controlan en la bodega de la planta.</p></div>
      <div className="btns" style={{ margin: 0 }}><button className="btn" onClick={openInsumoNuevo}>Nuevo insumo</button></div>
    </header>
    {I.length ? <Table heads={['Insumo', 'Unidad', ['Mínimo en planta', 'r'], ['Usado en', 'r']]}
      rows={I.map(i => (
        <Fila key={i.id} onOpen={() => openInsumoEditar(i.id)}>
          <td>{i.nombre}</td><td>{i.unidad || 'unidad'}</td><td className="r">{i.stockMin ? num(i.stockMin) : '—'}</td>
          <td className="r">{L('productos').filter(p => (p.bom || []).some(b => b.insumo === i.id)).length} productos</td>
        </Fila>))} />
      : <Empty>No hay insumos. Créalos para poder definir la fórmula de materiales de cada producto.</Empty>}
  </>);
}
