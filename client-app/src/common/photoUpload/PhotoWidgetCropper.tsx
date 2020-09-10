import React, { useRef } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

interface IProps {
  setImage: (file: Blob) => void;
  imagePreview: string;
}

const PhotoWidgetCropper: React.FC<IProps> = ({ setImage, imagePreview }) => {
  const test = useRef<Cropper>();

  const cropImage = () => {
    const cropper = test.current || null;

    if (cropper === null) {
      return;
    }
    cropper.getCroppedCanvas().toBlob((blob: any) => {
      setImage(blob);
    }, "image/jpeg");
  };

  return (
    <Cropper
      src={imagePreview}
      style={{ height: 200, width: "100%" }}
      initialAspectRatio={1 / 1}
      preview=".img-preview"
      guides={false}
      viewMode={1}
      dragMode="move"
      cropBoxMovable={true}
      cropBoxResizable={true}
      crop={cropImage}
      onInitialized={(instance) => {
        test.current = instance;
      }}
    />
  );
};

export default PhotoWidgetCropper;
