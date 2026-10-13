// Huzaifa AI Command Center Frontend Controller

let currentRunId = null;
let currentPlanData = null;
let currentPlatform = 'instagram';

// DOM Elements
const messageEl = document.querySelector('#message');
const executeBtn = document.querySelector('#execute');
const outputEl = document.querySelector('#output');
const statusEl = document.querySelector('#status');
const approvalBanner = document.querySelector('#approval-banner');
const approveBtn = document.querySelector('#btn-approve');
const viewDraftsBtn = document.querySelector('#btn-view-drafts');
const previewSection = document.querySelector('#content-preview-section');
const platformCardContainer = document.querySelector('#platform-card-container');
const contentCounter = document.querySelector('#content-counter');
const approvalCounter = document.querySelector('#approval-counter');
const navButtons = document.querySelectorAll('.nav-btn');
const tabViews = document.querySelectorAll('.tab-view');
const platTabs = document.querySelectorAll('.plat-tab');
const chipButtons = document.querySelectorAll('.chip');
const auditTableBody = document.querySelector('#audit-table-body');
const refreshAuditBtn = document.querySelector('#refresh-audit');
const platformsGrid = document.querySelector('#platforms-grid');
const studioContainer = document.querySelector('#studio-full-container');
const studioStatus = document.querySelector('#studio-status');

// 1. Tab Switching
navButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetTab = btn.dataset.tab;
    navButtons.forEach((b) => b.classList.remove('active'));
    tabViews.forEach((v) => v.classList.remove('active'));

    btn.classList.add('active');
    const targetView = document.querySelector(`#view-${targetTab}`);
    if (targetView) targetView.classList.add('active');

    // Load data for specific tabs
    if (targetTab === 'activity') loadAuditLogs();
    if (targetTab === 'platforms') loadPlatforms();
    if (targetTab === 'content') renderDedicatedStudio();
    if (targetTab === 'approvals') renderApprovalsView();
  });
});

// 2. Quick Prompts
chipButtons.forEach((chip) => {
  chip.addEventListener('click', () => {
    messageEl.value = chip.dataset.prompt;
    messageEl.focus();
  });
});

// 3. Platform Preview Switching
platTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    platTabs.forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    currentPlatform = tab.dataset.platform;
    renderPlatformCard(currentPlatform);
  });
});

// 4. Render Plan Steps
function renderPlan(data) {
  outputEl.classList.remove('empty');
  outputEl.innerHTML = data.plan.steps
    .map((step) => {
      const isApproval = step.requires_approval;
      const statusClass = step.status === 'completed' ? 'completed' : isApproval ? 'waiting_approval' : '';
      const statusText = step.status === 'completed' ? '✓ COMPLETED' : isApproval ? '⚠️ APPROVAL REQUIRED' : step.permission;

      return `
      <div class="plan-step">
        <div>
          <strong>${step.id.replaceAll('_', ' ').toUpperCase()}</strong>
          <small>${step.description}</small>
        </div>
        <div class="step-tags">
          <span class="badge ${statusClass}">${statusText}</span>
        </div>
      </div>`;
    })
    .join('');

  statusEl.textContent = `${data.status.replaceAll('_', ' ').toUpperCase()} / RUN: ${data.run_id.slice(0, 8)}`;

  // Show / update approval banner
  if (data.status === 'approval_required') {
    approvalBanner.classList.remove('hidden');
    approvalCounter.textContent = '1';
  } else {
    approvalBanner.classList.add('hidden');
    approvalCounter.textContent = '0';
  }

  // Handle Generated Content
  if (data.generated_content && Object.keys(data.generated_content).length > 0) {
    const count = Object.keys(data.generated_content).length;
    contentCounter.textContent = count;
    previewSection.classList.remove('hidden');

    // Auto select the first available platform
    const available = Object.keys(data.generated_content);
    if (available.includes('instagram')) currentPlatform = 'instagram';
    else currentPlatform = available[0];

    // Highlight proper tab
    platTabs.forEach((t) => {
      t.classList.toggle('active', t.dataset.platform === currentPlatform);
    });

    renderPlatformCard(currentPlatform);
  }
}

