/** The rich-text tags the messages use (t.rich): the key word, the signal word, a highlight, a break. */
export const rich = {
  hl: (chunks: React.ReactNode) => <em className="hl">{chunks}</em>,
  sig: (chunks: React.ReactNode) => <em className="sig">{chunks}</em>,
  mark: (chunks: React.ReactNode) => <mark>{chunks}</mark>,
  b: (chunks: React.ReactNode) => <b>{chunks}</b>,
  br: () => <br />,
  contact: (chunks: React.ReactNode) => <a className="link" href="#contact">{chunks}</a>,
};
