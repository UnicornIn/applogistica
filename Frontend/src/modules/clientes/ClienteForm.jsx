import { S } from '../../lib/store.js';
import { TIPOS_CLI } from '../../lib/constants.js';
import { cli, bodegas } from '../../lib/data.js';
import { db } from '../../services/db.js';
import { N, safeId } from '../../lib/format.js';
import { openModal, closeModal, run, go } from '../../lib/ui.js';

function Form({ x }){
  const v = k => x[k] ?? '';
  const submit = async ev => {
    ev.preventDefault(); const e = ev.currentTarget.elements;
    const ex = x.id ? cli(x.id) : null;
    const base = ex ? Object.fromEntries(Object.entries(ex).filter(([k]) => k !== 'id')) : {};
    const data = { ...base, nombre: e.nombre.value.trim(), tipo: e.tipo.value, nit: e.nit.value.trim(), ciudad: e.ciudad.value.trim(), direccion: e.direccion.value.trim(), contacto: e.contacto.value.trim(), telefono: e.telefono.value.trim(), email: e.email.value.trim(), bodegaId: e.bodegaId.value, descuento: N(e.descuento.value), pedidoMinimo: N(e.pedidoMinimo.value), activo: e.activo.checked, precios: ex?.precios || {}, creado: ex?.creado || Date.now() };
    const id = ex ? ex.id : safeId((data.nit || data.nombre) + '-' + Math.random().toString(36).slice(2, 5));
    if(await run(() => db.doc('clientes/' + id).set(data), ex ? 'Cliente actualizado.' : 'Cliente creado.')){ closeModal(); if(!ex) go('cliente', id, 'precios'); }
  };
  return (
    <form onSubmit={submit}>
      <div className="grid2">
        <div><label htmlFor="cf-n">Nombre o razón social</label><input id="cf-n" name="nombre" defaultValue={v('nombre')} required /></div>
        <div><label htmlFor="cf-t">Tipo</label><select id="cf-t" name="tipo" defaultValue={x.tipo || TIPOS_CLI[0]}>{TIPOS_CLI.map(t => <option key={t}>{t}</option>)}</select></div>
        <div><label htmlFor="cf-nit">NIT o cédula</label><input id="cf-nit" name="nit" defaultValue={v('nit')} /></div>
        <div><label htmlFor="cf-c">Ciudad</label><input id="cf-c" name="ciudad" defaultValue={v('ciudad')} /></div>
        <div><label htmlFor="cf-d">Dirección de entrega</label><input id="cf-d" name="direccion" defaultValue={v('direccion')} /></div>
        <div><label htmlFor="cf-ct">Contacto</label><input id="cf-ct" name="contacto" defaultValue={v('contacto')} /></div>
        <div><label htmlFor="cf-tel">Teléfono</label><input id="cf-tel" name="telefono" defaultValue={v('telefono')} /></div>
        <div><label htmlFor="cf-e">Correo</label><input id="cf-e" type="email" name="email" defaultValue={v('email')} /></div>
      </div>
      <h3>Condiciones comerciales</h3>
      <div className="grid3">
        <div><label htmlFor="cf-b">Bodega que despacha sus pedidos</label>
          <select id="cf-b" name="bodegaId" defaultValue={x.bodegaId || ''} required><option value="">Elige una bodega</option>{bodegas().map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}</select></div>
        <div><label htmlFor="cf-ds">Descuento general sobre PVP (%)</label><input id="cf-ds" type="number" min="0" max="100" step="0.1" name="descuento" defaultValue={v('descuento')} /></div>
        <div><label htmlFor="cf-m">Pedido mínimo (COP)</label><input id="cf-m" type="number" min="0" name="pedidoMinimo" defaultValue={v('pedidoMinimo')} /></div>
      </div>
      <p className="help">Los precios especiales por producto se fijan en la ficha del cliente.</p>
      <label className="inline"><input type="checkbox" name="activo" defaultChecked={x.activo !== false} /> Cliente activo</label>
      <div className="btns"><button className="btn pk" type="submit">{x.id ? 'Guardar cambios' : 'Crear cliente'}</button></div>
    </form>
  );
}
export const openClienteNuevo = () => openModal('Nuevo cliente', <Form x={{}} />, { wide: true });
export const openClienteEditar = id => openModal('Editar cliente', <Form x={cli(id) || {}} />, { wide: true });
