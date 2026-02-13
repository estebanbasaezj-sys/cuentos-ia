import OpenAI from 'openai';
import Replicate from 'replicate';
import { buildStoryPrompt, buildImagePrompt } from './prompts';
import { put } from '@vercel/blob';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function getReplicate() {
  return new Replicate({ auth: process.env.REPLICATE_API_TOKEN });
}

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

  const response = await getOpenAI().chat.completions.create({
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
  artStyle?: string;
  colorPalette?: string;
}): Promise<string> {
  const prompt = buildImagePrompt(params);

  const output = await getReplicate().run("black-forest-labs/flux-schnell", {
    input: {
      prompt,
      aspect_ratio: "1:1",
      num_outputs: 1,
      output_format: "png",
      go_fast: true,
    },
  });

  // output is an array of FileOutput objects
  const results = output as Array<{ url(): string }>;
  return results[0]?.url() || '';
}

// Generate all images in parallel for faster processing
export async function generateAllImagesParallel(pages: Array<{
  sceneDescription: string;
  childName: string;
  ageGroup: string;
  pageNumber: number;
  artStyle?: string;
  colorPalette?: string;
}>): Promise<Array<{ pageNumber: number; url: string | null; error?: string }>> {
  const promises = pages.map(async (page) => {
    try {
      const url = await generatePageImage(page);
      return { pageNumber: page.pageNumber, url };
    } catch (err) {
      console.error(`Image generation failed for page ${page.pageNumber}:`, err);
      return { pageNumber: page.pageNumber, url: null, error: (err as Error).message };
    }
  });

  return Promise.all(promises);
}

export async function downloadAndSaveImage(
  url: string,
  storyId: string,
  pageNumber: number
): Promise<string> {
  // Try to upload to Vercel Blob for persistent storage
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    try {
      const response = await fetch(url);
      const buffer = Buffer.from(await response.arrayBuffer());
      const blob = await put(`stories/${storyId}/${pageNumber}.png`, buffer, {
        access: 'public',
        contentType: 'image/png',
      });
      return blob.url;
    } catch (err) {
      console.error('Blob upload failed, using original URL:', err);
    }
  }

  // Fallback: return the original DALL-E URL directly
  return url;
}
