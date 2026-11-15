"use client";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, Lightformer, OrbitControls } from "@react-three/drei";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { GiftBox3D, boxDimsFor, fillerTop, type BoxDims } from "./gift-box-3d";
import { ItemModel } from "./item-models";
import { getLinenTexture } from "./textures";
import { BOX_COLORS, FILLER_COLORS, RIBBON_COLORS, hexOf, useBuilder, type PlacedItem } from "@/store/builder";

export interface GiftSceneProps {
  /** Filled with a function that returns a JPEG data URL of the current view. */
  captureRef: React.MutableRefObject<(() => string) | null>;
  onRibbonTied: () => void;
  noteFont: string;
  lowQuality?: boolean;
}

/** Positions items on a grid inside the box, honouring multi-slot items. */
function layoutItems(placed: PlacedItem[], capacity: number, dims: BoxDims) {
  const iw = dims.w - 0.22;
  const id = dims.d - 0.42; // leave room at the back for the note card
  const cols = Math.max(2, Math.round(Math.sqrt((capacity * iw) / id)));
  const rows = Math.ceil(capacity / cols);
  const cell = Math.min(iw / cols, id / rows);
  const cellPos = (i: number) => {
    const c = i % cols;
    const r = Math.floor(i / cols);
    return [(c - (cols - 1) / 2) * (iw / cols), (r - (rows - 1) / 2) * (id / rows) + 0.12] as const;
  };
  let slot = 0;
  return placed.map((p) => {
    const n = p.item.slots_used;
    const cells = Array.from({ length: n }, (_, k) => cellPos(Math.min(capacity - 1, slot + k)));
    slot += n;
    const x = cells.reduce((a, c) => a + c[0], 0) / n;
    const z = cells.reduce((a, c) => a + c[1], 0) / n;
    return { p, x, z, scale: cell * 1.02 * (1 + 0.24 * (n - 1)) };
  });
}

/** One item: drops in from above and settles with a soft bounce. */
function DroppingItem({ placed, x, z, y, scale, index }: { placed: PlacedItem; x: number; z: number; y: number; scale: number; index: number }) {
  const ref = useRef<THREE.Group>(null);
  const state = useRef({ y: y + 2.4, v: 0, settled: false, spin: (index % 2 ? 1 : -1) * 0.6 });
  const yaw = useMemo(() => ((index * 47) % 30) / 100 - 0.15, [index]);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    const s = state.current;
    const step = Math.min(dt, 1 / 30);
    if (!s.settled) {
      s.v -= 14 * step;
      s.y += s.v * step;
      if (s.y <= y) {
        s.y = y;
        if (Math.abs(s.v) < 0.9) {
          s.v = 0;
          s.settled = true;
        } else s.v = -s.v * 0.34;
      }
      s.spin *= 0.94;
    }
    g.position.set(x, s.y, z);
    g.rotation.set(0, yaw + s.spin, 0);
    // tiny squash on contact
    const squash = s.settled ? 1 : 1 - Math.min(0.08, Math.abs(s.v) * 0.004);
    g.scale.set(scale, scale * squash, scale);
  });
  // re-layout (e.g. another item removed) should glide, not re-drop
  useEffect(() => {
    if (state.current.settled) state.current.y = y;
  }, [y]);

  return (
    <group ref={ref} position={[x, y + 2.4, z]} scale={scale}>
      <ItemModel item={placed.item} variant={index} />
    </group>
  );
}

function Controller({ captureRef, onRibbonTied, ribbon, controls }: { captureRef: GiftSceneProps["captureRef"]; onRibbonTied: () => void; ribbon: React.MutableRefObject<number>; controls: React.RefObject<OrbitControlsImpl> }) {
  const { gl, scene, camera } = useThree();
  const step = useBuilder((s) => s.step);
  const finishStart = useRef<number | null>(null);
  const tied = useRef(false);
  const lastInteract = useRef(performance.now());

  useEffect(() => {
    captureRef.current = () => {
      gl.render(scene, camera);
      return gl.domElement.toDataURL("image/jpeg", 0.9);
    };
    return () => {
      captureRef.current = null;
    };
  }, [gl, scene, camera, captureRef]);

  useEffect(() => {
    const c = controls.current;
    if (!c) return;
    const mark = () => (lastInteract.current = performance.now());
    c.addEventListener("start", mark);
    c.addEventListener("end", mark);
    return () => {
      c.removeEventListener("start", mark);
      c.removeEventListener("end", mark);
    };
  }, [controls]);

  useEffect(() => {
    if (step === 3) {
      finishStart.current = performance.now();
      tied.current = false;
    } else {
      finishStart.current = null;
      ribbon.current = 0;
    }
  }, [step, ribbon]);

  useFrame(() => {
    if (finishStart.current != null) {
      const t = (performance.now() - finishStart.current) / 1000;
      ribbon.current = THREE.MathUtils.clamp((t - 1.3) / 2.4, 0, 1);
      if (ribbon.current >= 1 && !tied.current) {
        tied.current = true;
        onRibbonTied();
      }
    }
    const c = controls.current;
    if (c) {
      const idle = performance.now() - lastInteract.current > 5000;
      c.autoRotate = step === 3 ? ribbon.current >= 1 : idle;
      c.autoRotateSpeed = step === 3 ? 1.1 : 0.6;
    }
  });
  return null;
}

