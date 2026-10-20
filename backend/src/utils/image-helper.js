export function parseBase64Image(dataUriOrBase64, maxMb = 10) {
  if (!dataUriOrBase64 || typeof dataUriOrBase64 !== 'string') {
    return null;
  }

  let mimeType = 'image/png';
  let cleanBase64 = dataUriOrBase64;

  const match = dataUriOrBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
  if (match) {
    mimeType = match[1];
    cleanBase64 = match[2];
  }

  // Calculate approximate byte size from base64 length
  const sizeInBytes = (cleanBase64.length * 3) / 4;
  const maxBytes = maxMb * 1024 * 1024;

  if (sizeInBytes > maxBytes) {
    throw new Error(`Image size exceeds the ${maxMb}MB threshold.`);
  }

  return {
    mimeType,
    cleanBase64,
    dataUri: `data:${mimeType};base64,${cleanBase64}`,
  };
}
