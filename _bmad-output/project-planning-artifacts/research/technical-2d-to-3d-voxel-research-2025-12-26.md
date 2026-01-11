---
research_type: "technical"
topic: "2D-to-3D-voxel-conversion"
date: "2025-12-26"
status: "complete"
confidence: "high"
---

# Technical Research: 2D Image to 3D Voxel Conversion

**Researcher:** Juan  
**Date:** 2025-12-26  
**Focus:** Google AI Studio approach + ready-to-use solutions

---

## Executive Summary

There are **multiple ready-to-use solutions** for 2D→3D conversion available today. The most relevant for your Lego Builder project are:

| Solution | Type | Best For | Voxel Support |
|----------|------|----------|---------------|
| **Nano Banana World** | Google AI Studio demo | Quick voxel art from images | ✅ Native |
| **Microsoft Trellis** | Open source | High-quality 3D from images | ✅ Sparse voxel VAE |
| **TripoSR** | Open source | Fast single-image 3D | ❌ Mesh output |
| **Pix2Vox** | Research/Open source | Direct voxel generation | ✅ Native |

**Recommendation:** Start with **Nano Banana World** for prototyping, then integrate **Microsoft Trellis** or **Pix2Vox** for production.

---

## Google AI Studio Approaches

### Nano Banana World (Gemini 2.5 Flash)

A generative AI canvas built with Google's Gemini 2.5 Flash model that transforms text prompts and images into **3D voxel art**.

**Key Features:**
- Creates isometric voxel worlds from images
- Uses Gemini's multimodal understanding
- Can reason about and reassemble voxel creations

**How to Use:**
1. Access via Google AI Studio
2. Upload 2D reference image
3. Add descriptive prompt for voxel style
4. AI generates interactive 3D voxel model

**Relevance to Lego Builder:** 🟢 HIGH
- Native voxel output aligns with brick-based approach
- Could be first stage before "Lego-izer" constraint layer

