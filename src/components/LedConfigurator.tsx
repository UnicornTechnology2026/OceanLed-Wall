import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Box,
  CheckCircle,
  Columns3,
  Cylinder,
  RotateCcw,
  Spline,
} from "lucide-react";
import Reveal from "./Reveal";
import { useSiteSettings } from "../context/SiteSettingsContext";
import type { LedConfiguration } from "../context/SiteSettingsContext";

/* ------------------------------------------------------------------ */
/* Types and constants                                                 */
/* ------------------------------------------------------------------ */

type ShapeKey = "rectangular" | "curved" | "corner" | "pillar";
type ContentKey = "brand" | "bars" | "grid";

interface Config {
  shape: ShapeKey;
  width: number; // metres (flat width, arc length or circumference)
  height: number; // metres
  angle: number; // degrees, curved only
  inward: boolean; // curved: concave, corner: inside corner
  pitch: number; // mm
  content: ContentKey;
  cabinetGrid: boolean;
  person: boolean;
}

const DEFAULT_CONFIG: Config = {
  shape: "rectangular",
  width: 6,
  height: 3,
  angle: 60,
  inward: true,
  pitch: 2.5,
  content: "brand",
  cabinetGrid: true,
  person: true,
};

const CABINET = 0.5; // metres, 500 x 500 mm cabinets
const BOTTOM_OFFSET = 0.6; // screen bottom edge above the floor, metres
const FT_PER_M = 3.28084;

const SHAPES: {
  key: ShapeKey;
  label: string;
  hint: string;
  icon: typeof Box;
}[] = [
  {
    key: "rectangular",
    label: "Rectangular",
    hint: "Flat video wall",
    icon: Box,
  },
  { key: "curved", label: "Curved", hint: "Arc / cinema curve", icon: Spline },
  {
    key: "corner",
    label: "Corner (L-shape)",
    hint: "Two walls at 90°",
    icon: Columns3,
  },
  {
    key: "pillar",
    label: "Pillar",
    hint: "Full cylinder wrap",
    icon: Cylinder,
  },
];

const PITCHES = [1.5, 2.5, 3, 4, 6, 10];

const CONTENTS: { key: ContentKey; label: string }[] = [
  { key: "brand", label: "Brand" },
  { key: "bars", label: "Colour bars" },
  { key: "grid", label: "Size grid" },
];

const fmt = (n: number, digits = 1) => n.toFixed(digits).replace(/\.0+$/, "");

/* ------------------------------------------------------------------ */
/* Specs                                                               */
/* ------------------------------------------------------------------ */

function getSpecs(c: Config) {
  const cols = Math.round(c.width / CABINET);
  const rows = Math.round(c.height / CABINET);
  const resX = Math.round((c.width * 1000) / c.pitch);
  const resY = Math.round((c.height * 1000) / c.pitch);
  const area = c.width * c.height;

  let detail = "";
  if (c.shape === "curved") {
    const radius = c.width / THREE.MathUtils.degToRad(c.angle);
    detail = `${c.angle}° ${c.inward ? "concave" : "convex"} curve, radius ${fmt(radius)} m`;
  } else if (c.shape === "corner") {
    detail = `${c.inward ? "Inside" : "Outside"} corner, two wings of ${fmt(c.width / 2)} m`;
  } else if (c.shape === "pillar") {
    detail = `Diameter ${fmt(c.width / Math.PI, 2)} m`;
  }

  return {
    cols,
    rows,
    cabinets: cols * rows,
    resX,
    resY,
    megapixels: (resX * resY) / 1e6,
    area,
    areaFt: area * FT_PER_M * FT_PER_M,
    detail,
  };
}

/* ------------------------------------------------------------------ */
/* Three.js helpers                                                    */
/* ------------------------------------------------------------------ */

