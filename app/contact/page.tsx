import { getFooterSettings } from "@/lib/publicQueries";
import ContactPageClient from "./ContactPageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact Us | Dristi Times",
};

export default async function ContactPage() {
  const footer = await getFooterSettings();
  
  return <ContactPageClient footer={footer} />;
}
