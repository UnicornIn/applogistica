import { S, bump } from './store.js';
export const closeModal = () => { S.modal = null; bump(); };
export const openModal = (title, body, opts = {}) => { S.modal = { title, body, wide: !!opts.wide }; bump(); };
export function toast(msg, bad){
  const t = { id: Math.random(), msg, bad }; S.toasts = [...S.toasts, t]; bump();
  setTimeout(() => { S.toasts = S.toasts.filter(x => x.id !== t.id); bump(); }, bad ? 6000 : 3500);
}
export const errMsg = e => e?.code==='invalid_argument' ? 'No tienes permiso para guardar este cambio o un dato no es válido.' : (e?.message || 'No se pudo guardar. Intenta de nuevo.');
export async function run(fn, ok){ try{ await fn(); if(ok) toast(ok); return true; }catch(err){ console.error(err); toast(errMsg(err), true); return false; } }
export const go = (v, param = null, tab = null) => { S.view = v; S.param = param; S.tab = tab; S.modal = null; window.scrollTo(0, 0); bump(); };
export const openPedido = id => { if(S.view !== 'pedido') S.back = S.view; go('pedido', id); };
