"use client";

import { Box, Text, Flex } from "@chakra-ui/react";
import { PageShell } from "@/components/pageShell";
import { useLocale } from "@/lib/localeContext";

interface FooterSettings {
  email?: string;
  phone?: string;
  whatsapp?: string;
}

export default function ContactPageClient({ footer }: { footer: FooterSettings }) {
  const { locale } = useLocale();

  return (
    <PageShell>
      <Box maxW="800px" mx="auto" px="var(--side-pad)" py="60px">
        <Text as="h1" fontSize="32px" fontWeight="800" color="var(--color-headline)" mb="24px" fontFamily="var(--font-mukta), sans-serif">
          {locale === "ne" ? "सम्पर्क गर्नुहोस्" : "Contact Us"}
        </Text>
        
        {locale === "ne" ? (
          <Box color="var(--color-body)" fontSize="17px" lineHeight="1.8">
            <Text mb="24px">
              हामी तपाईंका प्रश्नहरू, प्रतिक्रियाहरू, र समाचार सुझावहरूलाई स्वागत गर्दछौं। कृपया तलका सम्पर्क विवरणहरू प्रयोग गरेर हामीलाई सम्पर्क गर्नुहोस्, र हाम्रो टोलीले सकेसम्म चाँडो तपाईंलाई प्रतिक्रिया दिनेछ।
            </Text>

            <Box bg="var(--color-surface)" border="1px solid var(--color-border)" borderRadius="8px" p="32px" mb="32px">
              <Text as="h2" fontSize="20px" fontWeight="700" color="var(--color-headline)" mb="16px">दृष्टि टाइम्स कार्यालय</Text>
              
              <Flex direction="column" gap="12px">
                <Box>
                  <Text fontWeight="600" color="var(--color-headline)" display="inline" mr="8px">ईमेल:</Text>
                  <a href={`mailto:${footer.email || 'info@dristitimes.com'}`} style={{ color: "var(--color-brand)" }}>{footer.email || 'info@dristitimes.com'}</a>
                </Box>
                
                <Box>
                  <Text fontWeight="600" color="var(--color-headline)" display="inline" mr="8px">फोन:</Text>
                  <a href={`tel:${footer.phone || '+977-9849115232'}`} style={{ color: "var(--color-brand)", fontFamily: "sans-serif" }}>{footer.phone || '+977-9849115232'}</a>
                </Box>
                
                {footer.whatsapp && (
                  <Box>
                    <Text fontWeight="600" color="var(--color-headline)" display="inline" mr="8px">ह्वाट्सएप:</Text>
                    <a href={`https://wa.me/${footer.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-brand)", fontFamily: "sans-serif" }}>{footer.whatsapp}</a>
                  </Box>
                )}
              </Flex>
            </Box>

            <Text as="h2" fontSize="24px" fontWeight="700" color="var(--color-headline)" mb="16px" mt="40px">
              हाम्रो लागि लेख्नुहोस्
            </Text>
            <Text mb="24px">
              दृष्टि टाइम्स सधैं भावुक लेखकहरू, विश्लेषकहरू, र रिपोर्टरहरूको खोजीमा छ। यदि तपाईंसँग हाम्रो दर्शकहरूसँग साझा गर्न कुनै विचारोत्तेजक लेख, अनुसन्धानात्मक रिपोर्ट, वा प्रेरणादायक कथा छ भने, कृपया हाम्रो सम्पादकीय टोलीलाई ईमेल गर्नुहोस्।
            </Text>

            <Text as="h2" fontSize="24px" fontWeight="700" color="var(--color-headline)" mb="16px" mt="40px">
              विज्ञापन तथा सहकार्य
            </Text>
            <Text mb="24px">
              विज्ञापन, प्रायोजित सामग्री, वा व्यापारिक साझेदारीको लागि, कृपया हाम्रो मार्केटिङ टोलीलाई सिधै फोन वा ईमेल मार्फत सम्पर्क गर्नुहोस्। तपाईंको ब्रान्डलाई नेपालभरि हजारौं पाठकहरूसम्म पुर्‍याउन मद्दत गर्न हामी प्रतिस्पर्धात्मक विज्ञापन प्याकेजहरू प्रस्ताव गर्छौं।
            </Text>
          </Box>
        ) : (
          <Box color="var(--color-body)" fontSize="17px" lineHeight="1.8">
            <Text mb="24px">
              We welcome your questions, feedback, and news tips. Please reach out to us using the contact details below, and our team will get back to you as soon as possible.
            </Text>

            <Box bg="var(--color-surface)" border="1px solid var(--color-border)" borderRadius="8px" p="32px" mb="32px">
              <Text as="h2" fontSize="20px" fontWeight="700" color="var(--color-headline)" mb="16px">Dristi Times Office</Text>
              
              <Flex direction="column" gap="12px">
                <Box>
                  <Text fontWeight="600" color="var(--color-headline)" display="inline" mr="8px">Email:</Text>
                  <a href={`mailto:${footer.email || 'info@dristitimes.com'}`} style={{ color: "var(--color-brand)" }}>{footer.email || 'info@dristitimes.com'}</a>
                </Box>
                
                <Box>
                  <Text fontWeight="600" color="var(--color-headline)" display="inline" mr="8px">Phone:</Text>
                  <a href={`tel:${footer.phone || '+977-9849115232'}`} style={{ color: "var(--color-brand)", fontFamily: "sans-serif" }}>{footer.phone || '+977-9849115232'}</a>
                </Box>
                
                {footer.whatsapp && (
                  <Box>
                    <Text fontWeight="600" color="var(--color-headline)" display="inline" mr="8px">WhatsApp:</Text>
                    <a href={`https://wa.me/${footer.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{ color: "var(--color-brand)", fontFamily: "sans-serif" }}>{footer.whatsapp}</a>
                  </Box>
                )}
              </Flex>
            </Box>

            <Text as="h2" fontSize="24px" fontWeight="700" color="var(--color-headline)" mb="16px" mt="40px">
              Write for Us
            </Text>
            <Text mb="24px">
              Dristi Times is always looking for passionate writers, analysts, and reporters. If you have an insightful opinion piece, an investigative report, or an inspiring story to share with our audience, please email your pitches to our editorial team.
            </Text>

            <Text as="h2" fontSize="24px" fontWeight="700" color="var(--color-headline)" mb="16px" mt="40px">
              Advertisement & Partnerships
            </Text>
            <Text mb="24px">
              For advertising inquiries, sponsored content, or business partnerships, please contact our marketing team directly via phone or email. We offer competitive banner placements, sponsored articles, and full-site takeovers to help your brand reach thousands of readers across Nepal.
            </Text>
          </Box>
        )}
      </Box>
    </PageShell>
  );
}
