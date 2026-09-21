"use client";

import { Box, Flex, Text, Button, Input } from "@chakra-ui/react";
import { Trash2, Edit2, Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { saveRedirectAction, deleteRedirectAction } from "../seoRedirectActions";

export default function RedirectsManager({ redirects }: { redirects: any[] }) {
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [isActive, setIsActive] = useState(true);

  const handleEdit = (r: any) => {
    setEditingId(r.id);
    setSource(r.sourcePath);
    setDestination(r.destinationPath);
    setIsActive(r.isActive);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!source || !destination) return;
    
    startTransition(async () => {
      try {
        await saveRedirectAction(editingId || crypto.randomUUID(), source, destination, isActive);
        setShowForm(false);
        setSource("");
        setDestination("");
        setEditingId(null);
      } catch (err: any) {
        alert(err.message);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Delete this redirect?")) return;
    startTransition(() => {
      deleteRedirectAction(id);
    });
  };

  const toggleActive = (r: any) => {
    startTransition(() => {
      saveRedirectAction(r.id, r.sourcePath, r.destinationPath, !r.isActive);
    });
  };

  return (
    <Box>
      <Flex justify="space-between" align="center" mb="24px">
        <Text fontSize="16px" color="var(--color-muted)">Manage 301 Permanent Redirects</Text>
        <Button 
          bg="var(--color-brand)" color="white" 
          _hover={{ opacity: 0.8 }}
          onClick={() => {
            setEditingId(null);
            setSource("");
            setDestination("");
            setIsActive(true);
            setShowForm(!showForm);
          }}
        >
          <Plus size={16} style={{ marginRight: '8px' }} />
          Add Redirect
        </Button>
      </Flex>

      {showForm && (
        <Box bg="var(--color-surface)" p="20px" borderRadius="8px" border="1px solid var(--color-border)" mb="24px">
          <form onSubmit={handleSave}>
            <Flex gap="16px" align="flex-end">
              <Box flex="1">
                <Text fontSize="12px" fontWeight="600" mb="6px">Old URL (Source)</Text>
                <Input value={source} onChange={e => setSource(e.target.value)} placeholder="/news/old-slug" required bg="var(--color-input-bg)" />
              </Box>
              <Box flex="1">
                <Text fontSize="12px" fontWeight="600" mb="6px">New URL (Destination)</Text>
                <Input value={destination} onChange={e => setDestination(e.target.value)} placeholder="/article/new-slug" required bg="var(--color-input-bg)" />
              </Box>
              <Button type="submit" bg="var(--color-brand)" color="white" disabled={isPending} px="24px">
                {isPending ? "Saving..." : "Save"}
              </Button>
            </Flex>
          </form>
        </Box>
      )}

      <Box overflowX="auto" bg="var(--color-surface)" borderRadius="8px" border="1px solid var(--color-border)">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
          <thead style={{ background: 'var(--color-input-bg)' }}>
            <tr>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>Status</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>Source Path</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>Destination Path</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid var(--color-border)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {redirects.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '20px', color: 'var(--color-muted)' }}>No redirects found.</td>
              </tr>
            ) : redirects.map(r => (
              <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <input type="checkbox" checked={r.isActive} onChange={() => toggleActive(r)} disabled={isPending} style={{ cursor: 'pointer', width: '16px', height: '16px' }} />
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{r.sourcePath}</td>
                <td style={{ padding: '12px 16px', color: 'var(--color-brand)' }}>{r.destinationPath}</td>
                <td style={{ padding: '12px 16px' }}>
                  <Flex gap="8px">
                    <button type="button" onClick={() => handleEdit(r)} style={{ padding: '6px', background: 'transparent', cursor: 'pointer' }}><Edit2 size={16} /></button>
                    <button type="button" onClick={() => handleDelete(r.id)} style={{ padding: '6px', background: 'transparent', cursor: 'pointer', color: 'red' }}><Trash2 size={16} /></button>
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
