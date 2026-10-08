/* Base de datos local (localStorage) con la misma interfaz que usaba la plataforma: collection().onSnapshot/add, doc().set/update/delete. */
const subs = {}; const K = c => 'rf:' + c;
const read = c => { try{ return JSON.parse(localStorage.getItem(K(c)) || '{}'); }catch{ return {}; } };
const write = (c, o) => localStorage.setItem(K(c), JSON.stringify(o));
const snap = c => ({ docs: Object.entries(read(c)).map(([id, d]) => ({ id, data: () => d })) });
const emit = c => (subs[c] || []).forEach(f => f(snap(c)));
const split = p => { const i = p.indexOf('/'); return [p.slice(0, i), p.slice(i + 1)]; };
const setPath = (o, path, v) => { const ks = path.split('.'); let t = o; ks.slice(0, -1).forEach(k => { t = t[k] = (t[k] && typeof t[k] === 'object') ? t[k] : {}; }); t[ks.at(-1)] = v; };
export const db = {
  collection: c => ({
    onSnapshot(ok){ (subs[c] ||= new Set()).add(ok); queueMicrotask(() => ok(snap(c))); return () => subs[c].delete(ok); },
    async add(d){ const o = read(c), id = Math.random().toString(36).slice(2, 12) + Date.now().toString(36); o[id] = d; write(c, o); emit(c); return { id }; }
  }),
  doc: p => { const [c, id] = split(p); return {
    async set(d){ const o = read(c); o[id] = d; write(c, o); emit(c); },
    async update(d){ const o = read(c); if(!o[id]) throw Object.assign(new Error('El registro ya no existe.'), { code: 'not_found' }); for(const [k, v] of Object.entries(d)) setPath(o[id], k, v); write(c, o); emit(c); },
    async delete(){ const o = read(c); delete o[id]; write(c, o); emit(c); }
  }; }
};
