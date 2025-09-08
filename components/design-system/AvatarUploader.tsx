'use client';
import { env } from "@/lib/env";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { Alert } from "./Alert";
import { Button } from "./Button";
import { Badge } from "./Badge";

type Props = {
  userId: string | null;
  onUploaded: (url: string, path: string) => void;
  className?: string;
  initialUrl?: string;
  bucket?: string; // default 'avatars'
};

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

export const AvatarUploader: React.FC<Props> = ({
  userId,
  onUploaded,
  className = "",
  initialUrl,
  bucket = "avatars",
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(initialUrl ?? null);
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const onSelect = (f: File) => {
    if (!f.type.startsWith("image/")) {
      setError("Please choose an image file (JPG/PNG/WebP).");
      return;
    }
    if (f.size > 3 * 1024 * 1024) {
      setError("Max size is 3MB.");
      return;
    }
    setError(null);
    setFile(f);
  };

  const upload = async () => {
    if (!userId || !file) return;
    setBusy(true);
    setError(null);

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (upErr) {
      setBusy(false);
      setError(upErr.message);
      return;
    }

    // Public URL (switch to signed if bucket is private)
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    const publicUrl = data.publicUrl;

    setBusy(false);
    onUploaded(publicUrl, path);
  };

  return (
    <div className={`card-surface p-4 rounded-ds ${className}`}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onSelect(f);
        }}
        className={`
          border-2 border-dashed rounded-ds p-6 text-center cursor-pointer
          ${drag ? "border-primary bg-primary/5" : "border-border dark:border-vibrantPurple/20"}
        `}
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <Image
            src={preview}
            alt="Avatar preview"
            width={112}
            height={112}
            className="mx-auto h-28 w-28 rounded-full object-cover ring-2 ring-primary/40"
          />
        ) : (
          <div className="text-muted-foreground">
            <div className="text-h3 mb-1">Upload avatar</div>
            <div className="text-small opacity-80">
              Drag & drop or click to browse
            </div>
            <div className="mt-2">
              <Badge size="sm">JPG • PNG • WebP • ≤3MB</Badge>
            </div>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onSelect(f);
        }}
      />

      {error && (
        <Alert variant="error" className="mt-3">
          {error}
        </Alert>
      )}

      <div className="mt-3 flex gap-3 justify-center">
        <Button
          variant="secondary"
          onClick={() => inputRef.current?.click()}
          className="rounded-ds-xl"
        >
          Choose file
        </Button>
        <Button
          variant="primary"
          onClick={upload}
          disabled={!file || !userId || busy}
          className="rounded-ds-xl"
        >
          {busy ? "Uploading…" : "Upload"}
        </Button>
      </div>
    </div>
  );
};
