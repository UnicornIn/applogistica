import { L } from '../../lib/data.js';
import { N, DAY, ymd, safeId } from '../../lib/format.js';

export const OP_EST = { planeada: 'Planeada', en_proceso: 'En proceso', por_liberar: 'Por liberar (calidad)', liberada: 'Liberada', rechazada: 'Rechazada', cancelada: 'Cancelada' };

/* Unidades vendidas por día en los últimos 90 días (mínimo 14 días de base). */
export function consumoDiario(sku){
  const now = Date.now(), desde = now - 90 * DAY; let total = 0, first = now;
  for(const m of L('movimientos')){
    if(m.tipo !== 'despacho_pedido' && m.tipo !== 'venta_web') continue;
    if(m.fecha < first) first = m.fecha;
    if(m.fecha < desde) continue;
    for(const l of m.lineas || []) if(l.clase === 'pt' && l.item === sku) total += -N(l.cant);
  }
  const dias = Math.max(14, Math.min(90, (now - first) / DAY));
  return total / dias;
}
export const enProduccion = sku => L('producciones')
  .filter(o => o.sku === sku && ['planeada', 'en_proceso', 'por_liberar'].includes(o.estado))
  .reduce((s, o) => s + N(o.estado === 'por_liberar' ? o.cantidadReal : o.cantidad), 0);
export const defLote = sku => safeId(`L${ymd()}-${sku}`).toUpperCase();
