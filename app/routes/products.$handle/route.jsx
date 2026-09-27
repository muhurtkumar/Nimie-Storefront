import {useLoaderData} from 'react-router';
import {ProductDetails} from '~/components/Pdp/ProductDetails';
import {ProductIntro} from '~/components/Pdp/ProductIntro.jsx';
import FAQs from '~/components/Pdp/FAQs';
import {Reviews} from '~/components/Pdp/Reviews.jsx';
import productIntroImage from '~/assets/layout/ProductIntroImage.png';
import { BehindTheScenes } from '~/components/Home/BehindTheScenes';
import nimieLogo from '~/assets/home/nimie-logo.png';
import clip1 from '~/assets/home/clip-1.mp4';
import clip2 from '~/assets/home/clip-2.mp4';
import clip3 from '~/assets/home/clip-3.mp4';
import clip4 from '~/assets/home/clip-4.mp4';
const PRODUCT_INFO = [
  'Fabric: Pure cotton-linen',
  'Craft: Hand-embroidered Lucknow Chikankari',
  'Neckline: V-neck',
  'Sleeves: Bell sleeves',
  'Detail: Tie-knot detailing',
  'Fit: Oversized, relaxed fit',
];

const REVIEWS_QUERY = `#graphql
  query Reviews {
    metaobjects(type: "review", first: 20) {
      nodes {
        id
        reviewer_name: field(key: "reviewer_name") { value }
        review_date: field(key: "review_date") { value }
        review_text: field(key: "review_text") { value }
      }
    }
  }
`;

export const meta = () => {
  return [{title: `Nimie | Product`}];
};

// --- Merge in whatever your product loader already does ---
// If you already have a loader here (fetching the product by handle,
// variants, etc.), keep that code and just add the reviews fetch below —
// don't replace the whole function with this.
export async function loader(args) {
  const {context} = args;
  const {storefront} = context;

  // const criticalData = await loadCriticalData(args); // <- your existing product fetch, if any

  const {metaobjects} = await storefront.query(REVIEWS_QUERY);
  const reviews = metaobjects.nodes.map((node) => ({
    id: node.id,
    name: node.reviewer_name?.value ?? 'Anonymous',
    date: node.review_date?.value ?? '',
    text: node.review_text?.value ?? '',
  }));

  return {
    // ...criticalData,  <- keep merging in your existing product data here
    reviews,
  };
}

export default function ProductPage() {
  const {reviews /* , product, ...rest */} = useLoaderData();

  return (
    <>
      

      <ProductDetails />
      <ProductIntro
        image={productIntroImage}
        imageAlt="Nimie team"
        title="Halter Neck Heavy Chikankari"
        info={PRODUCT_INFO}
      />

      <Reviews reviews={reviews} />
      {/* <ProductShowcase products={data.showcaseProducts} /> */}
      <BehindTheScenes
              videos={[clip1, clip2, clip3, clip4]}
              logo={nimieLogo}
              eyebrow="From Behind the Scenes"
              heading="Embroided with <3"
              description="From the heart of Lucknow, take an exclusive look behind the scenes at the makers keeping centuries-old craftsmanship alive in every Nimie kurti."
            />
      <FAQs />

    </>
  );
}