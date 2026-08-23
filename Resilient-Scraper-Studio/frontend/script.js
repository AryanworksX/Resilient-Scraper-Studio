(() => {
  // ---------------------------------------------------------
  // 1. Lenis Smooth Momentum Scrolling
  // ---------------------------------------------------------
  const lenis = new Lenis({
    duration: 1.25,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 0.95,
    touchMultiplier: 1.5,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  gsap.registerPlugin(ScrollTrigger);

  // Set your active Vercel domain or local fallback
  const API_BASE = window.VITE_API_URL || "https://resilient-scraper-studio.vercel.app";

  // ---------------------------------------------------------
  // 2. Kinetic Cursor
  // ---------------------------------------------------------
  const cursorDot = document.querySelector('.cursor-dot');
  const cursorOutline = document.querySelector('.cursor-outline');
  let cursorX = 0, cursorY = 0;
  let dotX = 0, dotY = 0;

  window.addEventListener('mousemove', (e) => {
    cursorX = e.clientX;
    cursorY = e.clientY;
    if (cursorDot) cursorDot.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
  });

  function updateCursor() {
    dotX += (cursorX - dotX) * 0.16;
    dotY += (cursorY - dotY) * 0.16;
    if (cursorOutline) cursorOutline.style.transform = `translate(${dotX}px, ${dotY}px)`;
    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  function attachHoverTriggers() {
    document.querySelectorAll('a, button, .product-row-capsule, .hover-trigger').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }
  attachHoverTriggers();

  // ---------------------------------------------------------
  // 3. Three.js Realtime Dynamic 3D Mesh Animation
  // ---------------------------------------------------------
  const canvas = document.getElementById('webgl-canvas');
  if (canvas) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 7);

    const renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const geometry = new THREE.IcosahedronGeometry(2, 40);
    const basePositions = new Float32Array(geometry.attributes.position.array);
    const material = new THREE.MeshPhysicalMaterial({
      color: 0x141026,
      roughness: 0.12,
      metalness: 0.15,
      transmission: 0.88,
      ior: 1.45,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const wireGeo = new THREE.IcosahedronGeometry(2.15, 6);
    const wireMat = new THREE.MeshBasicMaterial({ color: 0x9d6fff, wireframe: true, transparent: true, opacity: 0.16 });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    scene.add(wireMesh);

    const particleCount = 420;
    const particleGeo = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 22;
      particlePositions[i + 1] = (Math.random() - 0.5) * 22;
      particlePositions[i + 2] = (Math.random() - 0.5) * 16;
    }
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({ color: 0x38bdf8, size: 0.032, transparent: true, opacity: 0.55 });
    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const keyLight = new THREE.DirectionalLight(0x9d6fff, 3.8);
    keyLight.position.set(5, 5, 4);
    scene.add(keyLight);

    const rimLight = new THREE.PointLight(0x38bdf8, 4.5, 18);
    rimLight.position.set(-5, -3, 2);
    scene.add(rimLight);

    let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    window.addEventListener('mousemove', (e) => {
      mouse.targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouse.targetY = -(e.clientY / window.innerHeight - 0.5) * 2;
    });

    const masterTimeline = gsap.timeline({
      scrollTrigger: {
        trigger: 'main',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1.2
      }
    });

    masterTimeline
      .to(mesh.position, { x: 2.2, y: 0.1, z: 0.2, ease: 'power1.inOut' }, 0.1)
      .to(wireMesh.position, { x: 2.2, y: 0.1, z: 0.2, ease: 'power1.inOut' }, 0.1)
      .to(mesh.position, { x: -1.8, y: -0.3, z: 1.0, ease: 'power1.inOut' }, 0.35)
      .to(wireMesh.position, { x: -1.8, y: -0.3, z: 1.0, ease: 'power1.inOut' }, 0.35)
      .to(mesh.position, { x: 2.4, y: 0.5, z: -0.5, ease: 'power1.inOut' }, 0.65)
      .to(wireMesh.position, { x: 2.4, y: 0.5, z: -0.5, ease: 'power1.inOut' }, 0.65)
      .to(mesh.position, { x: 0, y: 1.8, z: -2.5, ease: 'power1.inOut' }, 0.85)
      .to(wireMesh.position, { x: 0, y: 1.8, z: -2.5, ease: 'power1.inOut' }, 0.85);

    const clock = new THREE.Clock();
    function animate() {
      requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      const positions = geometry.attributes.position.array;
      for (let i = 0; i < positions.length; i += 3) {
        const u = basePositions[i];
        const v = basePositions[i + 1];
        const w = basePositions[i + 2];
        const wave = Math.sin(u * 2.5 + time * 1.6) * Math.cos(v * 2.5 + time * 1.6) * 0.16;
        positions[i] = u + u * wave;
        positions[i + 1] = v + v * wave;
        positions[i + 2] = w + w * wave;
      }
      geometry.attributes.position.needsUpdate = true;
      geometry.computeVertexNormals();

      mesh.rotation.y += 0.003;
      wireMesh.rotation.y -= 0.002;
      scene.rotation.y = mouse.x * 0.25;
      scene.rotation.x = -mouse.y * 0.25;
      particles.rotation.y = time * 0.02;

      renderer.render(scene, camera);
    }
    animate();

    window.addEventListener('resize', () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });
  }

  // ---------------------------------------------------------
  // 4. Step Scroll Triggering
  // ---------------------------------------------------------
  const stepCards = document.querySelectorAll('.step-card');
  const stepNumber = document.getElementById('step-number');
  stepCards.forEach((card, index) => {
    ScrollTrigger.create({
      trigger: card,
      start: 'top center+=100',
      end: 'bottom center',
      onEnter: () => activateStep(index),
      onEnterBack: () => activateStep(index)
    });
  });

  function activateStep(index) {
    stepCards.forEach((c, i) => c.classList.toggle('active', i === index));
    if (stepNumber) stepNumber.textContent = (index + 1).toString().padStart(2, '0');
  }

  // ---------------------------------------------------------
  // 5. Data Engine State & DOM References
  // ---------------------------------------------------------
  let rawItems = [];
  let priceChartInstance = null;

  const apiDot = document.getElementById('api-dot');
  const apiStatusText = document.getElementById('api-status-text');
  const statTrackedNum = document.getElementById('stat-tracked-num');
  const statDropsNum = document.getElementById('stat-drops-num');
  const statRestocksNum = document.getElementById('stat-restocks-num');
  const statHealthNum = document.getElementById('stat-health-num');
  const fleetCountTag = document.getElementById('fleet-count-tag');
  const fleetContainer = document.getElementById('products-fleet-container');
  const activityStreamList = document.getElementById('activity-stream-list');
  const refreshBtn = document.getElementById('refresh-btn');

  // Modals & Studio Artifacts
  const analysisModal = document.getElementById('analysis-modal');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalProductTitle = document.getElementById('modal-product-title');
  const modalProductWebsite = document.getElementById('modal-product-website');
  const modalProductStock = document.getElementById('modal-product-stock');
  const modalCurrentPrice = document.getElementById('modal-current-price');
  const modalHighPrice = document.getElementById('modal-high-price');
  const modalLowPrice = document.getElementById('modal-low-price');
  const modalAvgPrice = document.getElementById('modal-avg-price');
  const modalTotalSnaps = document.getElementById('modal-total-snaps');
  const modalSnapshotLog = document.getElementById('modal-snapshot-log');
  const modalLastScraped = document.getElementById('modal-last-scraped');

  const addProductModal = document.getElementById('add-product-modal');
  const openAddModalBtn = document.getElementById('open-add-modal-btn');
  const headerAddBtn = document.getElementById('header-add-btn');
  const closeAddModalBtn = document.getElementById('close-add-modal-btn');
  const urlScrapeForm = document.getElementById('url-scrape-form');
  const scrapeForm = document.getElementById('scrape-form');
  const formAlert = document.getElementById('form-alert');

  async function checkApiHealth() {
    try {
      const res = await fetch(`${API_BASE}/`);
      if (res.ok) {
        if (apiDot) apiDot.className = 'status-dot online';
        if (apiStatusText) apiStatusText.textContent = 'Engine Active';
        if (statHealthNum) statHealthNum.textContent = '100%';
        return true;
      }
    } catch (err) {
      if (apiDot) apiDot.className = 'status-dot offline';
      if (apiStatusText) apiStatusText.textContent = 'Backend Offline';
      if (statHealthNum) statHealthNum.textContent = 'Degraded';
    }
    return false;
  }

  async function loadItems() {
    await checkApiHealth();
    try {
      const res = await fetch(`${API_BASE}/api/items`);
      if (!res.ok) throw new Error('API unreachable');
      const data = await res.json();
      
      const rawList = data.items || [];
      rawItems = rawList.map(item => {
        if (Array.isArray(item)) return item;
        return [
          item.id || 0,
          item.title || item.product_name || 'Unknown Item',
          parseFloat(item.price || 0),
          item.stock || item.stock_status || 'In Stock',
          item.scraped_at || '',
          item.currency || '₹'
        ];
      });
      renderDashboard();
    } catch (err) {
      if (fleetContainer) {
        fleetContainer.innerHTML = `
          <div style="text-align: center; color: var(--danger); padding: 3rem; font-size: 0.9rem;">
            Failed to connect to backend at <code>${API_BASE}</code>.
          </div>
        `;
      }
    }
  }

  function renderDashboard() {
    const productMap = new Map();
    let priceDropCount = 0;
    let restockCount = 0;

    rawItems.forEach((row) => {
      const [id, title, price, stock, scrapedAt, currency] = row;
      if (!productMap.has(title)) productMap.set(title, []);
      productMap.get(title).push({ id, title, price: Number(price), stock, scrapedAt, currency: currency || '₹' });
    });

    productMap.forEach((snapshots) => {
      snapshots.sort((a, b) => (a.id || 0) - (b.id || 0));
      for (let i = 1; i < snapshots.length; i++) {
        if (snapshots[i].price < snapshots[i - 1].price) priceDropCount++;
        if (
          snapshots[i - 1].stock?.toLowerCase() === 'out of stock' &&
          snapshots[i].stock?.toLowerCase() === 'in stock'
        ) restockCount++;
      }
    });

    const totalUnique = productMap.size;
    if (statTrackedNum) statTrackedNum.textContent = totalUnique;
    if (statDropsNum) statDropsNum.textContent = priceDropCount;
    if (statRestocksNum) statRestocksNum.textContent = restockCount;
    if (fleetCountTag) fleetCountTag.textContent = totalUnique;

    if (!fleetContainer) return;

    if (totalUnique === 0) {
      fleetContainer.innerHTML = `
        <div class="empty-state-box">
          <div style="font-size: 2.4rem; margin-bottom: 0.6rem;">📡</div>
          <h4 style="font-family: 'Syne', sans-serif; font-size: 1.3rem; color: #fff;">No Tracked Items</h4>
          <p style="color: var(--text-muted); font-size: 0.85rem; max-width: 360px; margin: 0.4rem auto 1.4rem auto;">
            Enter any product URL to launch extraction.
          </p>
        </div>
      `;
    } else {
      let fleetHTML = '';
      productMap.forEach((snapshots, title) => {
        const latest = snapshots[snapshots.length - 1];
        const curr = latest.currency || '₹';
        const isDrop = snapshots.length > 1 && latest.price < snapshots[snapshots.length - 2].price;
        const isRestock = snapshots.length > 1 && 
          snapshots[snapshots.length - 2].stock?.toLowerCase() === 'out of stock' && 
          latest.stock?.toLowerCase() === 'in stock';

        const isInStock = latest.stock?.toLowerCase() === 'in stock';
        const badgeClass = isRestock ? 'restocked' : (isInStock ? 'in-stock' : 'out-of-stock');
        const badgeLabel = isRestock ? '● Restocked' : (isInStock ? '● In Stock' : '● Out of Stock');

        fleetHTML += `
          <div class="product-row-capsule hover-trigger" data-title="${escapeHtml(title)}">
            <div>
              <span class="prod-name">${escapeHtml(title)}</span>
              <span class="prod-domain">⚡ ${escapeHtml(extractDomain(title))}</span>
            </div>
            <div class="prod-price ${isDrop ? 'drop' : ''}">
              ${curr}${latest.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              ${isDrop ? '<span style="font-size: 0.68rem; color: var(--success); display: block;">▼ Price Drop</span>' : ''}
            </div>
            <div>
              <span class="pill ${badgeClass}">${badgeLabel}</span>
            </div>
            <div class="time-badge">
              ${escapeHtml((latest.scrapedAt || '').substring(11, 19) || 'Just now')}
            </div>
            <div style="display: flex; gap: 0.5rem;" onclick="event.stopPropagation();">
              <button class="btn-mini-inspect hover-trigger inspect-btn" data-title="${escapeHtml(title)}">Inspect</button>
              <button class="btn-mini-delete hover-trigger remove-btn" data-title="${escapeHtml(title)}">✕</button>
            </div>
          </div>
        `;
      });
      fleetContainer.innerHTML = fleetHTML;

      document.querySelectorAll('.product-row-capsule').forEach(card => {
        card.addEventListener('click', () => openProductAnalysis(card.getAttribute('data-title')));
      });
      document.querySelectorAll('.inspect-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          openProductAnalysis(btn.getAttribute('data-title'));
        });
      });
      document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          removeProduct(btn.getAttribute('data-title'));
        });
      });
    }

    renderActivityFeed(rawItems);
    attachHoverTriggers();
  }

  function renderActivityFeed(items) {
    if (!activityStreamList) return;
    if (items.length === 0) {
      activityStreamList.innerHTML = `<div style="color: var(--text-muted); font-size: 0.82rem;">No telemetry recorded yet.</div>`;
      return;
    }
    const reversed = [...items].slice(-8).reverse();
    activityStreamList.innerHTML = reversed.map((row) => {
      const [id, title, price, stock, scrapedAt, currency] = row;
      const curr = currency || '₹';
      const isStock = stock?.toLowerCase() === 'in stock';
      return `
        <div class="activity-item-capsule">
          <div class="activity-icon">⚡</div>
          <div style="flex: 1;">
            <div class="activity-desc">
              <strong style="color: #fff;">${escapeHtml(title)}</strong>: <span style="color: var(--accent); font-weight: 700;">${curr}${parseFloat(price).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              (<span style="color: ${isStock ? 'var(--success)' : 'var(--danger)'};">${escapeHtml(stock)}</span>)
            </div>
            <div class="activity-time">${formatTimeAgo(scrapedAt)} • #${id}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  function openProductAnalysis(title) {
    const snapshots = rawItems
      .filter(item => item && item[1] === title)
      .map(i => ({ id: i[0], price: Number(i[2]), stock: i[3], scrapedAt: i[4], currency: i[5] || '₹' }))
      .sort((a, b) => (a.id || 0) - (b.id || 0));

    if (snapshots.length === 0) return;

    const latest = snapshots[snapshots.length - 1];
    const curr = latest.currency || '₹';
    const prices = snapshots.map(s => s.price);
    const lowest = Math.min(...prices);
    const highest = Math.max(...prices);
    const avg = prices.reduce((acc, p) => acc + p, 0) / prices.length;
    const isInStock = latest.stock?.toLowerCase() === 'in stock';

    if (modalProductTitle) modalProductTitle.textContent = title;
    if (modalProductWebsite) modalProductWebsite.textContent = `⚡ SKU: ${extractDomain(title)}`;
    if (modalProductStock) {
      modalProductStock.className = `pill ${isInStock ? 'in-stock' : 'out-of-stock'}`;
      modalProductStock.textContent = isInStock ? '● In Stock' : '● Out of Stock';
    }
    if (modalLastScraped) modalLastScraped.textContent = `Last Ping: ${latest.scrapedAt ? latest.scrapedAt.substring(11, 19) : 'Active'}`;
    if (modalCurrentPrice) modalCurrentPrice.textContent = `${curr}${latest.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (modalLowPrice) modalLowPrice.textContent = `${curr}${lowest.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (modalHighPrice) modalHighPrice.textContent = `${curr}${highest.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (modalAvgPrice) modalAvgPrice.textContent = `${curr}${avg.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    if (modalTotalSnaps) modalTotalSnaps.textContent = snapshots.length;

    if (modalSnapshotLog) {
      modalSnapshotLog.innerHTML = snapshots.slice().reverse().map(s => `
        <div class="activity-item-capsule" style="padding: 0.75rem 1rem;">
          <div style="font-size: 0.75rem; font-family: 'JetBrains Mono'; color: var(--accent-cyan);">#${s.id}</div>
          <div style="flex: 1; font-size: 0.8rem;">
            Price: <strong style="color: #fff;">${curr}${s.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
            <div style="color: var(--text-muted); font-size: 0.7rem;">${escapeHtml(s.scrapedAt)}</div>
          </div>
        </div>
      `).join('');
    }

    renderChart(snapshots, curr);
    if (analysisModal) analysisModal.classList.add('open');
  }

  function renderChart(snapshots, currencySymbol = '₹') {
    const ctx = document.getElementById('priceHistoryChart');
    if (!ctx) return;
    if (priceChartInstance) priceChartInstance.destroy();

    const labels = snapshots.map((s, idx) => (s.scrapedAt && s.scrapedAt.length >= 16) ? s.scrapedAt.substring(11, 16) : `Ping #${idx + 1}`);
    const dataValues = snapshots.map(s => s.price);
    const gradient = ctx.getContext('2d').createLinearGradient(0, 0, 0, 240);
    gradient.addColorStop(0, 'rgba(157, 111, 255, 0.45)');
    gradient.addColorStop(1, 'rgba(157, 111, 255, 0.0)');

    priceChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: `Price (${currencySymbol})`,
          data: dataValues,
          borderColor: '#9d6fff',
          backgroundColor: gradient,
          borderWidth: 2.8,
          fill: true,
          tension: 0.35,
          pointBackgroundColor: '#38bdf8',
          pointBorderColor: '#06050b',
          pointBorderWidth: 2,
          pointRadius: 4.5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` Price: ${currencySymbol}${Number(context.raw).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            }
          }
        },
        scales: {
          x: { grid: { color: 'rgba(255, 255, 255, 0.04)' } },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.04)' },
            ticks: { callback: (val) => `${currencySymbol}${val}` }
          }
        }
      }
    });
  }

  function openAddModal() {
    if (addProductModal) addProductModal.classList.add('open');
    if (formAlert) formAlert.style.display = 'none';
  }

  // Permanent Delete connected to Backend API
  async function removeProduct(title) {
    if (!confirm(`Permanently delete "${title}" and all its history from database?`)) return;

    try {
      const res = await fetch(`${API_BASE}/api/items/delete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
      });

      if (res.ok) {
        rawItems = rawItems.filter(item => item[1] !== title);
        renderDashboard();
      } else {
        const err = await res.json();
        alert(`Delete failed: ${err.error || 'Unknown error'}`);
      }
    } catch (err) {
      alert(`Could not reach backend: ${err.message}`);
    }
  }

  window.switchAddTab = function(tab) {
    document.getElementById('tab-url-btn')?.classList.toggle('active', tab === 'url');
    document.getElementById('tab-manual-btn')?.classList.toggle('active', tab === 'manual');
    if (urlScrapeForm) urlScrapeForm.style.display = tab === 'url' ? 'flex' : 'none';
    if (scrapeForm) scrapeForm.style.display = tab === 'manual' ? 'flex' : 'none';
    if (formAlert) formAlert.style.display = 'none';
  };

  window.openProductAnalysis = openProductAnalysis;
  window.openAddModal = openAddModal;
  window.removeProduct = removeProduct;

  if (closeModalBtn) closeModalBtn.addEventListener('click', () => analysisModal?.classList.remove('open'));
  if (closeAddModalBtn) closeAddModalBtn.addEventListener('click', () => addProductModal?.classList.remove('open'));
  if (openAddModalBtn) openAddModalBtn.addEventListener('click', openAddModal);
  if (headerAddBtn) headerAddBtn.addEventListener('click', openAddModal);

  if (urlScrapeForm) {
    urlScrapeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = document.getElementById('target-product-url')?.value.trim();
      const submitBtn = document.getElementById('url-submit-btn');

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="spinner"></span> Scraping...`;
      }

      try {
        const res = await fetch(`${API_BASE}/api/scrape-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url })
        });
        const result = await res.json();
        if (res.ok) {
          if (formAlert) {
            formAlert.className = 'alert-banner success';
            formAlert.textContent = 'Scraped and saved successfully.';
            formAlert.style.display = 'block';
          }
          urlScrapeForm.reset();
          await loadItems();
          setTimeout(() => addProductModal?.classList.remove('open'), 1200);
        } else {
          throw new Error(result.error || 'Failed');
        }
      } catch (err) {
        if (formAlert) {
          formAlert.className = 'alert-banner error';
          formAlert.textContent = err.message;
          formAlert.style.display = 'block';
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = '⚡ Trigger Bright Data Collector';
        }
      }
    });
  }

  if (scrapeForm) {
    scrapeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('item-title')?.value.trim();
      const price = parseFloat(document.getElementById('item-price')?.value || 0);
      const stock = document.getElementById('item-stock')?.value || 'In Stock';

      try {
        const res = await fetch(`${API_BASE}/api/scrape`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, price, stock, currency: '₹' })
        });
        if (res.ok) {
          scrapeForm.reset();
          await loadItems();
          addProductModal?.classList.remove('open');
        }
      } catch (err) {
        if (formAlert) {
          formAlert.className = 'alert-banner error';
          formAlert.textContent = err.message;
          formAlert.style.display = 'block';
        }
      }
    });
  }

  if (refreshBtn) refreshBtn.addEventListener('click', () => loadItems());

  // Dynamic CSV Download binding to live Vercel endpoint
  document.querySelectorAll('a[href*="download-csv"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = `${API_BASE}/api/download-csv`;
    });
  });

  function extractDomain(title) {
    if (!title) return 'store.marketplace.com';
    if (title.toLowerCase().includes('realme')) return 'buy.realme.com';
    if (title.toLowerCase().includes('campus')) return 'campusshoes.com';
    if (title.toLowerCase().includes('nike')) return 'nike.in';
    if (title.toLowerCase().includes('amazon')) return 'amazon.in';
    return 'store.com';
  }

  function formatTimeAgo(dateStr) {
    return dateStr ? dateStr.substring(11, 16) : 'Just now';
  }

  function escapeHtml(str) {
    return String(str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  loadItems();
})();
