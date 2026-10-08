import { S } from './store.js';
import { db } from '../services/db.js';
import { N } from './format.js';
import { ACTIVE } from './constants.js';
import { L, cfg, bodegas, prod, activos } from './data.js';
let _stk = {src:null, map:null};
export function stockMap(){
  const mv = L('movimientos');
  if(_stk.src === mv) return _stk.map;
  const m = new Map();
  for(const d of mv){
    for(const l of (d.lineas||[])){
      const lote = l.lote || '-';
      const k = `${d.bodega}|${l.clase}|${l.item}|${lote}`;
      const e = m.get(k) || {bodega:d.bodega, clase:l.clase, item:l.item, lote, desde:Infinity, cant:0};
      e.cant += N(l.cant);
      if(N(l.cant)>0 && d.fecha<e.desde) e.desde = d.fecha;
      m.set(k, e);
    }
  }
  _stk = {src:mv, map:m};
  return m;
}
export function lotes(b, clase, item){
  const out = [];
  for(const e of stockMap().values()) if(e.bodega===b && e.clase===clase && e.item===item && Math.abs(e.cant)>1e-6) out.push(e);
  return out.sort((a,c)=>a.desde-c.desde);
}
export function stock(b, clase, item){ let s=0; for(const e of stockMap().values()) if(e.bodega===b && e.clase===clase && e.item===item) s+=e.cant; return s; }
export function reservado(b, sku, exceptPedido){
  let r=0;
  for(const p of L('pedidos')) if(ACTIVE.includes(p.estado) && p.bodega===b && p.id!==exceptPedido) for(const i of p.items||[]) if(i.sku===sku) r+=N(i.cant);
  for(const t of L('traslados')) if(t.estado==='pendiente' && t.origen===b) for(const i of t.items||[]) if(i.sku===sku) r+=N(i.cant);
  return r;
}
export const dispB = (b, sku, exceptPedido) => stock(b,'pt',sku) - reservado(b, sku, exceptPedido);
export const dispTotal = sku => bodegas().reduce((s,b)=>s+dispB(b.id,sku),0);
export function pick(b, clase, item, qty){
  const out=[]; let rest=N(qty);
  for(const e of lotes(b,clase,item)){
    if(rest<=0) break; if(e.cant<=0) continue;
    const t=Math.min(e.cant, rest);
    out.push({clase, item, lote:e.lote, cant:t}); rest-=t;
  }
  return {lineas:out, faltante:Math.max(0,rest)};
}
export async function addMov(tipo, bodega, lineas, ref, nota){
  if(!lineas.length) return;
  await db.collection('movimientos').add({tipo, bodega, lineas, ref:ref||'', nota:nota||'', fecha:Date.now(), usuario:S.me?.id||''});
}
export function alertasStock(){
  const out=[];
  for(const p of activos()) for(const b of bodegas()){
    const min = N(p.stockMin?.[b.id]); if(!min) continue;
    const d = dispB(b.id, p.id); if(d < min) out.push({bodega:b.id, nombre:p.nombre, sku:p.id, disp:d, min, clase:'pt'});
  }
  const pl = cfg().bodegaPlanta;
  if(pl) for(const i of L('insumos')){ const min=N(i.stockMin); if(!min) continue; const s=stock(pl,'in',i.id); if(s<min) out.push({bodega:pl, nombre:i.nombre, sku:i.id, disp:s, min, clase:'in'}); }
  return out;
}
export function precioCliente(c, sku){
  const p = prod(sku); if(!p || !c) return 0;
  const o = c.precios?.[sku];
  if(o!==undefined && o!==null && o!=='') return N(o);
  return Math.round(N(p.pvp) * (1 - N(c.descuento)/100));
}
