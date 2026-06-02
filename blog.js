// Blog database - edit this array to manage posts
const posts = [
    {
      id: "claude",
      title: "My CLAUDE.md file optimized to learn as a PhD student",
      date: "Jun 2, 2026",
      category: "AI Tools",
      summary: "",
      file: "posts/CLAUDE.md"
    },
    {
    id: "diffusion",
    title: "My Notes from Principles of Diffusion Models Chieh-Hsin Lai et. al.",
    date: "May 27, 2026",
    category: "Machine Learning",
    summary: "",
    file: "posts/diffusion.md"
  },
  {
    id: "dream-gaussian",
    title: "DreamGaussian: Generative Gaussian Splatting for Efficient 3D Content Creation",
    date: "May 23, 2026",
    category: "Computer Vision",
    summary: "3D Gaussian Diffusion using SDS",
    type: "pdf",
    file: "posts/dream_gaussian.pdf"
  },
  {
    id: "vit",
    title: "Vision Transformer",
    date: "May 23, 2026",
    category: "Computer Vision",
    summary: "",
    type: "pdf",
    file: "posts/vit.pdf"
  },
  {
    id: "dit",
    title: "Diffusion Transformer",
    date: "March 26, 2026",
    category: "Computer Vision",
    summary: "",
    type: "pdf",
    file: "posts/dit.pdf"
  },
  {
    id: "3d-2d",
    title: "3D to 2D Splatting Math",
    date: "May 23, 2026",
    category: "Computer Vision",
    summary: "",
    type: "pdf",
    file: "posts/3D_2D.pdf"
  },
  {
    id: "simclr-moco",
    title: "SimCLR and MoCo",
    date: "April 5, 2026",
    category: "Computer Vision",
    summary: "",
    type: "pdf",
    file: "posts/simclr_moco.pdf"
  },
  {
    id: "dinov3-losses",
    title: "DiNOv3 Losses",
    date: "April 12, 2026",
    category: "Computer Vision",
    summary: "",
    type: "pdf",
    file: "posts/dinov3_losses.pdf"
  },
  {
    id: "cir",
    title: "CIR: Composed Image Retrieval",
    date: "April 9, 2026",
    category: "Computer Vision",
    summary: "Mathematical introduction to the CIR problem",
    type: "pdf",
    file: "posts/cir.pdf"
  },
  {
    id: "policy-grad",
    title: "RL: Policy Gradient Estimation",
    date: "May 23, 2026",
    category: "Reinforcement Learning",
    summary: "",
    type: "pdf",
    file: "posts/policy_grad.pdf"
  },
  {
    id: "vggt",
    title: "VGGT: Visual Geometry Grounded Transformer",
    date: "May 23, 2026",
    category: "Machine Learning",
    summary: "An overview of representation learning on graphs, spatial graph convolutions, and node feature normalization techniques.",
    file: "posts/vggt.md"
  },
  // {
  //   id: "graph-neural-networks",
  //   title: "Introduction to Graph Neural Networks (GNNs)",
  //   date: "May 20, 2026",
  //   category: "Machine Learning",
  //   summary: "An overview of representation learning on graphs, spatial graph convolutions, and node feature normalization techniques.",
  //   file: "posts/graph-neural-networks.md"
  // }
];

// App initialization
document.addEventListener("DOMContentLoaded", () => {
  // Setup Mermaid config if loaded
  if (window.mermaid) {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'neutral',
      securityLevel: 'loose'
    });
  }

  // Handle initial route
  handleRoute();

  // Listen for back/forward navigation
  window.addEventListener("popstate", handleRoute);
});

// Routing logic
function handleRoute() {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("post");

  if (postId) {
    const post = posts.find(p => p.id === postId);
    if (post) {
      loadPost(post);
    } else {
      showIndex();
    }
  } else {
    showIndex();
  }
}

// Navigate to a specific post or back to index
function navigateTo(postId) {
  if (postId) {
    window.history.pushState({}, "", `blog.html?post=${postId}`);
  } else {
    window.history.pushState({}, "", "blog.html");
  }
  handleRoute();
}

// Display the main index of posts
function showIndex() {
  const listView = document.getElementById("list-view");
  const postView = document.getElementById("post-view");
  const postsContainer = document.getElementById("posts-container");

  if (!listView || !postView || !postsContainer) return;

  // Toggle views
  listView.style.display = "block";
  postView.style.display = "none";

  // Render list of posts
  postsContainer.innerHTML = "";

  posts.forEach(post => {
    const postElement = document.createElement("article");
    postElement.className = "post-summary-card";
    const isPdf = post.type === "pdf";
    const postHref = isPdf ? post.file : `blog.html?post=${post.id}`;
    const linkAttrs = isPdf
      ? `href="${postHref}" target="_blank" rel="noopener"`
      : `href="${postHref}" onclick="event.preventDefault(); navigateTo('${post.id}')"`;
    const actionText = isPdf ? "Open PDF &rarr;" : "Read notes &rarr;";

    postElement.innerHTML = `
      <div class="post-meta">
        <span class="post-date">${post.date}</span>
        <span class="post-category">${post.category}</span>
      </div>
      <h2 class="post-title">
        <a ${linkAttrs}>${post.title}</a>
      </h2>
      <p class="post-summary">${post.summary}</p>
      <a ${linkAttrs} class="read-more-link">${actionText}</a>
    `;

    postsContainer.appendChild(postElement);
  });
}

