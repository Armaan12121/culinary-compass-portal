
import { supabase } from '@/integrations/supabase/client';

export const profileService = {
  async getUserPreferences(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data.preferences;
  },
  
  async updateUserPreferences(userId: string, preferences: any) {
    const { error } = await supabase
      .from('profiles')
      .update({ preferences })
      .eq('id', userId);
    
    if (error) throw error;
  },

  async getCuisines() {
    const { data, error } = await supabase
      .from('cuisines')
      .select('name')
      .order('name');
    
    if (error) throw error;
    return data.map(cuisine => cuisine.name);
  },
  
  async getDietaryTypes() {
    const { data, error } = await supabase
      .from('dietary_types')
      .select('name')
      .order('name');
    
    if (error) throw error;
    return data.map(type => type.name);
  }
};
