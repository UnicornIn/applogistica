import { useEffect, useState } from 'react';
import { S, bump } from '../lib/store.js';
import { COLS } from '../lib/constants.js';
import { db } from '../services/db.js';
import { seedIfEmpty } from '../services/seed.js';

/* Carga y escucha todas las colecciones. Devuelve true cuando todas ya llegaron. */
export default function useCollections(acct){
  const [loaded, setLoaded] = useState(() => new Set());
  useEffect(() => {
    if(!acct) return;
    S.me = { id: acct.id, name: acct.name };
    S.isOwner = !!acct.owner;
    let unsubs = [];
    seedIfEmpty().then(() => {
      unsubs = COLS.map(c => db.collection(c).onSnapshot(snap => {
        S.D[c] = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setLoaded(s => new Set(s).add(c));
        bump();
      }));
    });
    return () => { unsubs.forEach(off => off && off()); setLoaded(new Set()); };
  }, [acct]);
  return COLS.every(c => loaded.has(c));
}
