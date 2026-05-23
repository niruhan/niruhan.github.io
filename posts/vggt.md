# VGGT: Visual Geometry Grounded Transformer

Jianyuan Wang et al. VGG, Oxford, Meta AI

Instead of following classical Structure from Motion (SfM), Multi-View Stereo (MVS), Bundle Adjustment (BA) optimization pipelines, train one large transformer to directly predict cameras, depths, point maps, and point tracks from a set of images in one feed-forward pass.

## Problem Setup

Input: a set of images from the same scene: $(I_i)^N_{i=1}$, $I_i \in \mathbb{R}^{3 \times H \times W}$

VGGT Output for each image $i$: $f((I_i)^N_{i=1}) = $