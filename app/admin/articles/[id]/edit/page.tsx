import { Box, Text } from "@chakra-ui/react";
import { getContainer } from "@/lib/container";
import { listAuthorOptions } from "@/lib/adminQueries";
import { ArticleForm } from "../../ArticleForm";
import { updateArticleAction } from "../../../actions";
import { notFound } from "next/navigation";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const container = getContainer();
  const [article, authorOptions] = await Promise.all([
    container.listArticles.execute({ limit: 1000 }),
    listAuthorOptions(),
  ]);
  const found = article.items.find((a) => a.id === id);

  if (!found) notFound();

  const boundAction = updateArticleAction.bind(null, id);

  return (
    <Box>
      <Text fontSize="24px" fontWeight="800" color="var(--color-headline)" mb="24px">
        Edit Article
      </Text>
      <Box bg="var(--color-surface)" border="1px solid var(--color-border)" borderRadius="8px" p="24px">
        <ArticleForm
          action={boundAction}
          authorOptions={authorOptions}
          submitLabel="Save Changes"
          defaultValues={{
            titleNe: found.title.ne,
            titleEn: found.title.en,
            excerptNe: found.excerpt.ne,
            excerptEn: found.excerpt.en,
            bodyNe: found.body.ne,
            bodyEn: found.body.en,
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
      </Box>
    </Box>
  );
}