// Top-down path (x, z) of the screen surface, left to right as the
// viewer (standing at +z, looking towards -z) sees it.
function buildPath(c: Config): THREE.Vector2[] {
  const w = c.width;
  switch (c.shape) {
    case "rectangular":
      return [new THREE.Vector2(-w / 2, 0), new THREE.Vector2(w / 2, 0)];

    case "curved": {
      const alpha = THREE.MathUtils.degToRad(c.angle);
      const radius = w / alpha;
      const sign = c.inward ? 1 : -1;
      const segments = Math.max(8, Math.ceil(c.angle / 3));
      const pts: THREE.Vector2[] = [];
      for (let i = 0; i <= segments; i++) {
        const phi = -alpha / 2 + (alpha * i) / segments;
        pts.push(
          new THREE.Vector2(
            radius * Math.sin(phi),
            sign * radius * (1 - Math.cos(phi)),
          ),
        );
      }
      return pts;
    }

    case "corner": {
      const a = w / 2 / Math.SQRT2;
      return c.inward
        ? [
            new THREE.Vector2(-a, 0),
            new THREE.Vector2(0, -a),
            new THREE.Vector2(a, 0),
          ]
        : [
            new THREE.Vector2(-a, -a),
            new THREE.Vector2(0, 0),
            new THREE.Vector2(a, -a),
          ];
    }

    case "pillar": {
      const radius = w / (2 * Math.PI);
      const segments = 72;
      const pts: THREE.Vector2[] = [];
      for (let i = 0; i <= segments; i++) {
        const phi = -Math.PI + (2 * Math.PI * i) / segments;
        pts.push(
          new THREE.Vector2(radius * Math.sin(phi), radius * Math.cos(phi)),
        );
      }
      return pts;
    }
  }
}

