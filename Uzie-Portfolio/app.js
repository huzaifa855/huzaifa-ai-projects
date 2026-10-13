/* Interactive Portfolio Logic - Particle Canvas, AI Chatbot, Filterable Skills & Modals */

// --- 1. Dynamic Particle Canvas Background ---
class ParticleNetwork {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.numParticles = 70;
    this.maxDistance = 140;
    this.mouse = { x: null, y: null, radius: 180 };

    this.init();
    this.animate();
    this.addEventListeners();
  }

  init() {
    this.resize();
    this.particles = [];
    for (let i = 0; i < this.numParticles; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1,
        color: i % 2 === 0 ? 'rgba(102, 126, 234, ' : 'rgba(240, 147, 251, '
      });
    }
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  addEventListeners() {
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });
    window.addEventListener('mouseleave', () => {
      this.mouse.x = null;
      this.mouse.y = null;
    });
    window.addEventListener('click', (e) => {
      // Create pulse burst on click
      for (let i = 0; i < 5; i++) {
        this.particles.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 3,
          vy: (Math.random() - 0.5) * 3,
          radius: Math.random() * 2.5 + 1,
          color: 'rgba(0, 242, 254, '
        });
      }
      if (this.particles.length > 100) this.particles.splice(0, 5);
    });
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + '0.6)';
      this.ctx.fill();

      // Connect with mouse if nearby
      if (this.mouse.x !== null) {
        let dx = this.mouse.x - p.x;
        let dy = this.mouse.y - p.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < this.mouse.radius) {
          let alpha = (1 - dist / this.mouse.radius) * 0.4;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(this.mouse.x, this.mouse.y);
          this.ctx.strokeStyle = p.color + alpha + ')';
          this.ctx.lineWidth = 0.8;
          this.ctx.stroke();
        }
      }

      // Connect with neighboring particles
      for (let j = i + 1; j < this.particles.length; j++) {
        let p2 = this.particles[j];
        let dx = p.x - p2.x;
        let dy = p.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < this.maxDistance) {
          let alpha = (1 - dist / this.maxDistance) * 0.15;
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = 'rgba(102, 126, 234, ' + alpha + ')';
          this.ctx.lineWidth = 0.6;
          this.ctx.stroke();
        }
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}

// --- 2. Interactive AI Assistant / Chatbot Logic ---
const aiKnowledgeBase = [
  {
    keywords: ['background', 'who', 'about', 'bio', 'uzie', 'experience'],
    response: "Uzie is a Senior Full-Stack Engineer & AI Architect with over 6 years of experience building high-concurrency web applications, microservices, and multi-agent AI systems. Uzie specializes in modern JS frameworks, Python, PyTorch, and WebGL graphics."
  },
  {
    keywords: ['tech', 'stack', 'skills', 'languages', 'frameworks', 'tools'],
    response: "Uzie's core technical stack includes: Frontend (React, Next.js, TypeScript, Tailwind, WebGL/Three.js), Backend (Node.js, Python, FastAPI, PostgreSQL, Redis, GraphQL), and AI/ML (PyTorch, OpenAI API, LangChain, Vector Databases)."
  },
  {
    keywords: ['project', 'projects', 'work', 'uzie', 'analytics', 'hyperstudio', 'vision'],
    response: "Uzie's top featured projects include: 1) **Uzie AI Analytics Platform** (Predictive AI telemetry), 2) **HyperStudio Developer Workspace** (Browser collaborative IDE), and 3) **Neural Vision Studio** (Real-time in-browser computer vision)."
  },
  {
    keywords: ['contact', 'email', 'reach', 'hire', 'available', 'linkedin', 'github', 'instagram', 'insta'],
    response: "You can reach Uzie directly at **whyuzi9988@gmail.com** or connect via LinkedIn (`linkedin.com/in/huzaifa-khattak-696b21415`), Instagram (`instagram.com/whyuzi9988`), or GitHub (`github.com/uzie`). Uzie is currently open for consulting, full-stack leadership, and AI architecture roles!"
  }
];

function handleChatSubmit(e) {
  e.preventDefault();
  const inputEl = document.getElementById('chat-input');
  const userMsg = inputEl.value.trim();
  if (!userMsg) return;

  appendChatMessage(userMsg, 'user');
  inputEl.value = '';

  showTypingIndicator();

  setTimeout(() => {
    removeTypingIndicator();
    const botReply = generateAIResponse(userMsg);
    appendChatMessage(botReply, 'bot');
  }, 1000 + Math.random() * 800);
}

function sendQuickPrompt(promptText) {
  const inputEl = document.getElementById('chat-input');
  inputEl.value = promptText;
  handleChatSubmit(new Event('submit'));
}

