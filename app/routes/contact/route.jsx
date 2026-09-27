import heroBanner from '~/assets/home/hero-banner.png';
import {InstagramReels} from '~/components/InstagramReels/InstagramReels.jsx';
import {dummyInstagramReels} from '~/components/InstagramReels/getInstagramReels.js';
import {useLoaderData} from 'react-router';
import {ContactMethod} from '~/components/Contact/ContactMethod.jsx';
// import FAQs from '~/components/Pdp/FAQs';
// import {ProductIntro} from '~/components/Pdp/ProductIntro.jsx';
// import productIntroImage from '~/assets/layout/ProductIntroImage.png'; 

// const PRODUCT_INFO = [
//   'Fabric: Pure cotton-linen',
//   'Craft: Hand-embroidered Lucknow Chikankari',
//   'Neckline: V-neck',
//   'Sleeves: Bell sleeves',
//   'Detail: Tie-knot detailing',
//   'Fit: Oversized, relaxed fit',
// ];

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
      {/* <FAQs />
      <ProductIntro
        image={productIntroImage}
        imageAlt="Nimie team"
        title="Halter Neck Heavy Chikankari"
        info={PRODUCT_INFO}
      /> */}
    </>
  );
}