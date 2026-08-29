"use client";

import { use } from "react";
import { ReviewsScreen } from "@/components/screens/reviews-screen";

export default function ProductReviewsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ReviewsScreen productId={id} />;
}
