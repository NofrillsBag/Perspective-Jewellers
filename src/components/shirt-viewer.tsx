import { useEffect, useId, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Pause, Play, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { viewerKeyAction } from '@/lib/viewer-accessibility';

type ShirtViewerProps = {
  /** Name of a CSS design token, e.g. "--fabric-olive". */
  fabricToken: string;
  logo: string;
  fabricName: string;
};

/** Resolve a CSS custom property to a THREE.Color so the model shares the site's design tokens. */
function tokenColor(host: HTMLElement, name: string) {
  const probe = document.createElement('span');
  probe.style.color = `var(${name})`;
  host.append(probe);
  const computed = getComputedStyle(probe).color;
  probe.remove();
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Color(0x888888);
  ctx.fillStyle = computed;
  ctx.fillRect(0, 0, 1, 1);
  const p = ctx.getImageData(0, 0, 1, 1).data;
  return new THREE.Color(`rgb(${p[0]}, ${p[1]}, ${p[2]})`);
}

function drawLogo(canvas: HTMLCanvasElement, text: string, fabric: THREE.Color) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const luminance = 0.2126 * fabric.r + 0.7152 * fabric.g + 0.0722 * fabric.b;
  const ink = luminance > 0.45 ? '#2b241f' : '#f4efe4';
  const label = (text.trim() || 'YOUR BRAND').toUpperCase();
  let size = 150;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  do {
    ctx.font = `${size}px Italiana, Georgia, serif`;
    size -= 6;
  } while (ctx.measureText(label).width > canvas.width * 0.86 && size > 30);
  ctx.fillStyle = ink;
  ctx.fillText(label, canvas.width / 2, canvas.height / 2);
  ctx.fillRect(canvas.width * 0.32, canvas.height / 2 + size * 0.75, canvas.width * 0.36, 3);
}

