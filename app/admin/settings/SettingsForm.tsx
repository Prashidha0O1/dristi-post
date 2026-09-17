"use client";
import { Box, Flex, Text, SimpleGrid, chakra, IconButton } from "@chakra-ui/react";
import { Trash2, Plus } from "lucide-react";
import { useState } from "react";
import { updateFooterSettings, updateSeoSettings } from "./actions";

function InputField({ label, name, value, onChange, type = "text", as = "input" }: any) {
  return (
    <Box mb="16px">
      <Text fontSize="14px" fontWeight="600" mb="6px" color="var(--color-headline)">{label}</Text>
      {as === "textarea" ? (
        <chakra.textarea name={name} value={value} onChange={onChange} w="full" p="10px" borderRadius="6px" border="1px solid var(--color-border)" bg="var(--color-input-bg)" color="var(--color-body)" rows={4} />
      ) : (
        <chakra.input type={type} name={name} value={value} onChange={onChange} w="full" h="40px" px="12px" borderRadius="6px" border="1px solid var(--color-border)" bg="var(--color-input-bg)" color="var(--color-body)" />
      )}
    </Box>
  );
}

export function SettingsForm({ initialFooter, initialSeo }: { initialFooter: any; initialSeo: any }) {
  const [footer, setFooter] = useState(initialFooter);
  const [seo, setSeo] = useState(initialSeo);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  const handleFooterChange = (e: any) => setFooter({ ...footer, [e.target.name]: e.target.value });
  const handleSeoChange = (e: any) => setSeo({ ...seo, [e.target.name]: e.target.value });

  // Ensure pageOverrides is initialized
  if (!seo.pageOverrides) seo.pageOverrides = [];

  const handleAddOverride = () => {
    setSeo({ ...seo, pageOverrides: [...seo.pageOverrides, { slug: "", title_ne: "", title_en: "", desc_ne: "", desc_en: "" }] });
  };
  const handleRemoveOverride = (index: number) => {
    const newOverrides = [...seo.pageOverrides];
    newOverrides.splice(index, 1);
    setSeo({ ...seo, pageOverrides: newOverrides });
  };
  const handleOverrideChange = (index: number, e: any) => {
    const newOverrides = [...seo.pageOverrides];
    newOverrides[index][e.target.name] = e.target.value;
    setSeo({ ...seo, pageOverrides: newOverrides });
  };

  const handleSave = async () => {
    setLoading(true);
    setStatus(null);
    try {
      await updateFooterSettings(footer);
      await updateSeoSettings(seo);
      setStatus("Settings saved successfully!");
      setTimeout(() => setStatus(null), 3000);
    } catch (e) {
      setStatus("Failed to save settings.");
    }
    setLoading(false);
  };

  return (
    <Box bg="var(--color-card)" borderRadius="12px" border="1px solid var(--color-border)" p="24px">
      
      <Box mb="32px">
        <Text fontSize="20px" fontWeight="800" mb="24px" borderBottom="1px solid var(--color-border)" pb="12px">Footer & Contact</Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="24px">
          <Box>
            <Text fontSize="16px" fontWeight="700" mb="16px" color="var(--color-subtle)">Company Info</Text>
            <InputField label="About Description (Nepali)" name="description_ne" value={footer.description_ne} onChange={handleFooterChange} as="textarea" />
            <InputField label="About Description (English)" name="description_en" value={footer.description_en} onChange={handleFooterChange} as="textarea" />
            <InputField label="Company Registration No." name="companyRegNo" value={footer.companyRegNo} onChange={handleFooterChange} />
            <InputField label="Media Registration No." name="mediaRegNo" value={footer.mediaRegNo} onChange={handleFooterChange} />
          </Box>
          <Box>
            <Text fontSize="16px" fontWeight="700" mb="16px" color="var(--color-subtle)">Contact & Social Links</Text>
            <InputField label="Contact Email" name="email" value={footer.email} onChange={handleFooterChange} />
            <InputField label="Phone Number" name="phone" value={footer.phone} onChange={handleFooterChange} />
            <InputField label="WhatsApp Link/Number" name="whatsapp" value={footer.whatsapp} onChange={handleFooterChange} />
            <InputField label="Facebook URL" name="socialFacebook" value={footer.socialFacebook} onChange={handleFooterChange} />
            <InputField label="X (Twitter) URL" name="socialX" value={footer.socialX} onChange={handleFooterChange} />
            <InputField label="TikTok URL" name="socialTiktok" value={footer.socialTiktok} onChange={handleFooterChange} />
          </Box>
        </SimpleGrid>
      </Box>

      <Box>
        <Text fontSize="20px" fontWeight="800" mb="24px" borderBottom="1px solid var(--color-border)" pb="12px">SEO & Pages</Text>
        <SimpleGrid columns={{ base: 1, md: 2 }} gap="24px">
          <Box>
            <Text fontSize="16px" fontWeight="700" mb="16px" color="var(--color-subtle)">Home Page SEO</Text>
            <InputField label="Meta Title (Nepali)" name="home_title_ne" value={seo.home_title_ne} onChange={handleSeoChange} />
            <InputField label="Meta Title (English)" name="home_title_en" value={seo.home_title_en} onChange={handleSeoChange} />
            <InputField label="Meta Description (Nepali)" name="home_desc_ne" value={seo.home_desc_ne} onChange={handleSeoChange} as="textarea" />
            <InputField label="Meta Description (English)" name="home_desc_en" value={seo.home_desc_en} onChange={handleSeoChange} as="textarea" />
          </Box>
          <Box>
            <Text fontSize="16px" fontWeight="700" mb="16px" color="var(--color-subtle)">Blog Page SEO</Text>
            <InputField label="Meta Title (Nepali)" name="blog_title_ne" value={seo.blog_title_ne} onChange={handleSeoChange} />
            <InputField label="Meta Title (English)" name="blog_title_en" value={seo.blog_title_en} onChange={handleSeoChange} />
            <InputField label="Meta Description (Nepali)" name="blog_desc_ne" value={seo.blog_desc_ne} onChange={handleSeoChange} as="textarea" />
            <InputField label="Meta Description (English)" name="blog_desc_en" value={seo.blog_desc_en} onChange={handleSeoChange} as="textarea" />
          </Box>
        </SimpleGrid>
        </Box>

      <Box mt="40px">
        <Flex justify="space-between" align="center" mb="24px" borderBottom="1px solid var(--color-border)" pb="12px">
          <Text fontSize="20px" fontWeight="800">Additional Pages SEO</Text>
          <chakra.button type="button" onClick={handleAddOverride} display="flex" alignItems="center" gap="6px" fontSize="13px" fontWeight="600" color="var(--color-brand)" bg="transparent" border="none" cursor="pointer" _hover={{ textDecoration: "underline" }}>
            <Plus size={16} /> Add Page SEO
          </chakra.button>
        </Flex>

        {seo.pageOverrides?.length === 0 && (
          <Text fontSize="14px" color="var(--color-subtle)">No additional page overrides configured. Click "Add Page SEO" to customize slugs like "science-tech", "sports", etc.</Text>
        )}

        <Flex direction="column" gap="24px">
          {seo.pageOverrides?.map((override: any, index: number) => (
            <Box key={index} p="20px" borderRadius="8px" border="1px solid var(--color-border)" bg="var(--color-card-alt)">
              <Flex justify="space-between" align="center" mb="16px">
                <Text fontWeight="700" fontSize="16px">Page #{index + 1}</Text>
                <chakra.button type="button" onClick={() => handleRemoveOverride(index)} color="red.500" bg="transparent" border="none" cursor="pointer" _hover={{ color: "red.600" }}>
                  <Trash2 size={18} />
                </chakra.button>
              </Flex>
              <InputField label="URL Slug (e.g. science-tech, sports)" name="slug" value={override.slug} onChange={(e: any) => handleOverrideChange(index, e)} />
              <SimpleGrid columns={{ base: 1, md: 2 }} gap="24px">
                <Box>
                  <InputField label="Meta Title (Nepali)" name="title_ne" value={override.title_ne} onChange={(e: any) => handleOverrideChange(index, e)} />
                  <InputField label="Meta Description (Nepali)" name="desc_ne" value={override.desc_ne} onChange={(e: any) => handleOverrideChange(index, e)} as="textarea" />
                </Box>
                <Box>
                  <InputField label="Meta Title (English)" name="title_en" value={override.title_en} onChange={(e: any) => handleOverrideChange(index, e)} />
                  <InputField label="Meta Description (English)" name="desc_en" value={override.desc_en} onChange={(e: any) => handleOverrideChange(index, e)} as="textarea" />
                </Box>
              </SimpleGrid>
            </Box>
          ))}
        </Flex>
      </Box>


      <Flex mt="32px" pt="24px" borderTop="1px solid var(--color-border)" justify="space-between" align="center">
        <Text color={status?.includes("Failed") ? "red.500" : "green.500"} fontWeight="600">{status}</Text>
        <chakra.button
          onClick={handleSave}
          disabled={loading}
          h="40px"
          px="20px"
          bg="var(--color-brand)"
          color="white"
          fontWeight="600"
          borderRadius="6px"
          border="none"
          cursor="pointer"
          _hover={{ opacity: 0.9 }}
          _disabled={{ opacity: 0.5, cursor: "not-allowed" }}
        >
          {loading ? "Saving..." : "Save Settings"}
        </chakra.button>
      </Flex>
    </Box>
  );
}
