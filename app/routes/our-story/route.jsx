import { OurStoryHero } from "~/components/OurStory/OurStoryHero";
import { AboutNimie } from "~/components/OurStory/AboutNimie";

import ourStoryHeroImage from "~/assets/OurStory/OurStoryHero.png";
import nimieLogoGreen from "~/assets/OurStory/nimi-logo-green.png";
import nimieLogoWhite from "~/assets/OurStory/nimi-logo-white.png";
import {InstagramReels} from '~/components/InstagramReels/InstagramReels.jsx';
import {dummyInstagramReels} from '~/components/InstagramReels/getInstagramReels.js';
import { AboutCurator } from "~/components/OurStory/AboutCurator";

import { OurStoryQuote } from "~/components/OurStory/OurStoryQuote";
import ourStoryQuoteImage from "~/assets/OurStory/OurStoryQuote.png";

import aboutCuratorImage from "~/assets/OurStory/AboutCurator.png";
import aboutCuratorSignature from "~/assets/OurStory/AboutCuratorSignature.png";


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

const OUR_STORY_QUOTE_DATA = {
  image: ourStoryQuoteImage,
  quote: "Because tradition doesn't have to stay the same to stay meaningful.",
};

const ABOUT_CURATOR_DATA = {
  image: aboutCuratorImage,
  imageAlt: "Anika, founder of Nimie",
  eyebrow: "About the curator",
  paragraphs: [
    "Hi, I'm Anika, a fashion designer, a NIFT graduate, and someone deeply rooted in India's cultural landscape.",
    "Growing up in Lucknow, heritage wasn't just something in history books, it was woven into my daily surroundings. Among all the local crafts, Chikankari was always closest to my heart.",
    "As I grew up and began defining my own style, a gap started to form. My wardrobe shifted toward contemporary silhouettes and clean cuts, while the Chikankari I loved remained heavy, traditional, and complex. I couldn't find authentic pieces that matched modern aesthetics. I felt disconnected from my own roots simply because the craft hadn't evolved with the times. So, I decided to design it myself.",
  ],
  signature: aboutCuratorSignature,
  signatureAlt: "Anika's signature",
};

export default function PreviewOurStory() {
  return (
    <main>
      {/* Our Story Hero */}
      <OurStoryHero {...OUR_STORY_HERO_DATA} />

      {/* About Nimie */}
      <AboutNimie {...ABOUT_NIMIE_DATA} />

      <OurStoryQuote {...OUR_STORY_QUOTE_DATA} />

      <AboutCurator {...ABOUT_CURATOR_DATA} />

      <InstagramReels
              reels={dummyInstagramReels}
              instagramHandle="@NIMIE.IN"
            />
    </main>
  );
}