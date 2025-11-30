// Type declarations for framer-motion to fix React 19 compatibility
// Augment framer-motion module to be more permissive with motion component props
import 'framer-motion';

declare module 'framer-motion' {
  import * as React from 'react';
  
  // Make motion components accept any valid HTML attributes plus motion props
  export const motion: {
    div: React.ComponentType<any>;
    span: React.ComponentType<any>;
    p: React.ComponentType<any>;
    section: React.ComponentType<any>;
    button: React.ComponentType<any>;
    [key: string]: React.ComponentType<any>;
  };
}
