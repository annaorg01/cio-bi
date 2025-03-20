
import { supabase } from '@/integrations/supabase/client';
import { UserData, UserLink } from '@/components/admin/types';

export const fetchUsers = async (isUsingContextAuth: boolean): Promise<UserData[]> => {
  if (isUsingContextAuth) {
    // If using auth context, provide dummy data
    return [
      {
        id: '1',
        username: 'advaz',
        full_name: 'אדוה צביאלי',
        email: 'AdvaZ@hod-hasharon.muni.il',
        department: 'טכנולוגיות ומערכות מידע',
        links: [
          { id: '1', name: 'פורטל עובדים', url: 'https://www.hod-hasharon.muni.il/employees' },
          { id: '2', name: 'מערכת שכר', url: 'https://www.hod-hasharon.muni.il/salary' }
        ]
      },
      {
        id: '2',
        username: 'meytalab',
        full_name: 'מיטל אלבין- בש',
        email: 'meytalab@hod-hasharon.muni.il',
        department: 'משאבי אנוש',
        links: [
          { id: '3', name: 'מערכת חופשות', url: 'https://www.hod-hasharon.muni.il/vacation' }
        ]
      },
      {
        id: '3',
        username: 'michala',
        full_name: 'מיכל אלמגור',
        email: 'MichalA@hod-hasharon.muni.il',
        department: 'פניות ציבור וחופש המידע',
        links: [
          { id: '4', name: 'פניות ציבור', url: 'https://www.hod-hasharon.muni.il/public-requests' }
        ]
      }
    ];
  }

  // For Supabase auth, fetch real data
  try {
    // First, get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, email, department, full_name, is_admin');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }
    
    if (!profiles) {
      return [];
    }
    
    // Now for each profile, fetch their links
    const usersWithLinks = await Promise.all(
      profiles.map(async (profile) => {
        const { data: links, error: linksError } = await supabase
          .from('user_links')
          .select('id, name, url')
          .eq('user_id', profile.id);
        
        if (linksError) {
          console.error('Error fetching links:', linksError);
          throw linksError;
        }
        
        return {
          id: profile.id,
          username: profile.username || 'Unknown User',
          email: profile.email || '',
          department: profile.department || '',
          full_name: profile.full_name || '',
          links: links || []
        };
      })
    );
    
    return usersWithLinks;
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    throw error;
  }
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
