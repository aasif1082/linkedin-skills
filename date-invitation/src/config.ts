/**
 * ─────────────────────────────────────────────────────────────
 *  PERSONALIZE ME ❤️
 *  Everything you need to change lives in this one object.
 *  Edit, save, rebuild, redeploy. Nothing else is hardcoded.
 * ─────────────────────────────────────────────────────────────
 */
export const CONFIG = {
  /** Her name, used in "Hey ___ ❤️" and after confirmation. */
  GIRLFRIEND_NAME: 'Lakshmi',

  /** Your name, shown in the footer and the calendar invite signature. */
  YOUR_NAME: 'Your favourite person',

  /** Title of the calendar event she adds. */
  EVENT_TITLE: 'Date with ❤️',

  /** Shown on the confirmation card when she leaves the message field empty. */
  DEFAULT_MESSAGE: "Can't wait ❤️",

  /**
   * Body of the calendar event. `{signature}` is replaced with YOUR_NAME.
   * Her optional note is appended underneath automatically.
   */
  EVENT_DESCRIPTION:
    "It's a date! ❤️\n\n" +
    'You said YES, so now you officially have a date with me.\n\n' +
    "Can't wait to see you.\n\n" +
    '— {signature} ❤️',

  /** How long a timed date lasts on the calendar (only used if she picks a time). */
  EVENT_DURATION_HOURS: 2,
} as const;

/** The playful replies, one per NO click, in order. */
export const NO_MESSAGES = [
  'I think you clicked the wrong button.',
  "That doesn't look like a YES to me.",
  'Please reconsider. I have emotionally prepared for this date.',
  "Okay… I'll ask again. Will you go on a date with me? 🥺",
  'The YES button is looking particularly beautiful today.',
  "I promise it'll be worth it.",
  'One tiny date? Pretty please?',
  "Okay, I'm not giving up that easily.",
  'Final chance… maybe? ❤️',
] as const;
