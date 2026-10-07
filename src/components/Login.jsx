import { useState } from 'react';
import { ACCOUNTS, login } from '../services/auth.js';

export default function Login({ onDone }){
  const [email, setEmail] = useState(''); const [clave, setClave] = useState(''); const [err, setErr] = useState('');
  const submit = e => { e.preventDefault(); const a = login(email, clave); if(a) onDone(a); else setErr('Correo o clave incorrectos.'); };
  return (
    <div className="center"><div className="box">
      <span className="ws" aria-hidden="true" style={{ width: 36, height: 36, fontSize: 14, marginBottom: 14 }}>RF</span>
      <h1>Rizos Felices</h1><p className="sub">Operaciones Colombia — inicia sesión para continuar.</p>
      <form onSubmit={submit} style={{ textAlign: 'left' }}>
        <label htmlFor="l-e">Correo</label><input id="l-e" type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="username" required />
        <label htmlFor="l-c">Clave</label><input id="l-c" type="password" value={clave} onChange={e => setClave(e.target.value)} autoComplete="current-password" required />
        {err && <div className="err">{err}</div>}
        <div className="btns"><button className="btn pk" type="submit">Entrar</button></div>
      </form>
      <p className="help" style={{ marginTop: 18 }}>Demo: clave <code className="id">demo</code>. Cuentas:</p>
      <div className="seg" style={{ justifyContent: 'center' }}>{ACCOUNTS.map(a => <button key={a.id} type="button" onClick={() => { setEmail(a.email); setClave('demo'); }}>{a.name}</button>)}</div>
    </div></div>
  );
}
