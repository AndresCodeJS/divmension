export function elapsedTime(unixTimestamp:number) {
    const now = Date.now(); // Obtener el tiempo actual en milisegundos
    const diff = now - unixTimestamp*1000; // Diferencia en milisegundos

  const weeks = Math.floor(diff / (1000 * 60 * 60 * 24 * 7))
  if(weeks>=1) return `${weeks} w` 
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if(days>=1) return `${days} d`
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if(hours>=1) return `${hours} h`
  const minutes = Math.floor(diff / (1000 * 60));
  if(minutes>=1) return `${minutes} min`
  const seconds = Math.floor(diff / 1000);
  if(seconds>=0) return `${seconds} s`

  return ''
    
}