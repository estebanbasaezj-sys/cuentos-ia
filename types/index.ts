export interface User {
  id: string;
  email: string;
  name: string | null;
  password_hash: string | null;
  image: string | null;
  provider: 'credentials' | 'google';
  is_subscribed: number;
  stories_today: number;
  last_story_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Story {
  id: string;
  user_id: string;
  title: string | null;
  child_name: string;
  child_age_group: string;
  theme: string;
  tone: string;
  length: string;
  traits: string | null;
  status: 'queued' | 'generating_text' | 'generating_images' | 'ready' | 'failed';
  generation_progress: number;
  error_message: string | null;
  flagged_count: number;
  credit_cost: number;
  image_quality: string;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  story_id: string;
  page_number: number;
  text: string;
  image_url: string | null;
  image_prompt: string | null;
  created_at: string;
  updated_at: string;
}

export interface Share {
  id: string;
  story_id: string;
  share_token: string;
  expires_at: string;
  revoked: number;
  created_at: string;
}

export interface Report {
  id: string;
  story_id: string;
  user_id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  created_at: string;
}

export interface StoryWithPages extends Story {
  pages: Page[];
}

export interface GenerationStatus {
  status: Story['status'];
  progress: number;
  title: string | null;
  error: string | null;
}

export interface CreateStoryInput {
  childName: string;
  childAgeGroup: string;
  theme: string;
  customTheme?: string;
  tone: string;
  length: string;
  artStyle?: string;
  colorPalette?: string;
  traits?: {
    mascota?: string;
    colorFavorito?: string;
    artStyle?: string;
    colorPalette?: string;
  };
}

export interface UsageInfo {
  planType: 'free' | 'premium';
  storiesThisWeek: number;
  storiesThisMonth: number;
  weeklyLimit: number;
  monthlyLimit: number;
  freeRemaining: number;
  libraryCount: number;
  libraryLimit: number;
  monthlyCreditsRemaining: number;
  purchasedCreditsBalance: number;
  totalCreditsAvailable: number;
  renewalDate: string | null;
}

export interface Wallet {
  id: string;
  user_id: string;
  plan_type: 'free' | 'premium';
  credits_balance: number;
  monthly_credits_remaining: number;
  monthly_credits_total: number;
  renewal_date: string | null;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: 'none' | 'active' | 'canceled' | 'past_due';
  created_at: string;
  updated_at: string;
}

export interface CreditLedgerEntry {
  id: string;
  user_id: string;
  amount: number;
  balance_after: number;
  source: string;
  reference_id: string | null;
  description: string | null;
  created_at: string;
}

export interface GateResult {
  allowed: boolean;
  reason?: string;
  paywallType?: 'upgrade' | 'topup';
}
