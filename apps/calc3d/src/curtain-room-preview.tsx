import type { FabricType } from "@curtans-web/components/curtain-fabric-colors";
import { useEffect, useRef } from "react";

const PREVIEW_W = 400;
const PREVIEW_H = 320;

const ROOM = { w: 6, d: 5, h: 3 } as const;
const WIN = { w: 2.5, h: 2, bottomY: 0.85 } as const;
const WALL_Z = -ROOM.d / 2;
const CURTAIN_Z = WALL_Z + 0.12;
const ROD_Y = WIN.bottomY + WIN.h + 0.08;

export interface CurtainRoomPreviewProps {
  width: number;
  height: number;
  foldRatio: number;
  fabricType: FabricType;
  /** #RRGGBB */
  curtainColorHex: string;
}

const WOOD_PALETTE = ["#a67c52", "#b88a5e", "#9d7148", "#c59b6a", "#8f6640", "#d2b08c", "#bc9868"];

const pickWoodFill = (seed: number) => {
  const i = Math.floor(Math.abs(Math.sin(seed * 12.9898)) * WOOD_PALETTE.length) % WOOD_PALETTE.length;
  return WOOD_PALETTE[i];
};

/** Бесшовная плитка паркета: палубная укладка со сдвигом + затирка + волокна. */
const createParquetTexture = (THREE: Window["THREE"]) => {
  const sz = 512;
  const c = document.createElement("canvas");
  c.width = sz;
  c.height = sz;
  const g = c.getContext("2d");
  if (!g) return undefined;

  g.fillStyle = "#b89568";
  g.fillRect(0, 0, sz, sz);

  const plankL = 52;
  const plankW = 13;
  const grout = 1.5;
  let seed = 0;
  let row = 0;
  for (let y = 0; y < sz + plankW; y += plankW) {
    const offset = (row % 2) * (plankL / 2);
    for (let x = -plankL; x < sz + plankL; x += plankL) {
      const px = x + offset;
      g.fillStyle = pickWoodFill(seed++);
      g.fillRect(px + grout / 2, y + grout / 2, plankL - grout, plankW - grout);
      g.strokeStyle = "rgba(30,20,12,0.5)";
      g.lineWidth = 1;
      g.strokeRect(px + grout / 2, y + grout / 2, plankL - grout, plankW - grout);
      g.strokeStyle = "rgba(255,255,255,0.07)";
      g.lineWidth = 0.6;
      for (let t = px + 8; t < px + plankL - 6; t += 9) {
        g.beginPath();
        g.moveTo(t, y + 2);
        g.lineTo(t, y + plankW - 2);
        g.stroke();
      }
    }
    row++;
  }

  g.save();
  g.globalAlpha = 0.055;
  g.fillStyle = "#1a1208";
  for (let i = 0; i < 7000; i++) {
    g.fillRect(Math.random() * sz, Math.random() * sz, 1, 1);
  }
  g.restore();

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2.4, 2.4);
  return tex;
};

