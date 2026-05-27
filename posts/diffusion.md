# My notes from Principles of Diffusion Models Chieh-Hsin Lai et. al.

three complementary ways to formalize this idea
1. variational view: inspired by variational autoencoders, sees diffusion as learning to remove noise step by step
2. score-based view: rooted in energy-based modeling, learns the gradient of the evolving data distribution, which indicates how to nudge samples toward more likely regions
3. flow-based view: related to normalizing flows, treats generation as following a smooth path that moves samples from noise to data under a learned velocity field

## Training of DGM

We learn parameters $\phi$ of a model family $\{p_\phi\}$ by minimizing a discrepancy $D(p_\text{data}, p_\phi)$:

$$\phi^* \in \arg\min_\phi \, D(p_\text{data}, p_\phi)$$

Because $p_\text{data}$ is unknown, a practical choice of $D$ must admit efficient estimation from i.i.d. samples from $p_\text{data}$. With sufficient capacity, $p_{\phi^*}$ can closely approximate $p_\text{data}$.

**Forward KL and Maximum Likelihood Estimation (MLE).** A standard choice is the (forward) Kullback–Leibler divergence:

$$
D_\text{KL}\!\left(p_\text{data} \,\|\, p_\phi\right) := \int p_\text{data}(x) \log \frac{p_\text{data}(x)}{p_\phi(x)} \, dx \\
= \mathbb{E}_{x \sim p_\text{data}}\!\left[\log p_\text{data}(x) - \log p_\phi(x)\right] \\
= \mathbb{E}_{x \sim p_\text{data}}\!\left[\log \frac{p_\text{data}(x)}{p_\phi(x)}\right] \\
= -\mathbb{E}_{x \sim p_\text{data}}\!\left[\log p_\phi(x)\right] + H(p_\text{data})

$$

where $H(p_\text{data}) := -\mathbb{E}_{x \sim p_\text{data}}\!\left[\log p_\text{data}(x)\right]$ is the entropy of the data distribution, which is constant with respect to $\phi$.

## Note

- KL Divergence is asymmetric
$$D_\text{KL}(p_\text{data} \| p_\phi) \neq D_\text{KL}(p_\phi \| p_\text{data}).$$

- Minimizing $D_\text{KL}(p_\text{data} \| p_\phi)$ encourages **mode covering**: if there exists a set of positive measure $A$ with $p_\text{data}(A) > 0$ but $p_\phi(x) = 0$ for $x \in A$, then the integrand contains $\log(p_\text{data}(x)/0) = +\infty$ on $A$, so $D_\text{KL} = +\infty$. Thus minimizing forward KL forces the model to assign probability wherever the data has support.


## Minimizing KL $\Leftrightarrow$ MLE

$$\min_\phi \, D_\text{KL}(p_\text{data} \| p_\phi) \iff \max_\phi \, \mathbb{E}_{x \sim p_\text{data}}\!\left[\log p_\phi(x)\right].$$

In practice we replace the population expectation by its Monte Carlo estimate from i.i.d. samples $\{x^{(i)}\}_{i=1}^N \sim p_\text{data}$, yielding the empirical MLE objective

$$\hat{\mathcal{L}}_\text{MLE}(\phi) := -\frac{1}{N} \sum_{i=1}^N \log p_\phi\!\left(x^{(i)}\right),$$

optimized via stochastic gradients over minibatches; no evaluation of $p_\text{data}(x)$ is required.

## Fisher Divergence

$$D_F(p \| q) := \mathbb{E}_{x \sim p}\!\left[\|\nabla_x \log p(x) - \nabla_x \log q(x)\|_2^2\right]. \tag{1.1.3}$$

It measures the discrepancy between the score functions $\nabla_x \log p(x)$ and $\nabla_x \log q(x)$, which are vector fields pointing toward regions of higher probability. In short, $D_F(p \| q) \geq 0$ with equality if and only if $p = q$ almost everywhere.

**Beyond KL.** Although the KL divergence is the most widely used measure of difference between probability distributions, it is not the only one. Different divergences capture different geometric or statistical notions of discrepancy, which in turn affect the optimization dynamics of learning algorithms. A broad family is the **f-divergences** (Csiszár, 1963):

$$D_f(p \| q) = \int q(x)\, f\!\left(\frac{p(x)}{q(x)}\right) dx, \quad f(1) = 0, \tag{1.1.4}$$

where $f : \mathbb{R}_+ \to \mathbb{R}$ is a convex function. By changing $f$, we obtain many well-known divergences:

$$f(u) = u \log u \implies D_f = D_\text{KL}(p \| q) \quad \text{(forward KL)},$$

$$f(u) = \tfrac{1}{2}\!\left[u \log u - (u+1)\log\tfrac{1+u}{2}\right] \implies D_f = D_\text{JS}(p \| q) \quad \text{(Jensen–Shannon)},$$

$$f(u) = \tfrac{1}{2}|u - 1| \implies D_f = D_\text{TV}(p, q) \quad \text{(total variation)}.$$

For clarity, the explicit forms are

