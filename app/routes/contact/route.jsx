import heroBanner from '~/assets/home/hero-banner.png';
import {InstagramReels} from '~/components/InstagramReels/InstagramReels.jsx';
import {dummyInstagramReels} from '~/components/InstagramReels/getInstagramReels.js';
import {useLoaderData} from 'react-router';
import {ContactMethod} from '~/components/Contact/ContactMethod.jsx';

export const meta = () => {
  return [{title: `Nimie | Contact`}];
};

export default function ContactPage() {
  const data = useLoaderData();
  return (
    <>
      <ContactMethod image={heroBanner} imageAlt="Nimie team" />
      <InstagramReels
        reels={dummyInstagramReels}
        instagramHandle="@NIMIE.IN"
      />
    </>
  );
}
