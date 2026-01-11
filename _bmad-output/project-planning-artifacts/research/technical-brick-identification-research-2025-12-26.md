---
research_type: "technical"
topic: "brick-identification-counting"
date: "2025-12-26"
status: "complete"
confidence: "high"
---

# Technical Research: Lego Brick Identification & Counting

**Researcher:** Juan  
**Date:** 2025-12-26  
**Focus:** Computer vision methods for scanning and counting Lego bricks from photos

---

## Executive Summary

**Good news:** This is a well-researched problem with multiple existing solutions!

| Solution | Type | Bricks Supported | Accuracy |
|----------|------|------------------|----------|
| **Brickit** | Mobile App | Thousands | High |
| **Brickognize** | API/Open Source | 85,000+ parts | ~90% |
| **YOLOv8/v11** | Custom ML | Configurable | 70-85% |
| **Sort A Brick** | Industrial | 25,000+ | >99% |

**Recommendation:** Use **Gemini vision** (like example2) for quick MVP, evaluate **Brickognize API** for production accuracy.

---

## Existing Apps & APIs

### 1. Brickit (Mobile App) ⭐ COMPETITOR

The leading app for Lego brick scanning.

**Features:**
- Scan pile of bricks with phone camera
- AI identifies brick types and colors
- Suggests possible builds from inventory
- Works with thousands of brick types

**How it works:**
- User spreads bricks on flat surface
- Takes photo from above
- AI detects and counts each brick
- Displays inventory and build suggestions

**Relevance:** Direct competitor - study their UX!

