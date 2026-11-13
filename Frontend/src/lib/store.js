import { useSyncExternalStore } from 'react';
const listeners = new Set(); let version = 0;
/* Estado global (equivale al objeto S del original). Se muta y luego se llama bump(). */
export const S = {
  me:null, isOwner:false, D:{}, view:null, param:null, tab:null, back:null, preview:null,
  cart:{}, cartNota:'', pedFiltro:'activos', devFiltro:'todas', facTab:'pedidos', invBod:'__all', invOpen:new Set(),
  rango:{p:'todo', d:'', h:''}, kx:{b:'', clase:'pt', item:''}, shopPreview:null, catPreview:null,
  modal:null, toasts:[]
};
export const bump = () => { version++; listeners.forEach(f => f()); };
export const useStore = () => useSyncExternalStore(f => (listeners.add(f), () => listeners.delete(f)), () => version);
