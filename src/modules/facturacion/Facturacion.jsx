import { S, bump } from '../../lib/store.js';
import { L, cfg, cli, bodName } from '../../lib/data.js';
import { inR } from '../../lib/rango.js';
import { N, money, fd, fdt } from '../../lib/format.js';
import { openPedido } from '../../lib/ui.js';
import { Head, Table, Empty } from '../../components/ui.jsx';
import DateBar from '../../components/DateBar.jsx';
import { openDev } from '../devoluciones/DevolucionDetalle.jsx';

const Fila = ({ onOpen, children }) => (
  <tr className="click" tabIndex={0} onClick={onOpen} onKeyDown={e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); onOpen(); } }}>{children}</tr>
);

function NotasCredito({ D }){
  const cola = D.filter(d => d.estado === 'recibida').sort((a, b) => (a.fechas?.recibida || 0) - (b.fechas?.recibida || 0));
  const hist = D.filter(d => d.estado === 'cerrada' && inR(d.fechas?.cerrada)).sort((a, b) => (b.fechas?.cerrada || 0) - (a.fechas?.cerrada || 0));
  return (<>
    {cola.length ? <Table heads={['Devolución', 'Cliente', 'Pedido', 'Recibida', ['Valor', 'r']]}
      rows={cola.map(d => <Fila key={d.id} onOpen={() => openDev(d.id)}><td><b>{d.id}</b></td><td>{cli(d.clienteId)?.nombre || '—'}</td><td>{d.pedidoId}</td><td className="nowrap">{fdt(d.fechas?.recibida)}</td><td className="r">{money(d.valor)}</td></Fila>)} />
      : <Empty>No hay notas crédito pendientes.</Empty>}
    <h3>Notas crédito emitidas</h3>
    <DateBar label="Fecha" />
    {hist.length ? <Table heads={['Nota crédito', 'Devolución', 'Cliente', 'Fecha', ['Valor', 'r']]}
      rows={hist.map(d => <Fila key={d.id} onOpen={() => openDev(d.id)}><td><b>{d.notaCredito?.numero || '—'}</b></td><td>{d.id}</td><td>{cli(d.clienteId)?.nombre || '—'}</td><td>{fd(d.notaCredito?.fecha)}</td><td className="r">{money(d.valor)}</td></Fila>)} />
      : <Empty>No hay notas crédito en estas fechas.</Empty>}
  </>);
}

function Facturas({ P }){
  const cola = P.filter(p => p.estado === 'despachado').sort((a, b) => (a.fechas?.despachado || 0) - (b.fechas?.despachado || 0));
  const hist = P.filter(p => p.estado === 'facturado' && inR(p.factura?.fecha || p.fechas?.facturado)).sort((a, b) => (b.fechas?.facturado || 0) - (a.fechas?.facturado || 0));
  const tot = hist.reduce((s, p) => s + N(p.total), 0);
  return (<>
    {cola.length ? <Table heads={['Pedido', 'Cliente', 'NIT', 'Despachado', ['Total', 'r'], 'Bodega']}
      rows={cola.map(p => <Fila key={p.id} onOpen={() => openPedido(p.id)}><td><b>{p.id}</b></td><td>{cli(p.clienteId)?.nombre || '—'}</td><td>{cli(p.clienteId)?.nit || '—'}</td><td className="nowrap">{fdt(p.fechas?.despachado)}</td><td className="r">{money(p.total)}</td><td>{bodName(p.bodega)}</td></Fila>)} />
      : <Empty>No hay pedidos por facturar.</Empty>}
    <h3>Facturados</h3>
    <DateBar label="Fecha de factura" />
    {hist.length ? <>
      <p className="sub">{hist.length} facturas por {money(tot)}</p>
      <Table heads={['Factura', 'Pedido', 'Cliente', 'Fecha', ['Total', 'r']]}
        rows={hist.map(p => <Fila key={p.id} onOpen={() => openPedido(p.id)}><td><b>{p.factura?.numero || '—'}</b></td><td>{p.id}</td><td>{cli(p.clienteId)?.nombre || '—'}</td><td>{fd(p.factura?.fecha)}</td><td className="r">{money(p.total)}</td></Fila>)} /></>
      : <Empty>No hay facturas en estas fechas.</Empty>}
  </>);
}

export default function Facturacion(){
  const P = L('pedidos'), D = L('devoluciones'), t = S.facTab, mail = cfg().correoFacturacion;
  const nP = P.filter(p => p.estado === 'despachado').length, nD = D.filter(d => d.estado === 'recibida').length;
  const tab = (k, txt, n) => <button role="tab" className={t === k ? 'on' : ''} aria-selected={t === k} onClick={() => { S.facTab = k; bump(); }}>{txt} <span className="sub">{n}</span></button>;
  return (<>
    <Head t="Por facturar" sub={`Pedidos despachados que esperan factura y devoluciones recibidas que esperan nota crédito en Siigo.${mail ? ` Los avisos por correo van a ${mail}.` : ''}`} />
    <div className="tabs" role="tablist">{tab('pedidos', 'Facturas', nP)}{tab('nc', 'Notas crédito', nD)}</div>
    {t === 'nc' ? <NotasCredito D={D} /> : <Facturas P={P} />}
  </>);
}
