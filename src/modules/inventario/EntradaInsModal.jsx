import { useState } from 'react';
import { S } from '../../lib/store.js';
import { L, bod, cfg } from '../../lib/data.js';
import { ctx } from '../../lib/access.js';
import { addMov } from '../../lib/inventory.js';
import { N } from '../../lib/format.js';
import { openModal, closeModal, toast, run } from '../../lib/ui.js';
import { itemsDe } from './AjusteModal.jsx';

function EntradaForm(){
  const [item, setItem] = useState(itemsDe('in')[0]?.id || '');
  const [cant, setCant] = useState(''); const [lote, setLote] = useState(''); const [nota, setNota] = useState('');
  const submit = async e => {
    e.preventDefault();
    const c = ctx();
    const pl = c.rol === 'bodega' ? c.bodegaId : (bod(S.invBod)?.tieneInsumos ? S.invBod : cfg().bodegaPlanta);
    if(!pl){ toast('Configura la bodega de la planta.', true); return; }
    if(await run(() => addMov('entrada_insumos', pl, [{ clase: 'in', item, lote: lote.trim() || '-', cant: N(cant) }], '', nota.trim()), 'Entrada registrada.')) closeModal();
  };
  return (
    <form onSubmit={submit}>
      <label htmlFor="ei-i">Insumo</label>
      <select id="ei-i" value={item} onChange={e => setItem(e.target.value)}>{itemsDe('in').map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</select>
      <div className="grid2">
        <div><label htmlFor="ei-q">Cantidad recibida</label><input id="ei-q" type="number" min="0" step="any" value={cant} onChange={e => setCant(e.target.value)} required /></div>
        <div><label htmlFor="ei-l">Lote del proveedor (opcional)</label><input id="ei-l" value={lote} onChange={e => setLote(e.target.value)} /></div>
      </div>
      <label htmlFor="ei-n">Proveedor o nota</label><input id="ei-n" value={nota} onChange={e => setNota(e.target.value)} />
      <div className="btns"><button className="btn pk" type="submit">Registrar entrada</button></div>
    </form>
  );
}
export function openEntradaIns(){
  if(!L('insumos').length){ toast('Primero crea los insumos en el catálogo.', true); return; }
  openModal('Entrada de material de empaque', <EntradaForm />);
}
