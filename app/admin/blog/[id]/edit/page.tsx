// Authenticated, per-request admin page: never statically prerendered.
export const dynamic = "force-dynamic";

import { Box } from "@chakra-ui/react";
import { notFound } from "next/navigation";
import { getContainer } from "@/lib/container";
import { BlogForm } from "../../BlogForm";
import { updateBlogAction } from "../../../blogActions";
import { Card, PageHeader } from "../../../ui";
import { primaryText } from "@/lib/domain/article";

export default async function EditBlogPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const container = getContainer();
  const found = await container.blogs.findById(id);

  if (!found) notFound();

  const boundAction = updateBlogAction.bind(null, id);

  return (
    <Box>
      <PageHeader
        title="Edit Blog"
        subtitle={primaryText(found.title)}
        action={
          <a href={`/blog/${found.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-brand)" }}>
            View live ↗
          </a>
        }
      />
      <Card p="24px">
        <BlogForm
          action={boundAction}
          submitLabel="Save Changes"
          defaultValues={{
            titleNe: found.title.ne,
            titleEn: found.title.en,
            excerptNe: found.excerpt.ne,
            excerptEn: found.excerpt.en,
            metaDescNe: found.metaDescription?.ne,
            metaDescEn: found.metaDescription?.en,
            isFeatured: found.isFeatured,
            heroImage: found.heroImage,
            heroImageAlt: found.heroImageAlt,
            bodyNe: found.body.ne,
            bodyEn: found.body.en,
            slug: found.slug,
          }}
        />
      </Card>
    </Box>
  );
}
