import crypto from "crypto";

const APP_ID = process.env.BAIDU_APP_ID!;
const SECRET = process.env.BAIDU_SECRET!;

export async function translateBatch(texts: string[]): Promise<string[]> {
  if (texts.length === 0) return [];
  if (!APP_ID || !SECRET) return texts;

  try {
    const q = texts.join("\n");
    const salt = String(Date.now());
    const sign = md5(APP_ID + q + salt + SECRET);

    const params = new URLSearchParams({
      q,
      from: "en",
      to: "zh",
      appid: APP_ID,
      salt,
      sign,
    });

    const res = await fetch(
      `https://fanyi-api.baidu.com/api/trans/vip/translate?${params}`
    );
    const data = await res.json();

    if (data.error_code) {
      console.error("Baidu translate error:", data.error_code, data.error_msg);
      return texts;
    }

    return data.trans_result.map(
      (t: { src: string; dst: string }) => t.dst
    );
  } catch {
    return texts;
  }
}

function md5(s: string): string {
  return crypto.createHash("md5").update(s).digest("hex");
}
