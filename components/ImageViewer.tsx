'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';

interface ImageViewerProps {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  onClose?: () => void; // 👈 Added this line
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  src,
  alt = 'image',
  width = 200,
  height = 200,
  onClose,
}) => {
  const modalRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (src) {
      modalRef.current?.showModal();
    } else {
      modalRef.current?.close();
    }
  }, [src]);

  const handleClose = () => {
    modalRef.current?.close();
    onClose?.(); // 👈 Calls parent close function if provided
  };

  if (!src) return null;

  return (
    <dialog ref={modalRef} id="image_view_modal" className="modal">
      <div className="modal-box">
        <form method="dialog">
          <button
            type="button"
            onClick={handleClose}
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          >
            ✕
          </button>
        </form>
        <h3 className="font-bold text-lg">Image Preview</h3>
        <div className="mt-4 flex justify-center">
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="rounded-lg object-contain"
          />
        </div>
      </div>
    </dialog>
  );
};

export default ImageViewer;
