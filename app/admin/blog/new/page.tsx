// Authenticated, per-request admin page: never statically prerendered.
export const dynamic = "force-dynamic";

import { Box } from "@chakra-ui/react";
import { BlogForm } from "../BlogForm";
import { createBlogAction } from "../../blogActions";
import { Card, PageHeader } from "../../ui";

export default function NewBlogPage() {
  return (
    <Box>
      <PageHeader title="New Blog" subtitle="Drafts stay private until published" />
      <Card p="24px">
        <BlogForm action={createBlogAction} submitLabel="Create Blog" showPublish />
      </Card>
    </Box>
  );
}
