export function buildStoryPrompt(params: {
  childName: string;
  ageGroup: string;
  theme: string;
  tone: string;
  pageCount: number;
  traits?: { mascota?: string; colorFavorito?: string };
}): string {
  const traitsLines: string[] = [];
  if (params.traits?.mascota) traitsLines.push(`Incluye a su mascota: ${params.traits.mascota}.`);
  if (params.traits?.colorFavorito) traitsLines.push(`Su color favorito es ${params.traits.colorFavorito}.`);

  return `Eres un escritor experto de cuentos infantiles en español latinoamericano.
Genera un cuento de ${params.pageCount} páginas para un niño/a de ${params.ageGroup} años llamado/a ${params.childName}.

Tema: ${params.theme}
Tono: ${params.tone}
${traitsLines.length > 0 ? traitsLines.join('\n') : ''}

REGLAS ESTRICTAS:
- Cada página debe tener 2-4 oraciones claras con vocabulario adecuado a la edad.
- La última frase de cada página debe conectar naturalmente con la siguiente.
- Final feliz y mensaje positivo.
- PROHIBIDO: violencia, contenido sexual, instrucciones peligrosas, datos de contacto reales, contenido aterrador.
- Usa español latinoamericano neutro.

RESPONDE ÚNICAMENTE con JSON válido (sin markdown, sin bloques de código), con esta estructura exacta:
{
  "titulo": "Título del cuento",
  "personajes": [
    {
      "nombre": "Nombre",
      "edad_estimada": "5 años",
      "genero": "niña",
      "descripcion_visual": "Descripción física EXTREMADAMENTE detallada..."
    }
  ],
  "paginas": [
    { "numero": 1, "texto": "Texto de la página 1...", "descripcion_escena": "Descripción visual breve de la escena para ilustración. Menciona a los personajes por nombre." }
  ]
}

REGLAS CRITICAS PARA PERSONAJES (las ilustraciones dependen de esto):
- Para el protagonista, estima la edad segun el grupo de edad (${params.ageGroup} años).
- Incluye "edad_estimada" y "genero" como campos separados.
- La descripcion_visual DEBE incluir en este orden exacto:
  1) Género y edad exacta
  2) Etnia/tono de piel específico
  3) Tipo, largo y color EXACTO del pelo, con peinado específico
  4) Forma y color de ojos
  5) Ropa COMPLETA: parte superior, parte inferior, calzado (todo con colores y detalles)
  6) Accesorios si los hay (cintas, lentes, collares, etc)
  7) Constitución física (altura, complexión)
- EJEMPLO: "niña de 5 años, piel morena clara con pecas en las mejillas, pelo castaño oscuro largo hasta la cintura con dos trenzas adornadas con cintas rojas, ojos grandes color café claro con pestañas largas, vestido azul cielo con estampado de margaritas blancas y cuello redondo, medias blancas hasta la rodilla, zapatos rojos de hebilla, complexión delgada y estatura baja para su edad"
- El personaje SIEMPRE usa la misma ropa en TODAS las páginas del cuento. No cambies su apariencia.
- En cada descripcion_escena, menciona a los personajes por nombre y describe qué están haciendo.
- Incluye al protagonista y a cualquier otro personaje relevante (amigos, mascotas, familiares).`;
}

export function buildImagePrompt(params: {
  sceneDescription: string;
  childName: string;
  ageGroup: string;
  pageNumber: number;
  totalPages?: number;
  artStyle?: string;
  colorPalette?: string;
  characterDescriptions?: string;
}): string {
  const stylePrompt = params.artStyle || 'watercolor illustration, soft brushstrokes, gentle color washes';
  const colorPrompt = params.colorPalette || 'warm color palette with oranges, yellows, and reds';

  let charBlock: string;
  if (params.characterDescriptions) {
    // Split by character entries and format each one prominently
    const characters = params.characterDescriptions.split(/\.\s*(?=[A-ZÁ-Ú])/);
    const charLines = characters
      .filter(c => c.trim())
      .map(c => `[CHARACTER - DO NOT ALTER APPEARANCE] ${c.trim()}`)
      .join('\n');

    charBlock = `
=== MANDATORY CHARACTER APPEARANCES (must match EXACTLY on every page) ===
${charLines}
=== END CHARACTER APPEARANCES ===

CRITICAL: The characters above MUST look IDENTICAL to their descriptions in every illustration. Same skin tone, same hair style and color, same clothing, same eye color. Do NOT change any physical feature. This is page ${params.pageNumber}${params.totalPages ? ` of ${params.totalPages}` : ''} of the same story.`;
  } else {
    charBlock = `The main character is a child named ${params.childName}, approximately ${params.ageGroup} years old.`;
  }

  return `Children's book illustration for young children.

Art style: ${stylePrompt}
Color palette: ${colorPrompt}

${charBlock}

SCENE (page ${params.pageNumber}): ${params.sceneDescription}

RULES:
- Follow the character descriptions EXACTLY - do not change any physical feature
- Follow the scene description - include all animals, objects, and elements described
- Safe, cheerful, age-appropriate content for children
- NO text, words, letters, or numbers in the image
- Professional children's book quality illustration`;
}
