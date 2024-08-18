// @flow
import React from 'react';
import type { Node } from 'react';
import { CardSpace, CardWrapper } from '../CardComponents';

import type {
  ComparisonCard,
  ProducDetailsCard,
  AddToCartCB,
} from '../../../entities';
import ProductCardRow from '../FeedProductCard/ProductCardRow';

type ComparisonCardProps = {
  card: ComparisonCard,
  onAddToCart: AddToCartCB,
  onCardSelect: (card: ProducDetailsCard) => void | Promise<void>,
};

function FeedComparisonCard({
  card,
  onAddToCart,
  onCardSelect,
}: ComparisonCardProps): Node {
  const renderComparisonProducts = (): Node => {
    if (card.products.length !== 0) {
      return (
        <CardSpace
          style={{
            padding: '10px',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gridTemplateRows: '1fr',
            gap: '10px',
          }}
        >
          {card.products.map((product) => (
            <ProductCardRow
              key={product.variant_id}
              card={{
                id: card.id,
                product,
                product_type: '',
                source_id: card.source_id,
                layout_state: '1x2',
                type: 'product_detail_card',
                payload: {
                  type: 'new_facet_constraint',
                  facet: 'variant_id',
                  value: String(product.variant_id),
                },
                product_recommendation_type: 'product_detail_card',
              }}
              onAddToCart={onAddToCart}
              onCardSelect={onCardSelect}
            />
          ))}
        </CardSpace>
      );
    }
    return null;
  };

  return (
    <CardWrapper
      card={card}
      size="auto"
      grid="1x2"
      style={{ overflow: 'hidden' }}
    >
      <CardSpace style={{ backgroundColor: '#F2F2F2' }}>
        {card.comparison_info.card_title && (
          <div
            style={{
              fontSize: 17,
              fontWeight: 600,
              padding: '15px 20px 0px 20px',
            }}
            className="pg-card-rich-text"
          >
            {card.comparison_info.card_title}
          </div>
        )}
        {card.comparison_info.title && (
          <div
            style={{
              fontSize: 15,
              fontWeight: 500,
              padding: '20px',
            }}
            className="pg-card-rich-text"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: card.comparison_info.title }}
          />
        )}
        {card.comparison_info.description && (
          <div
            style={{
              fontSize: 15,
              fontWeight: 500,
              padding: '20px',
              borderTop: '1px solid #CFCFCF',
            }}
            className="pg-card-rich-text"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{
              __html: card.comparison_info.description,
            }}
          />
        )}
      </CardSpace>
      {renderComparisonProducts()}
    </CardWrapper>
  );
}

export default FeedComparisonCard;
