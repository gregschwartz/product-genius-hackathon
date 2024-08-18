// @flow
import React from 'react';
import type { Node } from 'react';
import { m } from 'framer-motion';

export function NativeCartWrapper({
  variantId,
}: {
  variantId: string | number,
}): Node {
  return (
    <m.form
      method="post"
      action="/cart/add"
      id="product_form_id"
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      <input type="hidden" name="product-id" value={variantId} />
    </m.form>
  );
}