function generateAIResponse(query) {
  const q = query.toLowerCase();
  for (let item of aiKnowledgeBase) {
    if (item.keywords.some(kw => q.includes(kw))) {
      return item.response;
    }
  }
  return `Thanks for your question! Uzie is passionate about building solutions around "${query}". Feel free to check out the Projects section or reach out via the contact form!`;
}

function appendChatMessage(text, sender) {
  const container = document.getElementById('chat-messages');
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${sender}`;

  const avatar = sender === 'user' ? '<i class="fa-solid fa-user"></i>' : '<i class="fa-solid fa-robot"></i>';
  
  msgDiv.innerHTML = `
    <div class="message-avatar">${avatar}</div>
    <div class="message-content">${formatMarkdownText(text)}</div>
  `;

  container.appendChild(msgDiv);
  container.scrollTop = container.scrollHeight;
}

function formatMarkdownText(txt) {
  return txt
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`(.*?)`/g, '<code style="background:rgba(255,255,255,0.1);padding:0.1rem 0.4rem;border-radius:4px;">$1</code>');
}

function showTypingIndicator() {
  const container = document.getElementById('chat-messages');
  const typingDiv = document.createElement('div');
  typingDiv.id = 'typing-indicator-msg';
  typingDiv.className = 'message bot';
  typingDiv.innerHTML = `
    <div class="message-avatar"><i class="fa-solid fa-robot"></i></div>
    <div class="message-content">
      <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    </div>
  `;
  container.appendChild(typingDiv);
  container.scrollTop = container.scrollHeight;
}

function removeTypingIndicator() {
  const indicator = document.getElementById('typing-indicator-msg');
  if (indicator) indicator.remove();
}

// --- 3. Skills Matrix Dynamic Filtering ---
const skillsData = [
  { name: 'TypeScript & JavaScript', level: 95, category: 'frontend', icon: 'fa-brands fa-js' },
  { name: 'React & Next.js', level: 92, category: 'frontend', icon: 'fa-brands fa-react' },
  { name: 'CSS3, Glassmorphism & WebGL', level: 90, category: 'frontend', icon: 'fa-solid fa-palette' },
  { name: 'Node.js & Express', level: 90, category: 'backend', icon: 'fa-brands fa-node-js' },
  { name: 'Python & FastAPI', level: 88, category: 'backend', icon: 'fa-brands fa-python' },
  { name: 'PostgreSQL, Redis & Vector DBs', level: 85, category: 'backend', icon: 'fa-solid fa-database' },
  { name: 'PyTorch & LLM Architectures', level: 84, category: 'ai', icon: 'fa-solid fa-brain' },
  { name: 'Computer Vision & OpenCV', level: 80, category: 'ai', icon: 'fa-solid fa-eye' },
  { name: 'Docker, K8s & AWS Cloud', level: 86, category: 'tools', icon: 'fa-brands fa-docker' },
  { name: 'Git & CI/CD Pipelines', level: 92, category: 'tools', icon: 'fa-brands fa-git-alt' }
];

function renderSkills(category = 'all') {
  const grid = document.getElementById('skills-grid');
  if (!grid) return;
  grid.innerHTML = '';

  const filtered = category === 'all' ? skillsData : skillsData.filter(s => s.category === category);

  filtered.forEach(skill => {
    const card = document.createElement('div');
    card.className = 'skill-card';
    card.innerHTML = `
      <div class="skill-info">
        <div class="skill-name">
          <i class="${skill.icon} gradient-text"></i> ${skill.name}
        </div>
        <span class="skill-percent">${skill.level}%</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill" style="width: 0%" data-target="${skill.level}%"></div>
      </div>
    `;
    grid.appendChild(card);
  });

  // Animate progress bars after insertion
  setTimeout(() => {
    document.querySelectorAll('.progress-bar-fill').forEach(fill => {
      fill.style.width = fill.getAttribute('data-target');
    });
  }, 50);
}

function filterSkills(category, btnEl) {
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderSkills(category);
}

// --- 4. Project Modal Deep-Dive Window ---
const projectDetailsData = {
  analytics: {
    title: 'Uzie AI Analytics Platform',
    category: 'AI & Data Engineering',
    image: 'assets/project_ai_analytics.png',
    tags: ['React', 'Python', 'FastAPI', 'PyTorch', 'WebGL'],
    description: `
      Uzie AI Analytics is a cutting-edge real-time predictive analytics dashboard designed for complex enterprise infrastructure monitoring.
      
      <strong>Key Features:</strong>
      <ul>
        <li>Real-time telemetry streaming over WebSockets.</li>
        <li>Anomaly detection powered by lightweight PyTorch neural models.</li>
        <li>Custom 3D WebGL data visualization matrices rendering 100k+ data points at 60 FPS.</li>
        <li>Automated alert routing and intelligent insight summaries.</li>
      </ul>
    `
  },
  workspace: {
    title: 'HyperStudio Developer Workspace',
    category: 'Full-Stack Web App',
    image: 'assets/project_dev_workspace.png',
    tags: ['Next.js 14', 'TypeScript', 'WebSockets', 'Tailwind'],
    description: `
      HyperStudio is an in-browser collaborative development workspace featuring low-latency code sync and AI agent pairing.

      <strong>Key Features:</strong>
      <ul>
        <li>Operational Transformation (OT) powered multi-user code editing.</li>
        <li>Integrated AI pair-programming assistant for rapid refactoring.</li>
        <li>Instant workspace sandboxing with micro-container backends.</li>
        <li>Glassmorphism customizable developer layout preset engine.</li>
      </ul>
    `
  },
  vision: {
    title: 'Neural Vision Studio',
    category: 'Computer Vision & Web Platform',
    image: 'assets/project_neural_vision.png',
    tags: ['OpenCV', 'TensorFlow.js', 'Docker', 'WebRTC'],
    description: `
      Neural Vision Studio brings edge computer vision capabilities straight into modern browsers without client installation.

      <strong>Key Features:</strong>
      <ul>
        <li>Real-time object detection and body pose estimation directly on GPU.</li>
        <li>Multi-stream video input filtering and custom neural weight uploads.</li>
        <li>Zero-latency WebRTC streaming feed analysis.</li>
        <li>Exportable telemetry logs and event triggers.</li>
      </ul>
    `
  }
};

function openProjectModal(key) {
  const data = projectDetailsData[key];
  if (!data) return;

  const modal = document.getElementById('project-modal');
  const content = document.getElementById('modal-content');

  content.innerHTML = `
    <div style="margin-bottom: 1.5rem;">
      <span class="section-tag" style="margin-bottom: 0.5rem;">${data.category}</span>
      <h2 style="font-size: 1.8rem; font-weight: 800; margin-bottom: 1rem;">${data.title}</h2>
      <img src="${data.image}" alt="${data.title}" style="width: 100%; height: 260px; object-fit: cover; border-radius: 18px; margin-bottom: 1.2rem; border: 1px solid rgba(255,255,255,0.1);">
      <div class="project-tags" style="margin-bottom: 1.2rem;">
        ${data.tags.map(t => `<span class="tag">${t}</span>`).join('')}
      </div>
      <div style="color: var(--text-secondary); line-height: 1.7; font-size: 0.98rem;">
        ${data.description}
      </div>
    </div>
    <div style="display: flex; gap: 1rem; margin-top: 1.8rem;">
      <a href="https://github.com/uzie" target="_blank" class="btn btn-primary" style="flex: 1; justify-content: center;">
        <i class="fa-brands fa-github"></i> Source Code
      </a>
      <button class="btn btn-secondary" onclick="closeProjectModalDirect()">Close</button>
    </div>
  `;

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeProjectModal(e) {
  if (e.target.classList.contains('modal-overlay')) {
    closeProjectModalDirect();
  }
}

function closeProjectModalDirect() {
  const modal = document.getElementById('project-modal');
  modal.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// --- 5. Utilities & UI Interactions ---
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

function copyToClipboard(text, msg = 'Copied to clipboard!') {
  navigator.clipboard.writeText(text).then(() => {
    showToast(msg);
  }).catch(() => {
    showToast('Failed to copy');
  });
}

function showToast(message) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<i class="fa-solid fa-circle-check gradient-text"></i> ${message}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(50px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function handleContactSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('sender-name').value;
  showToast(`Thank you, ${name}! Your message has been sent.`);
  document.getElementById('contact-form').reset();
}

// --- 6. Mobile Navigation & Initializer ---
document.addEventListener('DOMContentLoaded', () => {
  // Initialize Canvas
  new ParticleNetwork('bg-canvas');

  // Initial Skills render
  renderSkills('all');

  // Mobile Toggle
  const toggleBtn = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');
  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener('click', () => {
      navLinks.classList.toggle('mobile-open');
    });
  }

  // Navbar Scroll Spy
  const sections = document.querySelectorAll('section');
  const navItems = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 150;
      if (window.scrollY >= top) {
        current = sec.getAttribute('id');
      }
    });

    navItems.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href') === `#${current}`) {
        item.classList.add('active');
      }
    });
  });
});
