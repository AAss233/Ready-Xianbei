"use client";

import { use } from "react";
import { ProductScreen } from "@/components/screens/product-screen";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProductScreen id={id} />;
}
