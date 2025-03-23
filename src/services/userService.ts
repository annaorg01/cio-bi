
import { supabase } from '@/integrations/supabase/client';
import { UserData, UserLink } from '@/components/admin/types';

// Helper function to log user activity
const logActivity = async (userId: string, actionType: string, details: any): Promise<void> => {
  try {
    const { error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        action_type: actionType,
        details
      });
    
    if (error) {
      console.error('Error logging activity:', error);
    }
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

export const fetchUsers = async (isUsingContextAuth: boolean): Promise<UserData[]> => {
  if (isUsingContextAuth) {
    // If using auth context, provide dummy data
    return [
      {
        id: '11111111-1111-1111-1111-111111111111',
        username: 'advaz',
        full_name: 'אדוה צביאלי',
        email: 'AdvaZ@hod-hasharon.muni.il',
        department: 'טכנולוגיות ומערכות מידע',
        links: [
          { id: '11111111-1111-1111-1111-111111111101', name: 'פורטל עובדים', url: 'https://www.hod-hasharon.muni.il/employees' },
          { id: '11111111-1111-1111-1111-111111111102', name: 'מערכת שכר', url: 'https://www.hod-hasharon.muni.il/salary' }
        ]
      },
      {
        id: '22222222-2222-2222-2222-222222222222',
        username: 'meytalab',
        full_name: 'מיטל אלבין- בש',
        email: 'meytalab@hod-hasharon.muni.il',
        department: 'משאבי אנוש',
        links: [
          { id: '22222222-2222-2222-2222-222222222201', name: 'מערכת חופשות', url: 'https://www.hod-hasharon.muni.il/vacation' }
        ]
      },
      {
        id: '33333333-3333-3333-3333-333333333333',
        username: 'michala',
        full_name: 'מיכל אלמגור',
        email: 'MichalA@hod-hasharon.muni.il',
        department: 'פניות ציבור וחופש המידע',
        links: [
          { id: '33333333-3333-3333-3333-333333333301', name: 'פניות ציבור', url: 'https://www.hod-hasharon.muni.il/public-requests' }
        ]
      }
    ];
  }

  // For Supabase auth, fetch real data
  try {
    console.log('Fetching users from Supabase...');
    // First, get all profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, username, email, department, full_name, is_admin');
    
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      throw profilesError;
    }
    
    console.log('Fetched profiles:', profiles);
    
    if (!profiles || profiles.length === 0) {
      console.log('No profiles found in Supabase, returning dummy data');
      // If no profiles in Supabase, return dummy data as fallback
      return fetchUsers(true);
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
    
    console.log('Returning users with links:', usersWithLinks);
    return usersWithLinks;
  } catch (error) {
    console.error('Error in fetchUsers:', error);
    console.log('Returning dummy data due to error');
    // On error, fall back to dummy data for demo purposes
    return fetchUsers(true);
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
    const dummyLink = {
      id: Math.random().toString(),
      name,
      url
    };
    console.log('Adding dummy link (context auth):', dummyLink);
    return dummyLink;
  }
  
  console.log('Adding link to Supabase:', { userId, name, url });
  
  try {
    // Get the current user's ID for activity logging
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id || userId;
    
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
    
    if (error) {
      console.error('Error adding link:', error);
      throw error;
    }
    
    // Log the activity
    await logActivity(adminId, 'add_link', {
      target_user_id: userId,
      link_id: data.id,
      link_name: name,
      link_url: url
    });
    
    console.log('Link added successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in addUserLink:', error);
    // Return a dummy link as fallback
    const fallbackLink = {
      id: Math.random().toString(),
      name,
      url
    };
    console.log('Returning fallback link due to error:', fallbackLink);
    return fallbackLink;
  }
};

export const removeUserLink = async (linkId: string, isUsingContextAuth: boolean): Promise<void> => {
  if (isUsingContextAuth) {
    // For context auth, the parent component will handle the state update
    console.log('Removing dummy link (context auth):', linkId);
    return;
  }
  
  console.log('Removing link from Supabase:', linkId);
  
  try {
    // Get the current user's ID for activity logging
    const { data: { user } } = await supabase.auth.getUser();
    
    // Get link details before deletion for logging
    const { data: linkData } = await supabase
      .from('user_links')
      .select('user_id, name, url')
      .eq('id', linkId)
      .single();
    
    // Delete link from database for Supabase auth
    const { error } = await supabase
      .from('user_links')
      .delete()
      .eq('id', linkId);
    
    if (error) {
      console.error('Error removing link:', error);
      throw error;
    }
    
    // Log the activity
    if (user && linkData) {
      await logActivity(user.id, 'remove_link', {
        target_user_id: linkData.user_id,
        link_id: linkId,
        link_name: linkData.name,
        link_url: linkData.url
      });
    }
    
    console.log('Link removed successfully');
  } catch (error) {
    console.error('Error in removeUserLink:', error);
    // Silently fail and let the UI handle it
  }
};

// Add a function to log password changes
export const logPasswordChange = async (
  adminUserId: string,
  targetUserId: string
): Promise<void> => {
  try {
    const { error } = await supabase
      .from('password_change_history')
      .insert({
        admin_user_id: adminUserId,
        target_user_id: targetUserId
      });
    
    if (error) {
      console.error('Error logging password change:', error);
    }
  } catch (error) {
    console.error('Failed to log password change:', error);
  }
};
