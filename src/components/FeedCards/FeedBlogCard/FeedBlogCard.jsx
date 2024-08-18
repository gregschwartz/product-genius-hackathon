// @flow
import React from 'react';
import type { Node } from 'react';
import { CardSpace, CardWrapper } from '../CardComponents';

import type { BlogCard } from '../../../entities';
import { AppButton, AppImage } from '../../AppComponents';

type BlogCardProps = {
  card: BlogCard,
};

function FeedBlogCard({ card }: BlogCardProps): Node {
  return (
    <CardWrapper
      card={card}
      size="auto"
      grid="1x2"
    >
      <CardSpace
        type="vertical-full"
        style={{
          paddingBottom: 25,
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <CardSpace style={{ width: '100%' }}>
          <AppImage
            imageURL={card.image_url}
            style={{
              height: 150,
              width: '100%',
              backgroundColor: '#201E7B',
              marginBottom: 30,
            }}
          />
          <CardSpace style={{ padding: '0px 25px' }}>
            <div
              style={{ paddingBottom: 12, color: '#646464' }}
              className="pg-card-text __xl"
            >
              {card.title}
            </div>
            <div
              style={{ paddingBottom: 12, color: '#646464' }}
              className="pg-card-text __md_bold"
            >
              {card.summary}
            </div>
          </CardSpace>
        </CardSpace>
        <AppButton
          size="xl"
          style={{ '--pg-color-bk-btn': '#201E7B', '--pg-color-btn': '#FFFFFF' }}
        >
          Read Article
        </AppButton>
      </CardSpace>
    </CardWrapper>
  );
}

export default FeedBlogCard;
