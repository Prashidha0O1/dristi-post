// Authenticated, per-request admin page: never statically prerendered.
// (Also keeps `next build` from connecting to the database.)
export const dynamic = "force-dynamic";

import { Box } from "@chakra-ui/react";
import { notFound } from "next/navigation";
import { getContainer } from "@/lib/container";
import { JobForm } from "../../JobForm";
import { updateJobAction } from "../../../jobActions";
import { Card, PageHeader } from "../../../ui";
import { primaryText } from "@/lib/domain/article";

export default async function EditJobPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const container = getContainer();
  const found = await container.jobs.findById(id);

  if (!found) notFound();

  const boundAction = updateJobAction.bind(null, id);

  return (
    <Box>
      <PageHeader
        title="Edit Job"
        subtitle={`${primaryText(found.title)} · ${found.company}`}
        action={
          <a href={`/jobs/${found.slug}`} target="_blank" rel="noreferrer" style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-brand)" }}>
            View live ↗
          </a>
        }
      />
      <Card p="24px">
        <JobForm
          action={boundAction}
          submitLabel="Save Changes"
          defaultValues={{
            titleNe: found.title.ne,
            titleEn: found.title.en,
            company: found.company,
            location: found.location,
            provinceSlug: found.provinceSlug,
            employmentType: found.employmentType,
            descriptionNe: found.description.ne,
            descriptionEn: found.description.en,
            metaDescNe: found.metaDescription?.ne,
            metaDescEn: found.metaDescription?.en,
            salary: found.salary,
            deadline: found.deadline,
            applyUrl: found.applyUrl,
            isFeatured: found.isFeatured,
          }}
        />
      </Card>
    </Box>
  );
}
