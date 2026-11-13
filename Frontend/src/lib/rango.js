import { S } from './store.js'; import { DAY } from './format.js';
export function rango(){
  const r = S.rango, n = new Date();
  switch(r.p){
    case 'hoy': return [new Date(n.getFullYear(),n.getMonth(),n.getDate()).getTime(), Infinity];
    case '7': return [Date.now()-7*DAY, Infinity];
    case 'mes': return [new Date(n.getFullYear(),n.getMonth(),1).getTime(), Infinity];
    case 'mesant': return [new Date(n.getFullYear(),n.getMonth()-1,1).getTime(), new Date(n.getFullYear(),n.getMonth(),1).getTime()-1];
    case 'custom': return [r.d?new Date(r.d+'T00:00:00').getTime():-Infinity, r.h?new Date(r.h+'T23:59:59.999').getTime():Infinity];
    default: return [-Infinity, Infinity];
  }
}
export const inR = ms => { const [a,b] = rango(); return (ms||0) >= a && (ms||0) <= b; };
