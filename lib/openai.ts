import OpenAI from 'openai';
import Replicate from 'replicate';
import { buildStoryPrompt, buildImagePrompt } from './prompts';
import { put } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function getReplicate() {
  return new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
    useFileOutput: false,
  });
}

interface StoryPage {
  numero: number;
  texto: string;
  descripcion_escena: string;
}

interface StoryCharacter {
  nombre: string;
  descripcion_visual: string;
  edad_estimada?: string;
  genero?: string;
}

interface StoryResult {
  titulo: string;
  personajes?: StoryCharacter[];
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
  const pageCounts: Record<string, number> = { corto: 4, medio: 6, largo: 8 };
  const pageCount = pageCounts[params.length] || 4;

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
    max_tokens: pageCount > 6 ? 4000 : 3000,
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
  totalPages?: number;
  artStyle?: string;
  colorPalette?: string;
  characterDescriptions?: string;
}): Promise<string> {
  const prompt = buildImagePrompt(params);

  // Try Replicate Flux first (much cheaper), fallback to DALL-E
  if (process.env.REPLICATE_API_TOKEN) {
    try {
      const output = await getReplicate().run("black-forest-labs/flux-schnell", {
        input: {
          prompt,
          aspect_ratio: "1:1",
          num_outputs: 1,
          output_format: "webp",
          output_quality: 80,
          go_fast: true,
        },
      });
      const results = output as string[];
      const url = results[0] || '';
      if (url) {
        console.log(`[Replicate] Page ${params.pageNumber} OK`);
        return url;
      }
    } catch (err) {
      console.error(`[Replicate] Failed for page ${params.pageNumber}, falling back to DALL-E:`, (err as Error).message);
    }
  }

  // Fallback: DALL-E 3
  console.log(`[DALL-E] Generating page ${params.pageNumber}`);
  const response = await getOpenAI().images.generate({
    model: 'dall-e-3',
    prompt,
    n: 1,
    size: '1024x1024',
    quality: 'standard',
  });
  return response.data?.[0]?.url || '';
}

// Generate all images in parallel for faster processing
export async function generateAllImagesParallel(pages: Array<{
  sceneDescription: string;
  childName: string;
  ageGroup: string;
  pageNumber: number;
  totalPages?: number;
  artStyle?: string;
  colorPalette?: string;
  characterDescriptions?: string;
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
  let imageBuffer: Buffer;
  let contentType = 'image/png';
  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Image fetch failed with status ${response.status}`);
    }
    imageBuffer = Buffer.from(await response.arrayBuffer());
    const detectedContentType = response.headers.get('content-type');
    if (detectedContentType?.startsWith('image/')) {
      contentType = detectedContentType.split(';')[0];
    } else if (url.toLowerCase().includes('.webp')) {
      contentType = 'image/webp';
    } else if (url.toLowerCase().includes('.jpg') || url.toLowerCase().includes('.jpeg')) {
      contentType = 'image/jpeg';
    }
  } catch (err) {
    console.error('Image fetch failed, using original URL:', err);
    return url;
  }

  const extension =
    contentType === 'image/webp' ? 'webp' :
    contentType === 'image/jpeg' ? 'jpg' :
    'png';

  const shouldTryBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN || process.env.VERCEL);
  if (shouldTryBlob) {
    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        const blob = await put(`stories/${storyId}/${pageNumber}.${extension}`, imageBuffer, {
          access: 'public',
          contentType,
        });
        return blob.url;
      } catch (err) {
        console.error(`Blob upload failed (attempt ${attempt}/2):`, err);
      }
    }
  }

  // Dev fallback: write to local public directory.
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    try {
      const dir = path.join(process.cwd(), 'public', 'images', 'stories', storyId);
      await fs.mkdir(dir, { recursive: true });
      const filePath = path.join(dir, `${pageNumber}.${extension}`);
      await fs.writeFile(filePath, imageBuffer);
      console.log(`[Image] Page ${pageNumber} saved locally`);
      return `/images/stories/${storyId}/${pageNumber}.${extension}`;
    } catch (err) {
      console.error('Local image save failed:', err);
    }
  }

  // Production-safe fallback: inline data URL (avoids expiring provider URLs).
  const base64 = imageBuffer.toString('base64');
  console.warn(`[Image] Falling back to inline data URL for story ${storyId}, page ${pageNumber}`);
  return `data:${contentType};base64,${base64}`;
}

// ==================== TTS (Text-to-Speech) ====================

type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

export async function generatePageAudio(params: {
  text: string;
  voice: TTSVoice;
  speed?: number;
}): Promise<Buffer> {
  const response = await getOpenAI().audio.speech.create({
    model: 'tts-1',
    voice: params.voice,
    input: params.text,
    response_format: 'mp3',
    speed: params.speed ?? 1.0,
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function generateAndSavePageAudio(params: {
  text: string;
  voice: TTSVoice;
  speed?: number;
  storyId: string;
  pageNumber: number;
}): Promise<string> {
  const audioBuffer = await generatePageAudio({
    text: params.text,
    voice: params.voice,
    speed: params.speed,
  });

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(
      `stories/${params.storyId}/audio/${params.pageNumber}.mp3`,
      audioBuffer,
      { access: 'public', contentType: 'audio/mpeg' }
    );
    console.log(`[TTS] Page ${params.pageNumber} audio saved to Blob`);
    return blob.url;
  }

  // Fallback: save to local public/ directory (dev mode)
  const dir = path.join(process.cwd(), 'public', 'audio', 'stories', params.storyId);
  await fs.mkdir(dir, { recursive: true });
  const filePath = path.join(dir, `${params.pageNumber}.mp3`);
  await fs.writeFile(filePath, audioBuffer);
  console.log(`[TTS] Page ${params.pageNumber} audio saved locally`);
  return `/audio/stories/${params.storyId}/${params.pageNumber}.mp3`;
}

export async function generateAllAudioParallel(pages: Array<{
  text: string;
  pageNumber: number;
  storyId: string;
  voice: TTSVoice;
  speed?: number;
}>): Promise<Array<{ pageNumber: number; url: string | null; error?: string }>> {
  const promises = pages.map(async (page) => {
    try {
      const url = await generateAndSavePageAudio(page);
      return { pageNumber: page.pageNumber, url };
    } catch (err) {
      console.error(`TTS failed for page ${page.pageNumber}:`, err);
      return { pageNumber: page.pageNumber, url: null, error: (err as Error).message };
    }
  });

  return Promise.all(promises);
}