/** Обои: тёплый фон, едва заметный орнамент, швы рулонов; bump — шум + рельеф. */
const createWallpaperTextures = (THREE: Window["THREE"]) => {
  const w = 512;
  const h = 512;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const g = c.getContext("2d");
  if (!g) return null;

  const g0 = g.createLinearGradient(0, 0, w, 0);
  g0.addColorStop(0, "#e2ddd4");
  g0.addColorStop(0.45, "#ebe7df");
  g0.addColorStop(0.55, "#ebe7df");
  g0.addColorStop(1, "#e0dbd2");
  g.fillStyle = g0;
  g.fillRect(0, 0, w, h);

  const vGrad = g.createLinearGradient(0, 0, 0, h);
  vGrad.addColorStop(0, "rgba(255,255,255,0.06)");
  vGrad.addColorStop(0.5, "rgba(0,0,0,0)");
  vGrad.addColorStop(1, "rgba(0,0,0,0.04)");
  g.fillStyle = vGrad;
  g.fillRect(0, 0, w, h);

  const period = 128;
  g.save();
  g.globalAlpha = 0.09;
  g.strokeStyle = "#5c564c";
  g.lineWidth = 1;
  for (let ty = 0; ty < h + period; ty += period) {
    for (let tx = 0; tx < w + period; tx += period) {
      const cx = tx + period / 2;
      const cy = ty + period / 2;
      g.beginPath();
      g.moveTo(cx, cy - period * 0.35);
      g.quadraticCurveTo(cx + period * 0.32, cy, cx, cy + period * 0.35);
      g.quadraticCurveTo(cx - period * 0.32, cy, cx, cy - period * 0.35);
      g.stroke();
      g.beginPath();
      g.arc(cx, cy, period * 0.12, 0, Math.PI * 2);
      g.stroke();
    }
  }
  g.restore();

  g.strokeStyle = "rgba(55,50,45,0.07)";
  g.lineWidth = 1;
  for (let x = 64; x < w; x += 64) {
    g.beginPath();
    g.moveTo(x + 0.5, 0);
    g.lineTo(x + 0.5, h);
    g.stroke();
  }

  for (let x = 0; x < w; x += 2) {
    const a = 0.015 + (x % 5) * 0.004;
    g.strokeStyle = `rgba(95,88,78,${a})`;
    g.beginPath();
    g.moveTo(x, 0);
    g.lineTo(x, h);
    g.stroke();
  }

  for (let i = 0; i < 22000; i++) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    g.fillStyle = Math.random() > 0.5 ? "rgba(255,255,255,0.035)" : "rgba(30,26,22,0.03)";
    g.fillRect(x, y, 1, 1);
  }

  const mapTex = new THREE.CanvasTexture(c);
  mapTex.wrapS = mapTex.wrapT = THREE.RepeatWrapping;

  const bumpC = document.createElement("canvas");
  bumpC.width = w;
  bumpC.height = h;
  const gb = bumpC.getContext("2d");
  if (!gb) return { map: mapTex, bump: mapTex };
  const img = g.getImageData(0, 0, w, h);
  const out = gb.createImageData(w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const r = img.data[i];
    const gr = 0.299 * r + 0.587 * img.data[i + 1] + 0.114 * img.data[i + 2];
    const n = (Math.sin(i * 0.00012) + Math.sin(i * 0.00031)) * 6;
    const v = Math.max(0, Math.min(255, gr + n));
    out.data[i] = v;
    out.data[i + 1] = v;
    out.data[i + 2] = v;
    out.data[i + 3] = 255;
  }
  gb.putImageData(out, 0, 0);

  const bumpTex = new THREE.CanvasTexture(bumpC);
  bumpTex.wrapS = bumpTex.wrapT = THREE.RepeatWrapping;

  return { map: mapTex, bump: bumpTex };
};

