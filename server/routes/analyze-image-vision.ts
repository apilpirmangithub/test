import type { RequestHandler } from "express";

export const handleAnalyzeImageVision: RequestHandler = async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        ok: false,
        error: "Missing imageBase64 in request body",
      });
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY not configured");
      return res.status(503).json({
        ok: false,
        error: "Vision service not configured",
      });
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                },
              },
              {
                type: "text",
                text: "Provide a concise, single-line description of this image. Focus on the main subject and key visual elements. Keep it under 150 characters.",
              },
            ],
          },
        ],
        max_tokens: 100,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("OpenAI API error:", response.status, errorData);
      return res.status(response.status).json({
        ok: false,
        error: "Failed to analyze image with OpenAI Vision API",
      });
    }

    const data = (await response.json()) as any;
    const description =
      data.choices?.[0]?.message?.content || "Unable to describe image";

    res.json({
      ok: true,
      description: description.trim(),
    });
  } catch (error) {
    console.error("Vision analysis error:", error);
    res.status(500).json({
      ok: false,
      error: "Internal server error during vision analysis",
    });
  }
};
