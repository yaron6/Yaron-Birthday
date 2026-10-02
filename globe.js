 (async () => {
  const stage = document.getElementById("memoryGlobe");
  const canvas = document.getElementById("memoryGlobeCanvas");
  const toggle = document.getElementById("globeMotion");
  const counter = document.getElementById("globePhotoCount");
  const images = [...document.querySelectorAll(".album-photo img")];

  if (!stage || !canvas || !toggle) return;
  if (!window.THREE) {
    stage.hidden = true;
    return;
  }
  await Promise.all(images.map(image => image.decode().catch(() => {})));

  const THREE = window.THREE;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch {
    stage.hidden = true;
    return;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0, 0, 8.8);

  scene.add(new THREE.HemisphereLight(0xffdced, 0x180a1c, 1.8));
  const glowLight = new THREE.PointLight(0xff5c9d, 2.4, 12);
  glowLight.position.set(-3, 2.5, 4);
  scene.add(glowLight);
  const edgeLight = new THREE.PointLight(0x9c75ff, 1.8, 12);
  edgeLight.position.set(3, -2.5, -3);
  scene.add(edgeLight);

  const globe = new THREE.Group();
  scene.add(globe);

  const sphereGeometry = new THREE.SphereGeometry(1.18, 48, 36);
  const sphere = new THREE.Mesh(sphereGeometry, new THREE.MeshPhongMaterial({
    color: 0x3c1532,
    emissive: 0x8b1b4a,
    emissiveIntensity: 0.34,
    shininess: 55,
    transparent: true,
    opacity: 0.82
  }));
  globe.add(sphere);

  const wireframe = new THREE.Mesh(sphereGeometry, new THREE.MeshBasicMaterial({
    color: 0xff91bd,
    wireframe: true,
    transparent: true,
    opacity: 0.16
  }));
  wireframe.scale.setScalar(1.006);
  globe.add(wireframe);

  const orbitMaterial = new THREE.MeshBasicMaterial({
    color: 0xffa6ca,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide
  });
  [
    [0.7, 0.4, 0.2],
    [1.4, 1.1, 1.2],
    [2.2, 0.2, 2.6]
  ].forEach(rotation => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.006, 6, 160), orbitMaterial.clone());
    ring.rotation.set(...rotation);
    globe.add(ring);
  });

  const photoOrbit = new THREE.Group();
  scene.add(photoOrbit);
  const photoCards = [];
  const radius = 2.35;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));

  images.forEach((image, index) => {
    if (!image.complete || !image.naturalWidth) return;

    const aspect = image.naturalWidth / image.naturalHeight;
    const height = 0.7;
    const width = height * Math.max(0.58, Math.min(aspect, 1.12));
    const card = new THREE.Group();
    const frame = new THREE.Mesh(
      new THREE.PlaneGeometry(width + 0.055, height + 0.055),
      new THREE.MeshBasicMaterial({
        color: index % 5 === 0 ? 0xe8c98d : 0xff9fc5,
        side: THREE.DoubleSide
      })
    );
    frame.position.z = -0.018;
    card.add(frame);

    const texture = new THREE.Texture(image);
    texture.encoding = THREE.sRGBEncoding;
    texture.anisotropy = Math.min(renderer.capabilities.getMaxAnisotropy(), 4);
    texture.needsUpdate = true;
    card.add(new THREE.Mesh(
      new THREE.PlaneGeometry(width, height),
      new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide })
    ));

    const y = 1 - ((index + 0.5) / images.length) * 2;
    const ringRadius = Math.sqrt(1 - y * y);
    const angle = goldenAngle * index;
    const home = new THREE.Vector3(
      Math.cos(angle) * ringRadius * radius,
      y * radius,
      Math.sin(angle) * ringRadius * radius
    );
    card.position.copy(home);
    card.userData.home = home;
    card.userData.phase = index * 0.72;
    photoOrbit.add(card);
    photoCards.push(card);
  });

  counter.textContent = `${photoCards.length} FOTOGRAFIAS`;

  let paused = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let dragging = false;
  let lastPointer = { x: 0, y: 0 };
  const clock = new THREE.Clock();

  function resize() {
    const width = stage.clientWidth;
    const height = stage.clientHeight;
    if (!width || !height) return;
    camera.aspect = width / height;
    camera.position.z = width < 520 ? 9.8 : 8.8;
    const sceneScale = width < 520 ? 0.76 : 1;
    globe.scale.setScalar(sceneScale);
    photoOrbit.scale.setScalar(sceneScale);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  }

  new ResizeObserver(resize).observe(stage);
  resize();

  canvas.addEventListener("pointerdown", event => {
    dragging = true;
    lastPointer = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener("pointermove", event => {
    if (!dragging) return;
    const deltaX = event.clientX - lastPointer.x;
    const deltaY = event.clientY - lastPointer.y;
    photoOrbit.rotation.y += deltaX * 0.005;
    photoOrbit.rotation.x = Math.max(-0.55, Math.min(0.55, photoOrbit.rotation.x + deltaY * 0.004));
    lastPointer = { x: event.clientX, y: event.clientY };
  });
  canvas.addEventListener("pointerup", () => { dragging = false; });
  canvas.addEventListener("pointercancel", () => { dragging = false; });

  toggle.addEventListener("click", () => {
    paused = !paused;
    toggle.textContent = paused ? "▶" : "Ⅱ";
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.setAttribute("aria-label", paused ? "Retomar animação" : "Pausar animação");
    toggle.title = paused ? "Retomar animação" : "Pausar animação";
  });

  function animate() {
    requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    if (!paused && !dragging) {
      photoOrbit.rotation.y += 0.0017;
      globe.rotation.y -= 0.001;
      globe.rotation.x = Math.sin(elapsed * 0.18) * 0.04;
    }
    photoCards.forEach(card => {
      card.position.y = card.userData.home.y + Math.sin(elapsed * 0.85 + card.userData.phase) * 0.08;
      card.quaternion.copy(photoOrbit.quaternion).invert().multiply(camera.quaternion);
    });
    renderer.render(scene, camera);
  }

  animate();
})();