const createFabricTexture = (THREE: Window["THREE"], fabricType: FabricType) => {
  if (fabricType === "linen" || fabricType === "cotton" || fabricType === "polyester") {
    return undefined;
  }
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 128;
  const g = c.getContext("2d");
  if (!g) return undefined;
  g.fillStyle = "#888";
  g.fillRect(0, 0, 128, 128);
  if (fabricType === "jacquard") {
    for (let x = 0; x < 128; x += 8) {
      for (let y = 0; y < 128; y += 8) {
        g.fillStyle = (x + y) % 16 === 0 ? "rgba(60,50,40,0.35)" : "rgba(255,255,255,0.08)";
        g.fillRect(x, y, 8, 8);
      }
    }
  } else if (fabricType === "velvet") {
    for (let i = 0; i < 800; i++) {
      const x = Math.random() * 128;
      const y = Math.random() * 128;
      g.fillStyle = `rgba(20,10,40,${0.04 + Math.random() * 0.06})`;
      g.fillRect(x, y, 1.2, 1.2);
    }
  } else if (fabricType === "blackout") {
    g.fillStyle = "#2a2a32";
    g.fillRect(0, 0, 128, 128);
    g.fillStyle = "rgba(255,255,255,0.04)";
    for (let y = 0; y < 128; y += 3) g.fillRect(0, y, 128, 1);
  } else if (fabricType === "silk") {
    const grd = g.createLinearGradient(0, 0, 128, 128);
    grd.addColorStop(0, "rgba(255,255,255,0.25)");
    grd.addColorStop(0.5, "rgba(255,255,255,0)");
    grd.addColorStop(1, "rgba(200,220,255,0.2)");
    g.fillStyle = grd;
    g.fillRect(0, 0, 128, 128);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(2, 3);
  return tex;
};

const lerpTowardMaterialBase = (
  THREE: Window["THREE"],
  fabricType: FabricType,
  baseColorHex: number,
  userHex: string,
): number => {
  const user = new THREE.Color(userHex);
  const base = new THREE.Color(baseColorHex);
  const towardBase =
    fabricType === "blackout"
      ? 0.5
      : fabricType === "velvet" || fabricType === "jacquard"
        ? 0.4
        : fabricType === "silk"
          ? 0.26
          : 0.2;
  return user.clone().lerp(base, towardBase).getHex();
};

const fabricMaterialParams = (
  THREE: Window["THREE"],
  fabricType: FabricType,
  curtainColorHex: string,
): { color: number; roughness: number; metalness: number; map?: unknown } => {
  const map = createFabricTexture(THREE, fabricType);
  switch (fabricType) {
    case "linen":
      return {
        color: lerpTowardMaterialBase(THREE, fabricType, 0xd6ccb8, curtainColorHex),
        roughness: 0.92,
        metalness: 0,
        map,
      };
    case "cotton":
      return {
        color: lerpTowardMaterialBase(THREE, fabricType, 0xf2eee6, curtainColorHex),
        roughness: 0.88,
        metalness: 0,
        map,
      };
    case "silk":
      return {
        color: lerpTowardMaterialBase(THREE, fabricType, 0xfff5ef, curtainColorHex),
        roughness: 0.38,
        metalness: 0.12,
        map,
      };
    case "polyester":
      return {
        color: lerpTowardMaterialBase(THREE, fabricType, 0xe8ecf2, curtainColorHex),
        roughness: 0.55,
        metalness: 0.05,
        map,
      };
    case "velvet":
      return {
        color: lerpTowardMaterialBase(THREE, fabricType, 0x4a2c55, curtainColorHex),
        roughness: 0.78,
        metalness: 0.02,
        map,
      };
    case "jacquard":
      return {
        color: lerpTowardMaterialBase(THREE, fabricType, 0x8b7355, curtainColorHex),
        roughness: 0.72,
        metalness: 0.03,
        map,
      };
    case "blackout":
      return {
        color: lerpTowardMaterialBase(THREE, fabricType, 0x1e1e24, curtainColorHex),
        roughness: 0.95,
        metalness: 0,
        map,
      };
    default:
      return { color: 0xeeeeee, roughness: 0.85, metalness: 0 };
  }
};

const assertThree = (): Window["THREE"] => {
  const T = window.THREE;
  if (!T) {
    throw new Error("Three.js не загружен: проверьте script в index.html");
  }
  return T;
};

export const CurtainRoomPreview = ({
  width,
  height,
  foldRatio,
  fabricType,
  curtainColorHex,
}: CurtainRoomPreviewProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const foldRef = useRef(foldRatio);
  foldRef.current = foldRatio;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const THREE = assertThree();
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xe8e4dc);
    scene.fog = new THREE.Fog(0xe8e4dc, 8, 20);

    const camera = new THREE.PerspectiveCamera(45, PREVIEW_W / PREVIEW_H, 0.08, 80);
    camera.position.set(0, 1.45, 1.85);
    camera.lookAt(0, 1.35, WALL_Z);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(PREVIEW_W, PREVIEW_H);
    renderer.outputEncoding = THREE.sRGBEncoding;
    host.appendChild(renderer.domElement);
    const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());

    const ambient = new THREE.AmbientLight(0xffffff, 0.42);
    scene.add(ambient);
    const dir = new THREE.DirectionalLight(0xfff5e6, 0.85);
    dir.position.set(0.8, 2.2, 2.2);
    scene.add(dir);
    const fill = new THREE.DirectionalLight(0xdde8ff, 0.22);
    fill.position.set(-2, 1, 1);
    scene.add(fill);

    const wallpaper = createWallpaperTextures(THREE);
    if (wallpaper) {
      wallpaper.map.anisotropy = aniso;
      wallpaper.bump.anisotropy = aniso;
    }
    const makeWallpaperMat = (repU: number, repV: number) => {
      if (!wallpaper) {
        return new THREE.MeshStandardMaterial({
          color: 0xdfd8cf,
          roughness: 0.9,
          metalness: 0,
        });
      }
      const mapT = wallpaper.map.clone();
      mapT.anisotropy = aniso;
      mapT.repeat.set(repU, repV);
      mapT.wrapS = mapT.wrapT = THREE.RepeatWrapping;
      mapT.needsUpdate = true;
      const bumpT = wallpaper.bump.clone();
      bumpT.anisotropy = aniso;
      bumpT.repeat.set(repU, repV);
      bumpT.wrapS = bumpT.wrapT = THREE.RepeatWrapping;
      bumpT.needsUpdate = true;
      return new THREE.MeshStandardMaterial({
        color: 0xffffff,
        map: mapT,
        bumpMap: bumpT,
        bumpScale: 0.034,
        roughness: 0.8,
        metalness: 0.02,
      });
    };

    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0xf4f2ed,
      roughness: 0.93,
      metalness: 0,
    });

    const floorTex = createParquetTexture(THREE);
    if (floorTex) floorTex.anisotropy = aniso;
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0xf2e8dc,
      map: floorTex ?? undefined,
      roughness: 0.68,
      metalness: 0.03,
    });

    const floor = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const mkWall = (gw: number, gh: number, x: number, y: number, z: number, ry: number) => {
      const repU = Math.max(1.4, gw * 0.82);
      const repV = Math.max(1.4, gh * 0.62);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(gw, gh), makeWallpaperMat(repU, repV));
      m.position.set(x, y, z);
      m.rotation.y = ry;
      scene.add(m);
    };

    const wh = ROOM.h;
    const hx = ROOM.w / 2;
    const hz = ROOM.d / 2;
    const winL = WIN.w / 2;
    const winBot = WIN.bottomY;
    const winTop = WIN.bottomY + WIN.h;

    mkWall(ROOM.w, wh, 0, wh / 2, -hz, 0);
    mkWall(ROOM.w, wh, 0, wh / 2, hz, Math.PI);
    mkWall(ROOM.d, wh, -hx, wh / 2, 0, Math.PI / 2);
    mkWall(ROOM.d, wh, hx, wh / 2, 0, -Math.PI / 2);

    const ceil = new THREE.Mesh(new THREE.PlaneGeometry(ROOM.w, ROOM.d), ceilingMat);
    ceil.rotation.x = Math.PI / 2;
    ceil.position.y = wh;
    scene.add(ceil);

    const backZ = WALL_Z + 0.004;
    mkWall(hx - winL, wh, (-hx + (-winL)) / 2, wh / 2, backZ, 0);
    mkWall(hx - winL, wh, (winL + hx) / 2, wh / 2, backZ, 0);
    mkWall(WIN.w, wh - winTop, 0, (wh + winTop) / 2, backZ, 0);
    mkWall(WIN.w, winBot, 0, winBot / 2, backZ, 0);

    const glass = new THREE.Mesh(
      new THREE.PlaneGeometry(WIN.w - 0.06, WIN.h - 0.06),
      new THREE.MeshBasicMaterial({
        color: 0xa8d8ff,
        transparent: true,
        opacity: 0.22,
      }),
    );
    glass.position.set(0, winBot + WIN.h / 2, WALL_Z + 0.02);
    scene.add(glass);

    const curtainGroup = new THREE.Group();
    scene.add(curtainGroup);

    let raf = 0;
    let disposed = false;

    type CurtainPanel = {
      geo: {
        attributes: { position: { array: Float32Array; needsUpdate: boolean } };
        computeVertexNormals: () => void;
        dispose: () => void;
      };
      base: Float32Array;
    };
    const curtainsState: { left: CurtainPanel | null; right: CurtainPanel | null } = {
      left: null,
      right: null,
    };

    const rebuildCurtains = () => {
      while (curtainGroup.children.length) {
        const ch = curtainGroup.children[0];
        curtainGroup.remove(ch);
        const mesh = ch as { geometry?: { dispose: () => void }; material?: { dispose: () => void } };
        mesh.geometry?.dispose();
        mesh.material?.dispose();
      }
      curtainsState.left = null;
      curtainsState.right = null;

      const W = Math.min(Math.max(width, 1), 3);
      const H = Math.min(Math.max(height, 1.5), 3);
      const halfW = W / 2;
      const segsX = 22;
      const segsY = 28;

      const fp = fabricMaterialParams(THREE, fabricType, curtainColorHex);
      const mat = new THREE.MeshStandardMaterial({
        color: fp.color,
        roughness: fp.roughness,
        metalness: fp.metalness,
        map: fp.map as never,
        side: THREE.DoubleSide,
      });

      const makePanel = (sign: 1 | -1) => {
        const geo = new THREE.PlaneGeometry(halfW, H, segsX, segsY);
        const pos = geo.attributes.position as { array: Float32Array };
        const base = new Float32Array(pos.array.length);
        base.set(pos.array);
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(sign * (halfW / 2), ROD_Y - H / 2, CURTAIN_Z);
        curtainGroup.add(mesh);
        return { geo, base };
      };

      curtainsState.left = makePanel(-1);
      curtainsState.right = makePanel(1);
    };

    rebuildCurtains();

    const updateVertices = (t: number) => {
      const halfW = Math.min(Math.max(width, 1), 3) / 2;
      const freq = 2 + foldRef.current * 5;
      const amp = 0.045 + foldRef.current * 0.028;
      const wind = 0.012;

      const apply = (side: "left" | "right") => {
        const st = curtainsState[side];
        if (!st) return;
        const pos = st.geo.attributes.position as { array: Float32Array; needsUpdate: boolean };
        const arr = pos.array;
        const base = st.base;
        for (let i = 0; i < arr.length; i += 3) {
          const x = base[i];
          const y = base[i + 1];
          const u = (x + halfW / 2) / Math.max(halfW, 0.01);
          const fold =
            amp * Math.sin(u * Math.PI * 2 * freq * 0.4 + y * 1.15) +
            amp * 0.38 * Math.sin(u * Math.PI * 6 * foldRef.current + y * 2.3);
          const wobble = wind * Math.sin(t * 1.7 + u * 8 + y * 3);
          arr[i] = base[i];
          arr[i + 1] = base[i + 1];
          arr[i + 2] = base[i + 2] + fold + wobble;
        }
        pos.needsUpdate = true;
        st.geo.computeVertexNormals();
      };
      apply("left");
      apply("right");
    };

    let drag = false;
    let prevX = 0;
    let yaw = 0.28;
    let pitch = 0.08;
    const target = new THREE.Vector3(0, 1.32, WALL_Z);
    const radius = 4.0;
    const onDown = (e: MouseEvent) => {
      drag = true;
      prevX = e.clientX;
    };
    const onUp = () => {
      drag = false;
    };
    const onMove = (e: MouseEvent) => {
      if (!drag) return;
      const dx = e.clientX - prevX;
      prevX = e.clientX;
      yaw -= dx * 0.006;
    };
    renderer.domElement.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);

    const tick = (time: number) => {
      if (disposed) return;
      const t = time * 0.001;
      updateVertices(t);
      const p = pitch;
      const y = yaw;
      camera.position.x = target.x + radius * Math.sin(y) * Math.cos(p);
      camera.position.y = target.y + radius * Math.sin(p);
      camera.position.z = target.z + radius * Math.cos(y) * Math.cos(p);
      camera.lookAt(target);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(() => {
      if (!hostRef.current || disposed) return;
      const w = Math.max(hostRef.current.clientWidth, PREVIEW_W);
      const h = Math.max(Math.round((w * PREVIEW_H) / PREVIEW_W), PREVIEW_H);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    });
    ro.observe(host);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      renderer.domElement.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      while (curtainGroup.children.length) {
        const ch = curtainGroup.children[0];
        curtainGroup.remove(ch);
        const mesh = ch as { geometry?: { dispose: () => void }; material?: { dispose: () => void } };
        mesh.geometry?.dispose();
        mesh.material?.dispose();
      }
      scene.traverse((obj: { geometry?: { dispose: () => void }; material?: unknown }) => {
        obj.geometry?.dispose();
        const mat = obj.material;
        if (mat && typeof mat === "object" && "dispose" in mat && typeof (mat as { dispose: () => void }).dispose === "function") {
          (mat as { dispose: () => void }).dispose();
        }
      });
      if (wallpaper) {
        wallpaper.map.dispose();
        wallpaper.bump.dispose();
      }
      renderer.dispose();
      if (renderer.domElement.parentElement === host) {
        host.removeChild(renderer.domElement);
      }
    };
  }, [width, height, fabricType, curtainColorHex]);

  return (
    <div
      ref={hostRef}
      className="curtain-room-preview"
      style={{
        width: "min(100%, 440px)",
        minWidth: 280,
        aspectRatio: `${PREVIEW_W} / ${PREVIEW_H}`,
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid #d0ccc4",
        background: "#1a1a1a",
      }}
      role="img"
      aria-label="Предпросмотр штор в комнате, перетаскивание мышью вращает камеру"
    />
  );
};
