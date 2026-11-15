"use client";
// Procedural gift box with a lift-off lid, ribbon that ties itself, paper-shred
// filler and an optional handwritten note card. Animation is driven by
// `lidOpen` and `ribbonProgress` (0..1) props and damped every frame.
import { Suspense, forwardRef, useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { getPaperTexture, drawNoteCard } from "./textures";

export interface BoxDims {
  w: number;
  d: number;
  h: number;
}

export function boxDimsFor(capacity: number): BoxDims {
  const w = 1.25 + capacity * 0.105;
  return { w, d: w * 0.74, h: 0.62 + capacity * 0.022 };
}

const WALL = 0.035;
const LID_H = 0.2;

function Ribbon({ dims, color, progress }: { dims: BoxDims; color: string; progress: React.MutableRefObject<number> }) {
  const bandX = useRef<THREE.Mesh>(null);
  const bandZ = useRef<THREE.Mesh>(null);
  const sides = useRef<THREE.Group>(null);
  const bow = useRef<THREE.Group>(null);
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.42, metalness: 0.05 }), [color]);
  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(() => {
    const p = progress.current;
    const bands = THREE.MathUtils.clamp(p / 0.55, 0, 1);
    const bowP = THREE.MathUtils.clamp((p - 0.5) / 0.5, 0, 1);
    const ease = (t: number) => 1 - Math.pow(1 - t, 3);
    const s = Math.max(0.0001, ease(bands));
    if (bandX.current) bandX.current.scale.set(s, 1, 1);
    if (bandZ.current) bandZ.current.scale.set(1, 1, s);
    if (sides.current) sides.current.scale.set(1, Math.max(0.0001, ease(THREE.MathUtils.clamp((bands - 0.3) / 0.7, 0, 1))), 1);
    if (bow.current) {
      const b = ease(bowP);
      // overshoot pop for the bow
      const pop = b < 1 ? b * (1 + 0.25 * Math.sin(b * Math.PI)) : 1;
      bow.current.scale.setScalar(Math.max(0.0001, pop));
      bow.current.rotation.y = (1 - b) * Math.PI * 1.5;
      bow.current.visible = bowP > 0;
    }
    const vis = p > 0.001;
    if (bandX.current) bandX.current.visible = vis;
    if (bandZ.current) bandZ.current.visible = vis;
    if (sides.current) sides.current.visible = vis;
  });

  const rw = 0.16;
  const lw = dims.w + 0.07;
  const ld = dims.d + 0.07;
  return (
    <group>
      {/* bands over the lid (lid-local coords, lid top at y = LID_H/2) */}
      <mesh ref={bandX} material={mat} castShadow>
        <boxGeometry args={[lw + 0.012, LID_H + 0.012, rw]} />
      </mesh>
      <mesh ref={bandZ} material={mat} castShadow>
        <boxGeometry args={[rw, LID_H + 0.012, ld + 0.012]} />
      </mesh>
      {/* bands running down the base, positioned from the lid's frame */}
      <group ref={sides} position={[0, -LID_H / 2, 0]}>
        {[
          [0, 0, dims.d / 2 + 0.004, rw, 0.004],
          [0, 0, -dims.d / 2 - 0.004, rw, 0.004],
          [dims.w / 2 + 0.004, 0, 0, 0.004, rw],
          [-dims.w / 2 - 0.004, 0, 0, 0.004, rw],
        ].map(([x, , z, sx, sz], i) => (
          <mesh key={i} material={mat} position={[x as number, -(dims.h - LID_H + 0.02) / 2, z as number]}>
            <boxGeometry args={[sx as number, dims.h - LID_H + 0.02, sz as number]} />
          </mesh>
        ))}
      </group>
      {/* bow */}
      <group ref={bow} position={[0, LID_H / 2 + 0.03, 0]}>
        {[-1, 1].map((side) => (
          <mesh key={side} material={mat} position={[side * 0.19, 0.06, 0]} rotation={[Math.PI / 2, 0, side * 0.35]} scale={[1.25, 0.75, 1]} castShadow>
            <torusGeometry args={[0.15, 0.04, 12, 40]} />
          </mesh>
        ))}
        <mesh material={mat} position={[0, 0.04, 0]} castShadow>
          <sphereGeometry args={[0.075, 20, 20]} />
        </mesh>
        {[-1, 1].map((side) => (
          <mesh key={side} material={mat} position={[side * 0.13, 0.0, 0.2]} rotation={[0.1, side * 0.5, side * 0.25]}>
            <boxGeometry args={[0.1, 0.012, 0.38]} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Filler({ dims, color, count, top }: { dims: BoxDims; color: string; count: number; top: number }) {
  const ref = useRef<THREE.InstancedMesh>(null);
  useEffect(() => {
    const m = ref.current;
    if (!m) return;
    const o = new THREE.Object3D();
    const iw = dims.w - WALL * 2 - 0.04;
    const id = dims.d - WALL * 2 - 0.04;
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    for (let i = 0; i < count; i++) {
      o.position.set((rnd() - 0.5) * iw, top - rnd() * 0.08, (rnd() - 0.5) * id);
      o.rotation.set((rnd() - 0.5) * 1.2, rnd() * Math.PI, (rnd() - 0.5) * 1.2);
      o.scale.set(0.7 + rnd() * 0.8, 1, 1);
      o.updateMatrix();
      m.setMatrixAt(i, o.matrix);
    }
    m.instanceMatrix.needsUpdate = true;
  }, [dims, count, top]);
  return (
    <group>
      <mesh position={[0, top - 0.06, 0]} receiveShadow>
        <boxGeometry args={[dims.w - WALL * 2, 0.04, dims.d - WALL * 2]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
      <instancedMesh ref={ref} args={[undefined, undefined, count]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.006, 0.022]} />
        <meshStandardMaterial color={color} roughness={0.95} />
      </instancedMesh>
    </group>
  );
}

function NoteCard({ text, fontFamily, dims, top }: { text: string; fontFamily: string; dims: BoxDims; top: number }) {
  const canvas = useMemo(() => document.createElement("canvas"), []);
  const texture = useMemo(() => {
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }, [canvas]);
  useEffect(() => {
    let cancelled = false;
    const draw = () => {
      if (cancelled) return;
      drawNoteCard(canvas, text, fontFamily);
      texture.needsUpdate = true;
    };
    draw();
    document.fonts?.load(`64px ${fontFamily}`).then(draw).catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [text, fontFamily, canvas, texture]);
  // Leans back against the rear wall, low enough to sit under the closed lid.
  const cw = Math.min(0.85, dims.w * 0.42);
  return (
    <group position={[0, top + cw * 0.18, -dims.d / 2 + WALL + 0.17]} rotation={[-0.85, 0, 0]}>
      <mesh castShadow>
        <boxGeometry args={[cw, cw * 0.625, 0.008]} />
        <meshStandardMaterial color="#FBF6EE" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0, 0.0045]}>
        <planeGeometry args={[cw, cw * 0.625]} />
        <meshStandardMaterial map={texture} roughness={0.9} />
      </mesh>
    </group>
  );
}

export interface GiftBox3DProps {
  dims: BoxDims;
  boxColor: string;
  ribbonColor: string;
  fillerColor: string;
  lidOpen: boolean;
  /** 0 = no ribbon, 1 = fully tied */
  ribbonProgress: React.MutableRefObject<number>;
  note?: string;
  showNote?: boolean;
  noteFont: string;
  fillerCount?: number;
  /** Optional GLB for the box base (exported WITHOUT its lid). Scaled to the box width. */
  glbUrl?: string | null;
  children?: React.ReactNode;
}

/** A modelled box base loaded from GLB (Draco supported), fitted to the box footprint. */
function GlbBase({ url, dims }: { url: string; dims: BoxDims }) {
  const { scene } = useGLTF(url, true);
  const obj = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const size = new THREE.Vector3();
    box.getSize(size);
    clone.scale.set(dims.w / (size.x || 1), dims.h / (size.y || 1), dims.d / (size.z || 1));
    const c = new THREE.Vector3();
    box.getCenter(c);
    clone.position.set(-c.x * clone.scale.x, -box.min.y * clone.scale.y, -c.z * clone.scale.z);
    clone.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
    return clone;
  }, [scene, dims]);
  return <primitive object={obj} />;
}

/** Height of the filler surface; items sit on it. */
export const fillerTop = (dims: BoxDims) => dims.h * 0.5;

export const GiftBox3D = forwardRef<THREE.Group, GiftBox3DProps>(function GiftBox3D(
  { dims, boxColor, ribbonColor, fillerColor, lidOpen, ribbonProgress, note, showNote, noteFont, fillerCount = 260, glbUrl, children },
  ref
) {
  const lid = useRef<THREE.Group>(null);
  const openT = useRef(lidOpen ? 1 : 0);
  const paper = useMemo(() => getPaperTexture(), []);
  const boxMat = useMemo(() => new THREE.MeshStandardMaterial({ color: boxColor, roughness: 0.82, map: paper }), [boxColor, paper]);
  const innerMat = useMemo(() => new THREE.MeshStandardMaterial({ color: new THREE.Color(boxColor).multiplyScalar(0.88), roughness: 0.9, map: paper }), [boxColor, paper]);
  useEffect(() => () => { boxMat.dispose(); innerMat.dispose(); }, [boxMat, innerMat]);

  const { w, d, h } = dims;
  const top = fillerTop(dims);
  const closedPos = new THREE.Vector3(0, h - LID_H / 2 + 0.012, 0);
  // Open: the lid lifts off and leans upright behind the box, top facing the camera.
  const LEAN = Math.PI / 2 - 0.25;
  const openPos = new THREE.Vector3(0, ((d + 0.07) / 2) * Math.sin(LEAN) + 0.03, -d / 2 - 0.34);

  useFrame((_, dt) => {
    openT.current = THREE.MathUtils.damp(openT.current, lidOpen ? 1 : 0, 2.6, dt);
    const t = openT.current;
    if (!lid.current) return;
    lid.current.position.lerpVectors(closedPos, openPos, t);
    lid.current.position.y += Math.sin(t * Math.PI) * 0.9; // lift up and over
    lid.current.rotation.set(t * LEAN, 0, 0);
  });

  return (
    <group ref={ref}>
      {/* base: a GLB model if provided, else bottom + four walls so the inside is visible */}
      {glbUrl ? (
        <Suspense fallback={null}>
          <GlbBase url={glbUrl} dims={dims} />
        </Suspense>
      ) : (
        <group>
        <mesh material={innerMat} position={[0, WALL / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[w, WALL, d]} />
        </mesh>
        {[
          [0, h / 2, d / 2 - WALL / 2, w, WALL],
          [0, h / 2, -d / 2 + WALL / 2, w, WALL],
          [w / 2 - WALL / 2, h / 2, 0, WALL, d - WALL * 2],
          [-w / 2 + WALL / 2, h / 2, 0, WALL, d - WALL * 2],
        ].map(([x, y, z, sx, sz], i) => (
          <mesh key={i} material={boxMat} position={[x, y, z]} castShadow receiveShadow>
            <boxGeometry args={[sx, h, sz]} />
          </mesh>
        ))}
      </group>
      )}

      <Filler dims={dims} color={fillerColor} count={fillerCount} top={top} />
      {showNote && <NoteCard text={note || ""} fontFamily={noteFont} dims={dims} top={top} />}
      {children}

      {/* lid */}
      <group ref={lid}>
        <mesh material={boxMat} castShadow receiveShadow>
          <boxGeometry args={[w + 0.07, LID_H, d + 0.07]} />
        </mesh>
        <Ribbon dims={dims} color={ribbonColor} progress={ribbonProgress} />
      </group>
    </group>
  );
});
