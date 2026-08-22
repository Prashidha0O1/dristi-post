import { Box, SimpleGrid, Text, Flex } from "@chakra-ui/react";
import Link from "next/link";
import { getContainer } from "@/lib/container";

export default async function AdminDashboard() {
  const container = getContainer();

  const [allArticles, publishedArticles, draftArticles] = await Promise.all([
    container.listArticles.execute({ limit: 0 }),
    container.listArticles.execute({ status: "published", limit: 0 }),
    container.listArticles.execute({ status: "draft", limit: 0 }),
  ]);

  const recentArticles = await container.listArticles.execute({ limit: 5 });

  const stats = [
    { label: "Total Articles", value: allArticles.total, color: "#2563eb" },
    { label: "Published", value: publishedArticles.total, color: "#16a34a" },
    { label: "Drafts", value: draftArticles.total, color: "#ea580c" },
  ];

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="24px">
        <Text fontSize="24px" fontWeight="800" color="var(--color-headline)">Dashboard</Text>
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
            _hover={{ opacity: 0.9 }}
          >
            + New Article
          </Box>
        </Link>
      </Flex>

      <SimpleGrid columns={{ base: 1, sm: 3 }} gap="16px" mb="32px">
        {stats.map((s) => (
          <Box key={s.label} bg="var(--color-surface)" border="1px solid var(--color-border)" borderRadius="8px" p="20px">
            <Text fontSize="12px" fontWeight="600" color="var(--color-muted)" textTransform="uppercase" letterSpacing="0.5px" mb="8px">
              {s.label}
            </Text>
            <Text fontSize="32px" fontWeight="800" color={s.color}>
              {s.value}
            </Text>
          </Box>
        ))}
      </SimpleGrid>

      <Box bg="var(--color-surface)" border="1px solid var(--color-border)" borderRadius="8px" p="20px">
        <Text fontSize="16px" fontWeight="700" color="var(--color-headline)" mb="16px">Recent Articles</Text>
        {recentArticles.items.map((article) => (
          <Flex
            key={article.id}
            justify="space-between"
            align="center"
            py="10px"
            borderBottom="1px solid var(--color-border)"
            fontSize="14px"
          >
            <Box>
              <Text fontWeight="600" color="var(--color-headline)">{article.title.ne}</Text>
              <Text fontSize="12px" color="var(--color-muted)">{article.categorySlug}</Text>
            </Box>
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
        ))}
      </Box>
    </Box>
  );
}
