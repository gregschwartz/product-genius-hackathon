/* eslint-disable react/no-danger */
// @flow
import React, { useContext } from 'react';
import type { Node } from 'react';
import { m } from 'framer-motion';
import { DesignContext } from '../../context';

// $FlowIgnore
import './feedPortalBanner.scss';
import { getBannerAttributes } from './util';

type BannerCardImageProps = {
  image: string,
  title?: string,
  description?: string,
};
export function BannerCardImage({
  image,
  title,
  description,
}: BannerCardImageProps): Node {
  const renderContentText = () => {
    if (title || description) {
      return (
        <div className="pg-portal-banner-text">
          {title && <div className="pg-portal-banner-title">{title}</div>}
          {description && (
            <div className="pg-portal-banner-description">{description}</div>
          )}
        </div>
      );
    }
    return null;
  };
  return (
    <m.div data-type="image" className="pg-portal-banner">
      <img
        className="pg-portal-banner-image"
        src={image}
        alt="banner card"
        data-type="image"
        data-status="loading"
        onError={({ currentTarget }) => {
          currentTarget.setAttribute('data-status', 'error');
        }}
        onLoad={({ currentTarget }) => {
          currentTarget.setAttribute('data-status', 'loaded');
        }}
      />
      <div data-type="image" className="pg-portal-banner-content">
        {renderContentText()}
      </div>
    </m.div>
  );
}

BannerCardImage.defaultProps = {
  title: '',
  description: '',
};

type BannerCardContentProps = {
  image: string,
  title?: string,
  description?: string,
  contentHTML?: string,
};
export function BannerCardContent({
  image,
  title,
  description,
  contentHTML,
}: BannerCardContentProps): Node {
  const renderContentImage = () => {
    if (image) {
      return (
        <img
          className="pg-portal-banner-image"
          src={image}
          alt="banner card"
          data-type="content"
          data-status="loading"
          onError={({ currentTarget }) => {
            currentTarget.setAttribute('data-status', 'error');
          }}
          onLoad={({ currentTarget }) => {
            currentTarget.setAttribute('data-status', 'loaded');
          }}
        />
      );
    }
    return null;
  };

  if (contentHTML) {
    return (
      <m.div
        data-type="content"
        data-selector="pg-banner-card-full-w"
        className="pg-portal-banner"
      >
        {renderContentImage()}
        <div data-type="content" className="pg-portal-banner-content">
          {title && <div className="pg-portal-banner-title">{title}</div>}
          <div
            className="pg-portal-banner-text"
            dangerouslySetInnerHTML={{ __html: contentHTML }}
          />
        </div>
      </m.div>
    );
  }
  const renderContentText = () => {
    if (title || description) {
      return (
        <div className="pg-portal-banner-text">
          {title && <div className="pg-portal-banner-title">{title}</div>}
          {description && (
            <div className="pg-portal-banner-description">{description}</div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <m.div data-type="content" className="pg-portal-banner">
      {renderContentImage()}
      <div data-type="content" className="pg-portal-banner-content">
        {renderContentText()}
      </div>
    </m.div>
  );
}

BannerCardContent.defaultProps = {
  title: '',
  description: '',
  contentHTML: '',
};

function FeedPortalBanner(): Node {
  const {
    embedded: { banner },
  } = useContext(DesignContext);
  if (!banner.visible) return null;
  const { image, title, description } = getBannerAttributes(banner.content);
  if (!image && !title && !description) {
    return null;
  }
  if (banner.type === 'image') {
    return (
      <BannerCardImage image={image} title={title} description={description} />
    );
  }
  return (
    <BannerCardContent image={image} title={title} description={description} />
  );
}

export default FeedPortalBanner;
