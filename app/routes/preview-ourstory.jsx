/**
 * TEMPORARY PREVIEW ROUTE — delete this file once OurStoryHero has a
 * real home on the About page.
 *
 * This does NOT touch app/routes/_index/route.jsx (your homepage) or
 * any other route. It's a standalone page at /preview-ourstory, only
 * for looking at the component in the browser while you build it.
 *
 * It reuses image assets that already exist in your project
 * (nimie-logo.png, hero-banner.png) purely as stand-ins, so nothing
 * here depends on a file that doesn't exist yet. Swap them for real
 * About-page assets once you have them.
 */
import { OurStoryHero } from "~/components/OurStory/OurStoryHero";
import { AboutNimie } from "~/components/OurStory/AboutNimie";

import ourStoryHeroImage from "~/assets/OurStory/OurStoryHero.png";
import nimieLogoGreen from "~/assets/OurStory/nimi-logo-green.png";
import nimieLogoWhite from "~/assets/OurStory/nimi-logo-white.png";

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{ title: "Preview | Our Story" }];
};

/* =========================================================
   OUR STORY HERO DATA
   ========================================================= */

const OUR_STORY_HERO_DATA = {
  logoMark: nimieLogoGreen,
  logoMarkAlt: "Nimie",

  description:
    "At Nimie™, we believe your everyday style shouldn't come at the cost of your heritage. By blending traditional artisan craftsmanship with contemporary design, we're keeping the art alive on your terms, effortless, versatile, and entirely wearable.",

  image: ourStoryHeroImage,
  imageAlt: "Nimie Our Story",
};

/* =========================================================
   ABOUT NIMIE DATA
   ========================================================= */

const ABOUT_NIMIE_DATA = {
  logoMark: nimieLogoWhite,
  logoMarkAlt: "Nimie",
};

/* =========================================================
   PREVIEW PAGE
   ========================================================= */

export default function PreviewOurStory() {
  return (
    <main>
      {/* Our Story Hero */}
      <OurStoryHero {...OUR_STORY_HERO_DATA} />

      {/* About Nimie */}
      <AboutNimie {...ABOUT_NIMIE_DATA} />
    </main>
  );
}

// http://localhost:3000/preview-ourstory