// Load and render a specific post from its Markdown file or PDF
function loadPost(post) {
  const listView = document.getElementById("list-view");
  const postView = document.getElementById("post-view");
  const postTitle = document.getElementById("post-title");
  const postDate = document.getElementById("post-date");
  const postCategory = document.getElementById("post-category");
  const postBody = document.getElementById("post-body");

  if (!listView || !postView || !postBody) return;

  // Toggle views
  listView.style.display = "none";
  postView.style.display = "block";

  // Scroll to top
  window.scrollTo(0, 0);

  postTitle.textContent = post.title;
  postDate.textContent = post.date;
  postCategory.textContent = post.category;

  // PDF post: open the file directly so the browser uses its native PDF viewer.
  if (post.type === "pdf") {
    window.open(post.file, "_blank", "noopener");
    navigateTo(null);
    return;
  }

  // Markdown post: fetch and render
  postBody.innerHTML = `<div class="loading">Loading notes...</div>`;

  fetch(post.file)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to load post content: ${response.statusText}`);
      }
      return response.text();
    })
    .then(markdown => {
      renderMarkdownContent(markdown, postBody);
    })
    .catch(error => {
      console.error(error);
      postBody.innerHTML = `
        <div class="error-msg">
          <p>Failed to load notes. Please ensure the post exists in the repository.</p>
          <a href="blog.html" onclick="event.preventDefault(); navigateTo(null)" class="back-home-btn">&larr; Back to all notes</a>
        </div>
      `;
    });
}

// Compile Markdown, extract LaTeX, build diagrams
function renderMarkdownContent(markdownText, containerEl) {
  const mathBlocks = [];
  const mathInlines = [];

  // 1. Replaces block math $$ ... $$
  let processed = markdownText.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
    const id = mathBlocks.length;
    mathBlocks.push(formula.trim());
    return `%%BLOCK_MATH_${id}%%`;
  });

  // 2. Replaces inline math $ ... $ (ensures it doesn't span multiple paragraphs)
  processed = processed.replace(/\$([^$\n]+?)\$/g, (match, formula) => {
    const id = mathInlines.length;
    mathInlines.push(formula.trim());
    return `%%INLINE_MATH_${id}%%`;
  });

  // 3. Compile Markdown using marked.js
  let html = "";
  if (window.marked) {
    html = marked.parse(processed);
  } else {
    // Fallback if marked failed to load
    html = processed.replace(/\n/g, "<br>");
  }

  // 4. Inject math placeholders back into the compiled HTML
  html = html.replace(/%%BLOCK_MATH_(\d+)%%/g, (match, idStr) => {
    const id = parseInt(idStr, 10);
    const formula = mathBlocks[id];
    return `<div class="math-block" data-math="${encodeURIComponent(formula)}"></div>`;
  });

  html = html.replace(/%%INLINE_MATH_(\d+)%%/g, (match, idStr) => {
    const id = parseInt(idStr, 10);
    const formula = mathInlines[id];
    return `<span class="math-inline" data-math="${encodeURIComponent(formula)}"></span>`;
  });

  // Set the HTML content
  containerEl.innerHTML = html;

  // 5. Render LaTeX Equations using KaTeX
  if (window.katex) {
    containerEl.querySelectorAll('.math-block').forEach(el => {
      const formula = decodeURIComponent(el.getAttribute('data-math'));
      katex.render(formula, el, { displayMode: true, throwOnError: false });
    });

    containerEl.querySelectorAll('.math-inline').forEach(el => {
      const formula = decodeURIComponent(el.getAttribute('data-math'));
      katex.render(formula, el, { displayMode: false, throwOnError: false });
    });
  }

  // 6. Convert code blocks with class "language-mermaid" into Mermaid containers
  containerEl.querySelectorAll('pre code.language-mermaid').forEach((codeEl, idx) => {
    const preEl = codeEl.parentElement;
    const diagramText = codeEl.textContent.trim();

    const div = document.createElement('div');
    div.className = 'mermaid';
    div.id = `mermaid-diagram-${idx}`;
    div.textContent = diagramText;

    preEl.replaceWith(div);
  });

  // Render Mermaid diagrams
  if (window.mermaid) {
    try {
      mermaid.init(undefined, '.mermaid');
    } catch (e) {
      console.error("Failed to render Mermaid diagram:", e);
    }
  }
}
