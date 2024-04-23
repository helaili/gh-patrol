import { Installation, InstallationLite, Organization, User } from '@octokit/webhooks-types';


export interface PersonalAccessTokenRequestCreatedEvent {
  action: "created";
  personal_access_token_request: {
    id: number;
    owner: User;
    repository_selection: "none" | "all" | "selected";
    repository_count: number | null;
    repositories: [];
    permissions_added: {};
    permissions_upgraded: {};
    permissions_result: {};
    created_at: string;
    token_expired: boolean;
    token_expires_at: string;
    token_last_used_at: string | null;
  };
  organization: Organization;
  sender: User;
  installation: InstallationLite;
  enterprise: {
    id: number;
    slug: string;
    name: string;
    node_id: string;
    avatar_url: string;
    description: string;
    website_url: string;
    html_url: string;
    created_at: string;
    updated_at: string;
  }
}