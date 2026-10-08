import { Head } from '../components/ui.jsx';
import { S } from '../lib/store.js';
import Inicio from './inicio/Inicio.jsx';
import Pedidos from './pedidos/Pedidos.jsx';
// import Inventario from './inventario/invetario.jsx'

/* Cada vista del original → un módulo. Las que faltan se portan una por una y se registran aquí. */
const Pendiente = () => <><Head t={S.view} /><div className="note bk">Este módulo todavía no está portado a React.</div></>;
const MODULES = { 
    inicio: Inicio,
    pedidos: Pedidos,
    // Inventario: Inventario
};
export const renderView = c => { const V = MODULES[S.view] || Pendiente; return <V c={c} param={S.param} />; };
