export const generateImageFromText = async (
  prompt: string,
  demoMode: boolean = false,
): Promise<string> => {
  if (!prompt) throw new Error("Prompt is required.");

  try {
    const endpoint = demoMode ? "/api/demo-generate" : "/api/generate";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
      }),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || "Image generation failed");
      } catch (parseError) {
        const text = await response.text();
        throw new Error(
          text || `Image generation failed with status ${response.status}`,
        );
      }
    }

    const data = await response.json();

    if (data.url) {
      return data.url;
    }

    throw new Error("Image generation failed: No image URL received.");
  } catch (error) {
    throw error;
  }
};

export const generateImageFromTextWithWatermark = async (
  prompt: string,
  demoMode: boolean = false,
): Promise<{ url: string; originalUrl: string }> => {
  if (!prompt) throw new Error("Prompt is required.");

  try {
    const endpoint = demoMode
      ? "/api/demo-generate"
      : "/api/generate-with-watermark";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: prompt,
      }),
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || "Image generation failed");
      } catch (parseError) {
        const text = await response.text();
        throw new Error(
          text || `Image generation failed with status ${response.status}`,
        );
      }
    }

    const data = await response.json();
    let imageUrl = data.url;

    if (!imageUrl) {
      throw new Error("Image generation failed: No image URL received.");
    }

    const { addCanvasWatermark } = await import("@/lib/utils/add-watermark");
    const watermarkedUrl = await addCanvasWatermark(imageUrl, "protected:");

    return { url: watermarkedUrl, originalUrl: imageUrl };
  } catch (error) {
    throw error;
  }
};

export const editImage = async (
  prompt: string,
  image: { imageBytes: string; mimeType: string },
  demoMode: boolean = false,
): Promise<string> => {
  if (!prompt) throw new Error("Prompt is required.");
  if (!image || !image.imageBytes)
    throw new Error("Image is required for editing.");

  try {
    const binaryString = atob(image.imageBytes);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const imageBlob = new Blob([bytes], { type: image.mimeType });

    const formData = new FormData();
    formData.append("image", imageBlob, "image.png");
    formData.append("prompt", prompt);

    const endpoint = demoMode ? "/api/demo-edit" : "/api/edit";
    const response = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      try {
        const errorData = await response.json();
        throw new Error(errorData.error || "Image editing failed");
      } catch (parseError) {
        const text = await response.text();
        throw new Error(
          text || `Image editing failed with status ${response.status}`,
        );
      }
    }

    const data = await response.json();

    if (data.url) {
      return data.url;
    }

    throw new Error("Image editing failed: No image URL received.");
  } catch (error) {
    throw error;
  }
};

export const editImageWithWatermark = async (
  prompt: string,
  image: { imageBytes: string; mimeType: string },
  demoMode: boolean = false,
): Promise<{ url: string; originalUrl: string }> => {
  const editedUrl = await editImage(prompt, image, demoMode);

  try {
    const { addCanvasWatermark } = await import("@/lib/utils/add-watermark");
    const watermarkedUrl = await addCanvasWatermark(editedUrl, "protected:");
    return { url: watermarkedUrl, originalUrl: editedUrl };
  } catch (error) {
    console.error("Failed to add watermark:", error);
    return { url: editedUrl, originalUrl: editedUrl };
  }
};

export const upscaleImage = async (
  image: {
    imageBytes: string;
    mimeType: string;
  },
  demoMode: boolean = false,
): Promise<string> => {
  const prompt =
    "Create a high-resolution upscaled version of this image with enhanced details and improved clarity without changing the composition.";

  try {
    return await editImage(prompt, image, demoMode);
  } catch (error) {
    throw error;
  }
};
