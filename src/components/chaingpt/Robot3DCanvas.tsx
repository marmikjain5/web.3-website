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

    let width = container.clientWidth || 1200;
    let height = container.clientHeight || 700;
    const initialAspect = width / height;

    // 1. Scene
    const scene = new THREE.Scene();

    // 2. Camera sized to frame web3mascot and constellation comfortably across viewports
    const fovRad = (42 * Math.PI) / 360;
    const calcZ = (aspect: number) => {
      const fitW = (13.5 / 2 / (Math.tan(fovRad) * Math.max(aspect, 0.55))) * 1.05;
      const fitH = (7.5 / 2 / Math.tan(fovRad)) * 1.05;
      return Math.max(fitW, fitH, 9.8);
    };

    const camera = new THREE.PerspectiveCamera(42, initialAspect, 0.1, 100);
    camera.position.set(0, 0, calcZ(initialAspect));
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
    renderer.toneMappingExposure = 1.15;
    container.appendChild(renderer.domElement);

    // 4. Studio Lighting tailored for Light and Dark themes
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(4.0, 5.0, 5.0);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xfff5ee, 1.0);
    fillLight.position.set(-4.0, 2.5, 4.0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xff6001, 1.3);
    rimLight.position.set(0, -3.0, -3.5);
    scene.add(rimLight);

    const bottomGlow = new THREE.PointLight(0xe50914, 2.0, 8);
    bottomGlow.position.set(0, -1.5, 1.0);
    scene.add(bottomGlow);

    // Pivot group for rotation & floating
    const pivotGroup = new THREE.Group();
    scene.add(pivotGroup);

    // Dynamic shining link materials array
    const shiningLinkMaterials: THREE.MeshStandardMaterial[] = [];

    let mixer: THREE.AnimationMixer | null = null;
    let isDisposed = false;

    // Dedicated Eye Material (Crisp glowing white)
    const eyeMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xffffff,
      emissiveIntensity: 2.0,
      roughness: 0.08,
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

    const BRAND_RED = new THREE.Color("#E50914");
    const BRAND_RED_EMISSIVE = new THREE.Color("#FF1824");

    // 5. Load web3mascot.glb
    const loader = new GLTFLoader();
    loader.load(
      "/web3mascot.glb",
      (gltf) => {
        if (isDisposed) return;
        const model = gltf.scene;

        // Ensure all background constellation nodes and links are visible
        model.traverse((child) => {
          child.visible = true;

          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;

            // Robot Eyes
            if (mesh.name === "Cylinder" || mesh.name === "Cylinder.002") {
              mesh.material = eyeMaterial;
              return;
            }

            // Constellation Links (WebLink_*, Brand_Crimson_Link)
            if (
              mesh.name.startsWith("WebLink") ||
              (mesh.material && (mesh.material as THREE.Material).name.includes("Brand_Crimson_Link")) ||
              (mesh.material && (mesh.material as THREE.Material).name.includes("Brand_Heroic_Link"))
            ) {
              const linkMat = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0xff2233),
                emissive: new THREE.Color(0xff1824),
                emissiveIntensity: 2.6,
                roughness: 0.08,
                metalness: 0.2,
                transparent: true,
                opacity: 0.88,
              });
              mesh.material = linkMat;
              shiningLinkMaterials.push(linkMat);
              return;
            }

            // Constellation Nodes (Star_Node_*, Icosphere*, Brand_Crimson_Node)
            if (
              mesh.name.startsWith("Star_Node") ||
              mesh.name.startsWith("Icosphere") ||
              (mesh.material && (mesh.material as THREE.Material).name.includes("Brand_Crimson_Node"))
            ) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0xff3344),
                emissive: new THREE.Color(0xff1824),
                emissiveIntensity: 2.8,
                roughness: 0.05,
                metalness: 0.1,
              });
              return;
            }

            // Energy Rays along links
            if (
              mesh.name.startsWith("Energy_Ray") ||
              (mesh.material && (mesh.material as THREE.Material).name.includes("Brand_Laser_Ray"))
            ) {
              mesh.material = new THREE.MeshStandardMaterial({
                color: new THREE.Color(0xff4455),
                emissive: new THREE.Color(0xff2030),
                emissiveIntensity: 3.2,
                roughness: 0.05,
              });
              return;
            }

            // Mascot materials
            if (mesh.material) {
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
                mat.emissiveIntensity = 0.9;
              } else if (mat.name === "Brand_Dark_Grey") {
                mat.color.setHex(0x1e242a);
                mat.roughness = 0.3;
              }
            }
          }
        });

        // Center the mascot vertically at Y = 0 (mascot base in Blender is ~Z=0, center is ~Z=1.45)
        model.position.set(0, -1.45, 0);

        pivotGroup.add(model);

        // Play all built-in animations (head tilt, eye blinks, arm wave, energy rays, constellation pulses)
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

        rotState.targetY += deltaX * 0.007;
        rotState.targetX += deltaY * 0.007;
        rotState.targetX = Math.max(-0.45, Math.min(0.45, rotState.targetX));
      } else {
        const rect = container.getBoundingClientRect();
        const normX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        const normY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
        rotState.targetY = normX * 0.25;
        rotState.targetX = -normY * 0.18;
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

      // Dynamic real-time shining pulse across constellation links
      if (shiningLinkMaterials.length > 0) {
        const linkShine = 2.2 + Math.sin(clock.getElapsedTime() * 3.5) * 0.8;
        for (let i = 0; i < shiningLinkMaterials.length; i++) {
          shiningLinkMaterials[i].emissiveIntensity = linkShine;
        }
      }

      // Smooth lerp to target rotation
      rotState.currentY += (rotState.targetY - rotState.currentY) * 0.07;
      rotState.currentX += (rotState.targetX - rotState.currentX) * 0.07;

      // Gentle auto-sway when idle
      if (!rotState.isDragging) {
        rotState.idleTimer += delta;
        if (rotState.idleTimer > 2.0) {
          pivotGroup.rotation.y = rotState.currentY + Math.sin(clock.getElapsedTime() * 0.7) * 0.1;
        } else {
          pivotGroup.rotation.y = rotState.currentY;
        }
      } else {
        pivotGroup.rotation.y = rotState.currentY;
      }

      pivotGroup.rotation.x = rotState.currentX;

      // Gentle floating breathing cycle
      const elapsed = clock.getElapsedTime();
      pivotGroup.position.y = Math.sin(elapsed * 1.5) * 0.06;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Responsive resize
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 1200;
      height = container.clientHeight || 700;
      const currentAspect = width / height;
      camera.aspect = currentAspect;
      camera.position.z = calcZ(currentAspect);
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