// Extrudes the path upwards into a surface whose front face looks at the viewer.
function stripGeometry(
  path: THREE.Vector2[],
  height: number,
): THREE.BufferGeometry {
  const lengths = [0];
  for (let i = 1; i < path.length; i++) {
    lengths.push(lengths[i - 1] + path[i].distanceTo(path[i - 1]));
  }
  const total = lengths[lengths.length - 1];

  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  path.forEach((p, i) => {
    const u = lengths[i] / total;
    positions.push(p.x, 0, p.y, p.x, height, p.y);
    uvs.push(u, 0, u, 1);
  });
  for (let i = 0; i < path.length - 1; i++) {
    const a = i * 2;
    const b = (i + 1) * 2;
    indices.push(a, b, b + 1, a, b + 1, a + 1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  return geo;
}

function makeTexture(c: Config, maxAnisotropy: number): THREE.CanvasTexture {
  const ppm = Math.min(128, 2048 / Math.max(c.width, c.height)); // pixels per metre
  const W = Math.round(c.width * ppm);
  const H = Math.round(c.height * ppm);

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  if (ctx) {
    if (c.content === "brand") {
      const g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, "#06203d");
      g.addColorStop(0.5, "#0077c8");
      g.addColorStop(1, "#00d4c8");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);

      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.beginPath();
      ctx.arc(W * 0.2, H * 0.8, H * 0.7, 0, Math.PI * 2);
      ctx.arc(W * 0.8, H * 0.1, H * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `bold ${Math.round(H * 0.2)}px sans-serif`;
      ctx.fillText("OCEAN LED", W / 2, H * 0.44);
      ctx.font = `${Math.round(H * 0.07)}px sans-serif`;
      ctx.fillStyle = "rgba(255,255,255,0.8)";
      ctx.fillText("Premium LED Display Solutions", W / 2, H * 0.62);
    } else if (c.content === "bars") {
      const colors = [
        "#c8c8c8",
        "#c8c800",
        "#00c8c8",
        "#00c800",
        "#c800c8",
        "#c80000",
        "#0000c8",
      ];
      const barW = W / colors.length;
      colors.forEach((col, i) => {
        ctx.fillStyle = col;
        ctx.fillRect(i * barW, 0, barW + 1, H * 0.72);
      });
      const g = ctx.createLinearGradient(0, 0, W, 0);
      g.addColorStop(0, "#000000");
      g.addColorStop(1, "#ffffff");
      ctx.fillStyle = g;
      ctx.fillRect(0, H * 0.72, W, H * 0.28);
    } else {
      ctx.fillStyle = "#07121f";
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = "rgba(0,200,255,0.45)";
      ctx.lineWidth = 2;
      for (let x = 0; x <= c.width + 0.001; x += 1) {
        ctx.beginPath();
        ctx.moveTo(x * ppm, 0);
        ctx.lineTo(x * ppm, H);
        ctx.stroke();
      }
      for (let y = 0; y <= c.height + 0.001; y += 1) {
        ctx.beginPath();
        ctx.moveTo(0, y * ppm);
        ctx.lineTo(W, y * ppm);
        ctx.stroke();
      }
      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = `bold ${Math.round(H * 0.14)}px sans-serif`;
      ctx.fillText(`${fmt(c.width)} × ${fmt(c.height)} m`, W / 2, H / 2);
    }

    if (c.cabinetGrid) {
      ctx.strokeStyle = "rgba(0,0,0,0.4)";
      ctx.lineWidth = 1;
      const step = CABINET * ppm;
      for (let x = step; x < W - 1; x += step) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = step; y < H - 1; y += step) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = maxAnisotropy;
  return texture;
}

function buildScreen(c: Config, maxAnisotropy: number) {
  const group = new THREE.Group();

  const geometry = stripGeometry(buildPath(c), c.height);
  const front = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({
      map: makeTexture(c, maxAnisotropy),
      side: THREE.FrontSide,
      toneMapped: false,
    }),
  );
  const back = new THREE.Mesh(
    geometry,
    new THREE.MeshBasicMaterial({ color: 0x10161f, side: THREE.BackSide }),
  );
  const outline = new THREE.LineSegments(
    new THREE.EdgesGeometry(geometry, 20),
    new THREE.LineBasicMaterial({ color: 0x7f9bbd }),
  );

  const screen = new THREE.Group();
  screen.add(back, front, outline);
  screen.position.y = BOTTOM_OFFSET;
  group.add(screen);

  const box = new THREE.Box3().setFromObject(screen);

  if (c.person) {
    const person = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.2, 1.3, 4, 12),
      new THREE.MeshBasicMaterial({
        color: 0x8aa2c0,
        transparent: true,
        opacity: 0.6,
      }),
    );
    person.position.set(box.min.x - 0.9, 0.85, box.max.z + 0.7);
    group.add(person);
  }

  return { group, box };
}

function disposeObject(root: THREE.Object3D) {
  root.traverse((child) => {
    const obj = child as THREE.Mesh;
    obj.geometry?.dispose();
    const mats = Array.isArray(obj.material)
      ? obj.material
      : obj.material
        ? [obj.material]
        : [];
    mats.forEach((m) => {
      (m as THREE.MeshBasicMaterial).map?.dispose();
      m.dispose();
    });
  });
}

interface ThreeState {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  screen: THREE.Group | null;
  lastShape: ShapeKey | null;
  render: () => void;
}

function fitCamera(t: ThreeState, box: THREE.Box3, keepDirection: boolean) {
  const { camera, controls } = t;
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());

  const vFov = THREE.MathUtils.degToRad(camera.fov);
  const hFov = 2 * Math.atan(Math.tan(vFov / 2) * camera.aspect);
  const distV = (size.y + 1) / (2 * Math.tan(vFov / 2));
  const distH = (Math.max(size.x, size.z) + 1) / (2 * Math.tan(hFov / 2));
  const dist = Math.max(distV, distH) * 1.3 + size.z / 2 + 1;

  const dir = keepDirection
    ? camera.position.clone().sub(controls.target).normalize()
    : new THREE.Vector3(0.35, 0.18, 1).normalize();

  controls.target.copy(center);
  camera.position.copy(center).addScaledVector(dir, dist);
  controls.update();
}

