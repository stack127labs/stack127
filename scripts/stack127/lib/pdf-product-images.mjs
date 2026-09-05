export function parsePdfImageList(output) {
  const records = [];
  for (const line of String(output ?? "").split("\n")) {
    const match = line.trim().match(/^(\d+)\s+(\d+)\s+(\w+)\s+(\d+)\s+(\d+)\s+(\w+)\s+(\d+)\s+(\d+)\s+(\w+)/);
    if (!match) continue;
    records.push({
      bits: Number(match[8]),
      color: match[6],
      encoding: match[9],
      height: Number(match[5]),
      number: Number(match[2]),
      page: Number(match[1]),
      type: match[3],
      width: Number(match[4]),
    });
  }
  return records;
}

export function selectProductImage(images) {
  const candidates = images.filter((image) => {
    const shortest = Math.min(image.width, image.height);
    const longest = Math.max(image.width, image.height);
    const aspect = shortest / Math.max(image.width, image.height);
    const likelyPageBackdrop = longest >= 1200 && aspect >= 0.65 && aspect <= 0.76;
    return image.page <= 2 && image.type === "image" && shortest >= 240 && aspect >= 0.5 && !likelyPageBackdrop;
  });
  return candidates.sort((left, right) => {
    const leftAspect = Math.min(left.width, left.height) / Math.max(left.width, left.height);
    const rightAspect = Math.min(right.width, right.height) / Math.max(right.width, right.height);
    const leftScore = left.width * left.height * (0.65 + 0.35 * leftAspect);
    const rightScore = right.width * right.height * (0.65 + 0.35 * rightAspect);
    return rightScore - leftScore || left.number - right.number;
  })[0] ?? null;
}

export function exactDatasheetModel(model) {
  const value = String(model ?? "").trim();
  return /^[a-z0-9][a-z0-9-]{2,}$/i.test(value) ? value : null;
}
