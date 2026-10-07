import { S, useStore } from './lib/store.js';
import { access, ctx, navViews, EXTRA } from './lib/access.js';
import useSession from './hooks/useSession.js';
import useCollections from './hooks/useCollections.js';
import Login from './components/Login.jsx';
import Shell from './components/Shell.jsx';
import { Modal, Toasts } from './components/Modal.jsx';
import { renderView } from './modules/registry.jsx';

const Center = ({ h, children }) => <div className="center"><div className="box"><h1>{h}</h1>{children}</div></div>;

/* Si la vista actual no existe para el rol, vuelve a la primera permitida. */
function ensureView(c){
  const allowed = [...navViews(c.rol), ...(EXTRA[c.rol] || [])];
  if(!S.view || !allowed.includes(S.view)){ S.view = navViews(c.rol)[0]; S.param = null; }
}

function safeView(c){
  try{ return renderView(c); }
  catch(err){ console.error(err); return <div className="err">Esta vista falló al cargar: {err.message}</div>; }
}

export default function App(){
  useStore();
  const { acct, setAcct, signOut } = useSession();
  const ready = useCollections(acct);

  if(!acct) return <><Login onDone={setAcct} /><Toasts /></>;
  if(!ready) return <Center h="Cargando"><p className="sub">Conectando con los datos de la operación.</p></Center>;

  const a = access();
  if(!a) return (
    <Center h="Tu cuenta aún no tiene acceso">
      <p>Pídele al administrador de Rizos Felices que te asigne un rol.</p>
      <button className="btn" onClick={signOut}>Cerrar sesión</button>
    </Center>
  );

  const c = ctx();
  ensureView(c);
  return <><Shell c={c} a={a} onLogout={signOut}>{safeView(c)}</Shell><Modal /><Toasts /></>;
}
