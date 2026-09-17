// Authenticated, per-request admin page: never statically prerendered.
// (Also keeps `next build` from connecting to the database.)
export const dynamic = "force-dynamic";

import { Box } from "@chakra-ui/react";
import { getContainer } from "@/lib/container";
import { listAuthorOptions } from "@/lib/adminQueries";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/domain/user";
import { ArticleForm } from "../../ArticleForm";
import { updateArticleAction } from "../../../actions";
import { Card, PageHeader } from "../../../ui";
import { notFound } from "next/navigation";
import { primaryText } from "@/lib/domain/article";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const container = getContainer();
  // Was: list 1000 articles and .find() the one we want in JS. The repository
  // has a findById for exactly this, and the jobs edit page already uses it.
  const [found, authorOptions, user] = await Promise.all([
    container.articles.findById(id),
    listAuthorOptions(),
    getCurrentUser(),
  ]);
  const canAddAuthors = user ? can(user.role, "authors.manage") : false;

  if (!found) notFound();

  const boundAction = updateArticleAction.bind(null, id);

  return (
    <Box>
      <PageHeader
        title="Edit Article"
        subtitle={primaryText(found.title)}
        action={
          <a href={`/article/${found.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-brand)" }}>
            View live ↗
          </a>
        }
      />
      <Card p="24px">
        <ArticleForm
          action={boundAction}
          authorOptions={authorOptions}
          canAddAuthors={canAddAuthors}
          submitLabel="Save Changes"
          defaultValues={{
            titleNe: found.title.ne,
            titleEn: found.title.en,
            excerptNe: found.excerpt.ne,
            excerptEn: found.excerpt.en,
            bodyNe: found.body.ne,
            bodyEn: found.body.en,
            slug: found.slug,
            metaDescNe: found.metaDescription?.ne, metaDescEn: found.metaDescription?.en,
            categorySlug: found.categorySlug,
            provinceSlug: found.provinceSlug,
            authorId: found.authorId,
            imageUrl: found.imageUrl,
            tagSlugs: found.tagSlugs.join(","),
            isFeatured: found.isFeatured,
            isBreaking: found.isBreaking,
            isTrending: found.isTrending,
          }}
        />
      </Card>
    </Box>
  );
}
