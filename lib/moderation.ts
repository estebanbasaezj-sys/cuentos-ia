const BANNED_PATTERNS = [
  /violencia/i, /matar/i, /sangre/i, /arma/i, /pistola/i, /cuchillo/i,
  /sexual/i, /desnud/i, /droga/i, /alcohol/i, /suicid/i,
  /terroris/i, /bomba/i, /secuestr/i,
  /ignore previous/i, /ignore las instrucciones/i, /system prompt/i,
  /inyecci[oó]n/i, /jailbreak/i, /DAN mode/i,
];

export function moderateText(text: string): { safe: boolean; flaggedTerms: string[] } {
  const flagged: string[] = [];
  for (const pattern of BANNED_PATTERNS) {
    if (pattern.test(text)) {
      flagged.push(pattern.source);
    }
  }
  return { safe: flagged.length === 0, flaggedTerms: flagged };
}

export function moderateInputs(params: {
  childName: string;
  theme: string;
  traits?: Record<string, string>;
}): { safe: boolean; message?: string } {
  const textsToCheck = [
    params.childName,
    params.theme,
    ...Object.values(params.traits || {}),
  ].join(' ');

  const result = moderateText(textsToCheck);
  if (!result.safe) {
    return {
      safe: false,
      message: 'El contenido ingresado contiene términos no permitidos. Por favor, modifica tu solicitud.',
    };
  }
  return { safe: true };
}
