// @flow
import React, { useRef } from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';

// $FlowIgnore
import './appImage.scss';
import { fallbackURL } from '../../../hooks';

import {
  generateImageSrcSet,
  generateImageSizes,
} from '../../../utils/componentUtils';

type AppImageProps = {
  imageURL: string,
  position?: string,
  hover?: boolean,
  shadow?: boolean,
  imageBadge?: Node,
  dynamic?: boolean,
  style?: { [string]: any },
  onError?: (image: HTMLImageElement) => void | Promise<void>,
};

function AppImage({
  imageURL,
  position,
  shadow,
  dynamic,
  imageBadge,
  style,
  hover,
  onError,
}: AppImageProps): Node {
  const status = useRef('initial');
  return (
    <m.div
      data-status="loaded"
      data-model="background"
      data-shadow={shadow}
      data-hover={hover}
      style={style}
      className="pg-app-image"
      viewport={{ once: true }}
    >
      {imageBadge}
      <img
        alt="pg_image"
        className="pg-app-image-content"
        src={imageURL || ''}
        srcSet={dynamic ? generateImageSrcSet(imageURL) : undefined}
        sizes={dynamic ? generateImageSizes() : undefined}
        loading="lazy"
        style={{ objectPosition: position, margin: 0 }}
        onError={({ currentTarget }) => {
          if (status.current === 'initial') {
            status.current = 'error';
            currentTarget.removeAttribute('srcset');
            currentTarget.removeAttribute('sizes');
            currentTarget.setAttribute('src', fallbackURL);
            currentTarget.setAttribute('data-status', 'empty');
            if (onError) {
              onError(currentTarget);
            }
          }
        }}
      />
    </m.div>
  );
}

AppImage.defaultProps = {
  shadow: false,
  hover: false,
  imageBadge: null,
  dynamic: false,
  position: 'unset',
  style: undefined,
  onError: undefined,
};

export default AppImage;
