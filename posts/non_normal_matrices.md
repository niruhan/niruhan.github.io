# Non-Normal Matrices

## Definition

A **non-normal matrix** is a matrix that does not commute with its conjugate transpose.

A matrix \(A\) is **normal** if

$$
AA^* = A^*A
$$

where \(A^*\) is the conjugate transpose of \(A\).

For real matrices,

$$
A^* = A^T.
$$

Therefore, \(A\) is **non-normal** if

$$
AA^* \neq A^*A.
$$

## Properties of Normal Matrices

Normal matrices have several useful properties:

- Their eigenvectors form an orthonormal basis.
- They can be diagonalized by a unitary matrix:

$$
A = U \Lambda U^*
$$

- Their behavior is completely characterized by their eigenvalues.

### Examples of Normal Matrices

1. Symmetric matrices

$$
A = A^T
$$

2. Hermitian matrices

$$
A = A^*
$$

3. Orthogonal matrices

$$
A^T A = I
$$

4. Unitary matrices

$$
A^* A = I
$$

---

## Why Non-Normal Matrices Matter

Non-normal matrices can exhibit behavior that eigenvalues alone fail to predict.

Consider

$$
A =
\begin{bmatrix}
-1 & 100\\
0 & -1
\end{bmatrix}.
$$

The eigenvalues are

$$
\lambda_1 = \lambda_2 = -1,
$$

which suggests stability.

However,

$$
e^{At}
=
I + At + \frac{(At)^2}{2!} + \frac{(At)^3}{3!} + \cdots
$$

and

$$
A = -I +
\begin{bmatrix}
0 & 100\\
0 & 0
\end{bmatrix}.
$$

Define

$$
N =
\begin{bmatrix}
0 & 100\\
0 & 0
\end{bmatrix}.
$$

Then

$$
A = -I + N.
$$

Since \(N\) is nilpotent,

$$
N^2 = 0.
$$

Therefore,

$$
e^{Nt} = I + Nt
=
\begin{bmatrix}
1 & 100t\\
0 & 1
\end{bmatrix}.
$$

Thus

$$
e^{At}
=
e^{-t} e^{Nt}
=
e^{-t}
\begin{bmatrix}
1 & 100t\\
0 & 1
\end{bmatrix}.
$$

The norm behaves approximately as

$$
\|e^{At}\|
\approx
100 t e^{-t}.
$$

This produces **transient amplification** even though all eigenvalues indicate decay.

### Applications

This phenomenon appears in:

- Fluid dynamics
- Control theory
- Numerical linear algebra
- Deep learning optimization
- Graph signal processing

---

## Geometric Intuition

A normal matrix acts independently along orthogonal eigenvector directions.

A non-normal matrix:

- Has non-orthogonal eigenvectors.
- May not even be diagonalizable.
- Causes interactions between different directions.
- Can temporarily amplify energy even when all eigenvalues indicate decay.
- Can be highly sensitive to perturbations.

---

## Singular Values vs Eigenvalues

For a normal matrix,

$$
\sigma_i(A) = |\lambda_i(A)|.
$$

This relationship does **not** hold for non-normal matrices.

### Eigenvalues

Eigenvalues satisfy

$$
Av = \lambda v.
$$

They describe:

- Action on eigenvectors.
- Asymptotic growth or decay.
- Oscillation frequencies.
- Long-term dynamics.

### Singular Values

The largest singular value is

$$
\sigma_{\max}(A)
=
\max_{\|x\|=1}
\|Ax\|.
$$

Singular values describe:

- Maximum stretching of vectors.
- Signal amplification.
- Conditioning.
- Transient growth.

---

## Fundamental Inequality

For every matrix \(A\),

$$
\max_i |\lambda_i|
\le
\sigma_{\max}(A).
$$

Equality holds for normal matrices.

For non-normal matrices, the inequality is often strict.

---

## Singular Value Decomposition

If

$$
A = U \Sigma V^*,
$$

then the singular values are the diagonal entries of \(\Sigma\).

For any matrix,

$$
\|A\|_2
=
\sigma_{\max}(A).
$$

For an invertible matrix,

$$
\|A^{-1}\|_2
=
\frac{1}{\sigma_{\min}(A)}.
$$

These relationships hold regardless of whether the matrix is normal or non-normal.
