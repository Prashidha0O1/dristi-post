"use client";

import { Box, Flex, Text, Button, Input } from "@chakra-ui/react";
import { Trash2, Link as LinkIcon } from "lucide-react";
import { useState, useTransition } from "react";
import { saveRedirectAction, delete404LogAction } from "../seoRedirectActions";

export default function LogsManager({ logs }: { logs: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [fixingPath, setFixingPath] = useState<string | null>(null);
  const [destination, setDestination] = useState("");

  const handleFix = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fixingPath || !destination) return;
    
    startTransition(async () => {
      try {
        await saveRedirectAction(crypto.randomUUID(), fixingPath, destination, true);
        setFixingPath(null);
        setDestination("");
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  const handleDelete = (path: string) => {
    if (!confirm("Delete this log?")) return;
    startTransition(() => {
      delete404LogAction(path);
    });
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="24px">
        <Text fontSize="16px" color="var(--color-muted)">Monitor broken links and easily create redirects.</Text>
      </Flex>

      {fixingPath && (
        <Box bg="var(--color-surface)" p="20px" borderRadius="8px" border="1px solid var(--color-brand)" mb="24px">
          <Text fontSize="14px" fontWeight="600" mb="12px">Fix Broken Link: {fixingPath}</Text>
          <form onSubmit={handleFix}>
            <Flex gap="16px" align="center">
              <Input 
                value={destination} 
                onChange={e => setDestination(e.target.value)} 
                placeholder="Enter new destination (e.g. /article/new-slug)" 
                required 
                bg="var(--color-input-bg)" 
              />
              <Button type="submit" bg="var(--color-brand)" color="white" disabled={isPending} px="24px">
                {isPending ? "Creating..." : "Create Redirect"}
              </Button>
              <Button onClick={() => setFixingPath(null)} disabled={isPending} bg="transparent" border="1px solid var(--color-border)">
                Cancel
              </Button>
            </Flex>
          </form>
        </Box>
      )}

      <Box overflowX="auto" bg="var(--color-surface)" borderRadius="8px" border="1px solid var(--color-border)">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead style={{ background: 'var(--color-input-bg)' }}>
            <tr>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>Broken URL (Path)</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>Hit Count</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>Last Hit</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: 'var(--color-muted)' }}>No broken links found!</td>
              </tr>
            ) : logs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500, color: 'var(--color-red, red)' }}>{log.path}</td>
                <td style={{ padding: '12px 16px', fontWeight: 700 }}>{log.hitCount}</td>
                <td style={{ padding: '12px 16px', color: 'var(--color-muted)' }}>{new Date(log.lastHitAt).toLocaleString()}</td>
                <td style={{ padding: '12px 16px' }}>
                  <Flex gap="8px">
                    <Button size="sm" bg="blue.500" color="white" onClick={() => setFixingPath(log.path)} disabled={isPending}>
                      <LinkIcon size={12} style={{ marginRight: '6px' }} /> Fix
                    </Button>
                    <button type="button" onClick={() => handleDelete(log.path)} disabled={isPending} style={{ padding: '6px', background: 'transparent', cursor: 'pointer', color: 'red' }}>
                      <Trash2 size={16} />
                    </button>
                  </Flex>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
}
