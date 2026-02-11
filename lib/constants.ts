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
  { value: 'corto', label: 'Corto (4 páginas)', pages: 4 },
  { value: 'medio', label: 'Medio (6 páginas)', pages: 6 },
] as const;

export const FREE_STORIES_PER_DAY = 1;

export const SHARE_EXPIRATION_OPTIONS = [
  { value: 1, label: '1 día' },
  { value: 3, label: '3 días' },
  { value: 7, label: '7 días' },
  { value: 14, label: '14 días' },
  { value: 30, label: '30 días' },
] as const;

export const ART_STYLES = [
  { value: 'watercolor', label: 'Acuarela', prompt: 'watercolor illustration, soft brushstrokes, gentle color washes' },
  { value: 'cartoon', label: 'Caricatura', prompt: 'cartoon style, bold outlines, playful and expressive characters' },
  { value: 'digital', label: 'Digital moderno', prompt: 'modern digital art, clean lines, smooth gradients, vibrant' },
  { value: 'storybook', label: 'Libro clásico', prompt: 'classic storybook illustration, detailed, timeless fairy tale style' },
  { value: 'pastel', label: 'Pastel suave', prompt: 'soft pastel colors, dreamy atmosphere, gentle and calming' },
] as const;

export const COLOR_PALETTES = [
  { value: 'warm', label: 'Cálidos', prompt: 'warm color palette with oranges, yellows, and reds' },
  { value: 'cool', label: 'Fríos', prompt: 'cool color palette with blues, greens, and purples' },
  { value: 'pastel', label: 'Pasteles', prompt: 'soft pastel colors, muted and gentle tones' },
  { value: 'vibrant', label: 'Vibrantes', prompt: 'bright vibrant saturated colors, high contrast' },
  { value: 'earth', label: 'Tierra', prompt: 'earthy natural tones, browns, greens, warm neutrals' },
] as const;
