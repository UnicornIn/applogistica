import { useState } from 'react';
import { S } from '../../lib/store.js';
import { L, cli, bodegas, bodName, prodName } from '../../lib/data.js';
import { ctx, isRealAdmin } from '../../lib/access.js';
import { addMov } from '../../lib/inventory.js';
import { db } from '../../services/db.js';
import { N, num, money, fdt, toDI, fromDI } from '../../lib/format.js';
import { openModal, closeModal, toast, run } from '../../lib/ui.js';
import { Table, Pipe } from '../../components/ui.jsx';
import { DEV_FLOW, DEV_PASOS } from './constants.js';

const upd = (id, data) => db.doc('devoluciones/' + id).update(data);

function Aprobar({ d }){
  const val = (d.items || []).reduce((s, i) => s + N(i.cant) * N(i.precio), 0);
  const [bodega, setBodega] = useState(cli(d.clienteId)?.bodegaId || bodegas()[0]?.id || '');
  const [valor, setValor] = useState(Math.round(val)); const [rechazo, setRechazo] = useState('');
  const aprobar = async e => { e.preventDefault(); if(await run(() => upd(d.id, { estado: 'aprobada', bodega, valor: N(valor), fechas: { aprobada: Date.now() } }), 'Devolución aprobada. Pasa a la bodega.')) closeModal(); };
  const rechazar = async () => {
    const m = rechazo.trim(); if(!m){ toast('Escribe el motivo del rechazo.', true); document.getElementById('da-r')?.focus(); return; }
    if(await run(() => upd(d.id, { estado: 'rechazada', motivoRechazo: m, fechas: { rechazada: Date.now() } }), 'Devolución rechazada.')) closeModal();
  };
  return (<><h3>Paso 2: aprobación</h3>
    <form onSubmit={aprobar}>
      <div className="grid2">
        <div><label htmlFor="da-b">Bodega que recibe</label><select id="da-b" value={bodega} onChange={e => setBodega(e.target.value)}>{bodegas().map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}</select></div>
        <div><label htmlFor="da-v">Valor de la nota crédito</label><input id="da-v" type="number" min="0" value={valor} onChange={e => setValor(e.target.value)} /></div>
      </div>
      <label htmlFor="da-r">Motivo si la rechazas</label><input id="da-r" value={rechazo} onChange={e => setRechazo(e.target.value)} placeholder="Solo si vas a rechazarla" />
      <div className="btns"><button className="btn pk" type="submit">Aprobar devolución</button><button className="btn" type="button" onClick={rechazar}>Rechazar</button></div>
    </form></>);
}

function Recibir({ d }){
  const ped = L('pedidos').find(p => p.id === d.pedidoId);
  const [rows, setRows] = useState((d.items || []).map(i => ({ lote: (ped?.lineasDespacho || []).find(x => x.item === i.sku)?.lote || '', ok: N(i.cant), no: 0 })));
  const set = (k, f, v) => setRows(rows.map((r, i) => i === k ? { ...r, [f]: v } : r));
  const submit = async e => {
    e.preventDefault();
    const lineas = [], noVend = [];
    (d.items || []).forEach((i, k) => { const ok = N(rows[k].ok), no = N(rows[k].no), lote = rows[k].lote.trim() || 'DEV';
      if(ok > 0) lineas.push({ clase: 'pt', item: i.sku, lote, cant: ok }); if(no > 0) noVend.push({ sku: i.sku, lote, cant: no }); });
    if(await run(async () => { await addMov('devolucion', d.bodega, lineas, d.id); await upd(d.id, { estado: 'recibida', recepcion: { lineas, noVendible: noVend, por: S.me?.id || '' }, fechas: { recibida: Date.now() } }); }, 'Devolución recibida. Pasa a facturación para la nota crédito.')) closeModal();
  };
  return (<><h3>Paso 3: recepción en {bodName(d.bodega)}</h3>
    <p className="sub">Lo vendible vuelve al inventario con su lote. Lo no vendible queda registrado y no suma stock.</p>
    <form onSubmit={submit}>
      <Table heads={['Producto', 'Lote', ['Vendibles', 'r'], ['No vendibles', 'r']]}
        rows={(d.items || []).map((i, k) => <tr key={k}><td>{prodName(i.sku)} <span className="sub">{num(i.cant)} u.</span></td>
          <td><input value={rows[k].lote} onChange={e => set(k, 'lote', e.target.value)} required aria-label="Lote" /></td>
          <td className="r"><input type="number" min="0" value={rows[k].ok} onChange={e => set(k, 'ok', e.target.value)} aria-label="Vendibles" /></td>
          <td className="r"><input type="number" min="0" value={rows[k].no} onChange={e => set(k, 'no', e.target.value)} aria-label="No vendibles" /></td></tr>)} />
      <div className="btns"><button className="btn pk" type="submit">Confirmar recepción</button></div>
    </form></>);
}

