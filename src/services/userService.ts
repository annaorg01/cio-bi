
import { collection, doc, getDocs, addDoc, deleteDoc, query, where, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/integrations/firebase/client';
import { UserData, UserLink } from '@/components/admin/types';
import { CONTEXT_USERS } from '@/types/auth';
import { v4 as uuidv4 } from 'uuid';

// Helper function to log user activity
const logActivity = async (userId: string, actionType: string, details: any): Promise<void> => {
  try {
    await addDoc(collection(db, 'activity_logs'), {
      user_id: userId,
      action_type: actionType,
      details,
      created_at: new Date()
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

// Get proper UUID for context users
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

// Get user links from Firebase
export const fetchUserLinks = async (userId: string): Promise<UserLink[]> => {
  console.log('Fetching links for user ID:', userId);
  
  // Convert context user ID to UUID if needed
  const userUuid = getContextUserUuid(userId);
  console.log('Using UUID:', userUuid);
  
  try {
    // Fetch links from Firebase
    const q = query(collection(db, 'user_links'), where('user_id', '==', userUuid));
    const querySnapshot = await getDocs(q);
    
    const links: UserLink[] = [];
    querySnapshot.forEach((doc) => {
      links.push({
        id: doc.id,
        name: doc.data().name,
        url: doc.data().url
      });
    });
    
    console.log('Links fetched from Firebase:', links);
    return links;
    
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
    console.log('Fetching users from Firebase...');
    // First, get all profiles
    const profilesSnapshot = await getDocs(collection(db, 'profiles'));
    
    const profiles: any[] = [];
    profilesSnapshot.forEach((doc) => {
      profiles.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('Fetched profiles:', profiles);
    
    // Convert context users to have proper UUIDs for Firebase
    const contextUsersWithUuid = CONTEXT_USERS.map(user => ({
      ...user,
      firebaseId: getContextUserUuid(user.id)
    }));
    
    // Combine and deduplicate users from both sources
    const allProfiles = [
      ...(profiles || []),
      ...contextUsersWithUuid.map(user => ({
        id: user.firebaseId,
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
        // Get links from Firebase
        const q = query(collection(db, 'user_links'), where('user_id', '==', profile.id));
        const querySnapshot = await getDocs(q);
        
        const links: UserLink[] = [];
        querySnapshot.forEach((doc) => {
          links.push({
            id: doc.id,
            name: doc.data().name,
            url: doc.data().url
          });
        });
        
        return {
          id: profile.id,
          username: profile.username || 'Unknown User',
          email: profile.email || '',
          department: profile.department || '',
          full_name: profile.full_name || '',
          links: links
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
    const adminId = userUuid; // Fallback
    
    // Add link to database
    const newLink = {
      user_id: userUuid,
      name,
      url,
      created_at: new Date()
    };
    
    const docRef = await addDoc(collection(db, 'user_links'), newLink);
    
    const linkData = {
      id: docRef.id,
      name,
      url
    };
    
    // Log the activity
    await logActivity(adminId, 'add_link', {
      target_user_id: userUuid,
      link_id: docRef.id,
      link_name: name,
      link_url: url
    });
    
    console.log('Link added successfully:', linkData);
    
    // Update our local dummy data for backward compatibility
    if (userId === '1' || userId === '2' || userId === '3') {
      dummyUsers = dummyUsers.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            links: [...user.links, linkData]
          };
        }
        return user;
      });
    }
    
    return linkData;
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
  console.log('Removing link from Firebase:', linkId);
  
  try {
    // Get link details before deletion for logging
    const linkDocRef = doc(db, 'user_links', linkId);
    const linkDoc = await getDoc(linkDocRef);
    
    if (linkDoc.exists()) {
      const linkData = linkDoc.data();
      
      // Delete link from database
      await deleteDoc(linkDocRef);
      
      // Log the activity
      await logActivity('admin', 'remove_link', {
        link_id: linkId,
        link_name: linkData.name,
        link_url: linkData.url,
        target_user_id: linkData.user_id
      });
      
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
    await addDoc(collection(db, 'password_change_history'), {
      admin_user_id: adminUuid,
      target_user_id: targetUuid,
      changed_at: new Date()
    });
  } catch (error) {
    console.error('Failed to log password change:', error);
  }
};
