import { ins } from '../../lib/data.js';
import { db } from '../../services/db.js';
import { N, safeId } from '../../lib/format.js';
import { openModal, closeModal, run } from '../../lib/ui.js';

const UNIDADES = ['unidad', 'g', 'kg', 'ml', 'l', 'rollo', 'caja'];
function Form({ i }){
  const submit = async ev => {
    ev.preventDefault(); const e = ev.currentTarget.elements;
    const id = i.id || safeId(e.nombre.value.toLowerCase() + '-' + Math.random().toString(36).slice(2, 5));
    if(await run(() => db.doc('insumos/' + id).set({ nombre: e.nombre.value.trim(), unidad: e.unidad.value, stockMin: N(e.stockMin.value) }), 'Insumo guardado.')) closeModal();
  };
  return (
    <form onSubmit={submit}>
      <label htmlFor="if-n">Nombre</label><input id="if-n" name="nombre" defaultValue={i.nombre || ''} required placeholder="Envase 250 ml" />
      <div className="grid2">
        <div><label htmlFor="if-u">Unidad</label><select id="if-u" name="unidad" defaultValue={i.unidad || 'unidad'}>{UNIDADES.map(u => <option key={u}>{u}</option>)}</select></div>
        <div><label htmlFor="if-m">Stock mínimo en planta</label><input id="if-m" type="number" min="0" name="stockMin" defaultValue={i.stockMin ?? ''} /></div>
      </div>
      <div className="btns"><button className="btn pk" type="submit">Guardar</button></div>
    </form>
  );
}
export const openInsumoNuevo = () => openModal('Nuevo insumo', <Form i={{}} />);
export const openInsumoEditar = id => openModal('Editar insumo', <Form i={ins(id) || {}} />);
