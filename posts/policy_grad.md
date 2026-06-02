# PPO

- Alternates between **interacting with the environment** to sample data, and **optimizing a surrogate objective**.

$$
\text{interact w/ env} \;\longrightarrow\; \text{optimize surrogate objective}
$$
$$
\Big\downarrow
$$
$$
\text{sample data}
$$

- Similar data efficiency & performance as TRPO, but with **first-order optimization**.

---

## Policy Gradient Methods

- Compute an estimator of the **policy gradient**.
- Optimize via **SGD**.
- Common gradient estimator:

$$
\hat{g} = \hat{\mathbb{E}}_t\!\left[\nabla_\theta \log \pi_\theta(a_t \mid s_t)\, \hat{A}_t\right]
$$

where

- $\pi_\theta \to$ stochastic policy
- $\hat{A}_t \to$ estimator of the advantage function at time $t$

---

## Closer look at the gradient estimator

- Consider a **supervised learning** scenario on a fixed dataset.
- Objective function:

$$
J(\theta) = \mathbb{E}_{x \sim \text{Dataset}}\!\left[\,\mathcal{L}\big(f_\theta(x), y\big)\right]
$$

  - This dataset is **static**.
  - The dataset doesn't change when we update network parameters $\theta$.

- So when we take the gradient of the objective function:

$$
\nabla_\theta J(\theta)
= \nabla_\theta \,\mathbb{E}_{x \sim \text{Dataset}}\!\left[\mathcal{L}\big(f_\theta(x), y\big)\right]
= \mathbb{E}_{x \sim \text{Dataset}}\!\left[\nabla_\theta \mathcal{L}\big(f_\theta(x), y\big)\right]
\tag{1}
$$

- In the **RL setting**, the dataset itself moves with $\theta$. So we **cannot** do the above step of taking $\nabla$ inside $\mathbb{E}$.

- Consider the RL objective $\to$ maximize expected reward over a trajectory $\tau$:

$$
J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}\!\left[R(\tau)\right]
\tag{2}
$$

- Here, the $R$ function is computed by the environment — not by our NN.
- Our NN parameters affect the **probability of experiencing certain trajectories** (states & reward).

- Rewriting $(2)$ as a sum:

$$
J(\theta) = \sum_\tau P(\tau \mid \theta)\, R(\tau)
$$

$$
\nabla_\theta J(\theta) = \underbrace{\sum_\tau \nabla_\theta P(\tau \mid \theta) \cdot R(\tau)}_{\text{cannot formulate as expectation}}
\tag{3}
$$

- Usual expectation:

$$
\mathbb{E}_x[f(x)] \;\longleftrightarrow\; \sum_x P(x)\, f(x)
$$

- But here we have:

$$
\sum_x \nabla P(x) \cdot f(x)
$$

---

## Log-derivative trick

$$
\frac{d}{dx}\log x = \frac{1}{x}
$$

$$
\frac{d}{dx}\log P(x) = \frac{1}{P(x)} \cdot \frac{d\,P(x)}{dx}
$$

Similarly,

$$
\frac{d}{d\theta}\log P(\tau \mid \theta) = \frac{1}{P(\tau \mid \theta)} \cdot \frac{d\,P(\tau \mid \theta)}{d\theta}
$$

i.e.

$$
\nabla_\theta \log P(\tau \mid \theta) = \frac{1}{P(\tau \mid \theta)} \cdot \nabla_\theta P(\tau \mid \theta)
$$

Rearranging:

$$
\nabla_\theta P(\tau \mid \theta) = P(\tau \mid \theta)\, \nabla_\theta \log P(\tau \mid \theta)
\tag{4}
$$

---

### Use $(4)$ in $(3)$

$$
\nabla_\theta J(\theta) = \sum_\tau \nabla_\theta P(\tau \mid \theta) \cdot R(\tau)
$$

$$
= \underbrace{\sum_\tau P(\tau \mid \theta) \cdot \nabla_\theta \log P(\tau \mid \theta) \cdot R(\tau)}_{\mathbb{E}_{\tau \sim \pi_\theta}}
$$

$$
\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}\!\left[\nabla_\theta \log P(\tau \mid \theta)\, R(\tau)\right]
\tag{$\ast$}
$$

$$
P(\tau \mid \theta) \;\longrightarrow\; \pi_\theta(a_t \mid s_t)
$$

---

## Environment Cancellation Trick

**① Deconstruct the trajectory**

$\tau$ is $(s_0, a_0, s_1, a_1, \dots, s_T, a_T)$.

- $P(\tau \mid \theta)$ depends on 3 things:
  1. $P(s_0) \to$ prob. of starting at $s_0$
  2. $\pi_\theta(a_t \mid s_t) \to$ prob. of agent choosing $a_t$ in $s_t$
  3. $P(s_{t+1} \mid s_t, a_t) \to$ prob. of state transition from $s_t \to s_{t+1}$ if we do $a_t$

i.e.

$$
P(\tau \mid \theta) = P(s_0) \prod_{t=0}^{T} P(s_{t+1} \mid s_t, a_t)\, \pi_\theta(a_t \mid s_t)
$$

**② Apply log**

$$
\log P(\tau \mid \theta) = \log P(s_0) + \sum_{t=0}^{T}\Big[\log P(s_{t+1} \mid s_t, a_t) + \log \pi_\theta(a_t \mid s_t)\Big]
\tag{1}
$$