$$D_\text{JS}(p \| q) = \frac{1}{2} D_\text{KL}\!\left(p \,\Big\|\, \tfrac{1}{2}(p+q)\right) + \frac{1}{2} D_\text{KL}\!\left(q \,\Big\|\, \tfrac{1}{2}(p+q)\right),$$

and

$$D_\text{TV}(p, q) = \frac{1}{2} \int_{\mathbb{R}^D} |p - q| \, dx = \sup_{A \subset \mathbb{R}^D} |p(A) - q(A)|.$$

For $p_\phi$ to be a valid probability density function, it must satisfy two fundamental properties:

1. **Non-Negativity:** $p_\phi(x) \geq 0$ for all $x$ in the domain.
2. **Normalization:** The integral over the entire domain must equal one, i.e., $\int p_\phi(x)\, dx = 1$.

Ensuring non-negativity: applying a positive function to the raw output of the neural network
$$\tilde{p}_\phi(x) = \exp(E_\phi(x)).$$

Enforcing normalization:

$$p_\phi(x) = \frac{\tilde{p}_\phi(x)}{\int \tilde{p}_\phi(x')\, dx'} = \frac{\exp(E_\phi(x))}{\int \exp(E_\phi(x'))\, dx'}.$$

The denominator in this expression is known as the **normalizing constant** or **partition function**, denoted by $Z(\phi)$:

$$Z(\phi) := \int \exp(E_\phi(x'))\, dx'.$$

For most high-dimensional problems, the integral required to compute the normalizing constant $Z(\phi)$ is intractable. This intractability is a central problem that motivates the development of many different families of deep generative models.

## Prominent DGMs

### Energy-Based Models (EBMs)

Define a probability distribution through an energy function $E_\phi(x)$ that assigns lower energy to more probable data points. The probability of a data point is defined as:

$$p_\phi(x) := \frac{1}{Z(\phi)} \exp(-E_\phi(x)),$$

where

$$Z(\phi) = \int \exp(-E_\phi(x))\, dx.$$


### Autoregressive Models

Factorize the joint data distribution $p_\text{data}$ into a product of conditional probabilities using the chain rule of probability:

$$p_\text{data}(x) = \prod_{i=1}^D p_\phi(x_i \mid x_{<i}),$$

where $x = (x_1, \ldots, x_D)$ and $x_{<i} = (x_1, \ldots, x_{i-1})$.

Each conditional $p_\phi(x_i \mid x_{<i})$ is parameterized by a neural network, such as a Transformer.



### Variational Autoencoders (VAEs)

Extend classical autoencoders by introducing latent variables $z$ that capture hidden structure in the data $x$. Instead of directly learning a mapping between $x$ and $z$, VAEs adopt a probabilistic view: they learn both an **encoder**, $q_\theta(z|x)$, which approximates the unknown distribution of latent variables given the data, and a **decoder**, $p_\phi(x|z)$, which reconstructs data from these latent variables. To make training feasible, VAEs maximize a tractable surrogate to the true log-likelihood, called the **Evidence Lower Bound (ELBO)**:

$$\mathcal{L}_\text{ELBO}(\theta, \phi;\, x) = \mathbb{E}_{q_\theta(z|x)}\!\left[\log p_\phi(x|z)\right] - D_\text{KL}\!\left(q_\theta(z|x) \,\|\, p_\text{prior}(z)\right).$$

Here, the first term encourages accurate reconstruction of the data, while the second regularizes the latent variables by keeping them close to a simple prior distribution $p_\text{prior}(z)$ (often Gaussian).

### Normalizing Flows

**Normalizing Flows (NFs)** and **Neural Ordinary Differential Equations (NODEs)** aim to learn a bijective mapping $f_\phi$ between a simple latent distribution $z$ and a complex data distribution $x$ via an invertible operator. This is achieved either through a sequence of bijective transformations (in NFs) or by modeling the transformation as an Ordinary Differential Equation (in NODEs). These models leverage the **change-of-variable formula for densities**, enabling MLE training:

$$\log p_\phi(x) = \log p(z) + \log \left|\det \frac{\partial f_\phi^{-1}(x)}{\partial x}\right|.$$

### GANs

Two neural networks, a **generator** $G_\phi$ and a **discriminator** $D_\zeta$, compete against each other. The generator aims to create realistic samples $G_\phi(z)$ from random noise $z \sim p_\text{prior}$, while the discriminator attempts to distinguish between real samples $x$ and generated samples $G_\phi(z)$. The objective function for GANs can be formulated as:

$$\min_{G_\phi} \max_{D_\zeta} \underbrace{\mathbb{E}_{x \sim p_\text{data}(x)}\!\left[\log D_\zeta(x)\right]}_{\text{real}} + \underbrace{\mathbb{E}_{z \sim p_\text{prior}(z)}\!\left[\log(1 - D_\zeta(G_\phi(z)))\right]}_{\text{fake}}.$$


| | **Explicit** | | **Implicit** |
|---|---|---|---|
| | Exact Likelihood | Approx. Likelihood | |
| **Likelihood** | Tractable | Bound/Approx. | Not Directly Modeled / Intractable |
| **Objective** | MLE | ELBO | Adversarial |
| **Examples** | NFs, ARs | VAEs, DMs | GANs |
