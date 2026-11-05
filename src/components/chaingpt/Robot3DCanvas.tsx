"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

interface Robot3DCanvasProps {
  className?: string;
  enableInteraction?: boolean;
}

export default function Robot3DCanvas({
  className = "",
  enableInteraction = true,
}: Robot3DCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let width = container.clientWidth || 340;
    let height = container.clientHeight || 340;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera centered right on the mascot
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.6);
    camera.lookAt(0, 0, 0);

    // 3. Renderer with ACES Filmic Tone Mapping
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting tailored for Light and Dark themes
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(3.5, 4.5, 4.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfff5ee, 1.0);
    fillLight.position.set(-3.5, 2.0, 3.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xff6001, 1.2);
    rimLight.position.set(0, -3.0, -3.5);
    scene.add(rimLight);

    const bottomGlow = new THREE.PointLight(0xe50914, 1.5, 6);
    bottomGlow.position.set(0, -1.8, 0.5);
    scene.add(bottomGlow);

    // Pivot group for rotation & floating
    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);

    let mixer: THREE.AnimationMixer | null = null;
    let isDisposed = false;

    // Dedicated Eye Material (Crisp glowing white)
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 1.8,
      roughness: 0.1,
      metalness: 0.0,
    });

    // Orange Bezel Material
    const bezelMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#FF7A00"),
      emissive: new THREE.Color("#441800"),
      emissiveIntensity: 0.35,
      roughness: 0.18,
      metalness: 0.05,
    });

    // 5. Load web3mascot.glb
    const loader = new GLTFLoader();
    loader.load(
      "/web3mascot.glb",
      (gltf) => {
        if (isDisposed) return;
        const model = gltf.scene;

        // Hide any background constellation objects if present
        model.traverse((child) => {
          if (
            child.name.startsWith("Star_Node") ||
            child.name.startsWith("WebLink") ||
            child.name.startsWith("Energy_Ray") ||
            child.name.startsWith("Cyber_") ||
            child.name.startsWith("Icosphere")
          ) {
            child.visible = false;
          }
        });

        // Compute bounding box of visible mascot meshes and center precisely
        const box = new THREE.Box3();
        model.traverse((child) => {
          if (child.visible && (child as THREE.Mesh).isMesh) {
            box.expandByObject(child);
          }
        });
        const center = new THREE.Vector3();
        box.getCenter(center);
        model.position.set(-center.x, -center.y, -center.z);

        // Refine mascot materials for light theme perfection
        model.traverse((child) => {
          if ((child as THREE.Mesh).isMesh && child.visible) {
            const mesh = child as THREE.Mesh;

            if (mesh.name === "Cylinder" || mesh.name === "Cylinder.002") {
              mesh.material = eyeMaterial;
            } else if (mesh.material) {
              const mat = mesh.material as THREE.MeshStandardMaterial;

              if (mat.name === "Brand_Logo_Orange") {
                mesh.material = bezelMaterial;
              } else if (mat.name === "Brand_Neon_White") {
                mesh.material = eyeMaterial;
              } else if (mat.name === "Brand_White") {
                mat.color.setHex(0xf8fafc);
                mat.roughness = 0.22;
              } else if (mat.name === "Brand_Screen") {
                mat.color.setHex(0x0a0e10);
                mat.roughness = 0.08;
              } else if (mat.name === "Brand_Crimson_Cheek") {
                mat.color.setHex(0xff2a40);
                mat.emissive.setHex(0xe50914);
                mat.emissiveIntensity = 0.8;
              } else if (mat.name === "Brand_Dark_Grey") {
                mat.color.setHex(0x1e242a);
                mat.roughness = 0.3;
              }
            }
          }
        });

        pivotGroup.add(model);

        // Play all built-in mascot animations (head tilt, eye blinks, arm wave, notch)
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            const action = mixer?.clipAction(clip);
            if (action) {
              action.play();
            }
          });
        }

        setLoaded(true);
      },
      undefined,
      (err) => {
        console.error("Failed to load /web3mascot.glb:", err);
      }
    );

    // 6. Interaction State (Drag to inspect, hover parallax, auto-floating)
    const rotState = {
      targetY: 0,
      targetX: 0,
      currentY: 0,
      currentX: 0,
      isDragging: false,
      lastMouseX: 0,
      lastMouseY: 0,
      idleTimer: 0,
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!enableInteraction) return;
      rotState.isDragging = true;
      rotState.lastMouseX = e.clientX;
      rotState.lastMouseY = e.clientY;
      container.style.cursor = "grabbing";
    };

    const onPointerMove = (e: PointerEvent) => {
      rotState.idleTimer = 0;
      if (rotState.isDragging) {
        const deltaX = e.clientX - rotState.lastMouseX;
        const deltaY = e.clientY - rotState.lastMouseY;
        rotState.lastMouseX = e.clientX;
        rotState.lastMouseY = e.clientY;

        rotState.targetY += deltaX * 0.009;
        rotState.targetX += deltaY * 0.009;
        rotState.targetX = Math.max(-0.5, Math.min(0.5, rotState.targetX));
      } else {
        const rect = container.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        rotState.targetY = normX * 0.35;
        rotState.targetX = -normY * 0.25;
      }
    };

    const onPointerUp = () => {
      rotState.isDragging = false;
      container.style.cursor = "grab";
    };

    if (enableInteraction) {
      container.style.cursor = "grab";
      container.addEventListener("pointerdown", onPointerDown);
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    }

    // 7. Render Loop
    const clock = new THREE.Clock();
    let animId: number;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const delta = clock.getDelta();
      if (mixer) {
        mixer.update(delta);
      }

      // Smooth lerp to target rotation
      rotState.currentY += (rotState.targetY - rotState.currentY) * 0.08;
      rotState.currentX += (rotState.targetX - rotState.currentX) * 0.08;

      // Gentle auto-sway when idle
      if (!rotState.isDragging) {
        rotState.idleTimer += delta;
        if (rotState.idleTimer > 2.5) {
          pivotGroup.rotation.y = rotState.currentY + Math.sin(clock.getElapsedTime() * 0.8) * 0.12;
        } else {
          pivotGroup.rotation.y = rotState.currentY;
        }
      } else {
        pivotGroup.rotation.y = rotState.currentY;
      }

      pivotGroup.rotation.x = rotState.currentX;

      // Gentle floating breathing cycle
      const elapsed = clock.getElapsedTime();
      pivotGroup.position.y = Math.sin(elapsed * 1.6) * 0.06;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Responsive resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 340;
      height = container.clientHeight || 340;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      if (enableInteraction) {
        container.removeEventListener("pointerdown", onPointerDown);
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      scene.clear();
      eyeMaterial.dispose();
      bezelMaterial.dispose();
    };
  }, [enableInteraction]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full flex items-center justify-center select-none touch-none ${className}`}
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-[#E50914] border-t-transparent animate-spin" />
        </div>
      )}
    </div>
  );
}
