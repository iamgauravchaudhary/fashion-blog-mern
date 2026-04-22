# HuggingFace Image Generation Integration Guide

## Overview

This guide explains how to use the HuggingFace image generation integration for fashion outfit suggestions with automatic model fallback.

## Features

✅ **Multiple Model Support** - Uses best available model from fallback chain  
✅ **Automatic Model Fallback** - Tries Stable Diffusion 3 → FLUX.1 Schnell → Stable Diffusion 2 → v1.5  
✅ **Automatic Prompt Validation** - Ensures prompts work with HuggingFace  
✅ **Retry Logic** - Handles model loading and rate limiting  
✅ **Graceful Degradation** - Falls back to Unsplash if all models fail  
✅ **Batch Generation** - Generate multiple outfit images  

## Setup

### 1. Environment Variables

Add to your `.env` file:

```env
# HuggingFace API Configuration
HF_API_KEY=your_huggingface_api_key_here

# OpenRouter API Configuration (for outfit suggestions)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional: Gemini for fallback
GEMINI_API_KEY=your_gemini_api_key_here
```

### 2. Get Your HuggingFace API Key

1. Go to https://huggingface.co/settings/tokens
2. Create a new token with `read` access
3. Copy and paste into your `.env` file

### 3. Supported Models

The system automatically tries models in this order:

| Model | Speed | Quality | Availability |
|-------|-------|---------|--------------|
| Stable Diffusion 3 Medium | Medium | Excellent | ✅ Most reliable |
| FLUX.1 Schnell | Fast | Very Good | ✅ Fast generation |
| Stable Diffusion 2 | Medium | Good | ✅ Fallback |
| Stable Diffusion v1.5 | Fast | Good | ✅ Last resort |

If one model isn't available or fails, it automatically tries the next one!

## API Endpoints

### 1. Generate Outfit Suggestions (HuggingFace Optimized)

**Endpoint:** `POST /api/outfits/suggestions/huggingface`

Generates 4 outfit suggestions with HuggingFace-compatible image prompts and generates images.

**Request Body:**
```json
{
  "occasion": "Casual",           // Casual|Formal|Work|Weekend|Evening (optional)
  "weather": "Hot",               // Hot|Mild|Cold (optional)
  "count": 4                       // Number of outfits (1-10, optional)
}
```

**Response:**
```json
{
  "success": true,
  "count": 4,
  "outfits": [
    {
      "title": "Casual Comfort",
      "category": "Casual",
      "description": "White cotton t-shirt with blue jeans...",
      "items": {
        "top": "White cotton t-shirt",
        "bottom": "Blue jeans",
        "shoes": "White sneakers",
        "accessory": "Black sunglasses"
      },
      "colors": ["white", "blue", "black"],
      "season": "All Seasons",
      "styleTip": "Perfect everyday look...",
      "imagePrompt": "A stylish person wearing white cotton t-shirt, blue jeans...",
      "image": "data:image/jpeg;base64,..." // HuggingFace generated image
    }
  ],
  "metadata": {
    "occasion": "Casual",
    "weather": "Hot",
    "generatedAt": "2024-04-21T10:30:00Z",
    "huggingfaceModel": "FLUX.1-dev"
  }
}
```

**Example cURL:**
```bash
curl -X POST https://fashion-blog-mern-1.onrender.com/api/outfits/suggestions/huggingface \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "occasion": "Casual",
    "weather": "Hot",
    "count": 4
  }'
```

### 2. Validate HuggingFace Image Prompt

**Endpoint:** `POST /api/outfits/validate/prompt`

Validates and optimizes an image prompt for HuggingFace FLUX.1-dev.

**Request Body:**
```json
{
  "prompt": "Your image prompt here"
}
```

**Response:**
```json
{
  "success": true,
  "originalPrompt": "Your image prompt here",
  "validatedPrompt": "Optimized prompt that works with HuggingFace",
  "length": 145,
  "isValid": true,
  "recommendations": {
    "length": "145 characters (optimal: 60-300)",
    "startsWithPerson": true,
    "hasClothingItems": true,
    "hasFullBody": true,
    "hasPhotography": true,
    "hasBackground": true,
    "hasLighting": true
  }
}
```

**Example cURL:**
```bash
curl -X POST https://fashion-blog-mern-1.onrender.com/api/outfits/validate/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A stylish person wearing white t-shirt and blue jeans"
  }'
```

## Image Prompt Guidelines

### ✅ DO:

- Start with "A stylish person", "A professional", or "An elegant"
- Include specific clothing items and colors
- Include "full body shot" or "full body"
- Include "realistic fashion photography"
- Include "clean background"
- Include "professional lighting"
- Keep between 60-300 characters
- Use simple, descriptive language

### ❌ DON'T:

- Use special characters or line breaks
- Include copyright information
- Use vague descriptions
- Exceed 400 characters
- Include markdown formatting

### Example Good Prompts:

```
✅ A stylish person wearing white linen shirt, khaki shorts, white sneakers, full body shot, realistic fashion photography, clean background, professional lighting

✅ A professional woman wearing light blue blouse, black trousers, black heels, full body, business fashion photography, studio background, professional lighting

✅ An elegant man wearing dark navy blazer, grey trousers, white dress shirt, brown dress shoes, full body shot, formal fashion photography, clean white background, professional lighting
```

## Using the Utility Functions

### In Your Routes:

