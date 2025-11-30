import { useContext } from "react";
import { CreationContext } from "@/context/CreationContext";
import * as openaiService from "@/services/openaiService";
import { GenerationOptions, ToggleMode } from "@/types/generation";

const useGeminiGenerator = () => {
  const context = useContext(CreationContext);

  if (!context) {
    throw new Error(
      "useGeminiGenerator must be used within a CreationProvider",
    );
  }

  const {
    setIsLoading,
    setLoadingMessage,
    setError,
    setResultUrl,
    setResultType,
    resultUrl,
    addCreation,
    setOriginalPrompt,
    demoMode,
  } = context;

  const generate = async (
    mode: ToggleMode,
    options: GenerationOptions,
    demoModeParam: boolean = false,
  ) => {
    if (mode === "video") {
      setError("Video generation is coming soon!");
      return;
    }

    setIsLoading(true);
    setError(null);
    // Keep the previous image visible while loading (both demo and real)
    // This creates a stacking carousel effect where users see all generations
    setOriginalPrompt(options.prompt);

    try {
      let generatedUrl: string;
      let originalUrl: string = "";
      let type: "image" | "video";

      setLoadingMessage("Crafting your image...");
      const { remixType } = options;

      if (options.image) {
        if (options.remixType === "paid") {
          const result = await openaiService.editImageWithWatermark(
            options.prompt,
            options.image,
            demoModeParam,
          );
          generatedUrl = result.url;
          originalUrl = result.originalUrl;
        } else {
          generatedUrl = await openaiService.editImage(
            options.prompt,
            options.image,
            demoModeParam,
          );
          originalUrl = generatedUrl;
        }
      } else {
        if (remixType === "paid") {
          // For paid remix (both demo and production), use server-side watermark endpoint
          console.log("🎨 Generating image with server-side watermark");
          const result = await openaiService.generateImageFromTextWithWatermark(
            options.prompt,
            demoModeParam,
          );
          generatedUrl = result.url;
          originalUrl = result.originalUrl;
        } else {
          // Standard generation without watermark
          generatedUrl = await openaiService.generateImageFromText(
            options.prompt,
            demoModeParam,
          );
          originalUrl = generatedUrl;
        }
      }

      type = "image";
      setResultType("image");

      setResultUrl(generatedUrl);
      addCreation(
        generatedUrl,
        type,
        options.prompt,
        demoModeParam,
        remixType,
        options.parentAsset,
        originalUrl,
      );
    } catch (e: any) {
      console.error(e);
      let errorMessage =
        e.message || "An unknown error occurred during generation.";
      if (
        e.message &&
        (e.message.includes("API key not valid") ||
          e.message.includes("404") ||
          e.message.includes("PERMISSION_DENIED"))
      ) {
        errorMessage =
          "Your API key is invalid or project billing is not enabled. Please check your key and try again.";
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const upscale = async () => {
    if (!resultUrl || !resultUrl.startsWith("data:image")) {
      setError("Upscaling is only available for a generated image.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      setLoadingMessage("Upscaling image...");
      const [header, base64Data] = resultUrl.split(",");
      const mimeType = header.match(/:(.*?);/)?.[1] || "image/png";

      const upscaledUrl = await openaiService.upscaleImage(
        {
          imageBytes: base64Data,
          mimeType,
        },
        context.demoMode,
      );
      setResultUrl(upscaledUrl);
      setResultType("image");
    } catch (e: any) {
      console.error(e);
      setError(e.message || "An unknown error occurred during upscaling.");
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  return { generate, upscale, ...context };
};

export default useGeminiGenerator;
