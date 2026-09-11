"use client";

import { useEffect, useState } from "react";
import { Camera, ImageIcon } from "lucide-react";

export function ProfilePhotoPicker({ initialUrl }: { initialUrl: string }) {
  const [previewUrl, setPreviewUrl] = useState(initialUrl);
  const [fileName, setFileName] = useState("");

  useEffect(() => () => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setFileName(file.name);
  }

  return (
    <div>
      <span className="mb-2 block text-sm font-extrabold text-[#755967]">Profile picture</span>
      <label className="group flex cursor-pointer flex-col items-center gap-4 rounded-2xl border border-dashed border-[#ddaebd] bg-[#fff9fb] p-4 text-center transition hover:border-[#c7859a] hover:bg-[#fff4f7] sm:flex-row sm:text-left">
        <span className="relative grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-[1.5rem] border-4 border-white bg-gradient-to-br from-[#f9cad8] to-[#dfd2f5] text-2xl font-black text-[#785267] shadow-[0_10px_24px_rgba(153,89,112,0.16)]">
          {previewUrl ? <img src={previewUrl} alt="Selected profile preview" className="h-full w-full object-cover" /> : <Camera className="h-8 w-8 text-[#b9788e]" />}
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-[#684b5b]/70 py-1.5 text-[11px] font-bold text-white backdrop-blur-sm"><Camera className="h-3 w-3" /> Change</span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center justify-center gap-2 text-base font-bold text-[#765966] sm:justify-start"><ImageIcon className="h-4 w-4" /> Choose a new photo</span>
          <span className="mt-1 block text-sm leading-6 text-[#a18791]">JPG, PNG, WebP or GIF · no upload-size limit</span>
          {fileName && <span className="mt-2 block truncate rounded-lg bg-white/80 px-2.5 py-1.5 text-xs font-bold text-[#9a6c7d]">Previewing: {fileName}</span>}
        </span>
        <input name="avatar" type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleChange} className="sr-only" />
      </label>
      <p className="mt-2 text-xs leading-5 text-[#a18791]">Large photos are automatically optimized when saved.</p>
    </div>
  );
}
