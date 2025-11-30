import type { RequestHandler } from "express";

export const handleCaptureAssetVision: RequestHandler = async (req, res) => {
  try {
    const { mediaUrl, ipId, title } = req.body;

    if (!mediaUrl || !ipId) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields (mediaUrl, ipId)",
      });
    }

    // This is a fire-and-forget endpoint for capturing asset metadata
    // For now, we just acknowledge receipt and optionally fetch the image
    // to validate it's accessible

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      try {
        const imgResponse = await fetch(mediaUrl, {
          method: "HEAD",
          signal: controller.signal,
        });

        if (!imgResponse.ok) {
          console.warn(`Asset image not accessible: ${mediaUrl}`);
        }
      } finally {
        clearTimeout(timeout);
      }
    } catch (err) {
      console.warn(`Failed to verify asset image: ${mediaUrl}`, err);
    }

    // Always return success since this is fire-and-forget
    res.json({
      ok: true,
      captured: true,
      ipId,
      title: title || "Captured Asset",
    });
  } catch (error) {
    console.error("Asset capture error:", error);
    // Even on error, return success for fire-and-forget
    res.json({
      ok: true,
      captured: true,
    });
  }
};
