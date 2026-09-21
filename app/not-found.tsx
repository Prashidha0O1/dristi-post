import Link from "next/link";
import { Box, Flex, Text, Button } from "@chakra-ui/react";

export default function NotFound() {
  return (
    <Box>
      <Flex direction="column" align="center" justify="center" py="100px" px="20px" textAlign="center">
        <Text fontSize="120px" fontWeight="900" color="var(--color-brand)" lineHeight="1">
          404
        </Text>
        <Text fontSize="24px" fontWeight="700" color="var(--color-headline)" mt="20px" mb="12px">
          पृष्ठ फेला परेन (Page Not Found)
        </Text>
        <Text fontSize="16px" color="var(--color-muted)" maxW="400px" mb="32px">
          तपाईंले खोज्नुभएको पृष्ठ हटाइएको हुन सक्छ वा लिङ्क परिवर्तन भएको हुन सक्छ।
        </Text>
        <Link href="/">
          <Button bg="var(--color-brand)" color="white" _hover={{ opacity: 0.8 }} px="24px" h="48px" borderRadius="6px" fontWeight="600">
            गृहपृष्ठमा फर्कनुहोस्
          </Button>
        </Link>
      </Flex>
    </Box>
  );
}
