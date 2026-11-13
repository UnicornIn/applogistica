import Papa from 'papaparse';
import { S, bump } from '../../lib/store.js';
import { db } from '../../services/db.js';
import { prod } from '../../lib/data.js';
import { N, safeId } from '../../lib/format.js';
import { toast, run } from '../../lib/ui.js';

/* Lee el CSV de productos de Shopify y deja la vista previa en S.catPreview. */
export function parseCatalog(file){
  Papa.parse(file, { header: true, skipEmptyLines: true, complete: res => {
    const rows = res.data;
    if(!rows.length || !('Variant SKU' in rows[0])){ toast('El archivo no parece una exportación de productos de Shopify. Debe tener la columna Variant SKU.', true); return; }
    const titles = {}, out = [], seen = new Set();
    for(const r of rows){
      const h = r['Handle']; if(r['Title']) titles[h] = { t: r['Title'], type: r['Type'] || r['Product Category'] || '' };
      const sku = (r['Variant SKU'] || '').trim(); if(!sku || seen.has(sku)) continue; seen.add(sku);
      const base = titles[h]?.t || h || sku, opt = r['Option1 Value'] && r['Option1 Value'] !== 'Default Title' ? r['Option1 Value'] : '';
      out.push({ sku, nombre: opt ? `${base} ${opt}` : base, pvp: N(r['Variant Price']), presentacion: opt, linea: titles[h]?.type || '' });
    }
    if(!out.length){ toast('No encontré productos con SKU en el archivo.', true); return; }
    S.catPreview = out; bump();
  }, error: () => toast('No se pudo leer el archivo.', true) });
}
export const catCancel = () => { S.catPreview = null; bump(); };
export async function catConfirm(){
  const list = S.catPreview || []; let n = 0;
  const ok = await run(async () => {
    for(const r of list){ const id = safeId(r.sku), ex = prod(id);
      if(ex) await db.doc('productos/' + id).update({ nombre: r.nombre, pvp: r.pvp });
      else await db.doc('productos/' + id).set({ nombre: r.nombre, pvp: r.pvp, linea: r.linea || '', presentacion: r.presentacion || '', activo: true, stockMin: {}, bom: [] });
      n++; }
  });
  if(ok){ S.catPreview = null; bump(); toast(`${n} productos importados.`); }
}
