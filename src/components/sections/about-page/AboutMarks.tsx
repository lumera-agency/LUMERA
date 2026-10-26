/** The photos' places, until the owner adds the photos: thin line drawings in the captions' grey (about.css), never an
 *  accent and never a stock face. One person for a card, three for the team's picture. */
export function PersonMark() {
  return (
    <svg className="about-ph__ico" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <circle cx="24" cy="18.5" r="7.5" />
      <path d="M10.5 40c1.6-7.4 7-11.5 13.5-11.5S35.9 32.6 37.5 40" />
    </svg>
  );
}

export function TeamMark() {
  return (
    <svg className="about-ph__ico about-ph__ico--team" viewBox="0 0 72 48" aria-hidden="true" focusable="false">
      <circle cx="36" cy="17" r="7" />
      <path d="M23.5 40c1.5-6.9 6.5-10.7 12.5-10.7S47 33.1 48.5 40" />
      <circle cx="16" cy="20.5" r="5.5" />
      <path d="M5 39c1.2-5.4 5.2-8.4 10.5-8.4 2.3 0 4.3.6 6 1.6" />
      <circle cx="56" cy="20.5" r="5.5" />
      <path d="M67 39c-1.2-5.4-5.2-8.4-10.5-8.4-2.3 0-4.3.6-6 1.6" />
    </svg>
  );
}
