"use client";

import { useEffect, useState } from "react";
import PageHeader from "@/components/PageHeader";
import { heroImagesApi, mediaUrl } from "@/lib/api";

interface Breadcrumb {
  label: string;
  href?: string;
}

interface DynamicPageHeaderProps {
  page: string;
  title: string;
  subtitle: string;
  breadcrumbs: Breadcrumb[];
  gradient?: string;
  eyebrow?: string;
  accent?: string;
}

export default function DynamicPageHeader({ page, ...rest }: DynamicPageHeaderProps) {
  const [bgImage, setBgImage] = useState<string | undefined>(undefined);

  useEffect(() => {
    heroImagesApi
      .get(page)
      .then(({ data }) => setBgImage(mediaUrl(data.data.image?.media?.url)))
      .catch(() => setBgImage(undefined));
  }, [page]);

  return <PageHeader {...rest} bgImage={bgImage} />;
}
