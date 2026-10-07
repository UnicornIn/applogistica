import { S } from './store.js';
import { L } from './data.js';
import { ACTIVE } from './constants.js';
export function access(){
  if(S.isOwner) return {rol:'admin'};
  const u = L('usuarios').find(x => x.id===S.me?.id);
  return (u && u.activo!==false) ? u : null;
}
export function ctx(){
  const a = access();
  if(a?.rol==='admin' && S.preview) return {...S.preview, preview:true};
  return a;
}
export const isRealAdmin = c => c.rol==='admin' && !c.preview;

export const NAV = {
  admin:[
    ['Operación',[['inicio','Inicio'],['pedidos','Pedidos'],['inventario','Inventario'],['kardex','Kardex'],['traslados','Traslados'],['devoluciones','Devoluciones']]],
    ['Producción',[['plan','Plan de producción'],['produccion','Órdenes de producción'],['calidad','Liberación de lotes']]],
    ['Facturación',[['facturacion','Por facturar']]],
    ['Maestros',[['clientes','Clientes'],['catalogo','Catálogo'],['shopify','Tienda web']]],
    ['Sistema',[['usuarios','Usuarios'],['config','Configuración']]]
  ],
  distribuidor:[[null,[['nuevo','Nuevo pedido'],['pedidos','Mis pedidos'],['devoluciones','Devoluciones']]]],
  bodega:[[null,[['preparar','Pedidos por despachar'],['traslados','Traslados'],['devoluciones','Devoluciones'],['inventario','Inventario'],['kardex','Kardex']]]],
  planta:[[null,[['plan','Plan de producción'],['produccion','Órdenes de producción'],['inventario','Inventario planta'],['kardex','Kardex']]]],
  calidad:[[null,[['calidad','Liberación de lotes'],['produccion','Órdenes de producción']]]],
  facturacion:[[null,[['facturacion','Por facturar'],['pedidos','Pedidos'],['devoluciones','Devoluciones']]]]
};
export const navViews = rol => (NAV[rol]||[]).flatMap(g=>g[1].map(x=>x[0]));
export const EXTRA = {admin:['cliente','pedido'], facturacion:['cliente','pedido'], distribuidor:['pedido'], bodega:['pedido'], planta:[], calidad:[]};

export function badge(v, c){
  const P = L('pedidos'), D = L('devoluciones');
  switch(v){
    case 'pedidos': return c.rol==='admin' ? P.filter(p=>p.estado==='recibido'||p.estado==='asignado').length : 0;
    case 'facturacion': return P.filter(p=>p.estado==='despachado').length + D.filter(d=>d.estado==='recibida').length;
    case 'calidad': return L('producciones').filter(o=>o.estado==='por_liberar').length;
    case 'devoluciones': return c.rol==='admin' ? D.filter(d=>d.estado==='solicitada').length
                         : c.rol==='bodega' ? D.filter(d=>d.estado==='aprobada'&&d.bodega===c.bodegaId).length
                         : c.rol==='facturacion' ? D.filter(d=>d.estado==='recibida').length : 0;
    case 'preparar': return P.filter(p=>p.bodega===c.bodegaId && ACTIVE.includes(p.estado)).length;
    case 'traslados': return c.rol==='bodega' ? L('traslados').filter(t=>(t.estado==='pendiente'&&t.origen===c.bodegaId)||(t.estado==='en_transito'&&t.destino===c.bodegaId)).length : 0;
    default: return 0;
  }
}
