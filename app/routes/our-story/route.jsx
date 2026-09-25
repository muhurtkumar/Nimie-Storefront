import {OurStoryHero} from '~/components/OurStory/OurStoryHero';
import {AboutNimie} from '~/components/OurStory/AboutNimie';

export const meta = () => [
  {title: 'Nimie | Our Story'},
];

export default function OurStory() {
  return (
    <main>
      <OurStoryHero />
      <AboutNimie />
    </main>
  );
}