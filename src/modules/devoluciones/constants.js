export const DEV_FLOW = ['solicitada', 'aprobada', 'recibida', 'cerrada'];
export const DEV_EST = { solicitada: 'Solicitada', aprobada: 'Aprobada, en camino a bodega', recibida: 'Recibida, falta nota crédito', cerrada: 'Nota crédito emitida', rechazada: 'Rechazada' };
export const DEV_PASOS = [
  ['solicitada', 'Solicitud', 'El distribuidor elige el pedido, las unidades y el motivo.', 'Distribuidor'],
  ['aprobada', 'Aprobación', 'Rizos Felices revisa, define la bodega que recibe y el valor de la nota crédito. También puede rechazarla.', 'Super admin'],
  ['recibida', 'Recepción', 'La bodega recibe el producto y separa lo vendible, que vuelve al inventario con su lote, de lo no vendible.', 'Bodega'],
  ['cerrada', 'Nota crédito', 'Facturación emite la nota crédito en Siigo y registra su número. La devolución queda cerrada.', 'Facturación']
];
