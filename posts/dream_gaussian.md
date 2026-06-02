# 9840 Gen AI

# ① DreamGaussian

## SDC — Score Distillation Sampling

Pipeline: from a **3D Gaussian** representation, pick a **random camera angle**, then **3D → 2D render** to get a **2D image**. Add **noise $\epsilon$** to it, and pass through a **pretrained 2D diffusion model**, which outputs **predicted noise $\epsilon_\phi$**.

$$
(\text{2D img} + \epsilon) - \epsilon_\phi = \text{cleaner image}
$$

or

$$
\text{2D img} - (\epsilon_\phi - \epsilon) = \text{cleaner image}
$$

$$
\Rightarrow \quad \epsilon_\phi - \epsilon \text{ is the direction of optimality}
$$

- But we are working on **3D Gaussians, not pixels**.
- So we need to see how pixel values change w.r.t. change in Gaussian params.

A Gaussian's parameters:

$$
\theta_i = \{\, \mu_i,\; s_i,\; q_i,\; \alpha_i,\; c_i \,\}
$$

where

- $\mu_i$ = 3D position of center
- $s_i$ = scaling along 3 axes
- $q_i$ = rotation quaternion
- $\alpha_i$ = opacity
- $c_i$ = color (no spherical harmonics in this work)

---

How pixels change when Gaussian parameters are changed:

$$
\frac{\partial I_{\text{RGB}}}{\partial \theta}
$$

Let $\mathcal{L} \to$ loss in pixel space. By chain rule:

$$
\frac{\partial \mathcal{L}}{\partial \theta}
= \underbrace{\frac{\partial \mathcal{L}}{\partial I_{\text{RGB}}}}_{(\epsilon_\phi - \epsilon)}
\times
\underbrace{\frac{\partial I_{\text{RGB}}}{\partial \theta}}_{\text{differentiable rasterizer}}
$$

So the SDS gradient is:

$$
\nabla_\theta \mathcal{L}_{\text{SDS}}
= \mathbb{E}_{t,\, p,\, \epsilon}\!\left[
w(t)\Big(\epsilon_\phi\big(I_{\text{RGB}}^p;\, t,\, \tilde{I}_{\text{RGB}}^r,\, \angle p\big) - \epsilon\Big)\,
\frac{\partial I_{\text{RGB}}^r}{\partial \theta}
\right]
$$

where the **weighting function $w(t)$ depends on time $t$**.

---

$\tilde{I}_{\text{RGB}}^r$ = reference image given as prompt to the 2D → 3D task.

Reference loss:

$$
\mathcal{L}_{\text{ref}}
= \lambda_{\text{RGB}} \big\| I_{\text{RGB}}^r - \tilde{I}_{\text{RGB}}^r \big\|_2^2
+ \lambda_A \big\| I_A^r - \tilde{I}_A^r \big\|_2^2
$$

This just aligns the rendered image & transparency at the reference camera angle to the original input image (fidelity).

---

# Mesh Extraction

## Marching Cubes (circa '98)

Works over a **voxel grid**. Consider 1 voxel — it has 8 **corners**.

**Refresher**

Selecting $k$ from $n$ options $\binom{n}{k}$ ("n choose k"):

- **Combination** — don't care about order:

$$
\binom{n}{k} = \frac{n!}{r!\,(n-r)!}
$$

$$
\binom{8}{2} = \frac{8!}{2!\,6!} = \frac{8 \times 7}{2} = 28
$$

- **Permutation** — care about order:

$$
P(n, r) = \frac{n!}{(n-r)!}
$$

$$
P(8, 2) = \frac{8!}{6!} = 56
$$

- **\# of unique configurations** for 8 vertices, each having 2 options:

$$
2^8
$$

---

- Marching cubes tries to identify if the **surface** of the object passes through a voxel cube.
- Take a corner and see if it is inside or outside the object by comparing **density**.
- If **all** vertices have high density $\Rightarrow$ the voxel is **inside** the object.
- If **all** have low density $\Rightarrow$ the voxel is **outside**.
- If **some** vertices have high density & some have low density $\Rightarrow$ the surface passes through the voxel. So this voxel is **important for surface mesh construction**.

---

## In DreamGaussian

3D Gaussians $\longrightarrow$ a $128 \times 128 \times 128$ voxel grid.

**Density equation:**

$$
d(\mathbf{u}) = \sum_i \alpha_i \exp\!\left[ -\tfrac{1}{2}(\mathbf{u} - \mu_i)^\top \Sigma_i^{-1} (\mathbf{u} - \mu_i) \right]
$$

This is the sum of opacities weighted by distance from center, over all Gaussians intersecting at $\mathbf{u}$ (a Gaussian weighted by $\alpha_i$).

---

# UV-space texture refinement

Flatten the mesh: **3D mesh → 2D** ("flatten mesh") to get a **2D UV texture**.

- **Render image** $I$ at **orbiting angle $p$**.
- Add **random noise $\epsilon(t_{\text{start}})$** to the coarse render $I_{\text{coarse}}^p$:

$$
\text{random noise } \epsilon(t_{\text{start}}) \;+\; I_{\text{coarse}}^p
$$

- Pass through the **diffusion model denoiser $f_\phi$** with **condition $c$** to produce a **clear image $I_{\text{fine}}^p$**:

$$
I_{\text{fine}}^p = f_\phi\!\left[ I_{\text{coarse}}^p + \epsilon(t_{\text{start}}) \,\middle|\, t_{\text{start}},\, c \right]
$$

  - Idea from **SDEdit** (Stochastic Differential Editing).

- Now optimize the UV-space texture w.r.t. an **MSE loss**:

$$
\mathcal{L}_{\text{MSE}} = \big\| I_{\text{fine}}^p - I_{\text{coarse}}^p \big\|_2^2
$$