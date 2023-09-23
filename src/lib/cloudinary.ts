import z from "zod";

export const CloudinaryUploadResponseSchema = z.object({
  asset_id: z.string(),
  public_id: z.string(),
  version: z.number(),
  version_id: z.string(),
  signature: z.string(),
  width: z.number(),
  height: z.number(),
  format: z.string(),
  resource_type: z.string(),
  created_at: z.string().refine(
    (dateStr) => {
      // Ensure it's a valid date string
      return !isNaN(Date.parse(dateStr));
    },
    {
      message: "Invalid date format",
    }
  ),
  tags: z.array(z.string()), // Assuming tags are an array of strings
  bytes: z.number(),
  type: z.string(),
  etag: z.string(),
  placeholder: z.boolean(),
  url: z.string().url(),
  secure_url: z.string().url(),
  folder: z.string(),
  original_filename: z.string(),
});

export type CloudinaryUploadResponse = z.infer<
  typeof CloudinaryUploadResponseSchema
>;

export async function uploadClientsideImage(
  file: File
): Promise<CloudinaryUploadResponse> {
  // This is an "upload preset" which you can configure in your cloudinary settings
  // https://console.cloudinary.com/settings/c-bde968f285742f49d8c9593e6561ab/upload
  const cloudinaryUploadPreset =
    process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

  // But THIS is the URL you need to use to upload the image
  // The ID is the cloud name, which you can find in your cloudinary settings
  // https://console.cloudinary.com/console/c-bde968f285742f49d8c9593e6561ab/
  const cloudinaryCloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", cloudinaryUploadPreset);

  const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`;

  const response = await fetch(cloudinaryUrl, {
    method: "POST",
    body: formData,
  });
  const json = await response.json();
  const parsedJson = CloudinaryUploadResponseSchema.parse(json);
  return parsedJson;
}
