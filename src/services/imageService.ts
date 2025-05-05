
import { supabase } from "@/integrations/supabase/client";

// Check if the bucket exists, and create it if it doesn't
async function ensureBucketExists(bucketName: string): Promise<void> {
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
  
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, {
      public: true
    });
  }
}

// Upload an image and return the public URL
export async function uploadImage(file: File, folder: string = 'recipes'): Promise<string> {
  const bucketName = 'recipe-images';
  await ensureBucketExists(bucketName);

  // Create a unique file name
  const fileExt = file.name.split('.').pop();
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

  // Upload the file
  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file);

  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    throw new Error('Failed to upload image');
  }

  // Get the public URL
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return data.publicUrl;
}

// Delete an image
export async function deleteImage(url: string): Promise<void> {
  // Extract the path from the URL
  const bucketName = 'recipe-images';
  const urlObj = new URL(url);
  const path = urlObj.pathname.split('/').slice(2).join('/'); // Remove the first two segments (/storage/bucket-name)

  const { error } = await supabase.storage
    .from(bucketName)
    .remove([path]);

  if (error) {
    console.error('Error deleting image:', error);
    throw new Error('Failed to delete image');
  }
}
