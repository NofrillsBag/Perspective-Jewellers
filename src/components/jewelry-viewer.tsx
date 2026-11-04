import { useEffect, useId, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Pause, Play, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { productDescriptions, viewerKeyAction } from '@/lib/viewer-accessibility';
import type { Metal } from '@/lib/products';

type ViewerProps = { kind: 'ring' | 'earrings' | 'necklace'; metal: Metal; onMetalChange: (metal: Metal) => void };
export default function JewelryViewer({ kind, metal, onMetalChange }: ViewerProps) {
  const container = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const descriptionId = useId();
  const helpId = useId();
  const [rotating, setRotating] = useState(false);
  const metalRef = useRef<Metal>(metal);
  metalRef.current = metal;
  const applyMetal = useRef<(() => void) | null>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    const element = container.current;
    if (!element) return;
    let renderer: THREE.WebGLRenderer;
    try { renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true }); }
    catch { setError(true); return; }
    const tokenColor = (name: string) => {
      const probe = document.createElement('span');
      probe.style.color = `var(${name})`;
      element.append(probe);
      const color = getComputedStyle(probe).color;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) { ctx.fillStyle = color; ctx.fillRect(0, 0, 1, 1); const p = ctx.getImageData(0, 0, 1, 1).data; probe.remove(); return new THREE.Color(`rgb(${p[0]}, ${p[1]}, ${p[2]})`); }
      probe.remove(); return new THREE.Color();
    };
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, .1, 100);
    camera.position.set(0, .4, 6.8);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5;
    element.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');
    const pmrem = new THREE.PMREMGenerator(renderer);
    const room = new RoomEnvironment();
    const environment = pmrem.fromScene(room, .04);
    scene.environment = environment.texture;
    room.dispose();
    const material = new THREE.MeshStandardMaterial({ color: tokenColor(`--model-${metalRef.current}`), metalness: 1, roughness: .2 });
    applyMetal.current = () => material.color.copy(tokenColor(`--model-${metalRef.current}`));
    const group = new THREE.Group();
    const makeHoop = (radius: number, thickness: number) => {
      const geometry = new THREE.TorusGeometry(radius, thickness, 32, 160);
      const position = geometry.getAttribute('position');
      for (let i = 0; i < position.count; i++) {
        const x = position.getX(i), y = position.getY(i), a = Math.atan2(y, x);
        const ripple = 1 + .055 * Math.sin(a * 3) + .025 * Math.cos(a * 5);
        position.setXYZ(i, x * ripple, y * ripple, position.getZ(i) * (1 + .1 * Math.sin(a * 2)));
      }
      geometry.computeVertexNormals();
      return new THREE.Mesh(geometry, material);
    };
    if (kind === 'ring') { const ring = makeHoop(1, .2); ring.rotation.set(.15, -.35, .15); group.add(ring); }
    else if (kind === 'earrings') {
      [-.8, .8].forEach((x, i) => { const hoop = makeHoop(.62, .14); hoop.position.x = x; hoop.rotation.y = i ? -.3 : .3; group.add(hoop); });
    } else {
      const chain = makeHoop(1.15, .035); chain.scale.y = 1.2; group.add(chain);
      const pendant = new THREE.Mesh(new THREE.SphereGeometry(.22, 32, 32), material); pendant.scale.set(.8, 1.3, .5); pendant.position.y = -1.37; group.add(pendant);
    }
    scene.add(group);
    const light = new THREE.DirectionalLight(tokenColor('--model-light'), 3);
    light.position.set(3, 4, 5); scene.add(light);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 3.5;
    controls.maxDistance = 10;
    controls.autoRotateSpeed = 2;
    controls.rotateSpeed = .65;
    controls.zoomSpeed = .65;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
    controlsRef.current = controls;
    const pauseForInteraction = () => { controls.autoRotate = false; setRotating(false); };
    const focusViewer = () => element.focus({ preventScroll: true });
    controls.addEventListener('start', pauseForInteraction);
    renderer.domElement.addEventListener('pointerdown', focusViewer);
    const resize = () => { const width = element.clientWidth, height = element.clientHeight; if (!width || !height) return; renderer.setSize(width, height); camera.aspect = width / height; camera.updateProjectionMatrix(); };
    const observer = new ResizeObserver(resize); observer.observe(element); resize();
    let frame = 0;
    const clock = new THREE.Clock();
    const render = () => { frame = requestAnimationFrame(render); controls.update(Math.min(clock.getDelta(), .05)); renderer.render(scene, camera); };
    render();
    return () => { cancelAnimationFrame(frame); observer.disconnect(); controls.removeEventListener('start', pauseForInteraction); renderer.domElement.removeEventListener('pointerdown', focusViewer); controls.dispose(); group.traverse(obj => { if (obj instanceof THREE.Mesh) obj.geometry.dispose(); }); material.dispose(); environment.dispose(); pmrem.dispose(); renderer.dispose(); renderer.domElement.remove(); applyMetal.current = null; controlsRef.current = null; };
  }, [kind]);
  useEffect(() => { applyMetal.current?.(); }, [metal]);
  const pause = () => { if (controlsRef.current) controlsRef.current.autoRotate = false; setRotating(false); };
  const zoom = (factor: number) => { const controls = controlsRef.current; if (!controls) return; pause(); const offset = controls.object.position.clone().sub(controls.target); offset.setLength(THREE.MathUtils.clamp(offset.length() * factor, controls.minDistance, controls.maxDistance)); controls.object.position.copy(controls.target).add(offset); controls.update(); };
  const reset = () => { pause(); controlsRef.current?.reset(); };
  const toggleRotation = () => { const controls = controlsRef.current; if (!controls) return; controls.autoRotate = !controls.autoRotate; setRotating(controls.autoRotate); };
  const rotate = (horizontal: number, vertical: number) => {
    const controls = controlsRef.current;
    if (!controls) return;
    pause();
    const spherical = new THREE.Spherical().setFromVector3(controls.object.position.clone().sub(controls.target));
    spherical.theta += horizontal;
    spherical.phi = THREE.MathUtils.clamp(spherical.phi + vertical, .1, Math.PI - .1);
    controls.object.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));
    controls.update();
  };
  const changeMetal = (value: Metal) => onMetalChange(value);
  return <>
    <div className="viewer-stage">
      <div ref={container} className="viewer-canvas" role="region" aria-roledescription="interactive 3D product viewer" tabIndex={0} aria-label="Interactive panoramic jewellery model" aria-describedby={`${descriptionId} ${helpId}`} aria-keyshortcuts="ArrowLeft ArrowRight ArrowUp ArrowDown + - Home R Space" onKeyDown={event => {
        if (event.altKey || event.ctrlKey || event.metaKey) return;
        const action = viewerKeyAction(event.key);
        if (!action) return;
        event.preventDefault();
        event.stopPropagation();
        if (action === 'toggle') { if (!event.repeat) toggleRotation(); }
        else if (action === 'reset') reset();
        else if (action === 'zoom-in') zoom(.88);
        else if (action === 'zoom-out') zoom(1.12);
        else rotate(action === 'left' ? -.12 : action === 'right' ? .12 : 0, action === 'up' ? -.12 : action === 'down' ? .12 : 0);
      }} />
      <span className="viewer-label">{error ? '3D viewing is unavailable in this browser.' : '360° / CONCEPT MODEL'}</span>
      <div className="viewer-controls">
        <Button variant="ghost" size="icon" disabled={error} aria-pressed={rotating} aria-label={rotating ? 'Pause rotation' : 'Rotate automatically'} title={rotating ? 'Pause rotation (Space)' : 'Rotate automatically (Space)'} onClick={toggleRotation}>{rotating ? <Pause /> : <Play />}</Button>
        <Button variant="ghost" size="icon" disabled={error} aria-label="Zoom in" title="Zoom in (+)" onClick={() => zoom(.88)}><ZoomIn /></Button>
        <Button variant="ghost" size="icon" disabled={error} aria-label="Zoom out" title="Zoom out (−)" onClick={() => zoom(1.12)}><ZoomOut /></Button>
        <Button variant="ghost" size="icon" disabled={error} aria-label="Reset view" title="Reset view (Home or R)" onClick={reset}><RotateCcw /></Button>
      </div>
    </div>
    <p id={descriptionId} className="viewer-description">{productDescriptions[kind]} The illustrative model shows the shape in a {metal}-tone finish.</p>
    <p id={helpId} className="sr-only">Focus the viewer and use arrow keys to rotate, plus or minus to zoom, Home or R to reset, and Space to pause or resume rotation. Drag with one finger to rotate; pinch with two fingers to zoom. Escape closes the viewer.</p>
    <span role="status" aria-live="polite" className="sr-only">{error ? '3D viewing is unavailable. The product description is available below.' : `${rotating ? 'Automatic rotation on' : 'Automatic rotation paused'}. ${metal === 'gold' ? 'Gold' : 'Silver'} finish selected.`}</span>
    <div className="metal-options"><span className="text-xs text-muted-foreground mr-3">Finish</span><Button className="metal-swatch gold" aria-label="Gold finish" title="Gold finish" aria-pressed={metal === 'gold'} onClick={() => changeMetal('gold')} /><Button className="metal-swatch silver" aria-label="Silver finish" title="Silver finish" aria-pressed={metal === 'silver'} onClick={() => changeMetal('silver')} /></div>
  </>;
}
