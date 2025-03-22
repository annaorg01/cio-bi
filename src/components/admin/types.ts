
export interface UserLink {
  id: string;
  name: string;
  url: string;
}

export interface UserData {
  id: string;
  username: string;
  email?: string;
  department?: string;
  full_name?: string;
  role?: string;
  isAdmin?: boolean;
  links: UserLink[];
}
