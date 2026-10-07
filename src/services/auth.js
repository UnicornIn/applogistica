/* Login de demostración (solo frontend). Reemplazar por autenticación real cuando haya backend. */
export const ACCOUNTS = [
  { id:'u-admin', name:'superadmin', email:'superadmin@rizosfelices.co', clave:'demo', owner:true },
  { id:'u-dist',  name:'Distribuidor Demo', email:'distribuidor@rizosfelices.co', clave:'demo', rol:'distribuidor', clienteId:'cli-demo' },
  { id:'u-bog',   name:'Bodega Bogotá', email:'bodega@rizosfelices.co', clave:'demo', rol:'bodega', bodegaId:'bog' },
  { id:'u-pla',   name:'Planta', email:'planta@rizosfelices.co', clave:'demo', rol:'planta' },
  { id:'u-cal',   name:'Calidad', email:'calidad@rizosfelices.co', clave:'demo', rol:'calidad' },
  { id:'u-fac',   name:'Facturación', email:'facturacion@rizosfelices.co', clave:'demo', rol:'facturacion' }
];
const KEY = 'rf:session';
export const login = (email, clave) => { const a = ACCOUNTS.find(x => x.email === email.trim().toLowerCase() && x.clave === clave); if(a) localStorage.setItem(KEY, a.id); return a || null; };
export const logout = () => localStorage.removeItem(KEY);
export const currentAccount = () => ACCOUNTS.find(x => x.id === localStorage.getItem(KEY)) || null;
export const profiles = ids => Object.fromEntries(ids.map(i => [i, { name: ACCOUNTS.find(a => a.id === i)?.name }]));
export const search = q => ACCOUNTS.filter(a => !a.owner && (a.name + a.email).toLowerCase().includes((q || '').toLowerCase())).map(a => ({ id: a.id, name: a.name }));
