import OpenAI from 'openai';
import { buildStoryPrompt, buildImagePrompt } from './prompts';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface StoryPage {
  numero: number;
  texto: string;
  descripcion_escena: string;
}

interface StoryResult {
  titulo: string;
  paginas: StoryPage[];
}

export async function generateStoryText(params: {
  childName: string;
  ageGroup: string;
  theme: string;
  tone: string;
  length: string;
  traits?: { mascota?: string; colorFavorito?: string };
}): Promise<StoryResult> {
  const pageCount = params.length === 'corto' ? 4 : 6;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Eres un escritor de cuentos infantiles. Responde SOLO con JSON válido, sin markdown ni bloques de código.',
      },
      {
        role: 'user',
        content: buildStoryPrompt({ ...params, pageCount }),
      },
    ],
    temperature: 0.7,
    max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content || '';
  const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleaned) as StoryResult;
  } catch {
    throw new Error('No se pudo parsear la respuesta de la IA. Intenta de nuevo.');
  }
}

export async function generatePageImage(params: {
  sceneDescription: string;
  childName: string;
  ageGroup: string;
  pageNumber: number;
}): Promise<string> {
  const prompt = buildImagePrompt(params);

  const response = await openai.images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  });

  return response.data?.[0]?.url || '';
}

export async function downloadAndSaveImage(
  url: string,
  storyId: string,
  pageNumber: number
): Promise<string> {
  const dir = path.join(process.cwd(), 'public', 'uploads', 'stories', storyId);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filePath = path.join(dir, `${pageNumber}.png`);
  const response = await fetch(url);
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(filePath, buffer);

  return `/uploads/stories/${storyId}/${pageNumber}.png`;
}
