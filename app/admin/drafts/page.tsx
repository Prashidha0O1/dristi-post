// Authenticated, per-request admin page: never statically prerendered.
export const dynamic = "force-dynamic";

import { Box, Flex, Text } from "@chakra-ui/react";
import { FileEdit } from "lucide-react";
import { getContainer } from "@/lib/container";
import {
  Badge,
  Card,
  EmptyState,
  PageHeader,
  StatusBadge,
  TableHead,
  TableRow,
} from "../ui";
import { primaryText } from "@/lib/domain/article";
import { ArticleRowActions } from "../articles/ArticleRowActions";
import { BlogRowActions } from "../blog/BlogRowActions";
import {
  deleteArticleAction,
  publishArticleAction,
  unpublishArticleAction,
} from "../actions";
import {
  deleteBlogAction,
  publishBlogAction,
  unpublishBlogAction,
} from "../blogActions";

export default async function DraftsPage() {
  const container = getContainer();
  
  const [articlesRes, blogsRes] = await Promise.all([
    container.listArticles.execute({ status: "draft", limit: 50 }),
    container.listBlogs.execute({ status: "draft", limit: 50 }),
  ]);

  const mixedDrafts = [
    ...articlesRes.items.map(a => ({ type: "article" as const, data: a, updated: new Date(a.updatedAt).getTime() })),
    ...blogsRes.items.map(b => ({ type: "blog" as const, data: b, updated: new Date(b.updatedAt).getTime() }))
  ].sort((a, b) => b.updated - a.updated);

  return (
    <Box>
      <PageHeader
        title="Drafts"
        subtitle={`${mixedDrafts.length} total drafts`}
      />

      <Card>
        <TableHead>
          <Text flex="2">Title</Text>
          <Text flex="1" display={{ base: "none", md: "block" }}>Type</Text>
          <Text w="100px" textAlign="center">Status</Text>
          <Text w="180px" textAlign="right">Actions</Text>
        </TableHead>

        {mixedDrafts.map((draft) => {
          const id = draft.data.id;
          const isArticle = draft.type === "article";

          return (
            <TableRow key={`${draft.type}-${id}`}>
              <Box flex="2" minW="0" pr="12px">
                <Text fontWeight="600" color="var(--color-headline)" lineClamp={1}>
                  {primaryText(draft.data.title)}
                </Text>
                {draft.data.title.en && (
                  <Text fontSize="12px" color="var(--color-muted)" lineClamp={1} mt="1px">
                    {draft.data.title.en}
                  </Text>
                )}
              </Box>

              <Flex flex="1" align="center" gap="7px" display={{ base: "none", md: "flex" }} minW="0">
                <Badge tone={isArticle ? "neutral" : "info"}>
                  {isArticle ? "Article" : "Blog"}
                </Badge>
              </Flex>

              <Flex w="100px" justify="center">
                <StatusBadge status={draft.data.status} />
              </Flex>

              <Box w="180px">
                {isArticle ? (
                  <ArticleRowActions
                    id={id}
                    status={draft.data.status}
                    publishAction={publishArticleAction.bind(null, id)}
                    unpublishAction={unpublishArticleAction.bind(null, id)}
                    deleteAction={deleteArticleAction.bind(null, id)}
                  />
                ) : (
                  <BlogRowActions
                    id={id}
                    status={draft.data.status}
                    publishAction={publishBlogAction.bind(null, id)}
                    unpublishAction={unpublishBlogAction.bind(null, id)}
                    deleteAction={deleteBlogAction.bind(null, id)}
                  />
                )}
              </Box>
            </TableRow>
          );
        })}

        {mixedDrafts.length === 0 && (
          <EmptyState
            icon={<FileEdit size={30} strokeWidth={1.5} aria-hidden="true" />}
            title="No drafts"
            hint="You don't have any saved drafts right now."
          />
        )}
      </Card>
    </Box>
  );
}
