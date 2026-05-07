import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function callOpenAi(
  prompt: string,
  images: File[] = []
): Promise<string> {
  const imageContents = await Promise.all(
    images.map(async (image) => {
      const buffer = Buffer.from(await image.arrayBuffer());
      const base64 = buffer.toString("base64");

      return {
        type: "image_url" as const,
        image_url: {
          url: `data:${image.type};base64,${base64}`,
        },
      };
    })
  );

  const res = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          ...imageContents,
        ],
      },
    ],
  });

  return res.choices[0].message.content ?? "";
}