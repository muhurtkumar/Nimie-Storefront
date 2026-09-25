import {ContactMethod} from '~/components/Home/ContactMethod.jsx';
import heroBanner from '~/assets/Home/hero-banner.png';
// import {InstagramReels} from '~/components/Home/InstagramReels';
// import dummyInstagramReels from '~/components/DummyInstaReels.json';

export const meta = () => {
  return [{title: `Nimie | Contact`}];
};

export default function ContactPage() {
  return (
    <>
      <ContactMethod image={heroBanner} imageAlt="Nimie team" />
      {/* <InstagramReels
              reels={dummyInstagramReels}
              instagramHandle="@NIMIE.IN"
            /> */}
    </>
  );
}
