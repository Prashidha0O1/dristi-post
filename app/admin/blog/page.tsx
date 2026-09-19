// Authenticated, per-request admin page: never statically prerendered.
export const dynamic = "force-dynamic";

import { Box, Flex, Text } from "@chakra-ui/react";
import { PenLine, Plus } from "lucide-react";
import { getContainer } from "@/lib/container";
import { primaryText } from "@/lib/domain/article";
import {
  ButtonLink,
  Card,
  EmptyState,
  PageHeader,
  StatusBadge,
  TableHead,
  TableRow,
} from "../ui";
import { deleteBlogAction, publishBlogAction, unpublishBlogAction } from "../blogActions";
import { BlogRowActions } from "./BlogRowActions";

import { AdminSearch } from "../AdminSearch";

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

export default async function BlogListPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const container = getContainer();
  const params = await searchParams;
  const q = params?.q || "";

  const result = await container.listBlogs
    .execute({ limit: 50, search: q })
    .then((r) => ({ ok: true as const, ...r }))
    .catch((e: unknown) => ({
      ok: false as const,
      items: [],
      total: 0,
      message: e instanceof Error ? e.message : String(e),
    }));

  return (
    <Box>
      <PageHeader
        title="Blog"
        subtitle={result.ok ? `${result.total} total` : undefined}
        action={
          <ButtonLink href="/admin/blog/new" icon={<Plus size={15} strokeWidth={2.2} aria-hidden="true" />}>
            New Blog
          </ButtonLink>
        }
      />

      {!result.ok && (
        <Box mb="20px" px="16px" py="13px" borderRadius="8px" bg="var(--color-danger-bg)" color="var(--color-danger-fg)" fontSize="13px" lineHeight="1.6">
          <Text fontWeight="700" mb="2px">Could not load blogs</Text>
          <Text>{result.message}</Text>
          <Text mt="6px" opacity={0.85}>
            If this says the table is missing, the `blogs` table hasn&apos;t been created in the
            database yet.
          </Text>
        </Box>
      )}

      <AdminSearch placeholder="Search blogs..." />

      <Card>
        <TableHead>
          <Text flex="2">Title</Text>
          <Text w="130px" display={{ base: "none", md: "block" }}>Date</Text>
          <Text w="120px" textAlign="center">Status</Text>
          <Text w="180px" textAlign="right">Actions</Text>
        </TableHead>

        {result.items.map((blog) => (
          <TableRow key={blog.id}>
            <Box flex="2" minW="0" pr="12px">
              <Text fontWeight="600" color="var(--color-headline)" lineClamp={1}>
                {primaryText(blog.title)}
              </Text>
              <Text fontSize="12px" color="var(--color-muted)" lineClamp={1} mt="1px">
                {blog.slug}
              </Text>
            </Box>

            <Text w="130px" fontSize="13px" color="var(--color-muted)" display={{ base: "none", md: "block" }}>
              {formatDate(blog.publishedAt ?? blog.createdAt)}
            </Text>

            <Flex w="120px" justify="center">
              <StatusBadge status={blog.status} />
            </Flex>

            <Box w="180px">
              <BlogRowActions
                id={blog.id}
                status={blog.status}
                publishAction={publishBlogAction.bind(null, blog.id)}
                unpublishAction={unpublishBlogAction.bind(null, blog.id)}
                deleteAction={deleteBlogAction.bind(null, blog.id)}
              />
            </Box>
          </TableRow>
        ))}

        {result.ok && result.items.length === 0 && (
          <EmptyState
            icon={<PenLine size={30} strokeWidth={1.5} aria-hidden="true" />}
            title="No blog posts yet"
            hint="Published posts appear on the public blog at /blog."
            action={
              <ButtonLink href="/admin/blog/new" icon={<Plus size={15} strokeWidth={2.2} aria-hidden="true" />}>
                New Blog
              </ButtonLink>
            }
          />
        )}
      </Card>
    </Box>
  );
}
