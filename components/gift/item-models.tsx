"use client";
// Simple procedural 3D stand-ins for each builder item category. Every model
// fits roughly inside a 1×1×1 unit cube sitting on y = 0, and is scaled by the
// caller to its slot size. Items with a GLB use <NormalizedGLB /> instead.
import { useMemo } from "react";
import * as THREE from "three";
import { useGLTF, useTexture } from "@react-three/drei";
import type { BuilderItem } from "@/types";

const GOLD = { color: "#C9A45C", metalness: 0.9, roughness: 0.28 };

function Chocolates({ variant }: { variant: number }) {
  return (
    <group>
      <mesh castShadow position={[0, 0.16, 0]}>
        <boxGeometry args={[0.86, 0.32, 0.62]} />
        <meshStandardMaterial color={variant ? "#4A2B1A" : "#5B3420"} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.18, 0.33, 0.63]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
      <mesh position={[0, 0.33, 0]} castShadow>
        <boxGeometry args={[0.7, 0.01, 0.5]} />
        <meshStandardMaterial color="#F3E6D6" roughness={0.9} />
      </mesh>
    </group>
  );
}

function Jewellery({ name }: { name: string }) {
  const bracelet = /bracelet/i.test(name);
  return (
    <group>
      <mesh castShadow position={[0, 0.17, 0]}>
        <boxGeometry args={[0.66, 0.34, 0.66]} />
        <meshStandardMaterial color="#E3BFB2" roughness={0.95} />
      </mesh>
      {bracelet ? (
        <mesh position={[0, 0.4, 0]} rotation={[Math.PI / 2.4, 0, 0]} castShadow>
          <torusGeometry args={[0.22, 0.035, 16, 48]} />
          <meshStandardMaterial {...GOLD} />
        </mesh>
      ) : (
        [-0.13, 0.13].map((x) => (
          <group key={x} position={[x, 0.36, 0]}>
            <mesh>
              <torusGeometry args={[0.06, 0.012, 8, 24]} />
              <meshStandardMaterial {...GOLD} />
            </mesh>
            <mesh position={[0, -0.02, 0.04]} castShadow>
              <sphereGeometry args={[0.07, 24, 24]} />
              <meshStandardMaterial color="#FBF6EE" roughness={0.15} metalness={0.1} />
            </mesh>
          </group>
        ))
      )}
    </group>
  );
}

function Candle({ name }: { name: string }) {
  if (/bubble/i.test(name)) {
    const pts: [number, number, number][] = [];
    for (let y = 0; y < 3; y++) for (let x = 0; x < 3; x++) for (let z = 0; z < 3; z++) if ((x + y + z) % 1 === 0) pts.push([(x - 1) * 0.22, 0.14 + y * 0.22, (z - 1) * 0.22]);
    return (
      <group>
        {pts.map((p, i) => (
          <mesh key={i} position={p} castShadow>
            <sphereGeometry args={[0.15, 20, 20]} />
            <meshStandardMaterial color="#F7EEDC" roughness={0.55} />
          </mesh>
        ))}
        <mesh position={[0, 0.78, 0]}>
          <cylinderGeometry args={[0.01, 0.01, 0.12]} />
          <meshStandardMaterial color="#3A2A1E" />
        </mesh>
      </group>
    );
  }
  return (
    <group>
      <mesh castShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 0.6, 40]} />
        <meshPhysicalMaterial color="#F1E6D2" roughness={0.15} transmission={0.25} thickness={0.2} />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.27, 0.27, 0.02, 40]} />
        <meshStandardMaterial color="#FBF6EE" roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.25, 0.301]}>
        <planeGeometry args={[0.3, 0.2]} />
        <meshStandardMaterial color="#6E7F52" />
      </mesh>
      <mesh position={[0, 0.56, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.1]} />
        <meshStandardMaterial color="#3A2A1E" />
      </mesh>
    </group>
  );
}