export default function ShirtViewer({ fabricToken, logo, fabricName }: ShirtViewerProps) {
  const container = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial | null>(null);
  const logoRef = useRef<{ canvas: HTMLCanvasElement; texture: THREE.CanvasTexture } | null>(null);
  const tokenRef = useRef(fabricToken);
  const logoTextRef = useRef(logo);
  tokenRef.current = fabricToken;
  logoTextRef.current = logo;
  const descriptionId = useId();
  const [rotating, setRotating] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch { setError(true); return; }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0, 0.25, 6.4);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    element.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, 0.04);
    scene.environment = environment.texture;
    room.dispose();

    const fabric = tokenColor(element, tokenRef.current);
    const material = new THREE.MeshStandardMaterial({ color: fabric, roughness: 0.92, metalness: 0, side: THREE.DoubleSide });
    materialRef.current = material;

    const shirt = new THREE.Group();

    // Body: a lathe profile (radius, height) flattened front-to-back into an oval tube.
    const points: [number, number][] = [
      [1.02, -1.4], [1.04, -1.0], [1.05, -0.2], [1.03, 0.5], [0.98, 0.85], [0.78, 1.08], [0.5, 1.2], [0.37, 1.24],
    ];
    const profile = points.map(([x, y]) => new THREE.Vector2(x, y));
    const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 72), material);
    body.scale.z = 0.45;
    shirt.add(body);

    // Short sleeves: tapered, flattened tubes angled outward and down from each shoulder.
    const sleeveGeometry = new THREE.CylinderGeometry(0.3, 0.37, 1, 40, 1, true);
    const tilt = THREE.MathUtils.degToRad(35);
    const length = 1.0;
    ([1, -1] as const).forEach(side => {
      const sleeve = new THREE.Mesh(sleeveGeometry, material);
      sleeve.scale.set(1, length, 0.62);
      sleeve.position.set(side * (0.88 + Math.cos(tilt) * length * 0.5), 0.95 - Math.sin(tilt) * length * 0.5, 0);
      sleeve.rotation.z = side * -(Math.PI / 2 + tilt);
      shirt.add(sleeve);
    });

    // Collar ring around the neck opening.
    const collar = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.055, 16, 64), material);
    ring.rotation.x = Math.PI / 2;
    collar.add(ring);
    collar.position.y = 1.24;
    collar.scale.z = 0.45;
    shirt.add(collar);

    // Printed logo on the chest, drawn on a canvas so the buyer can type their own brand.
    const logoCanvas = document.createElement('canvas');
    logoCanvas.width = logoCanvas.height = 512;
    drawLogo(logoCanvas, logoTextRef.current, fabric);
    const texture = new THREE.CanvasTexture(logoCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    logoRef.current = { canvas: logoCanvas, texture };
    const decal = new THREE.Mesh(
      new THREE.PlaneGeometry(0.9, 0.9),
      new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, toneMapped: false }),
    );
    decal.position.set(0, 0.4, 0.478);
    shirt.add(decal);

    shirt.position.y = 0.08;
    scene.add(shirt);

    const light = new THREE.DirectionalLight(0xffffff, 2);
    light.position.set(3, 4, 5);
    scene.add(light);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 3.8;
    controls.maxDistance = 10;
    controls.autoRotate = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    controls.autoRotateSpeed = 2.2;
    controls.rotateSpeed = 0.65;
    controls.zoomSpeed = 0.65;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
    controlsRef.current = controls;
    setRotating(controls.autoRotate);
    const pauseForInteraction = () => { controls.autoRotate = false; setRotating(false); };
    const focusViewer = () => element.focus({ preventScroll: true });
    controls.addEventListener('start', pauseForInteraction);
    renderer.domElement.addEventListener('pointerdown', focusViewer);

    const resize = () => {
      const width = element.clientWidth, height = element.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();

    let frame = 0;
    const clock = new THREE.Clock();
    const render = () => {
      frame = requestAnimationFrame(render);
      controls.update(Math.min(clock.getDelta(), 0.05));
      renderer.render(scene, camera);
    };
    render();

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      controls.removeEventListener('start', pauseForInteraction);
      renderer.domElement.removeEventListener('pointerdown', focusViewer);
      controls.dispose();
      body.geometry.dispose();
      sleeveGeometry.dispose();
      ring.geometry.dispose();
      decal.geometry.dispose();
      (decal.material as THREE.Material).dispose();
      texture.dispose();
      material.dispose();
      environment.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      controlsRef.current = null;
      materialRef.current = null;
      logoRef.current = null;
    };
  }, []);

  // Fabric colour or logo text changed: update the existing model instead of rebuilding it.
  useEffect(() => {
    const element = container.current;
    const material = materialRef.current;
    const logoState = logoRef.current;
    if (!element || !material || !logoState) return;
    const color = tokenColor(element, fabricToken);
    material.color.copy(color);
    drawLogo(logoState.canvas, logo, color);
    logoState.texture.needsUpdate = true;
  }, [fabricToken, logo]);

  const pause = () => { if (controlsRef.current) controlsRef.current.autoRotate = false; setRotating(false); };
  const zoom = (factor: number) => {
    const controls = controlsRef.current;
    if (!controls) return;
    pause();
    const offset = controls.object.position.clone().sub(controls.target);
    offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance));
    controls.object.position.copy(controls.target).add(offset);
    controls.update();
  };
  const reset = () => { pause(); controlsRef.current?.reset(); };
  const toggleRotation = () => {
    const controls = controlsRef.current;
    if (!controls) return;
    controls.autoRotate = !controls.autoRotate;
    setRotating(controls.autoRotate);
  };
  const rotate = (horizontal: number, vertical: number) => {
    const controls = controlsRef.current;
    if (!controls) return;
    pause();
    const spherical = new THREE.Spherical().setFromVector3(controls.object.position.clone().sub(controls.target));
    spherical.theta += horizontal;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi + vertical, 0.1, Math.PI - 0.1);
    controls.object.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
    controls.update();
  };

  return <>
    <div className="viewer-stage shirt-stage">
      <div
        ref={container}
        className="viewer-canvas"
        role="region"
        aria-roledescription="interactive 3D product viewer"
        tabIndex={0}
        aria-label="Interactive panoramic shirt model"
        aria-describedby={descriptionId}
        aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown + - Home R Space"
        onKeyDown={event => {
          if (event.altKey || event.ctrlKey || event.metaKey) return;
          const action = viewerKeyAction(event.key);
          if (!action) return;
          event.preventDefault();
          event.stopPropagation();
          if (action === 'toggle') { if (!event.repeat) toggleRotation(); }
          else if (action === 'reset') reset();
          else if (action === 'zoom-in') zoom(0.88);
          else if (action === 'zoom-out') zoom(1.12);
          else rotate(action === 'left' ? -0.12 : action === 'right' ? 0.12 : 0, action === 'up' ? -0.12 : action === 'down' ? 0.12 : 0);
        }}
      />
      <span className="viewer-label">{error ? '3D viewing is unavailable in this browser.' : '360° / SAMPLE SHIRT'}</span>
      <div className="viewer-controls">
        <Button variant="ghost" size="icon" disabled={error} aria-pressed={rotating} aria-label={rotating ? 'Pause rotation' : 'Rotate automatically'} title={rotating ? 'Pause rotation (Space)' : 'Rotate automatically (Space)'} onClick={toggleRotation}>{rotating ? <Pause /> : <Play />}</Button>
        <Button variant="ghost" size="icon" disabled={error} aria-label="Zoom in" title="Zoom in (+)" onClick={() => zoom(0.88)}><ZoomIn /></Button>
        <Button variant="ghost" size="icon" disabled={error} aria-label="Zoom out" title="Zoom out (−)" onClick={() => zoom(1.12)}><ZoomOut /></Button>
        <Button variant="ghost" size="icon" disabled={error} aria-label="Reset view" title="Reset view (Home or R)" onClick={reset}><RotateCcw /></Button>
      </div>
    </div>
    <p id={descriptionId} className="sr-only">An illustrative 3D model of a short-sleeved t-shirt in {fabricName}, with the text “{logo.trim() || 'YOUR BRAND'}” printed on the chest. Drag to rotate, or focus the viewer and use arrow keys, plus and minus to zoom, and Space to pause.</p>
  </>;
}
