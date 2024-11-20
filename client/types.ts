import React from 'react';

// ===================== GENERAL TYPES ====================

export type Foo = 'foo';

// ===================== PROPS TYPES ====================

export interface BasicProps {
  foo: Foo;
  setFoo: React.Dispatch<React.SetStateAction<Foo>>;
}
