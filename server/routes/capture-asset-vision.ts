import type { RequestHandler } from "express";
import { addHashToWhitelist } from "../utils/remix-hash-whitelist";
import { sha256HexOfUrl } from "../utils/image-utils";

export const handleCaptureAssetVision: RequestHandler = async (req, res) => {
  try {
    const {
      mediaUrl,
      ipId,
      title,
      pHash,
      visionDescription,
      ownerAddress,
      mediaType,
      score,
      description,
      parentIpIds,
      licenseTermsIds,
      licenseTemplates,
      parentIpDetails,
      royaltyContext,
      maxMintingFee,
      maxRts,
      maxRevenueShare,
      licenseVisibility,
      licenses,
      isDerivative,
      parentsCount,
    } = req.body;

    if (!mediaUrl || !ipId) {
      return res.status(400).json({
        ok: false,
        error: "Missing required fields (mediaUrl, ipId)",
      });
    }

    // Verify asset image is accessible
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

    // Calculate SHA256 hash if not provided
    let imageHash = pHash;
    if (!imageHash) {
      try {
        imageHash = await sha256HexOfUrl(mediaUrl);
      } catch (hashErr) {
        console.warn(`Failed to calculate hash for asset ${ipId}:`, hashErr);
      }
    }

    // Write captured asset to whitelist blob (Vercel Blob)
    if (imageHash) {
      try {
        await addHashToWhitelist(imageHash, {
          ipId,
          title: title || "Captured Asset",
          timestamp: Date.now(),
          pHash: imageHash,
          visionDescription,
          ownerAddress,
          mediaType,
          score: score || null,
          description,
          parentIpIds,
          licenseTermsIds,
          licenseTemplates,
          parentIpDetails,
          royaltyContext,
          maxMintingFee,
          maxRts,
          maxRevenueShare,
          licenseVisibility,
          licenses,
          isDerivative,
          parentsCount,
        });

        console.log(
          `✅ Asset captured and written to whitelist: ${ipId} (${title})`,
        );
      } catch (whitelistErr) {
        console.error(
          `Failed to write captured asset to whitelist: ${ipId}`,
          whitelistErr,
        );
        // Still return success - whitelist write is not critical
      }
    }

    // Return success with captured asset details
    res.json({
      ok: true,
      captured: true,
      ipId,
      title: title || "Captured Asset",
      hash: imageHash,
      timestamp: Date.now(),
    });
  } catch (error) {
    console.error("Asset capture error:", error);
    res.status(500).json({
      ok: false,
      error: "Failed to capture asset",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
