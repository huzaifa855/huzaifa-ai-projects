// ==========================================================================
// AETHER AI — 3D Cybernetic Scroll Engine & Interactive Systems
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. 3D Scroll Canvas Image Sequence Engine
  // ==========================================
  const canvas = document.getElementById('canvas3d');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const framePercentEl = document.getElementById('framePercent');
  const frameNumEl = document.getElementById('frameNum');

  const TOTAL_FRAMES = 243;
  const frameImages = [];
  let isFirstFrameLoaded = false;

  let currentFrame = 0;
  let targetFrame = 0;
  let isRendering = false;

  // Helper: Get image path for frame index (1-based)
  const getFramePath = (index) => {
    const padded = String(index).padStart(3, '0');
    return `frames/ezgif-frame-${padded}.png`;
  };

  // Preload frames
  const preloadImages = () => {
    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        if (i === 1 && !isFirstFrameLoaded) {
          isFirstFrameLoaded = true;
          renderCanvas(0);
        }
      };
      frameImages.push(img);
    }
  };

  // Resize canvas with device pixel ratio
  const resizeCanvas = () => {
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    ctx.scale(dpr, dpr);
    renderCanvas(Math.round(currentFrame));
  };

  // Draw frame on canvas (contain/cover positioning)
  const renderCanvas = (frameIndex) => {
    if (!ctx || !canvas || frameImages.length === 0) return;
    
    // Clamp frame index
    const index = Math.max(0, Math.min(TOTAL_FRAMES - 1, Math.round(frameIndex)));
    const img = frameImages[index];

    if (!img || !img.complete || img.naturalWidth === 0) return;

    const canvasWidth = window.innerWidth;
    const canvasHeight = window.innerHeight;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Calculate Aspect Ratio Cover
    const imgWidth = img.naturalWidth;
    const imgHeight = img.naturalHeight;
    const imgRatio = imgWidth / imgHeight;
    const canvasRatio = canvasWidth / canvasHeight;

    let renderWidth, renderHeight, offsetX, offsetY;

    if (canvasRatio > imgRatio) {
      renderWidth = canvasWidth;
      renderHeight = canvasWidth / imgRatio;
      offsetX = 0;
      offsetY = (canvasHeight - renderHeight) / 2;
    } else {
      renderHeight = canvasHeight;
      renderWidth = canvasHeight * imgRatio;
      
      // On desktop, position robot slightly toward the right-center for visual balance
      if (canvasWidth > 900) {
        offsetX = (canvasWidth - renderWidth) * 0.7;
      } else {
        offsetX = (canvasWidth - renderWidth) / 2;
      }
      offsetY = 0;
    }

    ctx.drawImage(img, offsetX, offsetY, renderWidth, renderHeight);

    // Update floating HUD stats
    if (framePercentEl) {
      const pct = Math.round((index / (TOTAL_FRAMES - 1)) * 100);
      framePercentEl.textContent = `${pct}%`;
    }
    if (frameNumEl) {
      frameNumEl.textContent = `${index + 1}`;
    }
  };

  // Smooth Animation Loop using requestAnimationFrame & Lerp
  const animate = () => {
    // Exponential lerping
    const diff = targetFrame - currentFrame;
    if (Math.abs(diff) > 0.005) {
      currentFrame += diff * 0.12;
      renderCanvas(currentFrame);
    }
    requestAnimationFrame(animate);
  };

  // Scroll listener
  const onScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = Math.max(0, Math.min(1, maxScroll > 0 ? scrollTop / maxScroll : 0));
    targetFrame = progress * (TOTAL_FRAMES - 1);
  };

  // Initialize Canvas 3D
  if (canvas && ctx) {
    preloadImages();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('scroll', onScroll, { passive: true });
    resizeCanvas();
    animate();
  }

  // ==========================================
  // 2. Live FLOPs Counter Simulation
  // ==========================================
  const flopCounter = document.getElementById('flopCounter');
  if (flopCounter) {
    setInterval(() => {
      const base = 2.4;
      const variation = (Math.random() * 0.18 - 0.08).toFixed(2);
      const val = (base + parseFloat(variation)).toFixed(2);
      flopCounter.textContent = val;
    }, 1800);
  }

  // ==========================================
  // 3. Modals & Interactive Systems
  // ==========================================
  const builderModal = document.getElementById('systemBuilderModal');
  const featureModal = document.getElementById('featureDetailModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const featureCloseBtn = document.getElementById('featureCloseBtn');
  const featureContent = document.getElementById('featureModalContent');

  const buildSystemBtn = document.getElementById('buildSystemBtn');
  const buildNowBtn = document.getElementById('buildNowBtn');
  const mobileBuildBtn = document.getElementById('mobileBuildBtn');
  const exploreServicesBtn = document.getElementById('exploreServicesBtn');
  const loginBtn = document.getElementById('loginBtn');
  const mobileLoginBtn = document.getElementById('mobileLoginBtn');
  const deploySystemBtn = document.getElementById('deploySystemBtn');

  const openBuilder = (e) => {
    if (e) e.preventDefault();
    builderModal?.classList.add('open');
  };

  const closeBuilder = () => {
    builderModal?.classList.remove('open');
  };

  const closeFeatureModal = () => {
    featureModal?.classList.remove('open');
  };

  if (buildSystemBtn) buildSystemBtn.addEventListener('click', openBuilder);
  if (buildNowBtn) buildNowBtn.addEventListener('click', openBuilder);
  if (mobileBuildBtn) mobileBuildBtn.addEventListener('click', openBuilder);
  if (exploreServicesBtn) {
    exploreServicesBtn.addEventListener('click', () => {
      document.getElementById('solutions')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  if (loginBtn) {
    loginBtn.addEventListener('click', () => {
      alert('AETHER AI Secure Terminal: Single Sign-On Authenticator Initialized.');
    });
  }
  if (mobileLoginBtn) {
    mobileLoginBtn.addEventListener('click', () => {
      alert('AETHER AI Secure Terminal: Single Sign-On Authenticator Initialized.');
    });
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeBuilder);
  if (featureCloseBtn) featureCloseBtn.addEventListener('click', closeFeatureModal);

  window.addEventListener('click', (e) => {
    if (e.target === builderModal) closeBuilder();
    if (e.target === featureModal) closeFeatureModal();
  });

  // Deploy action simulation
  if (deploySystemBtn) {
    deploySystemBtn.addEventListener('click', () => {
      deploySystemBtn.disabled = true;
      deploySystemBtn.textContent = 'ALLOCATING NEURAL NODES...';
      
      setTimeout(() => {
        deploySystemBtn.textContent = 'SYSTEM PROVISIONED — REDIRECTING...';
        setTimeout(() => {
          closeBuilder();
          deploySystemBtn.disabled = false;
          deploySystemBtn.textContent = 'INITIALIZE DEPLOYMENT SEQUENCE';
          alert('Aether AI Cluster successfully provisioned on US-East Neural Matrix!');
        }, 1200);
      }, 1500);
    });
  }

  // ==========================================
  // 4. Feature Cards Interactive Details
  // ==========================================
  const featureData = {
    agents: {
      title: 'Autonomous AI Agents',
      subtitle: 'Multi-agent orchestration & distributed cognition',
      body: 'Our autonomous agents utilize goal-oriented planning loops, dynamic tool selection, and episodic memory caches. They execute long-horizon enterprise operations without requiring human babysitting.',
      specs: ['Sub-second decision latency', 'Self-correcting error trees', 'Sandboxed execution runtime']
    },
    workflows: {
      title: 'AI Workflows & Pipeline Routing',
      subtitle: 'Seamless integration with existing enterprise stacks',
      body: 'Intelligent routing directs high-throughput payloads across APIs, CRMs, databases, and custom neural models with full observability, audit trails, and automatic failovers.',
      specs: ['Universal webhook hooks', 'Visual directed acyclic graph (DAG)', '100% data residency compliance']
    },
    assistant: {
      title: 'Personal Assistant (Neural Core)',
      subtitle: 'Bespoke executive cognitive augmentation',
      body: 'Trained on your communication patterns, private data lake, and calendar cadence to draft strategic communications, triage priority tasks, and deliver actionable briefings in your exact voice.',
      specs: ['Fine-tuned tone adaptation', 'Real-time vector search across past files', 'Zero third-party retention']
    },
    jarvis: {
      title: 'Jarvis Systems (Command Node)',
      subtitle: 'Voice-driven ambient enterprise cockpit',
      body: 'Voice-activated, environment-aware central command structures that interface with hardware, IoT systems, terminal commands, and executive dashboards with zero latency.',
      specs: ['Ultra-low latency speech synthesis', 'Contextual multi-room awareness', 'Hardware peripheral integration']
    },
    social: {
      title: 'Social Auto-Pilot',
      subtitle: 'Generative virality & cross-channel broadcast',
      body: 'Generates branded multi-format content tailored to real-time market trends and automates scheduled distribution across channels.',
      specs: ['Trend momentum forecasting', 'Brand guardrail compliance validator', 'Automated A/B headline optimization']
    }
  };

  const featureCards = document.querySelectorAll('.feature-card');
  featureCards.forEach(card => {
    card.addEventListener('click', () => {
      const type = card.getAttribute('data-feature');
      const data = featureData[type];
      if (data && featureContent) {
        featureContent.innerHTML = `
          <div class="status-badge modal-badge">
            <span class="status-dot"></span>
            <span>SYSTEM SPECIFICATION</span>
          </div>
          <h2 class="modal-title" style="margin-bottom: 0.2rem;">${data.title}</h2>
          <p style="color: var(--accent-cyan); font-size: 0.85rem; font-family: var(--font-display); margin-bottom: 1.2rem;">${data.subtitle}</p>
          <p style="color: var(--text-secondary); font-size: 0.92rem; line-height: 1.6; margin-bottom: 1.5rem;">${data.body}</p>
          
          <h4 style="font-family: var(--font-display); font-size: 0.8rem; letter-spacing: 0.08em; color: var(--text-white); text-transform: uppercase; margin-bottom: 0.8rem;">Technical Specifications:</h4>
          <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1.8rem;">
            ${data.specs.map(s => `
              <li style="display: flex; align-items: center; gap: 0.6rem; color: var(--text-primary); font-size: 0.85rem;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                <span>${s}</span>
              </li>
            `).join('')}
          </ul>
          
          <button class="btn btn-primary w-full" onclick="document.getElementById('featureDetailModal').classList.remove('open'); document.getElementById('systemBuilderModal').classList.add('open');">
            DEPLOY THIS MODULE
          </button>
        `;
        featureModal.classList.add('open');
      }
    });
  });

  // 5. Mobile Menu Toggle
  const mobileToggle = document.getElementById('mobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  if (mobileToggle && mobileDrawer) {
    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.toggle('open');
    });
  }

  // 6. Interactive Tag Pills Highlight
  const tagPills = document.querySelectorAll('.tag-pill');
  tagPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const category = pill.getAttribute('data-category');
      const targetCard = document.querySelector(`.feature-card[data-feature="${category}"]`);
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.style.transform = 'scale(1.05)';
        targetCard.style.borderColor = 'var(--accent-cyan)';
        setTimeout(() => {
          targetCard.style.transform = '';
          if (!targetCard.classList.contains('active-card')) {
            targetCard.style.borderColor = '';
          }
        }, 1200);
      }
    });
  });
});
