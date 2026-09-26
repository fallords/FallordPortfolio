/** Shorter than this, the intro reads as a flicker rather than an intro. */
export const INTRO_MIN_MS = 500;
/** The intro never holds the page past this point, counted from the start of the page load. */
export const INTRO_MAX_MS = 1500;
/** Matches the fade on .intro in globals.css. */
export const INTRO_FADE_MS = 500;
/**
 * A page whose HTML took longer than this to arrive is already slow; the
 * intro would only make it slower, so it doesn't play.
 */
const INTRO_LATE_MS = INTRO_MAX_MS - INTRO_MIN_MS;
/** If the app hasn't started by now, stop waiting for it (see below). */
const HYDRATE_MS = 3000;

/**
 * Runs in <head>, before the first paint. Two jobs.
 *
 * It marks the page `data-js` for as long as JavaScript can be trusted to
 * run it. Anything hidden until a script reveals it (the scroll reveals) is
 * hidden only under that mark, and if the app hasn't started within
 * HYDRATE_MS (a bundle that failed to load, a browser too old for it) the
 * mark comes off and everything simply shows. The app confirms it started
 * by setting `data-hydrated`.
 *
 * And it owns the intro's life span: whether it plays at all (once per
 * session; not under reduced motion; not when the page is already late;
 * never without JavaScript, since the screen only exists while
 * `data-intro="show"`), and lifting it at INTRO_MAX_MS whatever else happens.
 * IntroScreen lifts it sooner, as soon as the page is actually ready.
 */
export const BOOT_SCRIPT = `(function(){var d=document.documentElement,now=performance.now();d.dataset.js="";setTimeout(function(){if(!("hydrated" in d.dataset))delete d.dataset.js},${HYDRATE_MS});try{if(sessionStorage.getItem("intro-seen")||matchMedia("(prefers-reduced-motion: reduce)").matches||now>${INTRO_LATE_MS}){d.dataset.intro="skip";return}}catch(e){}d.dataset.intro="show";setTimeout(function(){if(d.dataset.intro!=="show")return;d.dataset.intro="leaving";try{sessionStorage.setItem("intro-seen","1")}catch(e){}setTimeout(function(){d.dataset.intro="done"},${INTRO_FADE_MS})},Math.max(0,${INTRO_MAX_MS}-now))})()`;
