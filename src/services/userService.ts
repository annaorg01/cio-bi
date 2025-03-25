import { supabase } from '@/integrations/supabase/client';
import { UserData, UserLink } from '@/components/admin/types';
import { CONTEXT_USERS } from '@/types/auth';
import { v4 as uuidv4 } from '@supabase/supabase-js/dist/main/lib/helpers';

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

// Get proper UUID for context users (for Supabase compatibility)
const getContextUserUuid = (userId: string): string => {
  // If already a UUID, return as is
  if (userId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return userId;
  }
  
  // For context users with numeric IDs, create deterministic UUIDs
  switch (userId) {
    case '1': return '00000000-0000-0000-0000-000000000001';
    case '2': return '00000000-0000-0000-0000-000000000002';
    case '3': return '00000000-0000-0000-0000-000000000003';
    default: return `00000000-0000-0000-0000-${userId.padStart(12, '0')}`;
  }
};

// Map context user to their proper UUID
const getContextUserByUuid = (uuid: string): any | null => {
  if (uuid === '00000000-0000-0000-0000-000000000001') {
    return CONTEXT_USERS.find(u => u.id === '1');
  } else if (uuid === '00000000-0000-0000-0000-000000000002') {
    return CONTEXT_USERS.find(u => u.id === '2');
  } else if (uuid === '00000000-0000-0000-0000-000000000003') {
    return CONTEXT_USERS.find(u => u.id === '3');
  }
  return null;
};

// Get user links from Supabase
export const fetchUserLinks = async (userId: string): Promise<UserLink[]> => {
  console.log('Fetching links for user ID:', userId);
  
  // Convert context user ID to UUID if needed
  const userUuid = getContextUserUuid(userId);
  console.log('Using UUID:', userUuid);
  
  try {
    // Fetch links from Supabase
    const { data, error } = await supabase
      .from('user_links')
      .select('id, name, url')
      .eq('user_id', userUuid);
      
    if (error) {
      console.error('Error fetching links from Supabase:', error);
      throw error;
    }
    
    console.log('Links fetched from Supabase:', data);
    return data || [];
    
  } catch (error) {
    console.error('Error in fetchUserLinks:', error);
    // Fall back to empty array
    return [];
  }
};

// Storage for synchronized dummy data between context auth sessions
let dummyUsers = CONTEXT_USERS.map(contextUser => {
  return {
    id: contextUser.id,
    username: contextUser.username,
    full_name: contextUser.full_name || '',
    email: contextUser.email || '',
    department: contextUser.department || '',
    links: [] as UserLink[]
  };
});

// Initialize with some default links if needed
if (!dummyUsers[0].links || dummyUsers[0].links.length === 0) {
  dummyUsers[0].links = [
    { id: '11111111-1111-1111-1111-111111111101', name: 'פורטל עובדים', url: 'https://www.hod-hasharon.muni.il/employees' },
    { id: '11111111-1111-1111-1111-111111111102', name: 'מערכת שכר', url: 'https://www.hod-hasharon.muni.il/salary' }
  ];
}

if (!dummyUsers[1].links || dummyUsers[1].links.length === 0) {
  dummyUsers[1].links = [
    { id: '22222222-2222-2222-2222-222222222201', name: 'מערכת חופשות', url: 'https://www.hod-hasharon.muni.il/vacation' }
  ];
}

if (!dummyUsers[2].links || dummyUsers[2].links.length === 0) {
  dummyUsers[2].links = [
    { id: '33333333-3333-3333-3333-333333333301', name: 'פניות ציבור', url: 'https://www.hod-hasharon.muni.il/public-requests' }
  ];
}

export const fetchUsers = async (isUsingContextAuth: boolean): Promise<UserData[]> => {
  console.log('Fetching users, isUsingContextAuth:', isUsingContextAuth);
  
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
    
    // Convert context users to have proper UUIDs for Supabase
    const contextUsersWithUuid = CONTEXT_USERS.map(user => ({
      ...user,
      supabaseId: getContextUserUuid(user.id)
    }));
    
    // Combine and deduplicate users from both sources
    const allProfiles = [
      ...(profiles || []),
      ...contextUsersWithUuid.map(user => ({
        id: user.supabaseId,
        username: user.username,
        email: user.email,
        department: user.department,
        full_name: user.full_name,
        is_admin: user.isAdmin
      }))
    ];
    
    // Remove duplicates based on username
    const uniqueProfiles = allProfiles.filter((profile, index, self) => 
      profile.username && 
      index === self.findIndex(p => p.username === profile.username)
    );
    
    // Now for each profile, fetch their links
    const usersWithLinks = await Promise.all(
      uniqueProfiles.map(async (profile) => {
        // Get links from Supabase
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
    return [...dummyUsers];
  }
};

export const addUserLink = async (
  userId: string,
  name: string,
  url: string,
  isUsingContextAuth: boolean
): Promise<UserLink> => {
  console.log('Adding link for user ID:', userId);
  
  // Convert context user ID to UUID if needed
  const userUuid = getContextUserUuid(userId);
  console.log('Using UUID:', userUuid);
  
  try {
    // Get the current user's ID for activity logging
    const { data: { user } } = await supabase.auth.getUser();
    const adminId = user?.id || userUuid;
    
    // Add link to database
    const { data, error } = await supabase
      .from('user_links')
      .insert({
        user_id: userUuid,
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
      target_user_id: userUuid,
      link_id: data.id,
      link_name: name,
      link_url: url
    });
    
    console.log('Link added successfully:', data);
    
    // Update our local dummy data for backward compatibility
    if (userId === '1' || userId === '2' || userId === '3') {
      dummyUsers = dummyUsers.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            links: [...user.links, data]
          };
        }
        return user;
      });
    }
    
    return data;
  } catch (error) {
    console.error('Error in addUserLink:', error);
    // Return a dummy link as fallback
    const fallbackLink = {
      id: uuidv4(),
      name,
      url
    };
    console.log('Returning fallback link due to error:', fallbackLink);
    return fallbackLink;
  }
};

export const removeUserLink = async (linkId: string, isUsingContextAuth: boolean): Promise<void> => {
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
    
    // Delete link from database
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
    
    // Update our local dummy data for backward compatibility
    if (linkData && linkData.user_id) {
      const contextUser = getContextUserByUuid(linkData.user_id);
      if (contextUser) {
        const contextUserId = contextUser.id;
        dummyUsers = dummyUsers.map(user => {
          if (user.id === contextUserId) {
            return {
              ...user,
              links: user.links.filter(link => link.id !== linkId)
            };
          }
          return user;
        });
      }
    }
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
  // Convert context user IDs to UUIDs if needed
  const adminUuid = getContextUserUuid(adminUserId);
  const targetUuid = getContextUserUuid(targetUserId);
  
  try {
    const { error } = await supabase
      .from('password_change_history')
      .insert({
        admin_user_id: adminUuid,
        target_user_id: targetUuid
      });
    
    if (error) {
      console.error('Error logging password change:', error);
    }
  } catch (error) {
    console.error('Failed to log password change:', error);
  }
};