function Floor() {
  const tex = useMemo(() => getLinenTexture(), []);
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.001, 0]} receiveShadow>
      <circleGeometry args={[9, 64]} />
      <meshStandardMaterial map={tex} color="#FFFFFF" roughness={1} envMapIntensity={0.4} />
    </mesh>
  );
}

export default function GiftScene({ captureRef, onRibbonTied, noteFont, lowQuality }: GiftSceneProps) {
  const { box, placed, step, boxColor, ribbonColor, fillerColor, note } = useBuilder();
  const capacity = box?.capacity ?? 7;
  const dims = useMemo(() => boxDimsFor(capacity), [capacity]);
  const layout = useMemo(() => layoutItems(placed, capacity, dims), [placed, capacity, dims]);
  const ribbon = useRef(0);
  const controls = useRef<OrbitControlsImpl>(null);
  const top = fillerTop(dims);
  const lidOpen = !!box && step < 3;
  // Once the lid has closed on the finish step, hide the contents so taller
  // pieces never poke through the lid while the camera orbits.
  const [contentsHidden, setContentsHidden] = useState(false);
  useEffect(() => {
    if (step !== 3) return setContentsHidden(false);
    const t = setTimeout(() => setContentsHidden(true), 1100);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <Canvas
      shadows={!lowQuality}
      dpr={lowQuality ? [1, 1.5] : [1, 2]}
      gl={{ preserveDrawingBuffer: true, antialias: true, toneMapping: THREE.NeutralToneMapping }}
      camera={{ position: [0, 3.1, 4.6], fov: 38 }}
      aria-label="3D preview of your gift box"
      role="img"
    >
      <color attach="background" args={["#F6ECE0"]} />
      <fog attach="fog" args={["#F6ECE0", 7, 13]} />
      <ambientLight intensity={0.55} />
      <hemisphereLight args={["#FFF8EE", "#D9C2A5", 0.5]} />
      <directionalLight
        position={[3.5, 6, 3]}
        intensity={1.6}
        castShadow={!lowQuality}
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={-0.0004}
      />
      <Environment resolution={lowQuality ? 64 : 256} frames={1}>
        <Lightformer intensity={1.6} position={[0, 5, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[8, 8, 1]} color="#FFF6EA" />
        <Lightformer intensity={0.8} position={[-5, 2, 2]} rotation={[0, Math.PI / 2, 0]} scale={[6, 3, 1]} color="#F3E6D6" />
        <Lightformer intensity={0.6} position={[5, 2, -2]} rotation={[0, -Math.PI / 2, 0]} scale={[6, 3, 1]} color="#E8C9A1" />
      </Environment>

      <Suspense fallback={null}>
        <group position={[0, 0, 0.1]}>
          <GiftBox3D
            dims={dims}
            boxColor={hexOf(BOX_COLORS, boxColor)}
            ribbonColor={hexOf(RIBBON_COLORS, ribbonColor)}
            fillerColor={hexOf(FILLER_COLORS, fillerColor)}
            lidOpen={lidOpen}
            ribbonProgress={ribbon}
            note={note}
            showNote={!contentsHidden && (step >= 2 || note.trim().length > 0)}
            noteFont={noteFont}
            fillerCount={lowQuality ? 120 : 280}
            glbUrl={box?.glb_url || process.env.NEXT_PUBLIC_GIFT_BOX_GLB || null}
          >
            {!contentsHidden && layout.map(({ p, x, z, scale }, i) => (
              <DroppingItem key={p.uid} placed={p} x={x} z={z} y={top - 0.04} scale={scale} index={i} />
            ))}
          </GiftBox3D>
        </group>
        <Floor />
        <ContactShadows position={[0, 0.002, 0]} opacity={0.45} scale={10} blur={2.4} far={3} resolution={lowQuality ? 256 : 512} color="#5A3A22" />
      </Suspense>

      <OrbitControls
        ref={controls}
        makeDefault
        enablePan={false}
        minDistance={3.2}
        maxDistance={7.5}
        minPolarAngle={0.35}
        maxPolarAngle={1.32}
        target={[0, 0.45, 0]}
        enableDamping
        dampingFactor={0.08}
      />
      <Controller captureRef={captureRef} onRibbonTied={onRibbonTied} ribbon={ribbon} controls={controls} />
    </Canvas>
  );
}
