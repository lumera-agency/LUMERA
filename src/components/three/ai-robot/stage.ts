/*
 * The bridge between the robot's scene and the page's table (BotStory), on its own without three.js: the page loads it
 * whether the robot comes live or as a phone's film, and a phone's page then never pulls three.js in for it.
 */

/** The scene's word to the page (BotStory fills these in): the row a card goes into, the answer to show by the mouth
 *  (null: none), a card recorded as its row, the round starting over. */
export const botStage: {
  rowFor: (index: number) => Element | null;
  /** `under`: the card is held under the head's left (a phone), so the answer goes toward the head's right */
  say: (index: number | null, under?: boolean) => void;
  insert: (index: number) => void;
  reset: () => void;
} = {
  rowFor: () => null,
  say: () => {},
  insert: () => {},
  reset: () => {},
};
