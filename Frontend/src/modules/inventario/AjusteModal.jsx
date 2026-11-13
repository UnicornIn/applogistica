import { useState } from 'react';
import { S } from '../../lib/store.js';
import { L, bodegas, activos } from '../../lib/data.js';
import { addMov } from '../../lib/inventory.js';
import { N } from '../../lib/format.js';
import { openModal, closeModal, toast, run } from '../../lib/ui.js';

/* Opciones del select "Producto / Insumo" según la clase elegida. */
export const itemsDe = clase => clase === 'in'
  ? L('insumos').map(i => ({ id: i.id, label: i.nombre }))
  : activos().map(p => ({ id: p.id, label: `${p.nombre} (${p.id})` }));

function AjusteForm(){
  const bs = bodegas();
  const [bodega, setBodega] = useState(bs.some(b => b.id === S.invBod) ? S.invBod : (bs[0]?.id || ''));
  const [tipo, setTipo] = useState('carga_inicial');
  const [clase, setClase] = useState('pt');
  const [item, setItem] = useState(itemsDe('pt')[0]?.id || '');
  const [lote, setLote] = useState(''); const [cant, setCant] = useState(''); const [nota, setNota] = useState('');

  const cambiarClase = v => { setClase(v); setItem(itemsDe(v)[0]?.id || ''); };
  const submit = async e => {
    e.preventDefault();
    const q = N(cant); if(!q){ toast('La cantidad no puede ser cero.', true); return; }
    if(await run(() => addMov(tipo, bodega, [{ clase, item, lote: lote.trim(), cant: q }], '', nota.trim()), 'Movimiento registrado.')) closeModal();
  };
  return (
    <form onSubmit={submit}>
      <div className="grid2">
        <div><label htmlFor="aj-b">Bodega</label>
          <select id="aj-b" value={bodega} onChange={e => setBodega(e.target.value)}>{bs.map(b => <option key={b.id} value={b.id}>{b.nombre}</option>)}</select></div>
        <div><label htmlFor="aj-t">Tipo</label>
          <select id="aj-t" value={tipo} onChange={e => setTipo(e.target.value)}><option value="carga_inicial">Carga inicial</option><option value="ajuste_manual">Ajuste manual</option></select></div>
      </div>
      <label htmlFor="aj-c">Qué</label>
      <select id="aj-c" value={clase} onChange={e => cambiarClase(e.target.value)}><option value="pt">Producto terminado</option><option value="in">Material de empaque</option></select>
      <label htmlFor="aj-i">{clase === 'in' ? 'Insumo' : 'Producto'}</label>
      <select id="aj-i" value={item} onChange={e => setItem(e.target.value)} required>{itemsDe(clase).map(o => <option key={o.id} value={o.id}>{o.label}</option>)}</select>
      <div className="grid2">
        <div><label htmlFor="aj-l">Lote</label><input id="aj-l" value={lote} onChange={e => setLote(e.target.value)} required /></div>
        <div><label htmlFor="aj-q">Cantidad</label><input id="aj-q" type="number" step="any" value={cant} onChange={e => setCant(e.target.value)} required /><div className="help">Negativa para restar.</div></div>
      </div>
      <label htmlFor="aj-n">Motivo</label>
      <input id="aj-n" value={nota} onChange={e => setNota(e.target.value)} placeholder="Por qué se registra" />
      <div className="btns"><button className="btn pk" type="submit">Registrar</button></div>
    </form>
  );
}
export const openAjuste = () => openModal('Registrar carga o ajuste', <AjusteForm />);
