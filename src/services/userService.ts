
import { supabase } from "@/integrations/supabase/client";
import { User, Profile } from "@/types";

// Get the current user's profile
export async function getCurrentUserProfile(): Promise<Profile | null> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.session.user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }

  return data;
}

// Update user profile
export async function updateUserProfile(profile: Partial<Profile>): Promise<Profile> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) throw new Error('No user logged in');

  const { data, error } = await supabase
    .from('profiles')
    .update(profile)
    .eq('id', session.session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }

  return data;
}

// Update user preferences
export async function updateUserPreferences(preferences: User['preferences']): Promise<Profile> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) throw new Error('No user logged in');

  const { data, error } = await supabase
    .from('profiles')
    .update({
      preferences: preferences
    })
    .eq('id', session.session.user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating user preferences:', error);
    throw error;
  }

  return data;
}

// Upload user avatar
export async function uploadUserAvatar(file: File): Promise<string> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) throw new Error('No user logged in');

  const userId = session.session.user.id;
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath);

  // Update the user profile with the new avatar URL
  await supabase
    .from('profiles')
    .update({
      avatar_url: data.publicUrl
    })
    .eq('id', userId);

  return data.publicUrl;
}

// Get user's saved recipes IDs
export async function getUserSavedRecipeIds(): Promise<string[]> {
  const { data: session } = await supabase.auth.getSession();
  if (!session.session?.user) return [];

  const { data, error } = await supabase
    .from('saved_recipes')
    .select('recipe_id')
    .eq('user_id', session.session.user.id);

  if (error) {
    console.error('Error fetching saved recipe IDs:', error);
    throw error;
  }

  return data.map(item => item.recipe_id);
}