function NotaCredito({ d }){
  const [numero, setNumero] = useState(''); const [fecha, setFecha] = useState(toDI(Date.now()));
  const submit = async e => { e.preventDefault(); const n = numero.trim(); if(!n) return;
    if(await run(() => upd(d.id, { estado: 'cerrada', notaCredito: { numero: n, fecha: fromDI(fecha) }, fechas: { cerrada: Date.now() } }), `Nota crédito ${n} registrada. Devolución cerrada.`)) closeModal(); };
  return (<><h3>Paso 4: nota crédito</h3>
    <form onSubmit={submit}>
      <div className="grid2">
        <div><label htmlFor="nc-n">Número de la nota crédito en Siigo</label><input id="nc-n" value={numero} onChange={e => setNumero(e.target.value)} required placeholder="NC-0000" /></div>
        <div><label htmlFor="nc-f">Fecha</label><input id="nc-f" type="date" value={fecha} onChange={e => setFecha(e.target.value)} required /></div>
      </div>
      <div className="btns"><button className="btn pk" type="submit">Registrar nota crédito</button></div>
    </form></>);
}

function Recepcion({ d }){
  const lote = i => [...(d.recepcion.lineas || []), ...(d.recepcion.noVendible || []).map(x => ({ item: x.sku, lote: x.lote }))].find(l => l.item === i.sku)?.lote || '—';
  const sum = (arr, key, sku) => (arr || []).filter(l => l[key] === sku).reduce((s, l) => s + N(l.cant), 0);
  return (<><h3>Recepción</h3>
    <Table heads={['Producto', 'Lote', ['Vendible', 'r'], ['No vendible', 'r']]}
      rows={(d.items || []).map(i => <tr key={i.sku}><td>{prodName(i.sku)}</td><td>{lote(i)}</td><td className="r">{num(sum(d.recepcion.lineas, 'item', i.sku))}</td><td className="r">{num(sum(d.recepcion.noVendible, 'sku', i.sku))}</td></tr>)} /></>);
}

function Detalle({ id }){
  const d = L('devoluciones').find(x => x.id === id); if(!d) return null;
  const c = ctx(), idx = DEV_FLOW.indexOf(d.estado);
  return (<>
    <div className="kv">
      <div><span>Cliente</span><b>{cli(d.clienteId)?.nombre || '—'}</b></div><div><span>Pedido</span><b>{d.pedidoId}</b></div>
      <div><span>Motivo</span><b>{d.motivo}</b></div><div><span>Bodega que recibe</span><b>{d.bodega ? bodName(d.bodega) : 'Por definir'}</b></div>
      {d.valor ? <div><span>Valor nota crédito</span><b>{money(d.valor)}</b></div> : null}
      {d.notaCredito?.numero ? <div><span>Nota crédito Siigo</span><b>{d.notaCredito.numero}</b></div> : null}
    </div>
    {d.estado === 'rechazada'
      ? <div className="err">Rechazada el {fdt(d.fechas?.rechazada)}: {d.motivoRechazo || ''}</div>
      : <><Pipe estado={d.estado} flow={DEV_FLOW} big />
          <div className="steps s4">{DEV_PASOS.map(([e, t, , who], k) => <div key={e} className={k <= idx ? undefined : 'off'}><b>{t}</b>{who}<br />{fdt(d.fechas?.[e])}</div>)}</div></>}
    {d.nota && <div className="note">{d.nota}</div>}
    <Table heads={['Producto', ['Unidades', 'r'], ['Precio', 'r']]} rows={(d.items || []).map(i => <tr key={i.sku}><td>{prodName(i.sku)}</td><td className="r">{num(i.cant)}</td><td className="r">{money(i.precio)}</td></tr>)} />
    {d.recepcion && <Recepcion d={d} />}
    {isRealAdmin(c) && d.estado === 'solicitada' && <Aprobar d={d} />}
    {d.estado === 'aprobada' && (isRealAdmin(c) || (c.rol === 'bodega' && c.bodegaId === d.bodega)) && <Recibir d={d} />}
    {d.estado === 'recibida' && (isRealAdmin(c) || c.rol === 'facturacion') && <NotaCredito d={d} />}
  </>);
}
export const openDev = id => { if(L('devoluciones').some(x => x.id === id)) openModal(`Devolución ${id}`, <Detalle id={id} />, { wide: true }); };
