import {Await, useLoaderData} from 'react-router';
import {Suspense} from 'react';

import heroBanner from '~/assets/home/hero-banner.png';
import contactVideo from '~/assets/Contact/Contact.webm';

import {InstagramReels} from '~/components/InstagramReels/InstagramReels.jsx';
import {ContactMethod} from '~/components/Contact/ContactMethod.jsx';

export const meta = () => {
  return [{title: 'Nimie | Contact'}];
};

/**
 * @param {Route.LoaderArgs} args
 */
export async function loader({context}) {
  const instagramReels = import('~/lib/instafeed.server.js')
    .then(({getInstagramFeed}) => getInstagramFeed(context.env))
    .then((data) => {
      return (data?.data || [])
        .filter(
          (item) =>
            item.type === 'video' &&
            item.videos?.standard_resolution?.url,
        )
        .map((item) => ({
          id: item.id,
          media_type: 'VIDEO',
          media_url: item.videos.standard_resolution.url,
          thumbnail_url: item.images?.standard_resolution?.url
            ? `/api/instagram-media?url=${encodeURIComponent(
                item.images.standard_resolution.url,
              )}`
            : '',
          permalink: item.link,
          caption: item.caption?.text || '',
        }));
    })
    .catch((error) => {
      console.error('Failed to load Instagram reels on Contact page:', error);
      return [];
    });

  return {instagramReels};
}

export default function ContactPage() {
  const {instagramReels} = useLoaderData();

  return (
    <>
      <ContactMethod
        image={heroBanner}
        video={contactVideo}
        imageAlt="Nimie team"
      />

      <Suspense fallback={null}>
        <Await resolve={instagramReels}>
          {(reels) => (
            <InstagramReels
              reels={reels}
              instagramHandle="@nimie.in"
            />
          )}
        </Await>
      </Suspense>
    </>
  );
}

/** @typedef {import('./+types/route').Route} Route */