function Flowers({ name }: { name: string }) {
  const rose = /rose/i.test(name);
  const heads = rose ? [[0, 0.95, 0]] : [[-0.12, 0.9, 0.02], [0.1, 0.95, -0.05], [0.02, 1.02, 0.08], [-0.05, 0.85, -0.1], [0.14, 0.82, 0.08], [-0.16, 0.8, 0.1]];
  return (
    <group rotation={[0.35, 0, -0.15]}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <coneGeometry args={[0.24, 0.62, 24, 1, true]} />
        <meshStandardMaterial color="#C8A27A" roughness={0.95} side={THREE.DoubleSide} />
      </mesh>
      {heads.map((h, i) => (
        <group key={i}>
          <mesh position={[h[0] * 0.6, 0.55, h[2] * 0.6]}>
            <cylinderGeometry args={[0.008, 0.008, 0.6]} />
            <meshStandardMaterial color="#6E7F52" />
          </mesh>
          <mesh position={h as [number, number, number]} castShadow>
            <sphereGeometry args={[rose ? 0.16 : 0.09, 16, 16]} />
            <meshStandardMaterial color={rose ? "#D89A90" : i % 2 ? "#F6EEE2" : "#EBCFC4"} roughness={0.8} />
          </mesh>
        </group>
      ))}
      <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.13, 0.02, 8, 24]} />
        <meshStandardMaterial color="#6E7F52" />
      </mesh>
    </group>
  );
}

function Perfume() {
  return (
    <group>
      <mesh castShadow position={[0, 0.28, 0]}>
        <boxGeometry args={[0.42, 0.56, 0.24]} />
        <meshPhysicalMaterial color="#F3D9C9" roughness={0.05} transmission={0.6} thickness={0.4} ior={1.45} />
      </mesh>
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[0.36, 0.34, 0.18]} />
        <meshStandardMaterial color="#E8B9A2" transparent opacity={0.7} />
      </mesh>
      <mesh position={[0, 0.64, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.16, 24]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
    </group>
  );
}

function Keychain({ name }: { name: string }) {
  const heart = /heart/i.test(name);
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, -0.18);
    s.bezierCurveTo(-0.3, 0.02, -0.18, 0.24, 0, 0.1);
    s.bezierCurveTo(0.18, 0.24, 0.3, 0.02, 0, -0.18);
    return s;
  }, []);
  return (
    <group position={[0, 0.06, 0]} rotation={[-Math.PI / 2 + 0.15, 0, 0.3]}>
      {heart ? (
        <mesh castShadow>
          <extrudeGeometry args={[shape, { depth: 0.08, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3 }]} />
          <meshPhysicalMaterial color="#EBC6BA" roughness={0.1} transmission={0.3} thickness={0.2} />
        </mesh>
      ) : (
        <mesh castShadow>
          <cylinderGeometry args={[0.2, 0.2, 0.08, 32]} />
          <meshStandardMaterial color="#C8A27A" roughness={0.6} />
        </mesh>
      )}
      <mesh position={[0, heart ? 0.32 : 0.36, 0.04]}>
        <torusGeometry args={[0.12, 0.018, 10, 32]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
    </group>
  );
}

function MiniFrame() {
  return (
    <group position={[0, 0.02, 0]} rotation={[-0.25, 0, 0]}>
      <mesh castShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[0.7, 0.78, 0.06]} />
        <meshStandardMaterial color="#C89B6D" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.4, 0.032]}>
        <planeGeometry args={[0.54, 0.62]} />
        <meshStandardMaterial color="#E8C9A1" />
      </mesh>
      <mesh position={[0.1, 0.32, 0.034]}>
        <circleGeometry args={[0.12, 24]} />
        <meshStandardMaterial color="#8E9C75" />
      </mesh>
    </group>
  );
}

function Card() {
  return (
    <group rotation={[-0.3, 0.15, 0]}>
      <mesh castShadow position={[0, 0.36, 0]}>
        <boxGeometry args={[0.85, 0.6, 0.02]} />
        <meshStandardMaterial color="#F6EEE2" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.36, 0.012]}>
        <planeGeometry args={[0.3, 0.3]} />
        <meshStandardMaterial color="#8E9C75" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}

