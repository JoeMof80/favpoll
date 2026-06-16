export type User = {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type Charity = {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  registered_number: string | null;
  created_at: string;
};

export type Topic = {
  id: string;
  title: string;
  description: string | null;
  is_finite: boolean;
  is_active: boolean;
  created_by: string | null;
  created_at: string;
};

export type Favourite = {
  id: string;
  topic_id: string;
  label: string;
  all_time_pledged: number;
  all_time_count: number;
  is_canonical: boolean;
  source: "seed" | "organiser" | "guest";
  review_status?: "pending_review" | "accepted" | "rejected";
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  markets: string[];
  event_count: number;
  total_pledge_count: number;
  created_at: string;
  display_order?: number | null;
  // Present when fetched via favpoll_poll_favourites (infinite topics in favpoll context)
  favpoll_poll_item_id?: string;
  // Visibility state per favpoll poll — set when fetched via favpoll_poll_favourites join
  is_hidden?: boolean;
  is_guest_added?: boolean;
};

export type Protagonist = {
  id: string;
  name: string;
  context: string | null;
  about: string | null;
  photo_url: string | null;
  created_by: string | null;
  created_at: string;
};

export type Register =
  | "remembering"
  | "celebrating_one"
  | "celebrating_many"
  | "cause"
  | "neutral";

export type FavpollCategory = "celebration" | "memorial" | "fundraiser";
export type FavpollGrouping = "individual" | "couple" | "group";
export type FavpollSubject = "someone" | "cause";

export type Favpoll = {
  id: string;
  protagonist_id: string | null;
  subject: FavpollSubject;
  cause_label: string | null;
  occasion_type: string | null;
  opening_line: string | null;
  market: string;
  created_by: string;
  closes_at: string;
  original_closes_at: string | null;
  hard_close_at: string | null;
  extension_count: number;
  closed_at: string | null;
  total_raised: number;
  is_private: boolean;
  is_plural: boolean | null;
  is_exemplar?: boolean;
  is_listed?: boolean;
  category?: FavpollCategory | null;
  grouping?: FavpollGrouping;
  description: string | null;
  created_at: string;
};

export type FavpollPoll = {
  id: string;
  favpoll_id: string;
  topic_id: string;
  personal_reveal: string | null;
  created_at: string;
};

export type Pledge = {
  id: string;
  favpoll_poll_id: string;
  clerk_user_id: string | null;
  guest_email: string | null;
  guest_token: string | null;
  pot_allocation_id: string | null;
  total_amount: number;
  fee: number;
  withdrawn_at: string | null;
  created_at: string;
};

export type PledgeAllocation = {
  id: string;
  pledge_id: string;
  favourite_id: string;
  amount: number;
};

export type FavpollPot = {
  id: string;
  favpoll_id: string;
  created_by: string;
  total_deposited: number;
  total_allocated: number;
  created_at: string;
};

export type PotAllocation = {
  id: string;
  pot_id: string;
  allocated_to: string;
  amount: number;
  created_at: string;
};

export type FavpollInvite = {
  id: string;
  favpoll_id: string;
  email: string;
  created_at: string;
};

export type FavpollPollFavourite = {
  id: string;
  favpoll_poll_id: string;
  favourite_id: string;
  is_guest_added: boolean;
  added_by: string | null;
  is_hidden: boolean;
  hidden_at: string | null;
  hidden_by: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  label: string;
  description: string | null;
  created_at: string;
};

export type TopicCategory = {
  topic_id: string;
  category_id: string;
};

// Joined types for UI
export type FavpollWithDetails = Favpoll & {
  protagonists: Protagonist | null;
  favpoll_charities: { charities: Charity }[];
};

export type FavpollPollWithItems = FavpollPoll & {
  topics: Topic & { favourites: Favourite[] };
};

export type PledgeWithAllocations = Pledge & {
  pledge_allocations: PledgeAllocation[];
};

// Shared types used by EventFormV2 and server actions
export type TopicPlaceholders = Record<
  string,
  {
    about?: string;
    reveal: string;
    pronouns?: "she" | "he" | "they";
    group?: "pair" | "set";
  }
>;

export type TopicWithMeta = Topic & {
  favourites: Favourite[];
  category_ids: string[];
  placeholders?: TopicPlaceholders;
};

export type GeneratedDraft = {
  id: string;
  cache_key: string;
  register: string | null;
  topic_id: string | null;
  primary_charity_id: string | null;
  subject: string | null;
  about: string | null;
  reveal: string | null;
  model: string | null;
  status: "generated" | "curated" | "rejected";
  created_at: string;
};

export type CanvasPollInput = {
  id?: string;
  topicId: string | null;
  topicIsCustom: boolean;
  customTopicTitle: string;
  customTopicItems: string[];
  reveal: string | null;
  infiniteItems: { canonicalItemIds: string[]; customLabels: string[] } | null;
};

export type CanvasSubmitData = {
  protagonistName: string;
  protagonistAbout?: string | null;
  dateLabel: string | null;
  photoUrl?: string | null;
  category: FavpollCategory | null;
  grouping: FavpollGrouping;
  subject: FavpollSubject;
  causeLabel: string | null;
  openingLine: string | null;
  description: string | null;
  charityIds: string[];
  closesAt: string;
  isPrivate: boolean;
  isListed: boolean;
  potAmount: number | null;
  poll: CanvasPollInput;
};
