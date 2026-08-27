import { Box, Text } from "@chakra-ui/react";
import { ArticleForm } from "../ArticleForm";
import { createArticleAction } from "../../actions";
import { listAuthorOptions } from "@/lib/adminQueries";

export default async function NewArticlePage() {
  const authorOptions = await listAuthorOptions();

  return (
    <Box>
      <Text fontSize="24px" fontWeight="800" color="var(--color-headline)" mb="24px">
        New Article
      </Text>
      <Box bg="var(--color-surface)" border="1px solid var(--color-border)" borderRadius="8px" p="24px">
        <ArticleForm action={createArticleAction} authorOptions={authorOptions} submitLabel="Create Article" showPublish />
      </Box>
    </Box>
  );
}