// 5. Render Platform Cards (Instagram / TikTok / Facebook)
function renderPlatformCard(platformKey) {
  if (!currentPlanData || !currentPlanData.generated_content) return;
  const content = currentPlanData.generated_content[platformKey];
  if (!content) {
    platformCardContainer.innerHTML = `
      <div class="social-card">
        <div class="social-card-body" style="text-align: center; color: var(--muted); padding: 30px;">
          No draft generated for <b>${platformKey.toUpperCase()}</b> in this run. Click a quick prompt mentioning ${platformKey.toUpperCase()}.
        </div>
      </div>`;
    return;
  }

  let bodyHtml = '';

  if (platformKey === 'instagram') {
    const slidesHtml = content.slides
      ? content.slides
          .map(
            (s) => `
        <div class="slide-item">
          <span class="slide-number">SLIDE ${s.slide}</span>
          <h4>${s.title}</h4>
          <p>${s.body}</p>
        </div>`
          )
          .join('')
      : '';

    bodyHtml = `
      <div class="hook-box">
        <strong>OPENING VISUAL HOOK</strong>
        <div class="hook-text">"${content.hook}"</div>
      </div>

      <div>
        <strong style="font: 600 11px 'DM Mono', monospace; color: var(--muted); display:block; margin-bottom:8px;">5-SLIDE CAROUSEL BLUEPRINT</strong>
        <div class="slides-list">${slidesHtml}</div>
      </div>

      <div>
        <strong style="font: 600 11px 'DM Mono', monospace; color: var(--muted); display:block; margin-bottom:8px;">CAPTION & CALL-TO-ACTION</strong>
        <div class="caption-box">${content.caption}</div>
      </div>

      <div class="visual-prompt-box">
        <strong>MIDJOURNEY / FLUX PROMPT</strong>
        <code>${content.visual_prompt}</code>
      </div>

      <div>
        <strong style="font: 600 11px 'DM Mono', monospace; color: var(--muted); display:block; margin-bottom:8px;">TARGET HASHTAGS</strong>
        <div class="hashtags-box">
          ${content.hashtags.map((h) => `<span class="hash-pill">${h}</span>`).join('')}
        </div>
      </div>
    `;
  } else if (platformKey === 'tiktok') {
    const scriptHtml = content.script
      ? content.script
          .map(
            (item) => `
        <div class="timeline-item">
          <div class="timeline-time">${item.time}</div>
          <div class="timeline-cue">
            <strong>Audio:</strong> "${item.audio}"
            <small>Visual Action: ${item.visual}</small>
          </div>
        </div>`
          )
          .join('')
      : '';

    bodyHtml = `
      <div class="hook-box">
        <strong>0-3s STOP-SCROLL HOOK</strong>
        <div class="hook-text">"${content.hook}"</div>
      </div>

      <div>
        <strong style="font: 600 11px 'DM Mono', monospace; color: var(--muted); display:block; margin-bottom:8px;">ON-SCREEN TEXT OVERLAYS</strong>
        <div style="display:flex; flex-wrap:wrap; gap:8px;">
          ${(content.on_screen_text || []).map((t) => `<span class="badge" style="background:#111;color:#00f2fe;font-size:11px;">${t}</span>`).join('')}
        </div>
      </div>

      <div>
        <strong style="font: 600 11px 'DM Mono', monospace; color: var(--muted); display:block; margin-bottom:8px;">TIMESTAMPTED VIDEO SCRIPT (${content.duration || '35s'})</strong>
        <div class="script-timeline">${scriptHtml}</div>
      </div>

      <div class="visual-prompt-box" style="background:#f0fdff;border-color:#a5f3fc;">
        <strong style="color:#0891b2;">TRENDING AUDIO VIBE</strong>
        <div>${content.sound_suggestion || 'Trending tech synthwave'}</div>
      </div>

      <div>
        <strong style="font: 600 11px 'DM Mono', monospace; color: var(--muted); display:block; margin-bottom:8px;">VIRAL HASHTAGS</strong>
        <div class="hashtags-box">
          ${content.hashtags.map((h) => `<span class="hash-pill">${h}</span>`).join('')}
        </div>
      </div>
    `;
  } else if (platformKey === 'facebook') {
    bodyHtml = `
      <div class="hook-box">
        <strong>COMMUNITY ENGAGEMENT HOOK</strong>
        <div class="hook-text">"${content.hook}"</div>
      </div>

      <div>
        <strong style="font: 600 11px 'DM Mono', monospace; color: var(--muted); display:block; margin-bottom:8px;">LONG-FORM STORYTELLING POST</strong>
        <div class="caption-box">${content.body || content.caption}</div>
      </div>

      <div class="hook-box" style="background:#eff6ff;border-left-color:#3b82f6;">
        <strong style="color:#1d4ed8;">COMMUNITY DISCUSSION QUESTION</strong>
        <div style="font-weight:600;font-size:13.5px;color:#1e3a8a;">${content.discussion_question || content.cta}</div>
      </div>

      <div>
        <strong style="font: 600 11px 'DM Mono', monospace; color: var(--muted); display:block; margin-bottom:8px;">TOPIC TAGS</strong>
        <div class="hashtags-box">
          ${content.hashtags.map((h) => `<span class="hash-pill">${h}</span>`).join('')}
        </div>
      </div>
    `;
  }

  platformCardContainer.innerHTML = `
    <div class="social-card">
      <div class="social-card-header">
        <div class="card-title-group">
          <span class="card-platform-badge badge-${platformKey}">${platformKey.toUpperCase()}</span>
          <strong>${content.title || `${platformKey.toUpperCase()} Content Asset`}</strong>
        </div>
        <span class="badge completed">${content.safety_status || 'Passed Quality Review'}</span>
      </div>
      <div class="social-card-body">
        ${bodyHtml}
      </div>
    </div>
  `;
}

