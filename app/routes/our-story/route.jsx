import { OurStoryHero } from "~/components/OurStory/OurStoryHero";
import { AboutNimie } from "~/components/OurStory/AboutNimie";

import ourStoryHeroImage from "~/assets/OurStory/OurStoryHero.png";
import nimieLogoGreen from "~/assets/OurStory/nimi-logo-green.png";
import nimieLogoWhite from "~/assets/OurStory/nimi-logo-white.png";

/**
 * @type {Route.MetaFunction}
 */
export const meta = () => {
  return [{ title: "Nimie | Our Story" }];
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

const ABOUT_NIMIE_DATA = {
  logoMark: nimieLogoWhite,
  logoMarkAlt: "Nimie",
};

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