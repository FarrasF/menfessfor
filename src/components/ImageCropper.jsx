import { useEffect, useMemo, useRef, useState } from 'react';
import './ImageCropper.css';

const CROP_SIZE = 240;
const MAX_CROPPED_BYTES = 2_200_000;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function canvasToBlob(canvas, quality) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Gambar gagal diproses.'));
    }, 'image/jpeg', quality);
  });
}

function ImageCropper({ file, onCancel, onApply }) {
  const imageRef = useRef(null);
  const dragRef = useRef(null);
  const [imageSize, setImageSize] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const imageUrl = useMemo(() => URL.createObjectURL(file), [file]);

  useEffect(() => () => URL.revokeObjectURL(imageUrl), [imageUrl]);

  const baseScale = imageSize
    ? CROP_SIZE / Math.min(imageSize.width, imageSize.height)
    : 1;
  const renderedWidth = (imageSize?.width || CROP_SIZE) * baseScale * zoom;
  const renderedHeight = (imageSize?.height || CROP_SIZE) * baseScale * zoom;
  const maxOffsetX = Math.max(0, (renderedWidth - CROP_SIZE) / 2);
  const maxOffsetY = Math.max(0, (renderedHeight - CROP_SIZE) / 2);
  const boundedOffset = {
    x: clamp(offset.x, -maxOffsetX, maxOffsetX),
    y: clamp(offset.y, -maxOffsetY, maxOffsetY),
  };

  function handlePointerDown(event) {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      x: event.clientX,
      y: event.clientY,
      offsetX: boundedOffset.x,
      offsetY: boundedOffset.y,
    };
  }

  function handlePointerMove(event) {
    if (!dragRef.current) return;

    setOffset({
      x: clamp(
        dragRef.current.offsetX + event.clientX - dragRef.current.x,
        -maxOffsetX,
        maxOffsetX
      ),
      y: clamp(
        dragRef.current.offsetY + event.clientY - dragRef.current.y,
        -maxOffsetY,
        maxOffsetY
      ),
    });
  }

  async function handleApply() {
    const image = imageRef.current;
    if (!image || !imageSize) return;

    setProcessing(true);
    setError('');

    try {
      const scale = baseScale * zoom;
      const sourceSize = CROP_SIZE / scale;
      const sourceX = (imageSize.width - sourceSize) / 2 - boundedOffset.x / scale;
      const sourceY = (imageSize.height - sourceSize) / 2 - boundedOffset.y / scale;
      const canvas = document.createElement('canvas');
      let blob;

      for (const outputSize of [1400, 1200, 1000, 800, 600]) {
        canvas.width = outputSize;
        canvas.height = outputSize;
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Browser tidak dapat memproses gambar.');

        context.drawImage(
          image,
          sourceX,
          sourceY,
          sourceSize,
          sourceSize,
          0,
          0,
          outputSize,
          outputSize
        );

        for (const quality of [0.82, 0.72, 0.62, 0.5, 0.4]) {
          blob = await canvasToBlob(canvas, quality);
          if (blob.size <= MAX_CROPPED_BYTES) break;
        }

        if (blob.size <= MAX_CROPPED_BYTES) break;
      }

      if (!blob || blob.size > MAX_CROPPED_BYTES) {
        throw new Error('Gambar hasil crop terlalu besar. Coba pilih area lain.');
      }

      onApply(new File([blob], 'menfess-image.jpg', { type: 'image/jpeg' }));
    } catch (cropError) {
      setError(cropError.message || 'Gambar gagal diproses.');
      setProcessing(false);
    }
  }

  return (
    <div className="image-cropper-backdrop" onClick={onCancel}>
      <section
        className="image-cropper"
        role="dialog"
        aria-modal="true"
        aria-labelledby="image-cropper-title"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="image-cropper__header">
          <div>
            <h2 id="image-cropper-title">Potong gambar</h2>
            <p>Atur posisi gambar dalam bingkai persegi.</p>
          </div>
          <button type="button" className="gh-btn gh-btn-sm" onClick={onCancel} disabled={processing}>
            Batal
          </button>
        </header>

        <div
          className="image-cropper__viewport"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={() => { dragRef.current = null; }}
          onPointerCancel={() => { dragRef.current = null; }}
          aria-label="Geser gambar untuk memilih bagian yang dipotong"
        >
          <img
            ref={imageRef}
            src={imageUrl}
            alt="Area crop gambar"
            draggable="false"
            onLoad={(event) => setImageSize({
              width: event.currentTarget.naturalWidth,
              height: event.currentTarget.naturalHeight,
            })}
            style={{
              width: renderedWidth,
              height: renderedHeight,
              transform: `translate(calc(-50% + ${boundedOffset.x}px), calc(-50% + ${boundedOffset.y}px))`,
            }}
          />
        </div>

        <label className="image-cropper__zoom">
          <span>Perbesar</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            aria-label="Perbesar gambar"
          />
        </label>

        {error && <p className="image-cropper__error" role="alert">{error}</p>}

        <footer className="image-cropper__footer">
          <span>Persegi 1:1 · maksimal 30 MB sebelum dipotong</span>
          <button type="button" className="gh-btn gh-btn-primary" onClick={handleApply} disabled={!imageSize || processing}>
            {processing ? 'Memproses...' : 'Gunakan gambar'}
          </button>
        </footer>
      </section>
    </div>
  );
}

export default ImageCropper;