// @flow
import React from 'react';
import { m } from 'framer-motion';
import type { Node } from 'react';

import CloseIcon from '../../../assets/icons/pg-close.svg';

// $FlowIgnore
import './appModal.scss';

type AppModalProps = {
  children: Node,
  onClose: () => void,
};

function AppModal({ children, onClose }: AppModalProps): Node {
  return (
    <m.div className="pg-app-modal">
      <m.div
        className="pg-app-modal-overlay"
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onClose();
        }}
      />
      <m.div
        className="pg-app-modal-content"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'tween', duration: 0.2 }}
      >
        <m.span className="pg-app-modal-btn" onClick={onClose}>
          <CloseIcon style={{ transform: 'scale(1.2)' }} />
        </m.span>
        {children}
      </m.div>
    </m.div>
  );
}

export default AppModal;
