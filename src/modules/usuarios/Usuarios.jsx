import { ROLES } from '../../lib/constants.js';
import { L, cli, bodName } from '../../lib/data.js';
import { fdt } from '../../lib/format.js';
import { Head, Table, Empty, Uname } from '../../components/ui.jsx';
import { openUsuario } from './UsuarioForm.jsx';

export default function Usuarios(){
  const U = L('usuarios'), sol = L('solicitudes').filter(s => !U.some(u => u.id === s.id));
  return (<>
    <Head t="Usuarios" sub="Cada persona entra con su cuenta de Claude y ve solo lo que su rol permite." right={<button className="btn pk" onClick={() => openUsuario()}>Agregar usuario</button>} />
    {sol.length > 0 && <><h3>Solicitudes de acceso</h3>
      <Table heads={['Persona', 'Solicitó', '']} rows={sol.map(s => <tr key={s.id}><td><Uname id={s.id} fb="Persona sin nombre visible" /><div className="sub">{s.id}</div></td><td>{fdt(s.fecha)}</td><td className="r"><button className="btn sm pk" onClick={() => openUsuario(s.id)}>Asignar rol</button></td></tr>)} /></>}
    <h3>Con acceso</h3>
    {U.length ? <Table heads={['Persona', 'Rol', 'Asignado a', 'Estado', '']}
      rows={U.map(u => (
        <tr key={u.id}>
          <td><Uname id={u.id} />{u.etiqueta ? <div className="sub">{u.etiqueta}</div> : null}</td><td>{ROLES[u.rol] || u.rol}</td>
          <td>{u.bodegaId ? bodName(u.bodegaId) : u.clienteId ? (cli(u.clienteId)?.nombre || '—') : '—'}</td>
          <td>{u.activo === false ? <span className="chip ol">Sin acceso</span> : <span className="chip">Activo</span>}</td>
          <td className="r"><button className="btn sm" onClick={() => openUsuario(u.id)}>Editar</button></td>
        </tr>))} />
      : <Empty>Aún no has dado acceso a nadie. Tú, como dueña de la plataforma, eres super admin.</Empty>}
    <div className="note" style={{ marginTop: 18 }}>Quien no aparezca en la búsqueda (por ejemplo, un distribuidor externo) debe abrir el enlace de la plataforma una vez: su solicitud aparece arriba o te envía el código que ve en pantalla.</div>
  </>);
}
