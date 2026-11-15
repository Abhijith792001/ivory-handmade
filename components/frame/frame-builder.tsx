"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, CheckCircle2, ImagePlus, Loader2, RotateCcw, RotateCw, ShoppingBag, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { HeartDivider } from "@/components/brand/botanical";
import { FrameStage, SizeComparison, WallPreview } from "./preview-views";
import { mouldingBackground } from "./framed-photo";
import { useCart } from "@/store/cart";
import { dpiVerdict, effectiveDpi, isSquare, largestGoodSize, printDims, type Orientation } from "@/lib/frame";
import { framePrice } from "@/lib/pricing";
import { cropToCanvas, canvasToBlob, loadPhoto, renderFramedPreview, thumbnailDataUrl, validatePhoto, type LoadedPhoto } from "@/lib/image";
import { extFor, uploadToStorage } from "@/lib/upload";
import { script } from "@/lib/fonts";
import { cn, formatINR, uid } from "@/lib/utils";
import type { FrameExtras, FrameSize, FrameStyle } from "@/types";

const STEPS = ["Photo", "Size", "Crop", "Style", "Preview"] as const;

export function FrameBuilder({ sizes, styles, extras }: { sizes: FrameSize[]; styles: FrameStyle[]; extras: FrameExtras }) {
  const addToCart = useCart((s) => s.add);
  const [step, setStep] = useState(0);

  // Photo
  const [photo, setPhoto] = useState<LoadedPhoto | null>(null);
  const [fileName, setFileName] = useState("");
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [loadingPhoto, setLoadingPhoto] = useState(false);
  const [uploadState, setUploadState] = useState<"idle" | "uploading" | "done" | "error" | "local">("idle");
  const uploadRef = useRef<Promise<string | null> | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Size & crop
  const [sizeId, setSizeId] = useState(sizes.find((s) => s.label === "5×7")?.id ?? sizes[0]?.id);
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [area, setArea] = useState<Area | null>(null);
  const [croppedSrc, setCroppedSrc] = useState<string | null>(null);

  // Style
  const [styleId, setStyleId] = useState(styles[0]?.id);
  const [mat, setMat] = useState(false);
  const [engraveOn, setEngraveOn] = useState(false);
  const [engraving, setEngraving] = useState("");

  const [view, setView] = useState<"frame" | "wall" | "compare">("frame");
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);

  const size = sizes.find((s) => s.id === sizeId) ?? sizes[0];
  const style = styles.find((s) => s.id === styleId) ?? styles[0];
  const dims = printDims(size, orientation);
  const engraveText = engraveOn ? engraving.trim() : "";
  const price = framePrice(size, style, mat, !!engraveText, extras);
  const dpi = area ? effectiveDpi(area, dims) : photo ? effectiveDpi({ width: photo.width, height: photo.height }, dims) : 0;
  const verdict = dpiVerdict(dpi);
  const suggestion = photo ? largestGoodSize(sizes, photo) : undefined;

  // Pick a sensible default orientation from the photo
  useEffect(() => {
    if (photo) setOrientation(photo.width > photo.height ? "landscape" : "portrait");
  }, [photo]);

  // Re-render the cropped photo (debounced) for live previews
  useEffect(() => {
    if (!photo || !area) return;
    const t = setTimeout(async () => {
      const c = await cropToCanvas(photo.url, area, rotation, 1000);
      setCroppedSrc(c.toDataURL("image/jpeg", 0.85));
    }, 220);
    return () => clearTimeout(t);
  }, [photo, area, rotation]);

  const handleFile = useCallback(async (file: File | undefined) => {
    if (!file) return;
    const err = validatePhoto(file);
    if (err) return setPhotoError(err);
    setPhotoError(null);
    setLoadingPhoto(true);
    try {
      const loaded = await loadPhoto(file);
      setPhoto((old) => {
        if (old) URL.revokeObjectURL(old.url);
        return loaded;
      });
      setFileName(file.name);
      setCroppedSrc(null);
      setArea(null);
      setZoom(1);
      setRotation(0);
      setCrop({ x: 0, y: 0 });
      setAdded(false);
      // Start uploading the untouched original in the background.
      setUploadState("uploading");
      uploadRef.current = uploadToStorage("uploads", file, extFor(file))
        .then((r) => {
          setUploadState(r ? "done" : "local");
          return r?.path ?? null;
        })
        .catch(() => {
          setUploadState("error");
          return null;
        });
      setStep(1);
    } catch {
      setPhotoError("We couldn't open that photo. Please try a JPG or PNG.");
    } finally {
      setLoadingPhoto(false);
    }
  }, []);

  const onCropComplete = useCallback((_: Area, px: Area) => setArea(px), []);

  const handleAdd = async () => {
    if (!photo || !area) return;
    setAdding(true);
    setAddError(null);
    try {
      const cropped = await cropToCanvas(photo.url, area, rotation, 1400);
      const framed = await renderFramedPreview({
        photo: cropped,
        dims,
        frameColor: style.color,
        frameShade: style.texture || style.color,
        mat,
        engraving: engraveText,
        scriptFont: script.style.fontFamily,
      });
      const thumb = await thumbnailDataUrl(framed, 360);
      let previewUrl = thumb;
      let originalPath: string | undefined;
      try {
        const [orig, prev] = await Promise.all([uploadRef.current, uploadToStorage("previews", await canvasToBlob(framed, "image/jpeg", 0.88), "jpg")]);
        originalPath = orig ?? undefined;
        if (prev?.publicUrl) previewUrl = prev.publicUrl;
      } catch {
        // Keep the local thumbnail; the order can still go through WhatsApp.
      }
      addToCart({
        kind: "frame",
        key: uid("frame-"),
        name: `Custom Photo Frame · ${size.label}`,
        quantity: 1,
        unitPrice: price,
        sizeId: size.id,
        sizeLabel: size.label,
        orientation,
        styleId: style.id,
        styleName: style.name,
        mat,
        engraving: engraveText || undefined,
        crop: { ...area, rotation, zoom },
        originalUrl: originalPath,
        previewUrl,
        effectiveDpi: dpi,
      });
      setAdded(true);
    } catch (e) {
      setAddError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  const canGo = (i: number) => i === 0 || !!photo;
  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  const qualityBadge = photo && (
    <div
      className={cn(
        "flex items-start gap-3 rounded-2xl px-4 py-3 text-[13px]",
        verdict.level === "low" ? "bg-[#F6E1D6] text-[#8A3B1E]" : verdict.level === "good" ? "bg-cream text-brown" : "bg-sage-50 text-sage-dark"
      )}
      role={verdict.level === "low" ? "alert" : "status"}
    >
      {verdict.level === "low" ? <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />}
      <div>
        <p className="font-medium">
          Print quality: about {dpi} DPI at {size.label}
        </p>
        <p className="opacity-85">
          {verdict.level === "low"
            ? `This photo may look blurry at ${size.label}. Try a smaller size${suggestion && suggestion.id !== size.id ? ` such as ${suggestion.label}` : ""}, or zoom out.`
            : verdict.text}
        </p>
      </div>
    </div>
  );

  return (
    <div className="container pb-16">
      {/* Stepper */}
      <nav aria-label="Frame builder steps" className="mx-auto mb-8 max-w-3xl">
        <ol className="flex items-center justify-between">
          {STEPS.map((label, i) => (
            <li key={label} className="flex flex-1 items-center last:flex-none">
              <button
                onClick={() => canGo(i) && setStep(i)}
                disabled={!canGo(i)}
                aria-current={step === i ? "step" : undefined}
                className="flex flex-col items-center gap-1.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span
                  className={cn(
                    "grid h-9 w-9 place-items-center rounded-full border text-[13px] transition duration-500",
                    step === i ? "border-sage bg-sage-dark text-ivory shadow-soft" : i < step ? "border-sage bg-sage-50 text-sage-dark" : "border-brown/20 bg-ivory text-muted"
                  )}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className="label text-[13px]">{label}</span>
              </button>
              {i < STEPS.length - 1 && <span className={cn("mx-2 mb-5 h-px flex-1 transition-colors duration-500", i < step ? "bg-sage-dark" : "bg-brown/15")} />}
            </li>
          ))}
        </ol>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.35fr_1fr] lg:gap-12">
        {/* ── Visual panel ── */}
        <div className="lg:sticky lg:top-28 lg:self-start">
          {!photo ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                handleFile(e.dataTransfer.files?.[0]);
              }}
              className={cn(
                "flex h-[420px] flex-col items-center justify-center rounded-[2rem] border-2 border-dashed text-center transition sm:h-[480px]",
                dragOver ? "border-sage bg-sage-50" : "border-brown/20 bg-cream/60"
              )}
            >
              {loadingPhoto ? (
                <Loader2 className="h-10 w-10 animate-spin text-sage-dark" />
              ) : (
                <>
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-ivory text-sage-dark shadow-soft">
                    <ImagePlus className="h-9 w-9" strokeWidth={1.3} />
                  </span>
                  <p className="mt-6 font-serif text-3xl">Drop your photo here</p>
                  <p className="mt-2 text-[17px] text-muted">JPG, PNG or HEIC up to 20 MB</p>
                  <Button className="mt-6" onClick={() => inputRef.current?.click()}>
                    <Upload /> Choose a photo
                  </Button>
                </>
              )}
              {photoError && (
                <p role="alert" className="mt-4 text-[17px] text-destructive">
                  {photoError}
                </p>
              )}
            </div>
          ) : step === 2 ? (
            <div className="relative h-[420px] overflow-hidden rounded-[2rem] bg-brown/90 sm:h-[480px]">
              <Cropper
                image={photo.url}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={dims.w / dims.h}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
                showGrid
                objectFit="contain"
                style={{ cropAreaStyle: { border: "2px solid #FBF3EA", boxShadow: "0 0 0 9999px rgba(40,24,14,0.6)" } }}
              />
            </div>
          ) : view === "wall" && step >= 3 ? (
            <WallPreview dims={dims} src={croppedSrc ?? photo.url} style={style} mat={mat} engraving={engraveText} engravingFont={script.style.fontFamily} />
          ) : view === "compare" || step === 1 ? (
            <SizeComparison sizes={sizes} orientation={orientation} selectedId={size.id} onSelect={(s) => setSizeId(s.id)} src={croppedSrc ?? photo.url} style={style} />
          ) : (
            <FrameStage dims={dims} src={croppedSrc ?? photo.url} style={style} mat={mat} engraving={engraveText} engravingFont={script.style.fontFamily} />
          )}

          {/* keep a crop computed even before the crop step, so previews and DPI are right */}
          {photo && step !== 2 && (
            <div className="pointer-events-none absolute h-0 w-0 overflow-hidden opacity-0" aria-hidden>
              <div style={{ position: "relative", width: 400, height: 400 }}>
                <Cropper image={photo.url} crop={crop} zoom={zoom} rotation={rotation} aspect={dims.w / dims.h} onCropChange={setCrop} onCropComplete={onCropComplete} />
              </div>
            </div>
          )}

          {photo && step >= 3 && (
            <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="Preview mode">
              {(
                [
                  ["frame", "Frame"],
                  ["wall", "See on wall"],
                  ["compare", "Compare sizes"],
                ] as const
              ).map(([k, label]) => (
                <button
                  key={k}
                  role="tab"
                  aria-selected={view === k}
                  onClick={() => setView(k)}
                  className={cn("rounded-full px-4 py-2 text-[13px] uppercase tracking-[0.14em] transition", view === k ? "bg-brown text-ivory" : "bg-cream text-brown hover:bg-beige/50")}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/heic,image/heif,.heic,.heif"
            className="sr-only"
            aria-label="Upload photo"
            onChange={(e) => {
              handleFile(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </div>

        {/* ── Options panel ── */}
        <div className="card-soft min-w-0 p-6 sm:p-8">
          <AnimatePresence mode="wait">
            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.35 }}>
              {step === 0 && (
                <div>
                  <h2 className="font-serif text-3xl">Upload your photo</h2>
                  <p className="mt-2 text-[17px] leading-[1.7] text-ink">
                    Use the original photo from your phone or camera for the sharpest print. WhatsApp-forwarded photos are compressed and may look soft at bigger sizes.
                  </p>
                  <ul className="mt-6 space-y-3 text-[16px] text-ink">
                    {["We print on archival matte paper", "Your photo stays private, only our makers see it", "Every frame is hand-assembled in Kerala"].map((t) => (
                      <li key={t} className="flex items-center gap-3">
                        <Check className="h-4 w-4 text-sage-dark" /> {t}
                      </li>
                    ))}
                  </ul>
                  {photo && (
                    <div className="mt-6 rounded-2xl bg-ivory/80 p-4 text-[13px]">
                      <p className="font-medium">{fileName}</p>
                      <p className="text-muted">
                        {photo.width} × {photo.height} px
                      </p>
                    </div>
                  )}
                  <Button className="mt-8 w-full" onClick={() => inputRef.current?.click()}>
                    <Upload /> {photo ? "Choose a different photo" : "Choose a photo"}
                  </Button>
                </div>
              )}

              {step === 1 && (
                <div>
                  <h2 className="font-serif text-3xl">Choose a size</h2>
                  <p className="mt-1 text-[16px] text-muted">Prices include the frame and glass.</p>
                  <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Frame size">
                    {sizes.map((s) => {
                      const on = s.id === size.id;
                      const best = photo ? effectiveDpi(photo, printDims(s, orientation)) : 999;
                      return (
                        <button
                          key={s.id}
                          role="radio"
                          aria-checked={on}
                          onClick={() => setSizeId(s.id)}
                          className={cn(
                            "relative flex flex-col items-center rounded-2xl border px-2 pb-3 pt-4 text-center transition duration-300",
                            on ? "border-sage bg-ivory shadow-soft" : "border-brown/10 bg-ivory/50 hover:border-brown/30"
                          )}
                        >
                          <span className="flex h-10 items-end">
                            <span className="block rounded-[2px] border-2 border-brown/50 bg-beige/40" style={{ width: 6 + (s.width_in / 23.4) * 34, height: 6 + (s.height_in / 23.4) * 34 }} />
                          </span>
                          <span className="mt-2 font-serif text-xl leading-none">{s.label}</span>
                          <span className="mt-1 text-[13px] text-muted">
                            {s.width_in}″ × {s.height_in}″
                          </span>
                          <span className="mt-1 text-[16px] font-medium">{formatINR(s.price)}</span>
                          {best < 150 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#C0603A]" title="May look blurry at this size" aria-label="May look blurry" />}
                          {on && <Check className="absolute left-2 top-2 h-4 w-4 text-sage-dark" />}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 flex items-center gap-2 text-[13px] text-muted">
                    <span className="h-2 w-2 rounded-full bg-[#C0603A]" /> Your photo may look blurry at these sizes
                  </p>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="font-serif text-3xl">Crop your photo</h2>
                    <p className="mt-1 text-[16px] text-muted">
                      Drag to position. The crop is locked to {size.label} ({dims.w}″ × {dims.h}″).
                    </p>
                  </div>
                  <div>
                    <p className="label mb-3">Orientation</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(["portrait", "landscape"] as const).map((o) => (
                        <button
                          key={o}
                          disabled={isSquare(size)}
                          onClick={() => setOrientation(o)}
                          aria-pressed={orientation === o}
                          className={cn(
                            "flex items-center justify-center gap-2 rounded-xl border py-3 text-[13px] capitalize transition disabled:opacity-40",
                            orientation === o && !isSquare(size) ? "border-sage bg-ivory shadow-soft" : "border-brown/15 bg-ivory/50"
                          )}
                        >
                          <span className={cn("block rounded-[2px] border-2 border-current", o === "portrait" ? "h-5 w-3.5" : "h-3.5 w-5")} /> {o}
                        </button>
                      ))}
                    </div>
                    {isSquare(size) && <p className="mt-2 text-[13px] text-muted">Square sizes have no orientation.</p>}
                  </div>
                  <div>
                    <p className="label mb-2">Zoom</p>
                    <Slider min={1} max={4} step={0.01} value={[zoom]} onValueChange={(v) => setZoom(v[0])} thumbLabels={["Zoom"]} />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <p className="label">Rotate</p>
                      <div className="flex gap-1">
                        <button onClick={() => setRotation((r) => (r - 90 + 360) % 360)} className="rounded-full p-2 hover:bg-ivory" aria-label="Rotate left 90 degrees">
                          <RotateCcw className="h-4 w-4" />
                        </button>
                        <button onClick={() => setRotation((r) => (r + 90) % 360)} className="rounded-full p-2 hover:bg-ivory" aria-label="Rotate right 90 degrees">
                          <RotateCw className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <Slider min={0} max={360} step={1} value={[rotation]} onValueChange={(v) => setRotation(v[0])} thumbLabels={["Rotation"]} />
                  </div>
                  {qualityBadge}
                </div>
              )}

              {step === 3 && (
                <div className="space-y-7">
                  <h2 className="font-serif text-3xl">Frame style</h2>
                  <div>
                    <p className="label mb-3">
                      Moulding: <span className="normal-case tracking-normal text-brown">{style.name}</span>
                    </p>
                    <div className="flex flex-wrap gap-3" role="radiogroup" aria-label="Frame colour">
                      {styles.map((s) => (
                        <button
                          key={s.id}
                          role="radio"
                          aria-checked={s.id === style.id}
                          onClick={() => setStyleId(s.id)}
                          className="group flex flex-col items-center gap-1.5"
                        >
                          <span
                            className={cn("block h-14 w-14 rounded-xl shadow-soft ring-2 ring-offset-2 ring-offset-cream transition", s.id === style.id ? "ring-sage" : "ring-transparent group-hover:ring-brown/20")}
                            style={{ background: mouldingBackground(s) }}
                          />
                          <span className="text-[13px]">{s.name}</span>
                          <span className="-mt-1 text-[13px] text-muted">{s.extra_price ? `+${formatINR(s.extra_price)}` : "Included"}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-center justify-between rounded-2xl bg-ivory/70 px-4 py-4">
                    <span>
                      <span className="block text-[17px]">White mat border</span>
                      <span className="text-[13px] text-muted">A gallery-style border around the photo · +{formatINR(extras.mat_price)}</span>
                    </span>
                    <input type="checkbox" className="h-5 w-5 accent-[#6E7F52]" checked={mat} onChange={(e) => setMat(e.target.checked)} />
                  </label>
                  <div className="rounded-2xl bg-ivory/70 px-4 py-4">
                    <label className="flex cursor-pointer items-center justify-between">
                      <span>
                        <span className="block text-[17px]">Engraved line</span>
                        <span className="text-[13px] text-muted">A name or date under the photo · +{formatINR(extras.engraving_price)}</span>
                      </span>
                      <input type="checkbox" className="h-5 w-5 accent-[#6E7F52]" checked={engraveOn} onChange={(e) => setEngraveOn(e.target.checked)} />
                    </label>
                    {engraveOn && (
                      <Input className="mt-3" maxLength={40} placeholder="e.g. Anu & Rahul · 14.02.2024" value={engraving} onChange={(e) => setEngraving(e.target.value)} aria-label="Engraving text" />
                    )}
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <h2 className="font-serif text-3xl">Your frame</h2>
                  <dl className="space-y-2 text-[16px]">
                    {[
                      ["Size", `${size.label} · ${dims.w}″ × ${dims.h}″ · ${orientation}`, formatINR(size.price)],
                      ["Frame", style.name, style.extra_price ? formatINR(style.extra_price) : "—"],
                      ...(mat ? [["Mat", "White mat border", formatINR(extras.mat_price)]] : []),
                      ...(engraveText ? [["Engraving", `“${engraveText}”`, formatINR(extras.engraving_price)]] : []),
                    ].map(([k, v, p]) => (
                      <div key={k} className="flex items-baseline justify-between gap-4 border-b border-brown/10 pb-2">
                        <dt className="label">{k}</dt>
                        <dd className="flex-1 text-right text-ink">{v}</dd>
                        <dd className="w-16 text-right">{p}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="flex items-baseline justify-between">
                    <span className="label">Total</span>
                    <span className="font-serif text-4xl">{formatINR(price)}</span>
                  </div>
                  {qualityBadge}
                  {uploadState === "uploading" && (
                    <p className="flex items-center gap-2 text-[13px] text-muted">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading your original photo securely…
                    </p>
                  )}
                  {uploadState === "error" && (
                    <p className="text-[13px] text-destructive">We couldn&apos;t upload the original photo. You can still order and send it to us on WhatsApp.</p>
                  )}
                  {added ? (
                    <div className="rounded-2xl bg-sage-50 p-5 text-center">
                      <p className="font-script text-4xl text-sage-dark">Added to your bag ♡</p>
                      <div className="mt-4 grid gap-2 sm:grid-cols-2">
                        <Button asChild>
                          <Link href="/checkout">Checkout</Link>
                        </Button>
                        <Button variant="outline" onClick={() => { setAdded(false); setStep(0); setPhoto(null); setArea(null); setCroppedSrc(null); }}>
                          Frame another photo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="lg" className="w-full" onClick={handleAdd} disabled={adding || !area}>
                      {adding ? <Loader2 className="animate-spin" /> : <ShoppingBag />} {adding ? "Preparing your frame…" : `Add to bag · ${formatINR(price)}`}
                    </Button>
                  )}
                  {addError && <p role="alert" className="text-[17px] text-destructive">{addError}</p>}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {photo && (
            <div className="mt-8 flex items-center justify-between border-t border-brown/10 pt-6">
              <Button variant="ghost" onClick={back} disabled={step === 0}>
                <ArrowLeft /> Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button onClick={next}>
                  Next <ArrowRight />
                </Button>
              ) : (
                <span className="font-serif text-xl">{formatINR(price)}</span>
              )}
            </div>
          )}
          <HeartDivider className="mt-6" />
        </div>
      </div>
    </div>
  );
}
