'use client';

import React from 'react';
import ShopFront from '@/components/Order/Shop/Shop';

// Shop is now accessible to all users (including anonymous/guests)
const Shop: React.FC = () => {
  return <ShopFront />;
};

export default Shop;
