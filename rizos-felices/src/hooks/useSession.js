import { useState } from 'react';
import { S } from '../lib/store.js';
import { currentAccount, logout } from '../services/auth.js';

/* Cuenta activa + cierre de sesión. */
export default function useSession(){
  const [acct, setAcct] = useState(currentAccount);
  const signOut = () => { logout(); S.view = null; S.preview = null; setAcct(null); };
  return { acct, setAcct, signOut };
}