**③ Take gradient w.r.t. $\theta$**

$$
\nabla_\theta \log P(s_0) = 0 \qquad \text{initial state determined by env, not NN}
$$

$$
\nabla_\theta \log P(s_{t+1} \mid s_t, a_t) = 0 \qquad \text{state transitions are determined by env. dynamics, not NN}
$$

$$
\nabla_\theta \log \pi_\theta(a_t \mid s_t) \neq 0 \qquad \text{this is our policy network}
$$

Therefore $(1) \Rightarrow$

$$
\nabla_\theta \log P(\tau \mid \theta) = \sum_{t=0}^{T} \nabla_\theta \log \pi_\theta(a_t \mid s_t)
\tag{2}
$$

$(\ast), (2) \Rightarrow$

$$
\nabla_\theta J(\theta) = \mathbb{E}_{\tau \sim \pi_\theta}\!\left[\left(\sum_{t=0}^{T} \nabla_\theta \log \pi_\theta(a_t \mid s_t)\right) \cdot R(\tau)\right]
$$

$$
\Rightarrow \textbf{Model-free RL is possible!!!}
$$

i.e. we can update weights of our model **without knowing env dynamics!**

$$
\nabla_\theta J(\theta) = \sum_{t=0}^{T}\left[\mathbb{E}_{\tau \sim \pi_\theta}\!\left[\nabla_\theta \log \pi_\theta(a_t \mid s_t)\, R(\tau)\right]\right]
\tag{3}
$$

---

## Causality of Reward

- Action at time $t$ cannot affect reward at $t-1, t-2, \dots$

$$
R(\tau) = \sum_{t'=0}^{T} r_{t'}
= \underbrace{\sum_{t'=0}^{t-1} r_{t'}}_{\substack{\text{at time }=t \\ \text{this is constant}}}
+ \underbrace{\sum_{t'=t}^{T} r_{t'}}_{\text{this is variable}}
\tag{4}
$$

**Proof of ⑤** — the key lemma:

$$
\mathbb{E}_{x \sim P_\theta}\!\left[\nabla_\theta \log P_\theta(x)\right]
= \sum_x P_\theta(x) \cdot \nabla_\theta \log P_\theta(x)
$$

$$
= \sum_x P_\theta(x) \cdot \frac{1}{P_\theta(x)} \cdot \nabla_\theta P_\theta(x)
$$

$$
= \sum_x \nabla_\theta P_\theta(x)
$$

$$
= \nabla_\theta \sum_x P_\theta(x)
$$

$$
= \nabla_\theta (1) = 0
\tag{5}
$$

---

### Using $(4)$ in $(3)$

Consider

$$
\mathbb{E}_{\tau \sim \pi_\theta}\!\left[\nabla_\theta \log \pi_\theta(a_t \mid s_t)\, R(\tau)\right]
$$

$$
= \underbrace{\mathbb{E}_{\tau \sim \pi_\theta}\!\left[\nabla_\theta \log \pi_\theta(a_t \mid s_t) \sum_{t'=0}^{t-1} r_{t'}\right]}_{\text{(past rewards)}}
+ \mathbb{E}_{\tau \sim \pi_\theta}\!\left[\nabla_\theta \log \pi_\theta(a_t \mid s_t) \sum_{t'=t}^{T} r_{t'}\right]
$$

The first term factors as (past rewards are constant w.r.t. the action at $t$):

$$
\left(\sum_{t'=0}^{t-1} r_{t'}\right) \cdot \underbrace{\mathbb{E}_{\tau \sim \pi_\theta}\!\left[\nabla_\theta \log \pi_\theta(a_t \mid s_t)\right]}_{= \,0 \text{ by } (5)}
$$

Therefore

$$
\nabla_\theta J(\theta) = \sum_{t=0}^{T}\left[\mathbb{E}_{\tau \sim \pi_\theta}\!\left(\nabla_\theta \log \pi_\theta(a_t \mid s_t) \sum_{t'=t}^{T} r_{t'}\right)\right]
$$

- But $\displaystyle\sum_{t'=t}^{T} r_{t'}$ has **high variance**.

---

## Advantage estimator

So we use the **advantage estimator**:

$$
A_t(a_t \mid s_t) = \sum_{t'=t}^{T} \gamma^{t'} r_{t'} - V_t(s_t)
$$

Therefore

$$
\nabla_\theta J(\theta) = \sum_{t=0}^{T}\left[\mathbb{E}_{\tau \sim \pi_\theta}\, \nabla_\theta \log \pi_\theta(a_t \mid s_t)\, A_t\right]
$$

This **doesn't depend on $\tau$ anymore** — only on $a_t$ & $s_t$. Therefore

$$
\nabla_\theta J(\theta) = \sum_{t=0}^{T}\left[\mathbb{E}_{s_t, a_t \sim \pi_\theta}\!\left(\log \pi_\theta(a_t \mid s_t)\, A_t\right)\right]
$$

In practice, we let the agent generate $N$ samples & average over all time steps in that sampling. Therefore

$$
\nabla_\theta J(\theta) \propto \hat{\mathbb{E}}_t\!\left[\log \pi_\theta(a_t \mid s_t)\, A_t\right]
$$

— shifting from theoretical trajectories to a **practical batch of data**.