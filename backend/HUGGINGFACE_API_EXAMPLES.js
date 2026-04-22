/**
 * HuggingFace Image Generation - API Examples
 * 
 * This file contains example API calls for testing the HuggingFace 
 * integration for outfit suggestion image generation.
 * 
 * Use these with Postman, cURL, or any REST client.
 */

// ============================================
// 1. GENERATE OUTFIT SUGGESTIONS (HuggingFace Optimized)
// ============================================

// Request URL:
// POST https://fashion-blog-mern-1.onrender.com/api/outfits/suggestions/huggingface

// Request Headers:
// Authorization: Bearer YOUR_JWT_TOKEN
// Content-Type: application/json

// Request Body:
{
  "occasion": "Casual",     // Optional: Casual|Formal|Work|Weekend|Evening
    "weather": "Hot",         // Optional: Hot|Mild|Cold
      "count": 4                // Optional: 1-10 (default: 4)
}

// Example Response:
{
  "success": true,
    "count": 4,
      "outfits": [
        {
          "title": "Casual Comfort",
          "category": "Casual",
          "description": "White cotton t-shirt with blue jeans and sneakers",
          "items": {
            "top": "White cotton t-shirt",
            "bottom": "Blue jeans",
            "shoes": "White sneakers",
            "accessory": "Black sunglasses"
          },
          "colors": ["white", "blue", "black"],
          "season": "All Seasons",
          "styleTip": "Perfect everyday look for comfort and style",
          "imagePrompt": "A stylish person wearing white cotton t-shirt, blue jeans, white sneakers, black sunglasses, full body shot, realistic fashion photography, clean background, professional lighting",
          "image": "data:image/jpeg;base64,..." // HuggingFace generated image
        },
        // ... 3 more outfits
      ],
        "metadata": {
    "occasion": "Casual",
      "weather": "Hot",
        "generatedAt": "2024-04-21T10:30:00Z",
          "huggingfaceModel": "FLUX.1-dev"
  }
}

// ============================================
// 2. VALIDATE HUGGINGFACE IMAGE PROMPT
// ============================================

// Request URL:
// POST https://fashion-blog-mern-1.onrender.com/api/outfits/validate/prompt

// Request Headers:
// Content-Type: application/json

// Request Body:
{
  "prompt": "A stylish person wearing white t-shirt and blue jeans, full body shot, realistic fashion photography, clean background, professional lighting"
}

