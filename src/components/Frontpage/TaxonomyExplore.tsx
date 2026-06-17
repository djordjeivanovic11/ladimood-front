'use client';

import ExploreCardGrid, { type ExploreCard } from './ExploreCardGrid';
import { useCategoriesQuery, useCollectionsQuery } from '@/hooks/queries/useProducts';

const TaxonomyExplore = () => {
  const { data: categories = [] } = useCategoriesQuery();
  const { data: collections = [] } = useCollectionsQuery();

  const categoryCards: ExploreCard[] = categories.slice(0, 3).flatMap((category) => {
    const imageSrc = category.image_url?.trim();
    if (!imageSrc) return [];

    return [
      {
        title: category.name.toUpperCase(),
        subtitle: category.description || 'Istraži proizvode iz ove kategorije',
        imageSrc,
        link: `/shop?category_id=${category.id}`,
      },
    ];
  });

  const collectionCards: ExploreCard[] = collections.slice(0, 3).flatMap((collection) => {
    const imageSrc = collection.hero_image_url?.trim();
    if (!imageSrc) return [];

    return [
      {
        title: collection.name.toUpperCase(),
        subtitle: collection.description || 'Istraži proizvode iz ove kolekcije',
        imageSrc,
        link: `/shop?collection_id=${collection.id}`,
      },
    ];
  });

  const cards = [...categoryCards, ...collectionCards];

  if (cards.length === 0) return null;

  return <ExploreCardGrid cards={cards} />;
};

export default TaxonomyExplore;