// 6. Execute Command Handler
executeBtn.addEventListener('click', async () => {
  const text = messageEl.value.trim();
  if (!text) return;

  executeBtn.disabled = true;
  executeBtn.innerHTML = '<span>Planning & drafting...</span> ⏳';
  statusEl.textContent = 'Orchestrating agent workflow...';

  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, approval_mode: true }),
    });

    if (!response.ok) throw new Error('The agent failed to process the command.');
    const data = await response.json();
    currentRunId = data.run_id;
    currentPlanData = data;
    renderPlan(data);
  } catch (error) {
    outputEl.className = 'output';
    outputEl.textContent = error.message;
    statusEl.textContent = 'Execution failed';
  } finally {
    executeBtn.disabled = false;
    executeBtn.innerHTML = '<span>Create plan & draft</span> <b>↗</b>';
  }
});

// 7. Approve & Publish Handler
approveBtn.addEventListener('click', async () => {
  if (!currentRunId) return;

  approveBtn.disabled = true;
  approveBtn.textContent = 'Executing sandbox publishing...';

  try {
    const response = await fetch('/api/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        run_id: currentRunId,
        action: 'publish_content',
        platforms: ['instagram', 'tiktok', 'facebook'],
        approved: true,
        sandbox_mode: true,
      }),
    });

    if (!response.ok) throw new Error('Approval execution failed.');
    const res = await response.json();

    // Update Banner
    approvalBanner.innerHTML = `
      <div class="rule-item allowed" style="font-size: 13.5px; padding: 16px;">
        <div style="font-weight: 800; margin-bottom: 6px; font-size: 15px;">
          🎉 EXECUTION COMPLETED: Human Approval Granted & Sandbox Published!
        </div>
        <p style="margin:0 0 10px; color:#065f46;">
          ${res.message} The command center safely simulated delivery across Instagram, TikTok, and Facebook.
        </p>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          ${Object.entries(res.results)
            .map(([plat, info]) => `<span class="badge completed">✓ ${plat.toUpperCase()}: ${info.mode}</span>`)
            .join('')}
        </div>
      </div>
    `;

    // Mark steps completed in plan view
    if (currentPlanData && currentPlanData.plan) {
      currentPlanData.plan.steps.forEach((s) => {
        if (s.action === 'publish_content') s.status = 'completed';
      });
      renderPlan(currentPlanData);
      approvalBanner.classList.remove('hidden'); // Keep success message visible
    }

    approvalCounter.textContent = '0';
    statusEl.textContent = 'COMPLETED / ALL ACTIONS VERIFIED';
  } catch (err) {
    alert(err.message);
  } finally {
    approveBtn.disabled = false;
  }
});

viewDraftsBtn.addEventListener('click', () => {
  previewSection.scrollIntoView({ behavior: 'smooth' });
});