**Source:** [App Store](https://apple.com), [petapixel.com](https://petapixel.com)

---

### 2. Brickognize (Open Source API) ⭐ RECOMMENDED

GitHub: [brickognize](https://github.com/brickognize)

**Capabilities:**
- Identifies **85,000+** Lego parts and sets
- Uses Mask R-CNN with synthetic image generation
- Available as API for integration

**Technical Stack:**
- Mask R-CNN for instance segmentation
- Trained on synthetic + real images
- Can detect multiple bricks in one image

**Integration Options:**
- Bricqer marketplace integration
- API available for custom applications

**Relevance:** 🟢 HIGH - Could integrate this API!

**Source:** [GitHub](https://github.com)

---

### 3. Instabrick

**Features:**
- Lego parts recognition from photos
- Collection organization
- Minifigure recognition

**Source:** [instabrick.org](https://instabrick.org)

---

### 4. BrickScan (formerly BrickMonkey)

**Features:**
- Minifigure and brick collection management
- Export scans to store management software
- Mobile scanning capability

**Source:** [Google Play](https://play.google.com)

---

## YOLO-Based Detection (Build Your Own)

### YOLOv8 / YOLOv11

**Why YOLO:**
- Real-time object detection
- Proven for Lego brick detection
- Active development (YOLOv11 released 2025)

**Accuracy Results:**
| Dataset Type | Accuracy |
|--------------|----------|
| Synthetic training → Synthetic test | 85%+ |
| Synthetic training → Real images | ~70% |
| Synthetic + Real training → Real | 85%+ |

### Challenges

1. **Occlusion** - Bricks covering each other
2. **Similar shapes** - Many bricks look alike
3. **Lighting variation** - Indoor lighting varies
4. **Color accuracy** - Distinguishing similar colors

### Training Approach

```
1. Get 3D models from LDraw
2. Render synthetic images in Blender
3. Vary angles, lighting, backgrounds
4. Add occlusion scenarios
5. Train YOLOv8/v11 on synthetic data
6. Fine-tune on real photos
```

**Source:** [hackmd.io](https://hackmd.io), [kaggle.com](https://kaggle.com)

---

## Available Datasets

| Dataset | Size | Bricks | Type |
|---------|------|--------|------|
| **B200C** | 800,000 images | 200 classes | Synthetic |
| **Lego Parts 2.4M** | 2.4M renders | 4,800 parts | Synthetic |
| **LegoBricks** (HuggingFace) | 400K images | 1,000 parts | 3D rendered |
| **Lego Brick Sorting** | 4,580 photos | 20 parts | Real photos |

### B200 / B200C Dataset ⭐

- 800,000 colored images
- 200 classes
- Photo-realistic with varied backgrounds
- Includes occlusion scenarios

**Source:** [Kaggle](https://kaggle.com)

### Lego Parts Classification Dataset

- 2.4 million renders
- 4,800 unique parts
- 500 random angles per part
- Transparent backgrounds
- Official Lego colors

**Source:** [Kaggle](https://kaggle.com)

---

## Recommended Architectures

| Model | Use Case | Speed | Accuracy |
|-------|----------|-------|----------|
| **YOLOv8** | Real-time detection | Fast | Good |
| **YOLOv11** | Latest improvements | Fast | Better |
| **Mask R-CNN** | Instance segmentation | Slower | High |
| **ResNet-34/50** | Classification | Fast | High |

### For Your Use Case (Spread-out bricks photo):

**Best approach:** YOLOv8 or Mask R-CNN

```
User Photo → Object Detection → Bounding Boxes
          → Classification → Brick Type
          → Counting → Inventory List
```

---

## Industrial Solutions

### Sort A Brick

Industrial-grade Lego sorting machine.

**Specs:**
- Recognizes **25,000+ unique bricks**
- **>99% precision**
- Automatic sorting into bins
- Conveyor belt system

**Technology:**
- Custom computer vision
- High-resolution cameras
- Specialized lighting

**Source:** [tech.eu](https://tech.eu)

---

### Daniel West's Universal Sorting Machine

Open-source approach!

**Technology:**
- Raspberry Pi
- CNN trained on 3D model images
- Can identify bricks it hasn't seen before

**Source:** [raspberrypi.com](https://raspberrypi.com), [Medium](https://medium.com)

---

## Alternative: Gemini Vision (Fastest MVP)

Since you have example2 using Gemini, you could use the **same approach** for brick detection:

```typescript
// Modify the prompt for brick scanning
const BRICK_SCAN_PROMPT = `
  Analyze this image of Lego bricks spread on a surface.
  Identify each visible brick by:
  - Type (e.g., "2x4 brick", "1x2 plate", "2x2 slope")
  - Color (e.g., "red", "bright blue", "dark gray")
  - Count how many of each type/color combination
  
  Return as JSON array.
`;

const response = await ai.models.generateContent({
  model: 'gemini-3-pro-preview',
  contents: {
    parts: [
      { inlineData: { mimeType, data: base64Data } },
      { text: BRICK_SCAN_PROMPT }
    ]
  },
  config: {
    responseMimeType: "application/json"
  }
});
```

**Pros:**
- No ML training needed
- Works immediately
- Uses example2 infrastructure

**Cons:**
- May be less accurate than specialized models
- API costs per scan
- Less control over detection

---

## Recommended Approach for Lego Builder

### MVP (Fast)

Use **Gemini Vision** (like example2):
1. User uploads photo of spread bricks
2. Gemini analyzes and returns brick list
3. Display counted inventory

### Production (Accurate)

1. **Option A:** Integrate **Brickognize API**
   - Pre-trained on 85,000+ parts
   - Proven accuracy

2. **Option B:** Train custom **YOLOv8** model
   - Use B200C or LegoBricks dataset
   - Fine-tune on real photos
   - Deploy on-device or server

---

## Key Takeaways

1. ✅ **Solved problem** - Multiple working solutions exist
2. ✅ **Datasets available** - Kaggle has 2.4M+ renders
3. ✅ **YOLOv8 proven** - ~85% accuracy achievable
4. ✅ **Gemini option** - Fastest path for MVP
5. ⚠️ **Occlusion is hard** - Spread-out bricks work best
6. 💡 **Brickognize API** - Consider for production

---

## Next Steps

1. **For MVP:** Modify example2 to add Gemini brick scanning prompt
2. **For production:** Evaluate Brickognize API
3. **For custom model:** Download B200C dataset from Kaggle
