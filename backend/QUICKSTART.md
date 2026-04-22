# HuggingFace Integration - Quick Start Guide

## ⚡ 5-Minute Setup

### Step 1: Get API Keys

**HuggingFace Token** (5 seconds)
- Visit: https://huggingface.co/settings/tokens
- Create new token (choose "read" access)
- Copy the token

**OpenRouter Key** (optional, for better outfit generation)
- Visit: https://openrouter.ai/keys
- Create new key
- Copy the key

### Step 2: Configure Environment

Edit `backend/.env`:
```env
HF_API_KEY=hf_YOUR_TOKEN_HERE
OPENROUTER_API_KEY=sk_YOUR_KEY_HERE  # optional
```

### Step 3: Restart Server
```bash
cd backend
node server.js
```

### Step 4: Test It! 🚀

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

You should see 4 outfit suggestions with **HuggingFace-generated images**! ✨

**How it works:**
- Tries Stable Diffusion 3 (best quality) 
- Falls back to FLUX.1 Schnell (if needed)
- Falls back to Stable Diffusion 2 (if needed)
- Falls back to Stable Diffusion v1.5 (last resort)
- Falls back to Unsplash (only if all fail)

---

## 🎯 Main Endpoints

### Generate Outfit Suggestions
```
POST /api/outfits/suggestions/huggingface
```
**Body:**
```json
{
  "occasion": "Casual",    // Casual|Formal|Work|Weekend|Evening (optional)
  "weather": "Hot",        // Hot|Mild|Cold (optional)
  "count": 4               // 1-10 outfits (optional, default: 4)
}
```

**Response includes:** outfit title, description, items, colors, season, style tip, **image**

### Validate Image Prompt
```
POST /api/outfits/validate/prompt
```
**Body:**
```json
{
  "prompt": "A stylish person wearing white t-shirt, blue jeans..."
}
```

**Response includes:** validation score, recommendations, is valid

---

## 📝 Image Prompt Examples

### ✅ Good Prompts
```
"A stylish person wearing white linen shirt, khaki shorts, white sneakers, beige hat, full body shot, realistic fashion photography, clean background, professional lighting"

"A professional woman wearing light blue blouse, black trousers, black heels, full body, business fashion photography, studio background, professional lighting"

"An elegant man wearing dark navy blazer, grey trousers, white shirt, brown shoes, full body shot, formal fashion photography, clean white background, professional lighting"
```

### ❌ Bad Prompts
```
"stylish outfit"  ❌ Too vague

"person"  ❌ Missing all details

"white shirt"  ❌ Missing photography keywords
```

---

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| "HF_API_KEY not configured" | Add HF_API_KEY to .env and restart server |
| Getting Unsplash images | Check HF_API_KEY is correct, verify HuggingFace status |
| Timeout errors | Increase timeout (already set to 60s) |
| 10-30 second delay on first request | Normal - model is loading, subsequent requests are faster |
| Poor image quality | Use /validate/prompt endpoint to check prompt quality |

---

## 📚 Full Documentation

For complete documentation, see:
- **IMPLEMENTATION_SUMMARY.md** - Overview of all changes
- **HUGGINGFACE_GUIDE.md** - Complete API documentation
- **HUGGINGFACE_API_EXAMPLES.js** - Code examples and Postman collection

---

## 🎨 What Gets Generated

Each outfit includes:
- ✅ **Title** - e.g., "Casual Comfort"
- ✅ **Description** - e.g., "White cotton t-shirt with blue jeans and sneakers"
- ✅ **Items** - Top, Bottom, Shoes, Accessory (specific pieces)
- ✅ **Colors** - Array of main colors used
- ✅ **Season** - When this outfit works best
- ✅ **Style Tip** - Fashion advice for wearing it
- ✅ **Image Prompt** - How the image was generated (for reference)
- ✅ **Image** - The actual HuggingFace generated image! 🖼️

---

## 🚀 Next: Frontend Integration

### React Example
```javascript
const [outfits, setOutfits] = useState([]);

const generateOutfits = async () => {
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
    setOutfits(data.outfits);
    // Each outfit has an .image property with the generated image
  }
};
```

### Display Images
```jsx
{outfits.map((outfit) => (
  <div key={outfit.title}>
    <h2>{outfit.title}</h2>
    <p>{outfit.description}</p>
    <img 
      src={outfit.image}  // HuggingFace generated image!
      alt={outfit.title}
      style={{ width: '300px', height: '300px' }}
    />
    <ul>
      <li>Top: {outfit.items.top}</li>
      <li>Bottom: {outfit.items.bottom}</li>
      <li>Shoes: {outfit.items.shoes}</li>
      <li>Accessory: {outfit.items.accessory}</li>
    </ul>
    <p>💡 {outfit.styleTip}</p>
  </div>
))}
```

---

## ✅ Checklist

- [ ] Get HuggingFace token from https://huggingface.co/settings/tokens
- [ ] Get OpenRouter API key (optional) from https://openrouter.ai/keys
- [ ] Add to backend/.env
- [ ] Restart backend server
- [ ] Test the endpoint with cURL or Postman
- [ ] See HuggingFace-generated images! 🎉
- [ ] Integrate into frontend UI
- [ ] Deploy to production (update .env with production keys)

---

## 📞 Support

If something isn't working:
1. Check server logs: `npm run dev`
2. Verify .env has HF_API_KEY
3. Test endpoint with cURL
4. See HUGGINGFACE_GUIDE.md for detailed troubleshooting
5. Check HuggingFace status: https://status.huggingface.co/

---

**You're all set! 🎨✨**

The system will now generate AI outfit suggestions with beautiful HuggingFace-generated fashion photography!