// Example Response:
{
  "success": true,
    "originalPrompt": "A stylish person wearing white t-shirt and blue jeans, full body shot, realistic fashion photography, clean background, professional lighting",
      "validatedPrompt": "A stylish person wearing white t-shirt, blue jeans, full body shot, realistic fashion photography, clean background, professional lighting",
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

// ============================================
// 3. GENERATE OUTFIT SUGGESTIONS (Original Endpoint)
// ============================================

// Request URL:
// POST https://fashion-blog-mern-1.onrender.com/api/outfits/generate

// Request Headers:
// Authorization: Bearer YOUR_JWT_TOKEN
// Content-Type: application/json

// Request Body:
{
  "count": 4  // Optional: number of outfits (default: 4)
}

// Response: Similar to endpoint #1 but uses user's wardrobe for personalization

// ============================================
// CURL EXAMPLES
// ============================================

// Example 1: Generate Casual Outfits for Hot Weather
/*
curl -X POST https://fashion-blog-mern-1.onrender.com/api/outfits/suggestions/huggingface \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "occasion": "Casual",
    "weather": "Hot",
    "count": 4
  }'
*/

// Example 2: Generate Work Outfits
/*
curl -X POST https://fashion-blog-mern-1.onrender.com/api/outfits/suggestions/huggingface \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "occasion": "Work",
    "weather": "Mild",
    "count": 3
  }'
*/

// Example 3: Generate Evening Outfits
/*
curl -X POST https://fashion-blog-mern-1.onrender.com/api/outfits/suggestions/huggingface \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "occasion": "Evening",
    "weather": "Hot",
    "count": 2
  }'
*/

// Example 4: Validate a Custom Prompt
/*
curl -X POST https://fashion-blog-mern-1.onrender.com/api/outfits/validate/prompt \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A stylish woman wearing elegant black dress, black heels, gold accessories, full body, high fashion photography"
  }'
*/

// ============================================
// JAVASCRIPT/FETCH EXAMPLES
// ============================================

// Example 1: Generate Outfits using Fetch
/*
async function generateOutfits() {
  const token = localStorage.getItem('token');

  const response = await fetch('/api/outfits/suggestions/huggingface', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      occasion: 'Casual',
      weather: 'Hot',
      count: 4
    })
  });

  const data = await response.json();

  if (data.success) {
    console.log('Generated outfits:', data.outfits);

    // Display images
    data.outfits.forEach((outfit, index) => {
      const img = document.createElement('img');
      img.src = outfit.image; // This is the HuggingFace generated image
      img.alt = outfit.title;
      document.body.appendChild(img);
    });
  } else {
    console.error('Failed to generate outfits:', data.error);
  }
}
*/

// Example 2: Validate Prompt using Fetch
/*
async function validatePrompt(prompt) {
  const response = await fetch('/api/outfits/validate/prompt', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ prompt })
  });

  const data = await response.json();

  console.log('Prompt Score:', data.score, '%');
  console.log('Is Valid:', data.isValid);
  console.log('Recommendations:', data.recommendations);

  return data;
}
*/

// ============================================
// POSTMAN COLLECTION
// ============================================

/*
{
  "info": {
    "name": "Fashion Vlog - HuggingFace Integration",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Generate Casual Outfits (Hot Weather)",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer YOUR_JWT_TOKEN",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"occasion\": \"Casual\",\n  \"weather\": \"Hot\",\n  \"count\": 4\n}"
        },
        "url": {
          "raw": "https://fashion-blog-mern-1.onrender.com/api/outfits/suggestions/huggingface",
          "protocol": "https",
          "host": ["fashion-blog-mern-1", "onrender", "com"],
          "path": ["api", "outfits", "suggestions", "huggingface"]
        }
      }
    },
    {
      "name": "Validate Image Prompt",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"prompt\": \"A stylish person wearing white t-shirt, blue jeans, full body shot, realistic fashion photography, clean background, professional lighting\"\n}"
        },
        "url": {
          "raw": "https://fashion-blog-mern-1.onrender.com/api/outfits/validate/prompt",
          "protocol": "https",
          "host": ["fashion-blog-mern-1", "onrender", "com"],
          "path": ["api", "outfits", "validate", "prompt"]
        }
        }
      }
    }
  ]
}
*/

// ============================================
// TESTING CHECKLIST
// ============================================

/*
✓ Setup:
  - [ ] Add HF_API_KEY to .env
  - [ ] Add OPENROUTER_API_KEY to .env
  - [ ] Restart backend server
  - [ ] Get JWT token (login or use test token)

✓ Endpoint Tests:
  - [ ] Test: POST /api/outfits/suggestions/huggingface (Casual, Hot, 4)
  - [ ] Test: POST /api/outfits/suggestions/huggingface (Formal, Mild, 2)
  - [ ] Test: POST /api/outfits/suggestions/huggingface (Work, Cold, 3)
  - [ ] Test: POST /api/outfits/validate/prompt (various prompts)

✓ Response Validation:
  - [ ] success: true
  - [ ] outfits array has correct count
  - [ ] Each outfit has image property
  - [ ] image is valid base64 or URL
  - [ ] imagePrompt is properly formatted
  - [ ] All outfit properties present

✓ Error Handling:
  - [ ] Invalid JWT returns 401
  - [ ] Missing HF_API_KEY falls back to Unsplash
  - [ ] Invalid occasion defaults to "Casual"
  - [ ] Count > 10 handled gracefully

✓ Performance:
  - [ ] First request takes 10-30s (model loading)
  - [ ] Subsequent requests take 5-15s
  - [ ] Fallback images load instantly
  - [ ] No timeout errors with 60s timeout
*/

// ============================================
// TROUBLESHOOTING GUIDE
// ============================================

/*
PROBLEM: "HF_API_KEY not configured"
SOLUTION:
1. Check .env file has HF_API_KEY
2. Verify the key is valid (get from https://huggingface.co/settings/tokens)
3. Restart the backend server
4. Check server logs for confirmation

PROBLEM: Images are Unsplash fallbacks, not HuggingFace
SOLUTION:
1. Check server console for HuggingFace errors
2. Verify HF_API_KEY is correct
3. Check HuggingFace status: https://status.huggingface.co/
4. Verify FLUX.1-dev model is accessible: https://huggingface.co/black-forest-labs/FLUX.1-dev
5. Check rate limiting (may need to wait a few minutes)

PROBLEM: "Failed after 2 attempts"
SOLUTION:
1. Check internet connection
2. Increase retryDelay in generateImage function
3. Check HuggingFace API status
4. Try a simpler prompt
5. Check rate limiting

PROBLEM: Prompts generating poor images
SOLUTION:
1. Use /validate/prompt endpoint to check prompt quality
2. Follow image prompt guidelines in HUGGINGFACE_GUIDE.md
3. Ensure prompt has all required keywords
4. Test with the example prompts first
5. Increase guidance_scale in generateOutfitImage function (try 10-15)

PROBLEM: Timeout errors
SOLUTION:
1. Increase timeout value (currently 60000ms)
2. Check internet speed
3. Check if HuggingFace model is overloaded
4. Try batch generation with delays between requests
*/
