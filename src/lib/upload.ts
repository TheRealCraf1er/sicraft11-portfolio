import { supabase, STORAGE_BUCKET } from "./supabase";

export interface UploadResult {
  url?: string;
  error?: string;
}

/**
 * Stores an image and returns a usable URL.
 *
 * With Supabase configured the file goes to the public `site-assets` bucket.
 * Without it, the image is inlined as a data URL — fine for previewing, but
 * capped hard because localStorage quota is only a few megabytes and blowing
 * it would silently break every other save.
 */
export async function uploadImage(
  file: File,
  prefix = "asset",
): Promise<UploadResult> {
  if (!file.type.startsWith("image/")) {
    return { error: "That file isn't an image." };
  }
  if (file.size > 8 * 1024 * 1024) {
    return { error: "Image is over 8 MB — please use a smaller one." };
  }

  if (supabase) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "jpg";
    const path = `${prefix}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (error) return { error: error.message };

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return { url: data.publicUrl };
  }

  if (file.size > 1.5 * 1024 * 1024) {
    return {
      error:
        "Without Supabase, images live in this browser — keep it under 1.5 MB, or paste an image URL instead.",
    };
  }

  try {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Could not read that file."));
      reader.readAsDataURL(file);
    });
    return { url: dataUrl };
  } catch (e) {
    return { error: (e as Error).message };
  }
}
