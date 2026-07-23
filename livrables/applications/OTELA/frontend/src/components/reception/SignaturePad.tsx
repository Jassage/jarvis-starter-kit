'use client';
import { forwardRef, useImperativeHandle, useRef } from 'react';

export interface SignaturePadHandle {
  effacer: () => void;
  obtenirBlob: () => Promise<Blob | null>;
}

interface Props {
  largeur?: number;
  hauteur?: number;
  onDessinerChange?: (aDessine: boolean) => void;
}

// Pad de signature au check-in (point #8 du cahier des charges) — Pointer Events
// unifie souris/tactile (tablette de comptoir), pas besoin de gérer touch et mouse
// séparément. Résolution interne du canvas (attributs width/height) distincte de sa
// taille CSS affichée (w-full) : la position du pointeur doit être mise à l'échelle,
// sinon le tracé décale dès que le canvas est étiré par le CSS.
const SignaturePad = forwardRef<SignaturePadHandle, Props>(({ largeur = 500, hauteur = 180, onDessinerChange }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const enTrainDeDessiner = useRef(false);
  const aDejaDessine = useRef(false);

  function position(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function debuter(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = position(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    enTrainDeDessiner.current = true;
    canvasRef.current!.setPointerCapture(e.pointerId);
  }

  function tracer(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!enTrainDeDessiner.current) return;
    const ctx = canvasRef.current!.getContext('2d')!;
    const { x, y } = position(e);
    ctx.lineTo(x, y);
    ctx.strokeStyle = '#0b1733';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    if (!aDejaDessine.current) {
      aDejaDessine.current = true;
      onDessinerChange?.(true);
    }
  }

  function terminer() {
    enTrainDeDessiner.current = false;
  }

  useImperativeHandle(ref, () => ({
    effacer: () => {
      const canvas = canvasRef.current!;
      canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
      aDejaDessine.current = false;
      onDessinerChange?.(false);
    },
    obtenirBlob: () => new Promise((resolve) => canvasRef.current!.toBlob((b) => resolve(b), 'image/png')),
  }));

  return (
    <canvas
      ref={canvasRef}
      width={largeur}
      height={hauteur}
      onPointerDown={debuter}
      onPointerMove={tracer}
      onPointerUp={terminer}
      onPointerLeave={terminer}
      className="w-full rounded-xl"
      style={{ background: 'var(--color-surface-2)', border: '1px dashed var(--color-line)', cursor: 'crosshair', touchAction: 'none' }}
    />
  );
});
SignaturePad.displayName = 'SignaturePad';
export default SignaturePad;
