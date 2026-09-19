// Authenticated, per-request admin page: never statically prerendered.
// (Also keeps `next build` from connecting to the database.)
export const dynamic = "force-dynamic";

import { Box, Flex, Text } from "@chakra-ui/react";
import { Newspaper, Plus, Trash2 } from "lucide-react";
import { getContainer } from "@/lib/container";
import { categories } from "@/lib/config";
import {
  Badge,
  ButtonLink,
  Card,
  EmptyState,
  PageHeader,
  StatusBadge,
  TableHead,
  TableRow,
} from "../ui";
import {
  deleteArticleAction,
  publishArticleAction,
  unpublishArticleAction,
} from "../actions";
import { ArticleRowActions } from "./ArticleRowActions";
import { primaryText } from "@/lib/domain/article";

import { AdminSearch } from "../AdminSearch";

const CATEGORY_NAME = new Map(categories.map((c) => [c.slug, c]));

export default async function ArticlesListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const container = getContainer();
  const params = await searchParams;
  const q = params?.q || "";
  const { items: articles, total } = await container.listArticles.execute({ 
    limit: 50,
    search: q 
  });

  return (
    <Box>
      <PageHeader
        title="Articles"
        subtitle={`${total} total`}
        action={
          <Flex gap="8px">
            <ButtonLink href="/admin/articles/trash" variant="secondary" icon={<Trash2 size={15} strokeWidth={2.2} aria-hidden="true" />}>
              Trash
            </ButtonLink>
            <ButtonLink href="/admin/articles/new" icon={<Plus size={15} strokeWidth={2.2} aria-hidden="true" />}>
              New Article
            </ButtonLink>
          </Flex>
        }
      />

      <AdminSearch placeholder="Search articles..." />

      <Card>
        <TableHead>
          <Text flex="2">Title</Text>
          <Text flex="1" display={{ base: "none", md: "block" }}>Category</Text>
          <Text w="100px" textAlign="center">Status</Text>
          <Text w="180px" textAlign="right">Actions</Text>
        </TableHead>

        {articles.map((article) => {
          const category = CATEGORY_NAME.get(article.categorySlug);
          return (
            <TableRow key={article.id}>
              <Box flex="2" minW="0" pr="12px">
                <Text fontWeight="600" color="var(--color-headline)" lineClamp={1}>
                  {primaryText(article.title)}
                </Text>
                {article.title.en && (
                  <Text fontSize="12px" color="var(--color-muted)" lineClamp={1} mt="1px">
                    {article.title.en}
                  </Text>
                )}
              </Box>

              <Flex flex="1" align="center" gap="7px" display={{ base: "none", md: "flex" }} minW="0">
                <Box
                  w="8px"
                  h="8px"
                  borderRadius="2px"
                  flexShrink={0}
                  bg={category?.color || "var(--color-faint)"}
                />
                <Text fontSize="13px" color="var(--color-muted)" lineClamp={1}>
                  {category?.name.en ?? article.categorySlug}
                </Text>
              </Flex>

              <Flex w="100px" justify="center">
                {article.status === "published" &&
                article.publishedAt &&
                new Date(article.publishedAt) > new Date() ? (
                  <Badge tone="info">scheduled</Badge>
                ) : (
                  <StatusBadge status={article.status} />
                )}
              </Flex>

              <Box w="180px">
                <ArticleRowActions
                  id={article.id}
                  status={article.status}
                  publishAction={publishArticleAction.bind(null, article.id)}
                  unpublishAction={unpublishArticleAction.bind(null, article.id)}
                  deleteAction={deleteArticleAction.bind(null, article.id)}
                />
              </Box>
            </TableRow>
          );
        })}

        {articles.length === 0 && (
          <EmptyState
            icon={<Newspaper size={30} strokeWidth={1.5} aria-hidden="true" />}
            title="No articles yet"
            hint="Published articles appear on the homepage, category pages and the latest feed."
            action={
              <ButtonLink href="/admin/articles/new" icon={<Plus size={15} strokeWidth={2.2} aria-hidden="true" />}>
                New Article
              </ButtonLink>
            }
          />
        )}
      </Card>
    </Box>
  );
}
