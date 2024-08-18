// @flow
import React from 'react';
import type { Node } from 'react';

import { CardWrapper } from '../CardComponents';

import type { BannerCard } from '../../../entities';
import { BannerCardImage, BannerCardContent } from '../../FeedPortal/FeedPortalBanner';

type FeedBannerCardProps = {
  card: BannerCard,
};

export default function FeedBannerCard({ card }: FeedBannerCardProps): Node {
  const {
    type,
    image_url: image,
    title,
    description,
    content_html: contentHTML,
  } = card.banner_info;

  const renderContent = () => {
    if (type === 'image') {
      return (
        <BannerCardImage
          image={image}
          title={title}
          description={description}
        />
      );
    }
    return (
      <BannerCardContent
        image={image}
        title={title}
        contentHTML={contentHTML}
        description={description}
      />
    );
  };
  return (
    <CardWrapper
      card={card}
      size="auto"
      ghost
      grid="full_w"
      style={{ minHeight: 40 }}
    >
      {renderContent()}
    </CardWrapper>
  );
}
