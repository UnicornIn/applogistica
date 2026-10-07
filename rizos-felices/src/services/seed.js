import { db } from './db.js';
import { ACCOUNTS } from './auth.js';
const KEY = 'rf:seeded';
export async function seedIfEmpty(){
  if(localStorage.getItem(KEY)) return; localStorage.setItem(KEY, '1');
  const now = Date.now();
  await db.doc('config/general').set({ bodegas:[{id:'bog',nombre:'Bogotá',tieneInsumos:false},{id:'med',nombre:'Medellín (planta)',tieneInsumos:true}], bodegaPlanta:'med', bodegaWeb:'bog', correoFacturacion:'facturacion@rizosfelices.co', objetivoDias:45 });
  const P = [['RF-001','Crema para peinar 250 ml',32000,'Cuidado'],['RF-002','Gel definidor 300 ml',28000,'Cuidado'],['RF-003','Shampoo sin sulfatos 500 ml',45000,'Limpieza']];
  for(const [id,nombre,pvp,linea] of P) await db.doc('productos/'+id).set({ nombre, pvp, linea, presentacion:'', activo:true, stockMin:{bog:10} });
  await db.doc('clientes/cli-demo').set({ nombre:'Distribuidor Demo SAS', tipo:'Distribuidor', bodegaId:'bog', descuento:20, activo:true, precios:{} });
  for(const a of ACCOUNTS.filter(x => !x.owner)) await db.doc('usuarios/'+a.id).set({ rol:a.rol, bodegaId:a.bodegaId||'', clienteId:a.clienteId||'', activo:true });
  await db.collection('movimientos').add({ tipo:'carga_inicial', bodega:'bog', fecha:now, usuario:'u-admin', ref:'', nota:'', lineas:P.map(([id]) => ({ clase:'pt', item:id, lote:'L-INICIAL', cant:40 })) });
}
