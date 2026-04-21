/**
 * HuggingFace Image Generation Utility
 * Optimized for multiple models with fallbacks
 * 
 * Usage:
 *   const { generateImage, validatePrompt } = require('./huggingfaceImageGenerator');
 *   const imageBase64 = await generateImage("your prompt");
 */

// Available models with fallback chain
const MODELS = [
  {
    id: "stabilityai/stable-diffusion-3-medium",
    name: "Stable Diffusion 3 Medium",
    endpoint: "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-3-medium"
  },
  {
    id: "black-forest-labs/FLUX.1-schnell",
    name: "FLUX.1 Schnell (Fast)",
    endpoint: "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell"
  },
  {
    id: "stabilityai/stable-diffusion-2",
    name: "Stable Diffusion 2",
    endpoint: "https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2"
  },
  {
    id: "runwayml/stable-diffusion-v1-5",
    name: "Stable Diffusion v1.5",
    endpoint: "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5"
  }
];

/**
 * Validate and optimize prompt for HuggingFace FLUX.1-dev
 * @param {string} prompt - Raw image prompt
 * @returns {string} - Validated and optimized prompt
 */
export function validatePrompt(prompt) {
  if (!prompt || typeof prompt !== "string") {
    return "A stylish person wearing fashionable outfit, full body, realistic fashion photography, clean background, professional lighting";
  }

  let optimized = prompt.trim();

  // Ensure minimum length
  if (optimized.length < 20) {
    optimized = `${optimized}, realistic fashion photography, full body, clean background`;
  }

  // Ensure it doesn't exceed HuggingFace limits
  if (optimized.length > 400) {
    optimized = optimized.substring(0, 400);
  }

  // Add essential keywords if missing
  if (!optimized.toLowerCase().includes("fashion")) {
    optimized += ", fashion photography";
  }
  if (!optimized.toLowerCase().includes("full body")) {
    optimized += ", full body";
  }
  if (!optimized.toLowerCase().includes("clean background")) {
    optimized += ", clean background";
  }

  return optimized;
}

/**
 * Generate image using HuggingFace FLUX.1-dev
 * @param {string} prompt - Image generation prompt
 * @param {object} options - Additional options
 * @returns {Promise<string>} - Base64 encoded image or fallback URL
 */
export async function generateImage(prompt, options = {}) {
  const {
    maxRetries = 2,
    retryDelay = 3000,
    timeout = 60000,
    fallbackUrl = "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop"
  } = options;

  try {
    // Validate and optimize prompt
    const validatedPrompt = validatePrompt(prompt);

    // Check if HuggingFace API key is configured
    if (!process.env.HF_API_KEY) {
      console.warn("⚠️  HF_API_KEY not configured, using fallback image");
      return fallbackUrl;
    }

    console.log(`🎨 Generating image with HuggingFace FLUX.1-dev...`);
    console.log(`   Prompt: ${validatedPrompt.substring(0, 80)}...`);

    let lastError = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`   Attempt ${attempt}/${maxRetries}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(
          "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-dev",
          {
            headers: {
              Authorization: `Bearer ${process.env.HF_API_KEY}`,
              "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
              inputs: validatedPrompt,
              parameters: {
                guidance_scale: 7.5,
                num_inference_steps: 25
              }
            }),
            signal: controller.signal
          }
        );

        clearTimeout(timeoutId);

        if (response.ok) {
          const blob = await response.blob();
          const buffer = Buffer.from(await blob.arrayBuffer());
          const base64 = buffer.toString("base64");
          console.log("✅ Image generated successfully");
          return `data:image/jpeg;base64,${base64}`;
        } else {
          const errorText = await response.text();
          lastError = `Status ${response.status}: ${errorText}`;
          console.warn(`⚠️  HuggingFace API error: ${lastError}`);

          // Check if it's a model loading or rate limit issue
          if ((response.status === 503 || response.status === 429) && attempt < maxRetries) {
            console.log(`⏳ Model loading or rate limited, retrying in ${retryDelay}ms...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay));
            continue;
          }

          throw new Error(lastError);
        }
      } catch (err) {
        lastError = err.message;
        console.warn(`⚠️  Attempt ${attempt} failed: ${lastError}`);

        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }

    throw new Error(`Failed after ${maxRetries} attempts: ${lastError}`);

  } catch (err) {
    console.error(`❌ Image generation error: ${err.message}`);
    console.log(`📸 Using fallback image`);
    return fallbackUrl;
  }
}

/**
 * Batch generate images for multiple prompts
 * @param {array} prompts - Array of image prompts
 * @param {object} options - Additional options
 * @returns {Promise<array>} - Array of image URLs or base64 strings
 */
export async function generateImageBatch(prompts, options = {}) {
  if (!Array.isArray(prompts)) {
    throw new Error("Prompts must be an array");
  }

  console.log(`🎨 Batch generating ${prompts.length} images...`);

  const results = [];

  for (let i = 0; i < prompts.length; i++) {
    console.log(`   [${i + 1}/${prompts.length}] Processing...`);
    try {
      const imageUrl = await generateImage(prompts[i], options);
      results.push({
        success: true,
        prompt: prompts[i],
        image: imageUrl
      });
    } catch (err) {
      console.warn(`   Failed to generate image for prompt ${i + 1}: ${err.message}`);
      results.push({
        success: false,
        prompt: prompts[i],
        error: err.message,
        image: options.fallbackUrl || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&h=500&fit=crop"
      });
    }

    // Add delay between requests to avoid rate limiting
    if (i < prompts.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Get image generation status and recommendations
 * @param {string} prompt - Image prompt to analyze
 * @returns {object} - Validation results and recommendations
 */
export function analyzePrompt(prompt) {
  const validated = validatePrompt(prompt);
  const checks = {
    length: {
      value: validated.length,
      optimal: validated.length >= 60 && validated.length <= 300,
      message: `${validated.length} characters (optimal: 60-300)`
    },
    startsWithPerson: {
      value: /^(a|an|the)\s+(stylish|professional|elegant|man|woman|person)/i.test(validated),
      message: "Should start with 'A stylish person' or similar"
    },
    hasClothingItems: {
      value: /wearing|wearing|shirt|pants|dress|shoes|jacket|blouse|sweater|jeans|skirt|tie/i.test(validated),
      message: "Should include specific clothing items"
    },
    hasFullBody: {
      value: /full.?body|full.?length|head.?to.?toe/i.test(validated),
      message: "Should include 'full body' or similar"
    },
    hasPhotography: {
      value: /photography|photo|photoshoot/i.test(validated),
      message: "Should include 'photography' or 'photo'"
    },
    hasBackground: {
      value: /background|backdrop/i.test(validated),
      message: "Should specify background (clean, white, studio, etc.)"
    },
    hasLighting: {
      value: /lighting|light|illuminat/i.test(validated),
      message: "Should specify lighting (professional, studio, natural, etc.)"
    }
  };

  const passedChecks = Object.values(checks).filter(c => c.value).length;
  const totalChecks = Object.keys(checks).length;
  const score = Math.round((passedChecks / totalChecks) * 100);

  return {
    originalPrompt: prompt,
    validatedPrompt: validated,
    score: score,
    passedChecks: `${passedChecks}/${totalChecks}`,
    checks: checks,
    isValid: score >= 85,
    recommendations: Object.entries(checks)
      .filter(([_, check]) => !check.value)
      .map(([key, check]) => check.message)
  };
}

export default {
  validatePrompt,
  generateImage,
  generateImageBatch,
  analyzePrompt
};