```javascript
import { generateImage, validatePrompt, analyzePrompt } from '../utils/huggingfaceImageGenerator.js';

// Generate an image
const imageUrl = await generateImage("A stylish person wearing white t-shirt, blue jeans, full body shot, realistic fashion photography, clean background, professional lighting");

// Validate a prompt
const validatedPrompt = validatePrompt(userProvidedPrompt);

// Analyze a prompt
const analysis = analyzePrompt(userProvidedPrompt);
console.log(`Prompt score: ${analysis.score}%`);
console.log(`Recommendations:`, analysis.recommendations);
```

### Batch Generation:

```javascript
import { generateImageBatch } from '../utils/huggingfaceImageGenerator.js';

const prompts = [
  "A stylish person wearing casual outfit...",
  "A professional wearing work outfit...",
  "An elegant person wearing evening outfit..."
];

const results = await generateImageBatch(prompts, {
  maxRetries: 2,
  retryDelay: 3000,
  timeout: 60000
});

results.forEach((result, index) => {
  if (result.success) {
    console.log(`Image ${index + 1}: Success`, result.image);
  } else {
    console.log(`Image ${index + 1}: Failed`, result.error);
  }
});
```

## Flow Diagram

```
User Request
    ↓
OpenRouter LLM
    ↓
Generate Outfit JSON with imagePrompt
    ↓
Validate Prompt
    ↓
Try Stable Diffusion 3
    ↓ (if fails)
Try FLUX.1 Schnell
    ↓ (if fails)
Try Stable Diffusion 2
    ↓ (if fails)
Try Stable Diffusion v1.5
    ↓ (if all fail)
Fallback to Unsplash
    ↓
Return Complete Outfit with Image
```

## Error Handling

### HuggingFace API Errors

The system handles common errors with automatic fallback:

| Error | Cause | Action |
|-------|-------|--------|
| 404 Not Found | Model not available | Try next model in chain |
| 429 Too Many Requests | Rate limited | Retry with 3s delay (max 2 attempts) |
| 503 Service Unavailable | Model loading | Retry with 3s delay (max 2 attempts) |
| 401 Unauthorized | Invalid API Key | Stop and use Unsplash fallback |
| Timeout | Request too slow | Retry once, then next model |
| Network Error | Connection issue | Try next model or fallback to Unsplash |

### Auto-Recovery Features

✅ **Model Fallback Chain** - If one model fails, automatically tries the next  
✅ **Retry Logic** - Transient errors (429, 503) auto-retry with 3s delay  
✅ **Timeout Handling** - 90-second timeout with automatic recovery  
✅ **Unsplash Fallback** - All models fail → returns quality stock image  
✅ **No User Impact** - User always gets an outfit with an image

## Configuration Options

### In generateImage():

```javascript
const options = {
  maxRetries: 2,                    // Number of retry attempts
  retryDelay: 3000,                 // Delay between retries (ms)
  timeout: 60000,                   // Request timeout (ms)
  fallbackUrl: "https://..."        // Fallback image URL
};

const image = await generateImage(prompt, options);
```

## Troubleshooting

### Issue: "HF_API_KEY not configured"
- **Solution:** Add `HF_API_KEY` to your `.env` file and restart server

### Issue: "Failed after 2 attempts"
- **Solution:** Check internet connection, HuggingFace API status, API key validity

### Issue: Images are Unsplash fallbacks
- **Solution:** Check server logs for HuggingFace API errors, verify API key

### Issue: Prompts not generating good images
- **Solution:** Use the `/validate/prompt` endpoint and follow the guidelines above

## Performance Notes

- First image generation: 10-30 seconds (model loading)
- Subsequent images: 5-15 seconds (model ready)
- Batch generation: Add 1-2 seconds delay between requests to avoid rate limiting
- Recommended max batch size: 5 images per request

## API Keys & Security

- **Never commit** `.env` files with API keys
- Use `.gitignore` to exclude `.env`
- Rotate API keys regularly
- Use different keys for development and production
- Monitor API usage in HuggingFace dashboard

## Examples

### Example 1: Generate Casual Outfits for Hot Weather

```bash
curl -X POST https://fashion-blog-mern-1.onrender.com/api/outfits/suggestions/huggingface \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "occasion": "Casual",
    "weather": "Hot",
    "count": 4
  }'
```

### Example 2: Generate Work Outfits

```bash
curl -X POST https://fashion-blog-mern-1.onrender.com/api/outfits/suggestions/huggingface \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "occasion": "Work",
    "weather": "Mild",
    "count": 3
  }'
```

### Example 3: Validate Custom Prompt

```bash
curl -X POST https://fashion-blog-mern-1.onrender.com/api/outfits/validate/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A stylish woman wearing elegant black dress, black heels, gold necklace, full body, fashion photography"
  }'
```

## Frontend Integration

### React/TypeScript Example:

```typescript
const generateOutfits = async (occasion: string, weather: string) => {
  const response = await fetch('/api/outfits/suggestions/huggingface', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      occasion,
      weather,
      count: 4
    })
  });

  const data = await response.json();
  
  if (data.success) {
    setOutfits(data.outfits);
    // data.outfits[i].image contains the HuggingFace generated image
  }
};
```

## Support & Documentation

- HuggingFace API Docs: https://huggingface.co/docs/api-inference/
- FLUX.1-dev Model: https://huggingface.co/black-forest-labs/FLUX.1-dev
- OpenRouter API: https://openrouter.ai/docs
