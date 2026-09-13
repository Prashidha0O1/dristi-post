// Authenticated, per-request admin page: never statically prerendered.
// (Also keeps `next build` from connecting to the database.)
export const dynamic = "force-dynamic";

import { Box } from "@chakra-ui/react";
import { ArticleForm } from "../ArticleForm";
import { createArticleAction } from "../../actions";
import { listAuthorOptions } from "@/lib/adminQueries";
import { getCurrentUser } from "@/lib/auth/session";
import { can } from "@/lib/domain/user";
import { Card, PageHeader } from "../../ui";

export default async function NewArticlePage() {
  const [authorOptions, user] = await Promise.all([listAuthorOptions(), getCurrentUser()]);
  const canAddAuthors = user ? can(user.role, "authors.manage") : false;

  return (
    <Box>
      <PageHeader title="New Article" subtitle="Drafts stay private until published" />
      <Card p="24px">
        <ArticleForm action={createArticleAction} authorOptions={authorOptions} submitLabel="Create Article" showPublish canAddAuthors={canAddAuthors} />
      </Card>
    </Box>
  );
}
