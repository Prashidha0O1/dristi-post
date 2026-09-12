// Authenticated, per-request admin page: never statically prerendered.
// (Also keeps `next build` from connecting to the database.)
export const dynamic = "force-dynamic";

import { Box, SimpleGrid, Text, Flex } from "@chakra-ui/react";
import Link from "next/link";
import {
  Briefcase,
  FileEdit,
  Newspaper,
  Plus,
  SendHorizonal,
} from "lucide-react";
import { getContainer } from "@/lib/container";
import { ButtonLink, Card, EmptyState, PageHeader, StatusBadge } from "./ui";
import { primaryText } from "@/lib/domain/article";

function StatCard({
  label,
  value,
  icon,
  tone,
  href,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  tone: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <Box
        bg="var(--color-surface)"
        border="1px solid var(--color-border)"
        borderRadius="10px"
        p="18px"
        transition="border-color 0.15s"
        _hover={{ borderColor: "var(--color-brand)" }}
        cursor="pointer"
        h="full"
      >
        <Flex align="center" justify="space-between" mb="10px">
          <Text fontSize="12px" fontWeight="600" color="var(--color-muted)" textTransform="uppercase" letterSpacing="0.05em">
            {label}
          </Text>
          <Flex
            align="center"
            justify="center"
            w="30px"
            h="30px"
            borderRadius="7px"
            bg={tone}
            color="white"
            flexShrink={0}
          >
            {icon}
          </Flex>
        </Flex>
        <Text fontSize="30px" fontWeight="800" color="var(--color-headline)" lineHeight="1">
          {value}
        </Text>
      </Box>
    </Link>
  );
}

export default async function AdminDashboard() {
  const container = getContainer();

  // Jobs can fail independently of articles — the table may not exist yet if
  // the migration hasn't been run — so it's settled separately rather than
  // taking the whole dashboard down with it.
  const [allArticles, publishedArticles, draftArticles, recentArticles] = await Promise.all([
    container.listArticles.execute({ limit: 0 }),
    container.listArticles.execute({ status: "published", limit: 0 }),
    container.listArticles.execute({ status: "draft", limit: 0 }),
    container.listArticles.execute({ limit: 6 }),
  ]);

  const jobsResult = await container.listJobs
    .execute({ limit: 0 })
    .then((r) => ({ ok: true as const, total: r.total }))
    .catch(() => ({ ok: false as const, total: 0 }));

  const stats = [
    {
      label: "Total Articles",
      value: allArticles.total,
      icon: <Newspaper size={16} strokeWidth={2} aria-hidden="true" />,
      tone: "#2563eb",
      href: "/admin/articles",
    },
    {
      label: "Published",
      value: publishedArticles.total,
      icon: <SendHorizonal size={16} strokeWidth={2} aria-hidden="true" />,
      tone: "#16a34a",
      href: "/admin/articles",
    },
    {
      label: "Drafts",
      value: draftArticles.total,
      icon: <FileEdit size={16} strokeWidth={2} aria-hidden="true" />,
      tone: "#ea580c",
      href: "/admin/articles",
    },
    {
      label: "Jobs",
      value: jobsResult.total,
      icon: <Briefcase size={16} strokeWidth={2} aria-hidden="true" />,
      tone: "#7c3aed",
      href: "/admin/jobs",
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your newsroom"
        action={
          <Flex gap="8px">
            <ButtonLink href="/admin/jobs/new" variant="secondary" icon={<Plus size={15} strokeWidth={2.2} aria-hidden="true" />}>
              New Job
            </ButtonLink>
            <ButtonLink href="/admin/articles/new" icon={<Plus size={15} strokeWidth={2.2} aria-hidden="true" />}>
              New Article
            </ButtonLink>
          </Flex>
        }
      />

      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap="14px" mb="28px">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </SimpleGrid>

      {!jobsResult.ok && (
        <Box
          mb="24px"
          px="16px"
          py="12px"
          borderRadius="8px"
          bg="var(--color-warning-bg)"
          color="var(--color-warning-fg)"
          fontSize="13px"
          lineHeight="1.6"
        >
          <Text fontWeight="700" mb="2px">Jobs table not found</Text>
          <Text>
            The job board schema hasn&apos;t been applied to Supabase yet, so job counts show 0
            and the public /jobs page will error. Run the jobs migration to fix it.
          </Text>
        </Box>
      )}

      <Card>
        <Flex align="center" justify="space-between" px="18px" py="14px" borderBottom="1px solid var(--color-border)">
          <Text fontSize="15px" fontWeight="700" color="var(--color-headline)">Recent Articles</Text>
          <Link href="/admin/articles">
            <Text fontSize="12px" fontWeight="600" color="var(--color-brand)" _hover={{ textDecoration: "underline" }}>
              View all
            </Text>
          </Link>
        </Flex>

        {recentArticles.items.map((article) => (
          <Flex
            key={article.id}
            justify="space-between"
            align="center"
            gap="12px"
            px="18px"
            py="12px"
            borderBottom="1px solid var(--color-border)"
            transition="background 0.12s"
            _hover={{ bg: "var(--color-card-alt)" }}
            css={{ "&:last-of-type": { borderBottom: "none" } }}
          >
            <Box minW="0">
              <Link href={`/admin/articles/${article.id}/edit`}>
                <Text fontWeight="600" fontSize="14px" color="var(--color-headline)" lineClamp={1} _hover={{ color: "var(--color-brand)" }}>
                  {primaryText(article.title)}
                </Text>
              </Link>
              <Text fontSize="12px" color="var(--color-muted)" mt="1px">{article.categorySlug}</Text>
            </Box>
            <StatusBadge status={article.status} />
          </Flex>
        ))}

        {recentArticles.items.length === 0 && (
          <EmptyState
            icon={<Newspaper size={28} strokeWidth={1.5} aria-hidden="true" />}
            title="No articles yet"
            hint="Create your first article and it will appear here and on the public site."
            action={<ButtonLink href="/admin/articles/new" icon={<Plus size={15} strokeWidth={2.2} aria-hidden="true" />}>New Article</ButtonLink>}
          />
        )}
      </Card>
    </Box>
  );
}
