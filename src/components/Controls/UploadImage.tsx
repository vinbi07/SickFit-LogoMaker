import { useState } from "react";
import styles from "../../styles/ControlsPanel.module.css";

type UploadImageProps = {
  onUpload: (file: File) => Promise<void>;
};

export function UploadImage({ onUpload }: UploadImageProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File | undefined) => {
    if (!file) {
      return;
    }
    await onUpload(file);
  };

  return (
    <section className={styles.section}>
      <h2>Step 2: Upload your Image</h2>
      <div
        className={`${styles.uploadDropzone} ${isDragging ? styles.dropzoneActive : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          void handleFile(event.dataTransfer.files?.[0]);
        }}
      >
        <p className={styles.dropzoneHint}>Drag and drop your image here</p>
        <p className={styles.dropzoneHintSecondary}>or choose a file below</p>

        <input
          className={styles.uploadInput}
          type="file"
          accept="image/png, image/jpeg, image/avif"
          onChange={(event) => {
            const file = event.target.files?.[0];
            void handleFile(file);
            event.currentTarget.value = "";
          }}
        />
      </div>
    </section>
  );
}
