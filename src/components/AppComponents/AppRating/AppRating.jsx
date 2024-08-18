// @flow
import React from 'react';
import type { Node } from 'react';

// $FlowIgnore
import './appRating.scss';

type RatingProps = {
  ratingValue: number,
  showCount?: boolean,
  ratingCount?: number,
  style?: { [string]: any },
};

function Rating({
  ratingValue,
  ratingCount,
  style,
  showCount,
}: RatingProps): Node {
  const renderStarRating = () => {
    const ratingArr = [];
    for (let i = 0; i < 5; i += 1) {
      const ratingEntry = ratingValue - i;
      if (ratingEntry > 0.75) {
        ratingArr.push(
          <span key={`full-star-${i}`} className="pg-rating-star pg-star-full">
            &#9733;
          </span>,
        );
      } else if (ratingEntry > 0.35) {
        ratingArr.push(
          <span key={`half-star-${i}`} className="pg-rating-star pg-star-half">
            <div>&#9733;</div>
            <div>&#9733;</div>
          </span>,
        );
      } else {
        ratingArr.push(
          <span
            key={`empty-star-${i}`}
            className="pg-rating-star pg-star-empty"
          >
            &#9733;
          </span>,
        );
      }
    }
    return <div className="pg-rating-stars">{ratingArr}</div>;
  };

  const renderRatingCount = () => {
    if (showCount && ratingCount !== undefined) {
      return (
        <span data-multiple={ratingCount > 1} className="pg-rating-count">
          {`${ratingCount} `}
        </span>
      );
    }
    return null;
  };

  return (
    <div style={style} className="pg-rating">
      {renderStarRating()}
      {renderRatingCount()}
    </div>
  );
}

Rating.defaultProps = {
  showCount: false,
  ratingCount: undefined,
  style: undefined,
};

export default Rating;
