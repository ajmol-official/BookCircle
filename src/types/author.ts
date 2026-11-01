/**
 * Author Entity for BookCircle
 *
 * Authors are distinct from BookCircle members (Readers).
 * An author represents a literary creator and their bibliography in the catalogue,
 * regardless of whether they have a BookCircle account.
 *
 * Architecture Note (Future Capabilities):
 * The data structure is prepared for future author onboarding, profile claiming,
 * verified author badges, author self-management of biographies and upcoming releases,
 * official website/social media links, and community reader-author following.
 */
export interface Author {
  id: string; // Unique Author identifier
  slug: string; // URL-safe slug e.g. 'arundhati-roy'
  name: string; // Full name
  photo?: string; // Portrait / photo URL
  nationality?: string; // Country or nationality e.g. 'Indian', 'American', 'South Korean'
  countryFlag?: string; // Country flag emoji e.g. '🇮🇳'
  profession?: string; // Designation e.g. 'Novelist, Essayist & Activist'
  bio?: string; // Biographical narrative
  born?: string; // Birth year e.g. '1961'
  birthPlace?: string; // City, State, Country
  literaryAchievements?: string[]; // Notable awards, honors, fellowships
  notableWorks?: string[]; // Best known titles in literature
  websiteUrl?: string; // Author's official website or publisher portal
  
  // ─── Future-Ready Fields (Author Claiming & Follower System) ───
  isClaimed?: boolean; // Has this profile been claimed by the verified author?
  isVerified?: boolean; // Verified badge flag
  claimedUserId?: string; // BookCircle auth user ID who claimed this profile
  followersCount?: number; // Count of community members following this author
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    goodreads?: string;
    wikipedia?: string;
  };
}
