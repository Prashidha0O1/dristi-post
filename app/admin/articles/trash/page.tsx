export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { Box, Flex, Text } from "@chakra-ui/react";
import { Trash2 } from "lucide-react";
import { getContainer } from "@/lib/container";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/domain/user";
import { primaryText } from "@/lib/domain/article";
import { ButtonLink, Card, EmptyState, PageHeader, TableHead, TableRow } from "../../ui";
import { restoreArticleAction, deleteArticleForeverAction } from "../../actions";
import { TrashRowActions } from "./TrashRowActions";

import { AdminSearch } from "../../AdminSearch";

const RETENTION_DAYS = 7;

function daysLeft(deletedAt: string): number {
  const gone = new Date(deletedAt).getTime() + RETENTION_DAYS * 24 * 60 * 60 * 1000;
  return Math.max(0, Math.ceil((gone - Date.now()) / (24 * 60 * 60 * 1000)));
}

export default async function TrashPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const container = getContainer();
  const params = await searchParams;
  const q = params?.q || "";
  const { items } = await container.listTrashedArticles.execute({ 
    limit: 100,
    search: q
  });
  const canDeleteForever = can(me.role, "content.delete");

  return (
    <Box>
      <PageHeader
        title="Trash"
        subtitle="Deleted articles are kept for 7 days, then removed automatically."
        action={
          <ButtonLink href="/admin/articles" variant="secondary">
            Back to articles
          </ButtonLink>
        }
      />

      <AdminSearch placeholder="Search trash..." />

      <Card>
        <TableHead>
          <Text flex="2">Title</Text>
          <Text w="120px" textAlign="center">Auto-removes</Text>
          <Text w="200px" textAlign="right">Actions</Text>
        </TableHead>

        {items.map((article) => (
          <TableRow key={article.id}>
            <Box flex="2" minW="0" pr="12px">
              <Text fontWeight="600" color="var(--color-headline)" lineClamp={1}>
                {primaryText(article.title)}
              </Text>
              <Text fontSize="12px" color="var(--color-muted)" mt="1px">
                {article.slug}
              </Text>
            </Box>
            <Flex w="120px" justify="center">
              <Text fontSize="13px" color="var(--color-muted)">
                {article.deletedAt ? `${daysLeft(article.deletedAt)} days` : "—"}
              </Text>
            </Flex>
            <Box w="200px">
              <TrashRowActions
                canDeleteForever={canDeleteForever}
                restoreAction={restoreArticleAction.bind(null, article.id)}
                deleteForeverAction={deleteArticleForeverAction.bind(null, article.id)}
              />
            </Box>
          </TableRow>
        ))}

        {items.length === 0 && (
          <EmptyState
            icon={<Trash2 size={30} strokeWidth={1.5} aria-hidden="true" />}
            title="Trash is empty"
            hint="Deleted articles show up here for a week before they're gone for good."
          />
        )}
      </Card>
    </Box>
  );
}
