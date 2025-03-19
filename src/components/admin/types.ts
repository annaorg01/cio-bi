
export interface UserLink {
  id: string;
  name: string;
  url: string;
}

export interface UserData {
  id: string;
  username: string;
  links: UserLink[];
}
