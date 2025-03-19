
import { supabase } from '@/integrations/supabase/client';
import { UserData, UserLink } from '@/components/admin/types';

export const fetchUsers = async (isUsingContextAuth: boolean): Promise<UserData[]> => {
  if (isUsingContextAuth) {
    // If using auth context, provide dummy data
    return [
      {
        id: '1',
        username: 'user1',
        links: [
          { id: '1', name: 'פורטל עובדים', url: 'https://www.hod-hasharon.muni.il/employees' },
          { id: '2', name: 'מערכת שכר', url: 'https://www.hod-hasharon.muni.il/salary' }
        ]
      },
      {
        id: '2',
        username: 'user2',
        links: [
          { id: '3', name: 'מערכת חופשות', url: 'https://www.hod-hasharon.muni.il/vacation' }
        ]
      }
    ];
  }

  // For Supabase auth, fetch real data
  // First, get all profiles without trying to determine if admin
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, username');
  
  if (profilesError) throw profilesError;
  
  // Now for each profile, fetch their links
  const usersWithLinks = await Promise.all(
    profiles.map(async (profile) => {
      const { data: links, error: linksError } = await supabase
        .from('user_links')
        .select('id, name, url')
        .eq('user_id', profile.id);
      
      if (linksError) throw linksError;
      
      return {
        id: profile.id,
        username: profile.username || 'Unknown User',
        links: links || []
      };
    })
  );
  
  return usersWithLinks;
};

export const addUserLink = async (
  userId: string,
  name: string,
  url: string,
  isUsingContextAuth: boolean
): Promise<UserLink> => {
  if (isUsingContextAuth) {
    // Handle dummy data for context auth
    return {
      id: Math.random().toString(),
      name,
      url
    };
  }
  
  // Add link to database for Supabase auth
  const { data, error } = await supabase
    .from('user_links')
    .insert({
      user_id: userId,
      name,
      url
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
};

export const removeUserLink = async (linkId: string, isUsingContextAuth: boolean): Promise<void> => {
  if (!isUsingContextAuth) {
    // Delete link from database for Supabase auth
    const { error } = await supabase
      .from('user_links')
      .delete()
      .eq('id', linkId);
    
    if (error) throw error;
  }
  // For context auth, the parent component will handle the state update
};
