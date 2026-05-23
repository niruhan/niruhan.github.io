# Introduction to Graph Neural Networks (GNNs)

Graph Neural Networks (GNNs) have emerged as a powerful framework for representation learning on graphs. Unlike traditional neural networks designed for grid-like structures (such as images) or sequential structures (such as text), GNNs operate directly on graph structured data $G = (V, E)$, where $V$ is the set of vertices (nodes) and $E$ is the set of edges.

## Graph Representation

A graph can be represented by its adjacency matrix $A \in \mathbb{R}^{N \times N}$ and node feature matrix $X \in \mathbb{R}^{N \times F}$, where:
- $N = |V|$ is the number of nodes.
- $F$ is the dimensionality of node features.

## Spatial Graph Convolutions

The core operation of GNNs is **message passing**, where nodes iteratively update their representations by aggregating features from their neighbors. 

In a Graph Convolutional Network (GCN), the layer-wise propagation rule is formulated as:

$$H^{(l+1)} = \sigma \left( \tilde{D}^{-1/2} \tilde{A} \tilde{D}^{-1/2} H^{(l)} W^{(l)} \right)$$

Where:
1. $\tilde{A} = A + I_N$ is the adjacency matrix of the graph with added self-loops.
2. $I_N$ is the identity matrix.
3. $\tilde{D}$ is the diagonal degree matrix of $\tilde{A}$, where $\tilde{D}_{ii} = \sum_j \tilde{A}_{ij}$.
4. $H^{(l)}$ is the activation matrix in the $l$-th layer, with $H^{(0)} = X$.
5. $W^{(l)}$ is a layer-specific trainable weight matrix.
6. $\sigma(\cdot)$ denotes an activation function, such as $\text{ReLU}(\cdot)$.

## Intuition

Why do we normalize the adjacency matrix using $\tilde{D}^{-1/2} \tilde{A} \tilde{D}^{-1/2}$? 

If we simply use the unnormalized adjacency matrix $A$, the node representation $H^{(l+1)}$ would scale with the degree of the node. Normalizing with the degree matrix scales the features so that nodes with very high degrees do not dominate the aggregate representations:

$$h_i^{(l+1)} = \sigma \left( \sum_{j \in \mathcal{N}(i) \cup \{i\}} \frac{1}{\sqrt{d_i d_j}} h_j^{(l)} W^{(l)} \right)$$

This symmetric normalization ensures stable gradient propagation and prevents feature magnitudes from exploding during deep message passing steps.
