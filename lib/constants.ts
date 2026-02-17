export const AGE_GROUPS = [
  { value: '0-2', label: '0 a 2 años (bebé)' },
  { value: '3-5', label: '3 a 5 años (preescolar)' },
  { value: '6-8', label: '6 a 8 años (escolar)' },
  { value: '9-12', label: '9 a 12 años (preadolescente)' },
] as const;

export const THEMES = [
  { value: 'aventura', label: 'Aventura' },
  { value: 'amistad', label: 'Amistad' },
  { value: 'naturaleza', label: 'Naturaleza' },
  { value: 'espacio', label: 'Espacio' },
  { value: 'animales', label: 'Animales' },
  { value: 'noche', label: 'Hora de dormir' },
  { value: 'fantasia', label: 'Fantasía' },
  { value: 'custom', label: 'Otro (escribe tu tema)' },
] as const;

export const TONES = [
  { value: 'tierno', label: 'Tierno y calmado' },
  { value: 'divertido', label: 'Divertido y dinámico' },
  { value: 'educativo', label: 'Educativo' },
] as const;

export const LENGTHS = [
  { value: 'corto', label: 'Corto (4 páginas)', pages: 4, premium: false },
  { value: 'medio', label: 'Medio (6 páginas)', pages: 6, premium: true },
  { value: 'largo', label: 'Largo (8 páginas)', pages: 8, premium: true },
] as const;

export const SHARE_EXPIRATION_OPTIONS = [
  { value: 1, label: '1 día' },
  { value: 3, label: '3 días' },
  { value: 7, label: '7 días' },
  { value: 14, label: '14 días' },
  { value: 30, label: '30 días' },
] as const;

export const ART_STYLES = [
  { value: 'watercolor', label: 'Acuarela', prompt: 'watercolor illustration, soft brushstrokes, gentle color washes', premium: false },
  { value: 'cartoon', label: 'Caricatura', prompt: 'cartoon style, bold outlines, playful and expressive characters', premium: false },
  { value: 'digital', label: 'Digital moderno', prompt: 'modern digital art, clean lines, smooth gradients, vibrant', premium: true },
  { value: 'storybook', label: 'Libro clásico', prompt: 'classic storybook illustration, detailed, timeless fairy tale style', premium: true },
  { value: 'pastel', label: 'Pastel suave', prompt: 'soft pastel colors, dreamy atmosphere, gentle and calming', premium: true },
] as const;

export const COLOR_PALETTES = [
  { value: 'warm', label: 'Cálidos', prompt: 'warm color palette with oranges, yellows, and reds' },
  { value: 'cool', label: 'Fríos', prompt: 'cool color palette with blues, greens, and purples' },
  { value: 'pastel', label: 'Pasteles', prompt: 'soft pastel colors, muted and gentle tones' },
  { value: 'vibrant', label: 'Vibrantes', prompt: 'bright vibrant saturated colors, high contrast' },
  { value: 'earth', label: 'Tierra', prompt: 'earthy natural tones, browns, greens, warm neutrals' },
] as const;

export const TTS_VOICES = [
  { value: 'nova', label: 'Nova', description: 'Voz femenina suave y calida - ideal para cuentos tiernos' },
  { value: 'shimmer', label: 'Shimmer', description: 'Voz femenina clara y expresiva - ideal para aventuras' },
  { value: 'fable', label: 'Fable', description: 'Voz narrativa con caracter - ideal para fantasia' },
  { value: 'echo', label: 'Echo', description: 'Voz masculina calma y envolvente' },
  { value: 'onyx', label: 'Onyx', description: 'Voz masculina profunda y segura' },
  { value: 'alloy', label: 'Alloy', description: 'Voz neutra y versatil' },
] as const;

export const TTS_SPEEDS = [
  { value: 0.75, label: '0.75x' },
  { value: 1.0, label: '1x' },
  { value: 1.25, label: '1.25x' },
] as const;
