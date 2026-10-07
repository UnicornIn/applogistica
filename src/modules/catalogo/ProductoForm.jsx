import { L, prod, bodegas } from '../../lib/data.js';
import { db } from '../../services/db.js';
import { N, safeId } from '../../lib/format.js';
import { openModal, closeModal, toast, run } from '../../lib/ui.js';

function Form({ p }){
  const edit = !!p.id, bomMap = Object.fromEntries((p.bom || []).map(b => [b.insumo, b.cant]));
  const submit = async ev => {
    ev.preventDefault(); const e = ev.currentTarget.elements, id = p.id || safeId(e.sku.value);
    if(!p.id && prod(id)){ toast('Ya existe un producto con ese SKU.', true); return; }
    const stockMin = {}; bodegas().forEach(b => { const v = N(e['min_' + b.id]?.value); if(v) stockMin[b.id] = v; });
    const bom = L('insumos').map(i => ({ insumo: i.id, cant: N(e['bom_' + i.id]?.value) })).filter(b => b.cant > 0);
    if(await run(() => db.doc('productos/' + id).set({ nombre: e.nombre.value.trim(), linea: e.linea.value.trim(), presentacion: e.presentacion.value.trim(), pvp: N(e.pvp.value), activo: e.activo.checked, stockMin, bom }), 'Producto guardado.')) closeModal();
  };
  return (
    <form onSubmit={submit}>
      <div className="grid2">
        <div><label htmlFor="pf-s">SKU (igual que en Shopify)</label><input id="pf-s" name="sku" defaultValue={p.id || ''} readOnly={edit} required /></div>
        <div><label htmlFor="pf-n">Nombre</label><input id="pf-n" name="nombre" defaultValue={p.nombre || ''} required /></div>
        <div><label htmlFor="pf-l">Línea</label><input id="pf-l" name="linea" defaultValue={p.linea || ''} placeholder="Special, Men, Plus, Litro, Accesorios" /></div>
        <div><label htmlFor="pf-p">Presentación</label><input id="pf-p" name="presentacion" defaultValue={p.presentacion || ''} placeholder="250 ml" /></div>
        <div><label htmlFor="pf-v">PVP en la web (COP)</label><input id="pf-v" type="number" min="0" name="pvp" defaultValue={p.pvp ?? ''} required /></div>
        <div><label className="inline" style={{ marginTop: 36 }}><input type="checkbox" name="activo" defaultChecked={p.activo !== false} /> Producto activo</label></div>
      </div>
      <h3>Stock mínimo por bodega</h3>
      <div className="grid3">{bodegas().map(b => <div key={b.id}><label htmlFor={'pm-' + b.id}>{b.nombre}</label><input id={'pm-' + b.id} type="number" min="0" name={'min_' + b.id} defaultValue={p.stockMin?.[b.id] ?? ''} /></div>)}</div>
      <h3>Fórmula de materiales (por unidad)</h3>
      {L('insumos').length
        ? <div className="grid3">{L('insumos').map(i => <div key={i.id}><label htmlFor={'pb-' + i.id}>{i.nombre}</label><input id={'pb-' + i.id} type="number" min="0" step="any" name={'bom_' + i.id} defaultValue={bomMap[i.id] ?? ''} placeholder="0" /></div>)}</div>
        : <p className="sub">Crea primero los insumos de empaque para definir la fórmula.</p>}
      <div className="btns"><button className="btn pk" type="submit">{edit ? 'Guardar cambios' : 'Crear producto'}</button></div>
    </form>
  );
}
export const openProductoNuevo = () => openModal('Nuevo producto', <Form p={{}} />, { wide: true });
export const openProductoEditar = id => openModal('Editar producto', <Form p={prod(id) || {}} />, { wide: true });
