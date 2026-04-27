// CONTRACT_VERSION = 1
// Modelo de sesión:
// {
//   sessionId: string (obligatorio),
//   bookId: string (obligatorio, no vacío),
//   bookLabel: string (obligatorio, no vacío),
//   sessionLabel?: string (opcional; trim; si no aplica, '' o undefined)
//   createdAt: Date (opcional, pero útil)
// }