import Papa from 'papaparse';
import { S, bump } from '../../lib/store.js';
import { L, cfg, prod } from '../../lib/data.js';
import { addMov, pick } from '../../lib/inventory.js';
import { db } from '../../services/db.js';
import { N, safeId } from '../../lib/format.js';
import { toast, run } from '../../lib/ui.js';

export const shopCfg = () => L('config').find(d => d.id === 'shopify') || {};

/* Lee el CSV de pedidos de Shopify y deja la vista previa en S.shopPreview. */
export function parseShopify(file){
  Papa.parse(file, { header: true, skipEmptyLines: true, complete: res => {
    const rows = res.data;
    if(!rows.length || !('Name' in rows[0]) || !('Lineitem sku' in rows[0])){ toast('El archivo no parece una exportación de pedidos de Shopify. Debe tener las columnas Name y Lineitem sku.', true); return; }
    const imp = new Set(shopCfg().importados || []), orders = new Map(), skip = new Set();
    for(const r of rows){
      const name = (r['Name'] || '').trim(); if(!name) continue;
      if(!orders.has(name)){ orders.set(name, []); const fs = (r['Financial Status'] || '').toLowerCase(); if(r['Cancelled at'] || fs === 'refunded' || fs === 'voided') skip.add(name); }
      const sku = (r['Lineitem sku'] || '').trim(), q = N(r['Lineitem quantity']); if(sku && q > 0) orders.get(name).push({ sku, q });
    }
    const nuevos = [], porSku = {}, desconocidos = new Set(); let repetidos = 0;
    for(const [name, lines] of orders){
      if(skip.has(name)) continue;
      if(imp.has(name)){ repetidos++; continue; }
      nuevos.push(name);
      for(const l of lines){ const id = safeId(l.sku); if(!prod(id)){ desconocidos.add(l.sku); continue; } porSku[id] = (porSku[id] || 0) + l.q; }
    }
    S.shopPreview = { nuevos, repetidos, omitidos: skip.size, porSku, desconocidos: [...desconocidos] }; bump();
  }, error: () => toast('No se pudo leer el archivo.', true) });
}
export const shopCancel = () => { S.shopPreview = null; bump(); };
export async function shopConfirm(){
  const sp = S.shopPreview, wb = cfg().bodegaWeb; if(!sp || !wb) return;
  const lineas = [];
  for(const [sku, q] of Object.entries(sp.porSku)){
    const r = pick(wb, 'pt', sku, q); r.lineas.forEach(l => lineas.push({ ...l, cant: -l.cant }));
    if(r.faltante > 0) lineas.push({ clase: 'pt', item: sku, lote: 'SIN-LOTE', cant: -r.faltante });
  }
  const names = sp.nuevos, ref = names.length > 3 ? `${names[0]} a ${names[names.length - 1]} (${names.length} pedidos)` : names.join(', ');
  const ok = await run(async () => {
    await addMov('venta_web', wb, lineas, ref, 'Importado desde CSV de Shopify');
    const prev = shopCfg().importados || [];
    await db.doc('config/shopify').set({ importados: [...new Set([...prev, ...names])].slice(-8000), ultima: Date.now() });
  });
  if(ok){ S.shopPreview = null; bump(); toast(`${names.length} pedidos web descontados del inventario.`); }
}
