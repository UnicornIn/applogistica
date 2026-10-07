import { Head } from '../components/ui.jsx';
import { S } from '../lib/store.js';
import Inicio from './inicio/Inicio.jsx';
import Pedidos from './pedidos/Pedidos.jsx';
import Inventario from './inventario/Inventario.jsx';
import Traslados from './traslados/Traslados.jsx';
import Kardex from './kardex/Kardex.jsx';
import Devoluciones from './devoluciones/Devoluciones.jsx';
import Plan from './produccion/Plan.jsx';
import Produccion from './produccion/Produccion.jsx';
import Calidad from './produccion/Calidad.jsx';
import Facturacion from './facturacion/Facturacion.jsx';
import Clientes from './clientes/Clientes.jsx';
import Cliente from './clientes/Cliente.jsx';
import Catalogo from './catalogo/Catalogo.jsx';
import TiendaWeb from './shopify/TiendaWeb.jsx';
import Usuarios from './usuarios/Usuarios.jsx';
import Configuracion from './config/Configuracion.jsx';

/* Cada vista del original → un módulo. Las que faltan se portan una por una y se registran aquí. */
const Pendiente = () => <><Head t={S.view} /><div className="note bk">Este módulo todavía no está portado a React.</div></>;

const MODULES = {
  inicio: Inicio,
  pedidos: Pedidos,
  inventario: Inventario,
  traslados: Traslados,
  kardex: Kardex,
  devoluciones: Devoluciones,
  plan: Plan,
  produccion: Produccion,
  calidad: Calidad,
  facturacion: Facturacion,
  clientes: Clientes,
  cliente: Cliente,
  catalogo: Catalogo,
  shopify: TiendaWeb,
  usuarios: Usuarios,
  config: Configuracion,
};

export const renderView = c => { const V = MODULES[S.view] || Pendiente; return <V c={c} param={S.param} />; };
