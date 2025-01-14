"use client";
import React from "react";
import ShopFront from "@/components/Order/Shop/Shop";
import withAuth from "@/components/Authentication/HOC/withAuth";

const Shop: React.FC = () => {
  return <ShopFront />;
};

export default withAuth(Shop);