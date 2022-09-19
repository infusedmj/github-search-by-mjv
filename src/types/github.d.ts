export type Repo = {
  id: number;
  full_name: string;
  description: string;
  language: string;
  owner: string;
  owner_url: string;
  created_at: string;
  updated_at: string;
  tags: Array<string>;
  url: string;
  stars: number;
  license: string;
};
