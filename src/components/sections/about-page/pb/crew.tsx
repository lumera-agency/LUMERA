/**
 * The team's three roles, shared by block 1 (the passes on the rail, PbTeam) and block 3 (the signature's avatars,
 * PbWord): their photos and their glyphs.
 */

export const ROLES = [1, 2, 3] as const;
export type Role = (typeof ROLES)[number];

/**
 * The team's photos, one per role (the owner sends real ones; the same files serve the hero's passes and the quote's
 * signature). Put a path here, e.g. `1: "/img/about/team-1.jpg"`, and that role shows the photo everywhere on the page
 * (cover-cropped: the pass's 4:5 frame, the signature's round avatar); `null`: the finished empty frame. Nothing else
 * changes, every frame keeps its size either way.
 */
export const PHOTOS: Record<Role, string | null> = { 1: null, 2: null, 3: null };

/** each role's glyph in its empty photo frame (thin line, no people): two speech bubbles (the first conversation), a
 *  route through three stops (a project from the first talk to the launch), the pen's nib over a screen (design and
 *  build); drawn on a 48-unit square */
export const GLYPH: Record<Role, React.ReactNode> = {
  1: (
    <>
      <path d="M8 13.5c0-3 2.4-5.5 5.5-5.5h13c3 0 5.5 2.5 5.5 5.5v7c0 3-2.5 5.5-5.5 5.5H18l-6 4.5v-4.6A5.5 5.5 0 0 1 8 20.5z" />
      <path d="M36 19h3.5c2.5 0 4.5 2 4.5 4.5v6c0 2.5-2 4.5-4.5 4.5H39v4l-5.2-4H29c-2.5 0-4.5-2-4.5-4.5V30" />
      <path d="M15 16.5h11M15 20.5h7" />
    </>
  ),
  2: (
    <>
      <circle cx="10" cy="36" r="3.5" />
      <circle cx="26" cy="15" r="3.5" />
      <circle cx="40" cy="34" r="3.5" />
      <path d="M12.5 33.5c3-6 7-12 11-16M28.5 17.5c3.5 4 6.5 8.5 9.4 13.6" strokeDasharray="0.1 3.2" />
      <path d="M40 30.5V9.5M40 9.5h-7l2 3-2 3h7" />
    </>
  ),
  3: (
    <>
      <rect x="6" y="9" width="36" height="25" rx="3" />
      <path d="M6 15h36M18 40h12M24 34v6" />
      <path d="m27 30.5 9.5-9.5 4.3 4.3-9.5 9.5-5.6 1.3z" />
      <path d="m33.8 23.7 4.3 4.3" />
    </>
  ),
};

/** the studio's mark (public/img/logo-mark.svg), in the passes' bands and the signature */
export function Mark({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 329 329" aria-hidden="true" focusable="false">
      <path d="M119 269.5C119 302.361 92.3609 329 59.5 329C26.6391 329 0 302.361 0 269.5C0 253.546 6.27877 239.059 16.5 228.375C26.7212 217.691 53 193.038 53 164.5C53 135.962 26.7212 111.309 16.5 100.625C6.27877 89.9406 0 75.4536 0 59.5C0 26.6391 26.6391 0 59.5 0C92.3609 0 119 26.6391 119 59.5C119 75.4536 112.721 89.9406 102.5 100.625C92.2788 111.309 66 135.962 66 164.5C66 193.038 92.2788 217.691 102.5 228.375C112.721 239.059 119 253.546 119 269.5Z" />
      <path d="M59.5 329C26.6391 329 0 302.361 0 269.5C0 236.639 26.6391 210 59.5 210C75.4536 210 89.9406 216.279 100.625 226.5C111.309 236.721 135.962 263 164.5 263C193.038 263 217.691 236.721 228.375 226.5C239.059 216.279 253.546 210 269.5 210C302.361 210 329 236.639 329 269.5C329 302.361 302.361 329 269.5 329C253.546 329 239.059 322.721 228.375 312.5C217.691 302.279 193.038 276 164.5 276C135.962 276 111.309 302.279 100.625 312.5C89.9406 322.721 75.4536 329 59.5 329Z" />
      <circle cx="270" cy="59" r="59" />
    </svg>
  );
}