/* ------------------------------------------------------------------ */
/* Shared styles                                                       */
/* ------------------------------------------------------------------ */

const cardClass =
  "relative overflow-hidden rounded-[28px] border border-white/10 bg-linear-to-b from-[#0a1220] to-[#060b14] shadow-[0_0_80px_rgba(0,0,0,0.6)]";

const TopEdge = () => (
  <div className="pointer-events-none absolute inset-x-10 top-0 z-10 h-px bg-linear-to-r from-transparent via-ocean-cyan/70 to-transparent" />
);

const STEPS = ["Pick a shape", "Set size & pixel pitch", "Request your quote"];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

interface QuoteForm {
  name: string;
  phone: string;
  email: string;
  notes: string;
}

type QuoteErrors = Partial<Record<"name" | "phone" | "email", string>>;

const fieldClass =
  "w-full rounded-xl border bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-ocean-cyan/50 focus:ring-2 focus:ring-ocean-cyan/20";

const chipClass = (active: boolean) =>
  `rounded-lg border px-3 py-2 text-sm transition-colors ${
    active
      ? "border-ocean-cyan/60 bg-ocean-cyan/15 text-white"
      : "border-white/10 bg-white/[0.03] text-white/60 hover:border-ocean-cyan/40"
  }`;

export default function LedConfigurator() {
  const { addInquiry } = useSiteSettings();

  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [webglFailed, setWebglFailed] = useState(false);
  const [form, setForm] = useState<QuoteForm>({
    name: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [errors, setErrors] = useState<QuoteErrors>({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const viewportRef = useRef<HTMLDivElement>(null);
  const three = useRef<ThreeState | null>(null);

  const specs = useMemo(() => getSpecs(config), [config]);

  const set = <K extends keyof Config>(key: K, value: Config[K]) =>
    setConfig((prev) => ({ ...prev, [key]: value }));

  /* Create the scene once */
  useEffect(() => {
    const host = viewportRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setWebglFailed(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);
    renderer.domElement.className = "block h-full w-full";

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 400);
    camera.position.set(6, 4, 14);

    const grid = new THREE.GridHelper(80, 80, 0x2b4a6b, 0x16293f);
    (grid.material as THREE.Material).transparent = true;
    (grid.material as THREE.Material).opacity = 0.5;
    scene.add(grid);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 90;
    controls.maxPolarAngle = Math.PI / 2 - 0.02;

    const render = () => renderer.render(scene, camera);
    controls.addEventListener("change", render);

    const resize = () => {
      const { clientWidth, clientHeight } = host;
      if (!clientWidth || !clientHeight) return;
      renderer.setSize(clientWidth, clientHeight, false);
      camera.aspect = clientWidth / clientHeight;
      camera.updateProjectionMatrix();
      render();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    three.current = {
      renderer,
      scene,
      camera,
      controls,
      screen: null,
      lastShape: null,
      render,
    };

    return () => {
      observer.disconnect();
      controls.removeEventListener("change", render);
      controls.dispose();
      disposeObject(scene);
      renderer.dispose();
      renderer.domElement.remove();
      three.current = null;
    };
  }, []);

  /* Rebuild the screen whenever the configuration changes */
  useEffect(() => {
    const t = three.current;
    if (!t) return;

    if (t.screen) {
      t.scene.remove(t.screen);
      disposeObject(t.screen);
    }

    const { group, box } = buildScreen(
      config,
      t.renderer.capabilities.getMaxAnisotropy(),
    );
    t.scene.add(group);
    t.screen = group;

    fitCamera(t, box, t.lastShape === config.shape);
    t.lastShape = config.shape;
    t.render();
  }, [config]);

  const resetView = () => {
    const t = three.current;
    if (!t || !t.screen) return;
    fitCamera(t, new THREE.Box3().setFromObject(t.screen), false);
    t.render();
  };

  const validate = () => {
    const next: QuoteErrors = {};
    if (!form.name.trim()) next.name = "Please enter your name";
    if (form.phone.replace(/\D/g, "").length < 10)
      next.phone = "Enter a valid phone number";
    if (form.email.trim() && !/^\S+@\S+\.\S+$/.test(form.email))
      next.email = "Enter a valid email";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || !validate()) return;

    const shapeLabel =
      SHAPES.find((s) => s.key === config.shape)?.label ?? config.shape;
    const contentLabel =
      CONTENTS.find((ct) => ct.key === config.content)?.label ?? config.content;
    const hasOrientation =
      config.shape === "curved" || config.shape === "corner";
    const orientation = hasOrientation
      ? config.shape === "curved"
        ? config.inward
          ? "Concave (wraps viewer)"
          : "Convex (bulges out)"
        : config.inward
          ? "Inside corner"
          : "Outside corner"
      : null;

    const configuration: LedConfiguration = {
      shape: config.shape,
      shape_label: shapeLabel,
      shape_detail: specs.detail || "Flat",
      width_m: config.width,
      height_m: config.height,
      width_ft: Number((config.width * FT_PER_M).toFixed(1)),
      height_ft: Number((config.height * FT_PER_M).toFixed(1)),
      area_sqm: Number(specs.area.toFixed(2)),
      area_sqft: Math.round(specs.areaFt),
      curve_angle_deg: config.shape === "curved" ? config.angle : null,
      orientation,
      pixel_pitch: `P${config.pitch}`,
      preview_content: contentLabel,
      show_cabinet_grid: config.cabinetGrid,
      show_person: config.person,
      cabinet_columns: specs.cols,
      cabinet_rows: specs.rows,
      cabinets_total: specs.cabinets,
      cabinet_size_mm: "500 × 500",
      resolution_x: specs.resX,
      resolution_y: specs.resY,
      megapixels: Number(specs.megapixels.toFixed(2)),
      custom_requirements: form.notes.trim(),
    };

    const lines = [
      "3D LED Display Configurator enquiry",
      "",
      `Shape: ${shapeLabel}${specs.detail ? ` (${specs.detail})` : ""}`,
      `Size: ${fmt(config.width)} × ${fmt(config.height)} m (${fmt(config.width * FT_PER_M)} × ${fmt(
        config.height * FT_PER_M,
      )} ft), ${fmt(specs.area)} sq m`,
      `Pixel pitch: P${config.pitch}`,
      `Resolution: ${specs.resX} × ${specs.resY} px`,
      `Cabinets: ${specs.cols} × ${specs.rows} = ${specs.cabinets} (500 × 500 mm)`,
      `Custom requirements: ${form.notes.trim() || "None"}`,
    ];

    setSubmitting(true);
    setSubmitError("");
    try {
      await addInquiry({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        message: lines.join("\n"),
        source: "led_configurator",
        configuration,
      });
      setSent(true);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "We couldn't send your request. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setConfig(DEFAULT_CONFIG);
    setForm({ name: "", phone: "", email: "", notes: "" });
    setErrors({});
    setSubmitError("");
    setSent(false);
  };

  const insideLabel =
    config.shape === "curved"
      ? ["Convex (bulges out)", "Concave (wraps viewer)"]
      : ["Outside corner", "Inside corner"];

  const shapeLabel = SHAPES.find((s) => s.key === config.shape)?.label ?? "";

  const specRows: [string, string, string][] = [
    [
      "Display size",
      `${fmt(config.width)} × ${fmt(config.height)} m`,
      `${fmt(config.width * FT_PER_M)} × ${fmt(config.height * FT_PER_M)} ft`,
    ],
    ["Area", `${fmt(specs.area)} sq m`, `${fmt(specs.areaFt, 0)} sq ft`],
    [
      "Cabinets",
      `${specs.cabinets} pcs`,
      `${specs.cols} × ${specs.rows} (500 × 500 mm)`,
    ],
    [
      "Resolution",
      `${specs.resX} × ${specs.resY}`,
      `${fmt(specs.megapixels, 2)} megapixels`,
    ],
    ["Pixel pitch", `P${config.pitch}`, `View from ${fmt(config.pitch)} m +`],
    ["Shape", shapeLabel, specs.detail || "Flat"],
  ];

  return (
    <section
      id="configurator"
      className="relative overflow-x-clip bg-ocean-dark py-20 md:py-28"
    >
      {/* soft cyan glow, same style as the portfolio section */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_15%_25%,rgba(0,229,255,0.08),transparent_55%)]" />
      <div className="pointer-events-none absolute -right-40 top-1/3 h-96 w-96 rounded-full bg-ocean-cyan/10 blur-[140px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ───────── INTRO ───────── */}
        <Reveal>
          <h2 className="mt-5 max-w-4xl text-3xl font-extrabold uppercase leading-[1.1] tracking-tighter text-white sm:text-5xl lg:text-6xl">
            Design your LED display
            <span className="block bg-linear-to-r from-slate-400 via-slate-300 to-ocean-cyan bg-clip-text text-transparent">
              see it before you build it.
            </span>
          </h2>

          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-lg">
            Change the settings and watch the 3D preview update right beside
            them. Drag the preview to rotate it, then send the finished design
            to us for a quote.
          </p>

          <ol className="mt-6 flex flex-wrap gap-3">
            {STEPS.map((label, i) => (
              <li
                key={label}
                className="inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/3 py-1.5 pl-1.5 pr-4 text-xs font-medium uppercase tracking-wider text-white/70 sm:text-sm"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ocean-cyan text-xs font-bold text-black">
                  {i + 1}
                </span>
                {label}
              </li>
            ))}
          </ol>
        </Reveal>

        {/* ───────── MAIN : SETTINGS (left) + STICKY PREVIEW (right) ───────── */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_1.1fr] lg:items-start">
          {/* 3D PREVIEW - stays on screen while the settings scroll */}
          <div className="sticky top-20 z-20 lg:top-28 lg:order-2">
            <div className={`${cardClass} p-2 sm:p-4 lg:p-6`}>
              <TopEdge />

              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-linear-to-b from-[#0a1626] to-[#050b14]">
                <div
                  ref={viewportRef}
                  className="h-56 w-full touch-none sm:h-72 lg:h-96"
                />
                {webglFailed && (
                  <div className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-white/60">
                    3D preview is not supported on this device. You can still
                    choose your configuration and request a quote.
                  </div>
                )}
                <p className="pointer-events-none absolute bottom-3 left-4 hidden text-[10px] uppercase tracking-widest text-white/40 sm:block sm:text-xs">
                  Drag to rotate · Scroll or pinch to zoom
                </p>
                <button
                  type="button"
                  onClick={resetView}
                  className="btn-choice absolute bottom-3 right-4 gap-1.5 px-3 py-1.5 text-xs"
                >
                  <RotateCcw size={12} /> Reset view
                </button>
              </div>

              {/* compact summary on phones */}
              <p className="mt-2 px-1 text-center text-xs text-white/60 lg:hidden">
                <span className="font-semibold text-white">{shapeLabel}</span> ·{" "}
                {fmt(config.width)} × {fmt(config.height)} m · P{config.pitch} ·{" "}
                {specs.cabinets} cabinets
              </p>

              {/* full specs on larger screens */}
              <dl className="mt-4 hidden grid-cols-3 gap-3 lg:grid">
                {specRows.map(([label, value, sub]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-white/10 bg-white/3 p-3"
                  >
                    <dt className="text-[11px] uppercase tracking-wider text-white/40">
                      {label}
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-white">
                      {value}
                    </dd>
                    <dd className="mt-0.5 text-[11px] leading-snug text-white/40">
                      {sub}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* SETTINGS + QUOTE */}
          <div className="space-y-6 lg:order-1">
            {/* Step 1 : controls */}
            <Reveal>
              <div className={`${cardClass} space-y-6 p-6 sm:p-8`}>
                <TopEdge />

                <div>
                  <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/45">
                    <span className="h-2 w-2 rounded-full bg-ocean-cyan shadow-[0_0_10px_rgba(0,229,255,0.9)]" />
                    Step 1 · Configure
                  </p>
                  <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">
                    Customise your display
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">
                    Changes appear in the 3D preview straight away.
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-white/70">
                    Shape
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {SHAPES.map((s) => (
                      <button
                        key={s.key}
                        type="button"
                        aria-pressed={config.shape === s.key}
                        onClick={() => set("shape", s.key)}
                        className="btn-choice items-start gap-2.5 p-3 text-left"
                      >
                        <s.icon
                          size={18}
                          className="mt-0.5 shrink-0 text-ocean-cyan"
                        />
                        <span>
                          <span className="block text-sm font-semibold text-white">
                            {s.label}
                          </span>
                          <span className="block text-xs text-white/45">
                            {s.hint}
                          </span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="cfg-width"
                    className="flex justify-between text-sm text-white/70"
                  >
                    <span>
                      {config.shape === "pillar" ? "Circumference" : "Width"}
                    </span>
                    <span className="font-medium text-white">
                      {fmt(config.width)} m
                    </span>
                  </label>
                  <input
                    id="cfg-width"
                    type="range"
                    min={config.shape === "pillar" ? 2 : 1}
                    max={20}
                    step={0.5}
                    value={config.width}
                    onChange={(e) => set("width", Number(e.target.value))}
                    className="mt-2 w-full accent-ocean-cyan"
                  />
                </div>

                <div>
                  <label
                    htmlFor="cfg-height"
                    className="flex justify-between text-sm text-white/70"
                  >
                    <span>Height</span>
                    <span className="font-medium text-white">
                      {fmt(config.height)} m
                    </span>
                  </label>
                  <input
                    id="cfg-height"
                    type="range"
                    min={1}
                    max={10}
                    step={0.5}
                    value={config.height}
                    onChange={(e) => set("height", Number(e.target.value))}
                    className="mt-2 w-full accent-ocean-cyan"
                  />
                </div>

                {config.shape === "curved" && (
                  <div>
                    <label
                      htmlFor="cfg-angle"
                      className="flex justify-between text-sm text-white/70"
                    >
                      <span>Curve angle</span>
                      <span className="font-medium text-white">
                        {config.angle}°
                      </span>
                    </label>
                    <input
                      id="cfg-angle"
                      type="range"
                      min={15}
                      max={180}
                      step={5}
                      value={config.angle}
                      onChange={(e) => set("angle", Number(e.target.value))}
                      className="mt-2 w-full accent-ocean-cyan"
                    />
                  </div>
                )}

                {(config.shape === "curved" || config.shape === "corner") && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => set("inward", false)}
                      className={chipClass(!config.inward)}
                    >
                      {insideLabel[0]}
                    </button>
                    <button
                      type="button"
                      onClick={() => set("inward", true)}
                      className={chipClass(config.inward)}
                    >
                      {insideLabel[1]}
                    </button>
                  </div>
                )}

                <div>
                  <p className="mb-2 text-sm font-medium text-white/70">
                    Pixel pitch
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PITCHES.map((p) => (
                      <button
                        key={p}
                        type="button"
                        aria-pressed={config.pitch === p}
                        onClick={() => set("pitch", p)}
                        className="btn-choice px-3 py-2 text-sm"
                      >
                        P{p}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-white/40">
                    A smaller number means a sharper picture for close viewing;
                    a larger number suits longer viewing distances.
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-sm font-medium text-white/70">
                    Preview content
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {CONTENTS.map((ct) => (
                      <button
                        key={ct.key}
                        type="button"
                        aria-pressed={config.content === ct.key}
                        onClick={() => set("content", ct.key)}
                        className={chipClass(config.content === ct.key)}
                      >
                        {ct.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.cabinetGrid}
                      onChange={(e) => set("cabinetGrid", e.target.checked)}
                      className="accent-ocean-cyan"
                    />
                    Show cabinet grid
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2">
                    <input
                      type="checkbox"
                      checked={config.person}
                      onChange={(e) => set("person", e.target.checked)}
                      className="accent-ocean-cyan"
                    />
                    Show person (1.7 m)
                  </label>
                </div>
              </div>
            </Reveal>

            {/* Step 2 : quote */}
            <Reveal>
              <div className={`${cardClass} p-6 sm:p-8`}>
                <TopEdge />

                {sent ? (
                  <div className="py-10 text-center">
                    <CheckCircle
                      className="mx-auto mb-3 text-ocean-cyan"
                      size={44}
                      strokeWidth={1.5}
                    />
                    <h3 className="mb-1 text-lg font-bold uppercase tracking-wide text-white">
                      Quote Request Received
                    </h3>
                    <p className="mb-4 text-sm text-white/60">
                      Our team will review your design and get back to you
                      shortly.
                    </p>
                    <button
                      type="button"
                      onClick={reset}
                      className="text-sm font-medium text-ocean-cyan hover:underline"
                    >
                      Design another display
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-4"
                  >
                    <div>
                      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/45">
                        <span className="h-2 w-2 rounded-full bg-ocean-cyan shadow-[0_0_10px_rgba(0,229,255,0.9)]" />
                        Step 2 · Get a quote
                      </p>
                      <h3 className="mt-2 text-2xl font-bold tracking-tight text-white">
                        Request a quote for this design
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-white/55">
                        Your size, shape and pixel pitch are sent with the
                        request. Our team replies with pricing and next steps.
                      </p>
                    </div>

                    <div className="rounded-xl border border-ocean-cyan/20 bg-ocean-cyan/5 p-4 text-sm text-white/70">
                      <span className="font-semibold text-white">
                        {shapeLabel}
                      </span>{" "}
                      · {fmt(config.width)} × {fmt(config.height)} m · P
                      {config.pitch} · {specs.cabinets} cabinets
                    </div>

                    <div>
                      <input
                        aria-label="Name"
                        type="text"
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        placeholder="Your name *"
                        className={`${fieldClass} ${errors.name ? "border-red-400/60" : "border-white/10"}`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-red-400">
                          {errors.name}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        aria-label="Phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) =>
                          setForm({ ...form, phone: e.target.value })
                        }
                        placeholder="Phone * (+91 98765 43210)"
                        className={`${fieldClass} ${errors.phone ? "border-red-400/60" : "border-white/10"}`}
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-400">
                          {errors.phone}
                        </p>
                      )}
                    </div>
                    <div>
                      <input
                        aria-label="Email"
                        type="email"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        placeholder="Email (optional)"
                        className={`${fieldClass} ${errors.email ? "border-red-400/60" : "border-white/10"}`}
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-400">
                          {errors.email}
                        </p>
                      )}
                    </div>
                    <textarea
                      aria-label="Custom requirements"
                      rows={4}
                      value={form.notes}
                      onChange={(e) =>
                        setForm({ ...form, notes: e.target.value })
                      }
                      placeholder="Custom shape or other requirements (optional)"
                      className={`${fieldClass} resize-none border-white/10`}
                    />

                    {submitError && (
                      <p
                        role="alert"
                        className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300"
                      >
                        {submitError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex w-full items-center justify-center gap-3 rounded-md bg-ocean-cyan px-6 py-4 text-sm font-bold uppercase tracking-wide text-black shadow-[0_0_30px_rgba(0,229,255,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_0_45px_rgba(0,229,255,0.55)] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {submitting ? "Sending…" : "Request Quote"}
                      <span className="h-1.5 w-1.5 rounded-full bg-black" />
                    </button>
                  </form>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}
