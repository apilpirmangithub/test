import type { RequestHandler } from "express";

export const handleVisionImageDetection: RequestHandler = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        ok: false,
        error: "No image file provided",
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

    // Convert image buffer to base64
    const imageBase64 = req.file.buffer.toString("base64");

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
                  url: `data:${req.file.mimetype};base64,${imageBase64}`,
                },
              },
              {
                type: "text",
                text: "Analyze this image and provide: 1) A brief description of what's in the image, 2) Main objects detected, 3) Image quality assessment (good/fair/poor), 4) Any text visible in the image. Format your response as JSON.",
              },
            ],
          },
        ],
        max_tokens: 300,
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
    const analysisText = data.choices?.[0]?.message?.content || "";

    // Try to parse as JSON, fallback to plain text
    let analysis: any = {
      description: analysisText,
      detectedObjects: [],
      quality: "unknown",
      textContent: "",
    };

    try {
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch (parseErr) {
      console.warn("Failed to parse vision analysis as JSON:", parseErr);
    }

    res.json({
      ok: true,
      analysis,
      fileName: req.file.originalname,
    });
  } catch (error) {
    console.error("Vision detection error:", error);
    res.status(500).json({
      ok: false,
      error: "Internal server error during vision detection",
    });
  }
};
