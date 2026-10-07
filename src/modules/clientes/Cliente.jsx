import { S, bump } from '../../lib/store.js';
import { L, cli, bod, bodName, activos } from '../../lib/data.js';
import { isRealAdmin } from '../../lib/access.js';
import { inR } from '../../lib/rango.js';
import { db } from '../../services/db.js';
import { N, money, fd } from '../../lib/format.js';
import { go, run } from '../../lib/ui.js';
import { Head, Table, Empty, Uname } from '../../components/ui.jsx';
import DateBar from '../../components/DateBar.jsx';
import PedidosTable from '../pedidos/PedidosTable.jsx';
import { DEV_EST } from '../devoluciones/constants.js';
import { openDev } from '../devoluciones/DevolucionDetalle.jsx';
import { openClienteEditar } from './ClienteForm.jsx';
import Clientes from './Clientes.jsx';

const TABS = { resumen: 'Resumen', precios: 'Precios', pedidos: 'Pedidos', devoluciones: 'Devoluciones' };

function Resumen({ x }){
  const P = L('pedidos').filter(p => p.clienteId === x.id && p.estado !== 'cancelado');
  const comprado = P.filter(p => ['despachado', 'facturado'].includes(p.estado)).reduce((s, p) => s + N(p.total), 0);
  const ult = [...P].sort((a, b) => (b.fechas?.recibido || 0) - (a.fechas?.recibido || 0))[0];
  const users = L('usuarios').filter(u => u.clienteId === x.id);
  const kv = [['Bodega de despacho', bod(x.bodegaId) ? bodName(x.bodegaId) : 'Sin asignar'], ['NIT', x.nit], ['Dirección', x.direccion], ['Contacto', x.contacto], ['Teléfono', x.telefono], ['Correo', x.email], ['Descuento general', N(x.descuento) + '%'], ['Pedido mínimo', x.pedidoMinimo ? money(x.pedidoMinimo) : 'Sin mínimo']];
  return (<>
    <div className="stats">
      <div className="stat static"><b className="m">{money(comprado)}</b><span>Comprado (despachado)</span></div>
      <div className="stat static"><b>{P.length}</b><span>Pedidos</span></div>
      <div className="stat static"><b className="m">{ult ? fd(ult.fechas?.recibido) : '—'}</b><span>Último pedido</span></div>
    </div>
    <div className="kv" style={{ marginTop: 18 }}>{kv.map(([a, b]) => <div key={a}><span>{a}</span><b>{b || '—'}</b></div>)}</div>
    <h3>Usuarios con acceso</h3>
    {users.length ? <Table heads={['Usuario', 'Estado']} rows={users.map(u => <tr key={u.id}><td><Uname id={u.id} />{u.etiqueta ? <> <span className="sub">{u.etiqueta}</span></> : null}</td><td>{u.activo === false ? 'Inactivo' : 'Activo'}</td></tr>)} />
      : <Empty>Nadie de este cliente tiene acceso todavía. Asígnalo en Usuarios.</Empty>}
  </>);
}

function Precios({ x }){
  const submit = async ev => {
    ev.preventDefault(); const f = ev.currentTarget.elements, precios = {};
    activos().forEach(p => { const v = f['p_' + p.id]?.value; if(v !== undefined && v !== '') precios[p.id] = N(v); });
    Object.entries(x.precios || {}).forEach(([k, v]) => { if(!activos().some(p => p.id === k)) precios[k] = v; });
    const { id, ...rest } = x;
    await run(() => db.doc('clientes/' + x.id).set({ ...rest, precios }), 'Precios guardados.');
  };
  return (<>
    <p className="sub">Precio especial por producto. Vacío usa el descuento general de {N(x.descuento)}% sobre el PVP.</p>
    <form onSubmit={submit}>
      <Table heads={['Producto', ['PVP web', 'r'], ['Con descuento general', 'r'], ['Precio especial', 'r']]}
        rows={activos().map(p => <tr key={p.id}><td>{p.nombre}<div className="sub">{p.id}</div></td><td className="r">{money(p.pvp)}</td>
          <td className="r">{money(Math.round(N(p.pvp) * (1 - N(x.descuento) / 100)))}</td>
          <td className="r"><input type="number" min="0" name={'p_' + p.id} defaultValue={x.precios?.[p.id] ?? ''} aria-label={'Precio especial ' + p.nombre} /></td></tr>)} />
      <div className="btns"><button className="btn pk" type="submit">Guardar precios</button></div>
    </form></>);
}

export default function Cliente({ c, param }){
  const x = cli(param);
  if(!x){ S.view = 'clientes'; return <Clientes />; }
  const tab = S.tab || 'resumen', admin = isRealAdmin(c);
  const pedirComo = () => { S.preview = { rol: 'distribuidor', clienteId: x.id }; S.cart = {}; go('nuevo'); };
  let body = null;
  if(tab === 'resumen') body = <Resumen x={x} />;
  if(tab === 'precios' && admin) body = <Precios key={x.id} x={x} />;
  if(tab === 'pedidos'){
    const P = L('pedidos').filter(p => p.clienteId === x.id && inR(p.fechas?.recibido)).sort((a, b) => (b.fechas?.recibido || 0) - (a.fechas?.recibido || 0));
    body = <><DateBar label="Fecha del pedido" />{P.length ? <PedidosTable list={P} c={{ rol: 'distribuidor' }} /> : <Empty>No hay pedidos en estas fechas.</Empty>}</>;
  }
  if(tab === 'devoluciones'){
    const D = L('devoluciones').filter(d => d.clienteId === x.id);
    body = D.length ? <Table heads={['Devolución', 'Pedido', 'Motivo', 'Paso', ['Valor', 'r']]}
      rows={D.map(d => <tr key={d.id} className="click" tabIndex={0} onClick={() => openDev(d.id)} onKeyDown={e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openDev(d.id); } }}><td>{d.id}</td><td>{d.pedidoId}</td><td>{d.motivo}</td><td>{DEV_EST[d.estado]}</td><td className="r">{d.valor ? money(d.valor) : '—'}</td></tr>)} /> : <Empty>Sin devoluciones.</Empty>;
  }
  return (<>
    <Head t={x.nombre} sub={`${x.tipo || ''}${x.ciudad ? ', ' + x.ciudad : ''}`}
      right={<><button className="btn" onClick={() => go('clientes')}>Volver</button>{admin && <><button className="btn" onClick={() => openClienteEditar(x.id)}>Editar datos</button><button className="btn pk" onClick={pedirComo}>Hacer pedido para este cliente</button></>}</>} />
    <div className="tabs" role="tablist">
      {Object.entries(TABS).filter(([k]) => admin || k !== 'precios').map(([k, t]) => <button key={k} role="tab" aria-selected={k === tab} className={k === tab ? 'on' : ''} onClick={() => { S.tab = k; bump(); }}>{t}</button>)}
    </div>
    {body}
  </>);
}
