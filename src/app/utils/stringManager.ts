export function truncateText(text: string, maxLength: number) {
   /*  if (text.length <= maxLength) {
        return text;
    } */
    
    let truncated = text.slice(0, maxLength);
    let lastSpaceIndex = truncated.lastIndexOf(' ');
    
    // Si encontramos un espacio, cortamos ahí. Si no, cortamos en maxLength
    if (lastSpaceIndex > 0) {
        truncated = truncated.slice(0, lastSpaceIndex);
    }

    // Eliminar saltos de línea y espacios en blanco al comienzo y al final del texto
    truncated = truncated.trim();

    // Eliminar sangrías (tabulaciones y espacios al comienzo de las líneas)
    truncated = truncated.replace(/^\s+/gm, '');

    // Limitar a dos saltos de línea continuos
    truncated = truncated.replace(/(\n){3,}/g, '\n\n');

    //Permitir solo 2 saltos de linea en la previsualizacion del post

    let lines = truncated.split('\n')

    let pageBreaks = lines.length - 1;

  /*   console.log('longitud es', pageBreaks)

    console.log('las lineas son,', lines) */

    if(pageBreaks>2){
        truncated = lines[0] + '\n' + lines[1] + '\n' + lines[2]
    }
    
    return truncated + '...';
}

//Usado para mostrar los saltos de linea en el texto
export function mostrarTexto(texto: string) {
    return texto
      .replace(/\n/g, '<br>')
      .replace(/  /g, '&nbsp;&nbsp;');
  }

function cleanText(text: string) {
    // Eliminar sangrías (tabulaciones y espacios al comienzo de las líneas)
    text = text.replace(/^\s+/gm, '');

    // Eliminar saltos de línea y espacios en blanco al comienzo y al final del texto
    text = text.trim();

    // Limitar a dos saltos de línea continuos
    text = text.replace(/(\n){3,}/g, '\n\n');

    // Retornar el texto limpio
    return text;
}