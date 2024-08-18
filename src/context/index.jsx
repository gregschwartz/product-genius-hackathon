// @flow
import { createContext } from 'react';

import type { AppDesignProps, ContextConfigProps } from '../entities';
import { defaultDesign, defaultContextConfig } from '../utils/stateUtils';

// $FlowIgnore
export const DesignContext = createContext<AppDesignProps>(defaultDesign);

// $FlowIgnore
export const MobileContext = createContext<boolean>(window.innerWidth <= 800);

// $FlowIgnore
export const ConfigContext = createContext<ContextConfigProps>(defaultContextConfig);