**Source:** [YouTube tutorials on Nano Banana](https://youtube.com)

---

### 3D AI Studio (Image to 3D)

Commercial toolkit that transforms images into 3D assets with guidance on voxelization.

**Workflow for Voxel Art:**
1. Generate base 3D model from image in 3D AI Studio
2. Export model
3. Voxelize using MagicaVoxel or similar tools

**Best Practices:**
- Use clear, well-lit photos
- Center object with plain background
- Ensure visible details

**Source:** [3daistudio.com](https://3daistudio.com)

---

## Open Source Libraries

### 1. Microsoft Trellis (TRELLIS.2-4B) ⭐ RECOMMENDED

**Released:** Late 2024  
**GitHub:** [microsoft/TRELLIS](https://github.com/microsoft/TRELLIS)

**Technical Approach:**
- Flow-Matching Transformers
- Sparse voxel-based 3D VAE ("O-Voxel" representation)
- Encodes both geometry AND appearance
- Handles complex topologies and sharp features

**Capabilities:**
- Resolutions up to **1536³** voxels
- Multiple output formats: meshes, Radiance Fields, 3D Gaussians
- Single image input

**Relevance to Lego Builder:** 🟢 HIGH
- Sparse voxel representation is memory-efficient
- High resolution means better brick placement accuracy
- Open source = full customization possible

**Source:** [HuggingFace](https://huggingface.co), [GitHub](https://github.com)

---

### 2. TripoSR (Stability AI + TripoAI)

**Released:** Early 2024

**Features:**
- Fast 3D reconstruction from single image
- Known for speed and accuracy
- Detailed 3D asset generation

**Output:** Mesh-based (not native voxel)

**Relevance to Lego Builder:** 🟡 MEDIUM
- Would need voxelization post-processing
- Good for STL/OBJ → Lego conversion feature

**Source:** [triposrai.com](https://triposrai.com)

---

### 3. Pix2Vox (Research Implementation)

**GitHub:** Available as "2D-views-to-3D-Objects"

**Technical Approach:**
- DeepLab V3+ for semantic segmentation
- Pix2Vox architecture for 3D reconstruction
- **Direct voxel output**

**Relevance to Lego Builder:** 🟢 HIGH
- Native voxel generation
- Research-backed approach
- Can be fine-tuned for Lego-specific output

**Source:** [GitHub](https://github.com)

---

### 4. Hunyuan3D-2 (Tencent)

Open source model for high-resolution textured 3D from images.

- Blender integration available
- High-quality textures

**Source:** [YouTube demos](https://youtube.com)

---

## Technical Approaches (For Understanding)

### Neural Network Architectures Used

| Architecture | How It Works | Pros | Cons |
|--------------|--------------|------|------|
| **Encoder-Decoder** | Encodes 2D features → Decodes to 3D voxel grid | Simple, proven | Memory intensive |
| **VAE** | Learns latent 3D representation | Smoother output | May lose detail |
| **GANs** | Generator + Discriminator improve quality | High realism | Training complex |
| **Diffusion Models** | Progressive noise → structure | State-of-art quality | Slow generation |

### Voxel Representation Challenges

1. **Memory:** Voxels grow cubically (64³ = 262K, 256³ = 16M, 1024³ = 1B)
2. **Solution:** Sparse voxel representations (like Trellis uses)
3. **Alternative:** Generate mesh first, then voxelize

---

## Recommended Approach for Lego Builder

### Phase 1: Image → Voxel Model

```
Option A: Use Microsoft Trellis
- Input: 2D image
- Output: Sparse voxel representation
- Advantage: High resolution, open source

Option B: Use Pix2Vox variant
- Input: 2D image  
- Output: Dense voxel grid
- Advantage: Direct voxel output
```

### Phase 2: Voxel → Lego Bricks (Your "Lego-izer")

```
Input: Voxel model from Phase 1
Process:
1. Map voxels to Lego brick positions
2. Optimize brick selection (prefer larger bricks)
3. Ensure staggered joints
4. Validate structural integrity
5. Apply hollow/infill options
Output: Lego brick model with build instructions
```

---

## Quick Start Resources

| Resource | URL | Use For |
|----------|-----|---------|
| Microsoft Trellis | github.com/microsoft/TRELLIS | Best open source 2D→3D |
| Nano Banana World | Google AI Studio | Quick prototyping |
| Pix2Vox | GitHub search | Direct voxel research |
| MagicaVoxel | ephtracy.github.io | Voxel editing/export |

---

## Key Takeaways

1. ✅ **Ready solutions exist** - Microsoft Trellis is production-ready
2. ✅ **Voxel output available** - Both Trellis and Pix2Vox support voxels
3. ✅ **Google AI Studio works** - Nano Banana for quick prototyping
4. ⚠️ **You still need Lego-izer** - None convert to actual Lego bricks
5. 💡 **Two-phase approach confirmed** - Brainstorm insight validated
6. 🏆 **Local example2 is ideal foundation** - Working Image→Voxel codebase

---

## 🏆 Local Reference: Image to Voxel Example

**Location:** `/example2/` (Google AI Studio app)

This existing codebase is a **proven starting point** for the Lego Builder:

| Component | File | Reusable For |
|-----------|------|--------------|
| Image upload + drag-drop | `App.tsx` | User image input |
| Gemini vision integration | `services/gemini.ts` | Image → 3D conversion |
| Three.js voxel rendering | Generated output | 3D visualization |
| Streaming thoughts UI | `App.tsx` | Loading feedback |

### Key Implementation Pattern

```
User Image → Gemini 3 Pro (vision) → Three.js Voxel Scene
```

**The VOXEL_PROMPT can be modified to add Lego constraints:**
- Standard brick sizes (1x1, 1x2, 2x2, 2x4)
- Staggered joints requirement
- Buildability validation
- Layer-by-layer output

**Confidence:** 🟢 HIGH - This is a working, production-ready foundation.

---

## Next Steps

1. **Use example2 as implementation foundation** (ideal starting point)
2. **Prototype with Nano Banana World** in Google AI Studio
3. **Design the Lego-izer algorithm** (the novel part of your project)

