import { Box, Flex, Text } from "@chakra-ui/react";
import Link from "next/link";
import { getContainer } from "@/lib/container";

export default async function ArticlesListPage() {
  const container = getContainer();
  const { items: articles, total } = await container.listArticles.execute({ limit: 50 });

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="24px">
        <Box>
          <Text fontSize="24px" fontWeight="800" color="var(--color-headline)">Articles</Text>
          <Text fontSize="13px" color="var(--color-muted)">{total} total</Text>
        </Box>
        <Link href="/admin/articles/new">
          <Box
            as="span"
            px="16px"
            py="8px"
            bg="var(--color-brand)"
            color="white"
            borderRadius="4px"
            fontSize="13px"
            fontWeight="600"
            cursor="pointer"
          >
            + New Article
          </Box>
        </Link>
      </Flex>

      <Box bg="var(--color-surface)" border="1px solid var(--color-border)" borderRadius="8px" overflow="hidden">
        <Flex bg="var(--color-card-alt)" px="16px" py="10px" fontWeight="700" fontSize="12px" color="var(--color-muted)" textTransform="uppercase" letterSpacing="0.5px">
          <Text flex="2">Title</Text>
          <Text flex="1">Category</Text>
          <Text w="80px" textAlign="center">Status</Text>
          <Text w="100px" textAlign="right">Actions</Text>
        </Flex>

        {articles.map((article) => (
          <Flex key={article.id} px="16px" py="12px" borderTop="1px solid var(--color-border)" align="center" fontSize="14px">
            <Box flex="2" minW="0">
              <Text fontWeight="600" color="var(--color-headline)" lineClamp={1}>{article.title.ne}</Text>
              {article.title.en && (
                <Text fontSize="12px" color="var(--color-muted)" lineClamp={1}>{article.title.en}</Text>
              )}
            </Box>
            <Text flex="1" fontSize="13px" color="var(--color-muted)">{article.categorySlug}</Text>
            <Flex w="80px" justify="center">
              <Text
                fontSize="11px"
                fontWeight="600"
                px="8px"
                py="2px"
                borderRadius="4px"
                bg={article.status === "published" ? "#dcfce7" : "#fef3c7"}
                color={article.status === "published" ? "#16a34a" : "#d97706"}
              >
                {article.status}
              </Text>
            </Flex>
            <Flex w="100px" justify="flex-end" gap="8px">
              <Link href={`/admin/articles/${article.id}/edit`}>
                <Text fontSize="12px" color="var(--color-brand)" fontWeight="600" _hover={{ textDecoration: "underline" }}>Edit</Text>
              </Link>
            </Flex>
          </Flex>
        ))}

        {articles.length === 0 && (
          <Box py="40px" textAlign="center">
            <Text color="var(--color-muted)">No articles yet.</Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