function Teddy() {
  const fur = { color: "#D7BFA0", roughness: 1 } as const;
  return (
    <group>
      <mesh castShadow position={[0, 0.3, 0]} scale={[1, 1.1, 0.9]}>
        <sphereGeometry args={[0.28, 24, 24]} />
        <meshStandardMaterial {...fur} />
      </mesh>
      <mesh castShadow position={[0, 0.72, 0]}>
        <sphereGeometry args={[0.22, 24, 24]} />
        <meshStandardMaterial {...fur} />
      </mesh>
      {[-0.16, 0.16].map((x) => (
        <mesh key={x} position={[x, 0.9, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial {...fur} />
        </mesh>
      ))}
      <mesh position={[0, 0.68, 0.19]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#F1E4CF" />
      </mesh>
      <mesh position={[0, 0.7, 0.26]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color="#3A2A1E" />
      </mesh>
      {[-0.08, 0.08].map((x) => (
        <mesh key={x} position={[x, 0.78, 0.19]}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial color="#2A1E14" />
        </mesh>
      ))}
      {[-0.22, 0.22].map((x) => (
        <mesh key={x} position={[x, 0.08, 0.1]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial {...fur} />
        </mesh>
      ))}
      <mesh position={[0, 0.52, 0.12]} rotation={[0.3, 0, 0]}>
        <torusGeometry args={[0.14, 0.025, 8, 24]} />
        <meshStandardMaterial color="#6E7F52" />
      </mesh>
    </group>
  );
}

function Skincare({ name }: { name: string }) {
  if (/mist|spray/i.test(name)) {
    return (
      <group>
        <mesh castShadow position={[0, 0.3, 0]}>
          <cylinderGeometry args={[0.15, 0.15, 0.6, 32]} />
          <meshPhysicalMaterial color="#F0D2C8" roughness={0.1} transmission={0.5} thickness={0.3} />
        </mesh>
        <mesh position={[0, 0.66, 0]}>
          <cylinderGeometry args={[0.07, 0.1, 0.12, 24]} />
          <meshStandardMaterial color="#FBF6EE" />
        </mesh>
      </group>
    );
  }
  return (
    <group>
      <mesh castShadow position={[0, 0.14, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.28, 32]} />
        <meshStandardMaterial color="#F6EEE2" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.32, 0]}>
        <cylinderGeometry args={[0.25, 0.25, 0.08, 32]} />
        <meshStandardMaterial {...GOLD} />
      </mesh>
    </group>
  );
}

function Billboard({ url }: { url: string }) {
  const tex = useTexture(url);
  tex.colorSpace = THREE.SRGBColorSpace;
  return (
    <mesh position={[0, 0.45, 0]} rotation={[-0.2, 0, 0]} castShadow>
      <planeGeometry args={[0.85, 0.85]} />
      <meshStandardMaterial map={tex} transparent alphaTest={0.05} side={THREE.DoubleSide} />
    </mesh>
  );
}

/** Loads a GLB (Draco-compressed supported) and scales it to fit a unit cube on y=0. */
export function NormalizedGLB({ url, size = 1 }: { url: string; size?: number }) {
  const { scene } = useGLTF(url, true);
  const obj = useMemo(() => {
    const clone = scene.clone(true);
    const box = new THREE.Box3().setFromObject(clone);
    const s = new THREE.Vector3();
    box.getSize(s);
    const k = size / Math.max(s.x, s.y, s.z || 1);
    clone.scale.setScalar(k);
    const c = new THREE.Vector3();
    box.getCenter(c);
    clone.position.set(-c.x * k, -box.min.y * k, -c.z * k);
    clone.traverse((o) => {
      if ((o as THREE.Mesh).isMesh) o.castShadow = true;
    });
    return clone;
  }, [scene, size]);
  return <primitive object={obj} />;
}

export function ItemModel({ item, variant = 0 }: { item: BuilderItem; variant?: number }) {
  if (item.glb_url) return <NormalizedGLB url={item.glb_url} />;
  switch (item.category) {
    case "Chocolates":
      return <Chocolates variant={variant % 2} />;
    case "Jewellery":
      return <Jewellery name={item.name} />;
    case "Candles":
      return <Candle name={item.name} />;
    case "Flowers":
      return <Flowers name={item.name} />;
    case "Perfume":
      return <Perfume />;
    case "Keychains":
      return <Keychain name={item.name} />;
    case "Mini frames":
      return <MiniFrame />;
    case "Cards":
      return <Card />;
    case "Teddy":
      return <Teddy />;
    case "Skincare":
      return <Skincare name={item.name} />;
    default:
      return item.image_url ? <Billboard url={item.image_url} /> : <Card />;
  }
}