// 8. Load Audit Logs
async function loadAuditLogs() {
  try {
    const res = await fetch('/api/audit');
    if (!res.ok) return;
    const logs = await res.json();
    if (!logs || logs.length === 0) {
      auditTableBody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted)">No audit entries recorded yet.</td></tr>';
      return;
    }
    auditTableBody.innerHTML = logs
      .map(
        (log) => `
      <tr>
        <td style="color:var(--muted)">${new Date(log.timestamp).toLocaleTimeString()}</td>
        <td><strong>${log.agent}</strong></td>
        <td><span class="badge">${log.action}</span></td>
        <td style="color:#2563eb">${log.tool}</td>
        <td><span class="badge ${log.result.includes('completed') || log.result.includes('Published') ? 'completed' : 'approval_required'}">${log.result}</span></td>
      </tr>`
      )
      .join('');
  } catch (e) {
    auditTableBody.innerHTML = '<tr><td colspan="5" style="color:red">Failed to load audit trail.</td></tr>';
  }
}
if (refreshAuditBtn) refreshAuditBtn.addEventListener('click', loadAuditLogs);

// 9. Load Platforms
async function loadPlatforms() {
  try {
    const res = await fetch('/api/social/platforms');
    if (!res.ok) return;
    const data = await res.json();
    platformsGrid.innerHTML = data.platforms
      .map(
        (p) => `
      <div class="platform-adapter-card">
        <div class="adapter-header">
          <div class="adapter-name"><span>${p.icon}</span> ${p.name}</div>
          <span class="adapter-status-badge">${p.status}</span>
        </div>
        <p style="font-size:12px;color:var(--muted);margin-bottom:8px;">${p.type}</p>
        <div style="font:11px 'DM Mono',monospace;color:#4b5563;background:var(--paper);padding:8px;border-radius:4px;margin-bottom:12px;">
          API: ${p.api_provider}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:11px;">
          <span style="color:${p.requires_approval ? '#b45309' : '#059669'};font-weight:600;">
            ${p.requires_approval ? '🔒 Approval Guarded' : '⚡ Auto-deploy'}
          </span>
          <span class="badge completed">Mock / Sandbox Active</span>
        </div>
      </div>`
      )
      .join('');
  } catch (e) {
    platformsGrid.innerHTML = '<p style="color:red">Failed to load platforms.</p>';
  }
}

// 10. Dedicated Studio & Approvals Views
function renderDedicatedStudio() {
  if (!currentPlanData || !currentPlanData.generated_content) {
    studioContainer.innerHTML = '<p>Draft your first post in the <b>Command deck</b> to see full multi-platform previews here.</p>';
    studioStatus.textContent = '0 drafts';
    return;
  }
  studioStatus.textContent = `${Object.keys(currentPlanData.generated_content).length} platform assets`;
  studioContainer.className = 'studio-grid';
  studioContainer.innerHTML = Object.keys(currentPlanData.generated_content)
    .map((k) => `
      <div style="margin-bottom:24px;">
        <h3 style="margin-bottom:12px;display:flex;align-items:center;gap:8px;">
          <span class="card-platform-badge badge-${k}">${k.toUpperCase()}</span>
          ${currentPlanData.generated_content[k].title}
        </h3>
        <div class="caption-box">${currentPlanData.generated_content[k].caption || currentPlanData.generated_content[k].body}</div>
      </div>
    `)
    .join('');
}

function renderApprovalsView() {
  const container = document.querySelector('#approvals-container');
  if (!currentPlanData || currentPlanData.status !== 'approval_required') {
    container.innerHTML = '<div class="empty-state">No pending actions requiring approval. All systems normal.</div>';
    return;
  }

  container.innerHTML = `
    <div class="social-card" style="padding: 24px;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px;">
        <div>
          <span class="badge approval_required">PENDING DECISION</span>
          <h3 style="margin: 8px 0 4px;">Run ${currentRunId.slice(0, 8)}: Multi-Platform Social Broadcast</h3>
          <p style="color:var(--muted);font-size:12.5px;margin:0;">Target Platforms: Instagram, TikTok, Facebook</p>
        </div>
        <button id="btn-approve-secondary" class="approve-btn">Approve & Publish (Sandbox)</button>
      </div>
      <div class="rule-box">
        <div class="rule-item allowed">
          <b>Safe Output:</b> Drafts created and validated for 3 platforms.
        </div>
        <div class="rule-item guarded">
          <b>Blocked without action:</b> Real network transmission prevented.
        </div>
      </div>
    </div>
  `;

  document.querySelector('#btn-approve-secondary').addEventListener('click', () => {
    approveBtn.click();
  });
}
