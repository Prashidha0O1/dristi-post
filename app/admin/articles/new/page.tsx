import { Box } from "@chakra-ui/react";
import { ArticleForm } from "../ArticleForm";
import { createArticleAction } from "../../actions";
import { listAuthorOptions } from "@/lib/adminQueries";
import { Card, PageHeader } from "../../ui";

export default async function NewArticlePage() {
  const authorOptions = await listAuthorOptions();

  return (
    <Box>
      <PageHeader title="New Article" subtitle="Drafts stay private until published" />
      <Card p="24px">
        <ArticleForm action={createArticleAction} authorOptions={authorOptions} submitLabel="Create Article" showPublish />
      </Card>
    </Box>
  );
}
