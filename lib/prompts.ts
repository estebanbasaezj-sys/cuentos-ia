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
  "paginas": [
    { "numero": 1, "texto": "Texto de la página 1...", "descripcion_escena": "Descripción visual breve de la escena para ilustración" }
  ]
}`;
}

export function buildImagePrompt(params: {
  sceneDescription: string;
  childName: string;
  ageGroup: string;
  pageNumber: number;
}): string {
  return `Children's book illustration, watercolor style, warm and vibrant colors, whimsical and friendly atmosphere. Scene: ${params.sceneDescription}. The main character is a child named ${params.childName}, approximately ${params.ageGroup} years old. Style: soft rounded shapes, gentle lighting, safe and cheerful for children, storybook quality illustration. No text or words in the image. 1024x1024.`;
}
