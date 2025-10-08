// @ts-ignore
import React, { useEffect, useMemo, useState } from 'react';
// @ts-ignore
import { ServerConnection } from '@jupyterlab/services';
// @ts-ignore
import { URLExt } from '@jupyterlab/coreutils';

interface FileItemDTO {
  id: string;
  filename: string;
  mimeType?: string;
  fileSize?: number;
  ownerId?: string;
  description?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface FileSharePanelProps {
  projectId: string;
  baseUrl?: string; // jupyter base url
  onBack: () => void;
}

export const FileSharePanel: React.FC<FileSharePanelProps> = ({ projectId, baseUrl = '', onBack }) => {
  const [files, setFiles] = useState<FileItemDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState<string>('');
  const [tags, setTags] = useState<string>('');

  const settings = useMemo(() => ServerConnection.makeSettings(), []);
  const root = useMemo(() => (baseUrl || settings.baseUrl || '').replace(/\/+$/, ''), [baseUrl, settings.baseUrl]);
  const apiList = useMemo(() => URLExt.join(root, 'collab-manager', 'api', 'files', projectId), [root, projectId]);
  const apiDownload = (fileId: string) => URLExt.join(root, 'collab-manager', 'api', 'files', projectId, fileId, 'download');

  const requestJSON = async (url: string, init: RequestInit = {}) => {
    const response = await ServerConnection.makeRequest(url, init, settings);
    const ct = response.headers.get('content-type') || '';
    if (!response.ok) {
      if (ct.includes('application/json')) {
        const data = await response.json();
        throw new Error(data.error || response.statusText);
      } else {
        const text = await response.text();
        throw new Error(text || response.statusText);
      }
    }
    if (ct.includes('application/json')) {
      return await response.json();
    }
    // Fallback
    return {};
  };

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await requestJSON(apiList, { method: 'GET' });
      if (!data.success) throw new Error(data.error || 'Failed to load files');
      setFiles(data.files || []);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const onUpload = async () => {
    if (!selectedFile) return;
    const form = new FormData();
    form.append('action', 'create');
    form.append('file', selectedFile);
    if (description) form.append('description', description);
    if (tags) form.append('tags', tags); // can be comma-separated

    try {
      setUploading(true);
      setError('');
      const data = await requestJSON(apiList, { method: 'POST', body: form });
      if (!data.success) throw new Error(data.error || 'Upload failed');
      setSelectedFile(null);
      setDescription('');
      setTags('');
      await fetchFiles();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setUploading(false);
    }
  };

  const onDelete = async (fileId: string) => {
    if (!confirm('Delete this file?')) return;
    try {
      setError('');
      const data = await requestJSON(apiList, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: fileId })
      });
      if (!data.success) throw new Error(data.error || 'Delete failed');
      await fetchFiles();
    } catch (e: any) {
      setError(e.message || String(e));
    }
  };

  const onUpdateMeta = async (fileId: string, desc: string, tagStr: string) => {
    try {
      setError('');
      const tagsList = tagStr
        ? tagStr.split(',').map(s => s.trim()).filter(Boolean)
        : [];
      const data = await requestJSON(apiList, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id: fileId, description: desc, tags: tagsList })
      });
      if (!data.success) throw new Error(data.error || 'Update failed');
      await fetchFiles();
    } catch (e: any) {
      setError(e.message || String(e));
    }
  };

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return files;
    return files.filter(f => (f.filename || '').toLowerCase().includes(s) || (f.tags || []).some(t => t.toLowerCase().includes(s)));
  }, [files, search]);

  return (
    <div style={{ padding: '20px', height: '100%', boxSizing: 'border-box' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <button onClick={onBack}>Back</button>
        <h2 style={{ margin: 0 }}>File Share</h2>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search by name or tag"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '6px 8px', width: 240 }}
          />
          <button onClick={fetchFiles} disabled={loading}>Refresh</button>
        </div>
      </div>

      <div style={{ border: '1px solid #ddd', padding: 12, borderRadius: 6, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="file" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            style={{ padding: '6px 8px', width: 220 }}
          />
          <input
            type="text"
            placeholder="Tags (comma separated)"
            value={tags}
            onChange={e => setTags(e.target.value)}
            style={{ padding: '6px 8px', width: 220 }}
          />
          <button onClick={onUpload} disabled={uploading || !selectedFile}>Upload</button>
        </div>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>
      )}

      <div style={{ border: '1px solid #eee', borderRadius: 6 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr 1fr', padding: '8px 12px', background: '#fafafa', fontWeight: 600 }}>
          <div>Name</div>
          <div>Size</div>
          <div>Owner</div>
          <div>Description / Tags</div>
          <div>Actions</div>
        </div>
        {loading ? (
          <div style={{ padding: 12 }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 12 }}>No files</div>
        ) : (
          filtered.map(item => (
            <Row key={item.id} item={item} onDelete={onDelete} onUpdate={onUpdateMeta} onDownload={() => window.open(apiDownload(item.id), '_blank')} />
          ))
        )}
      </div>
    </div>
  );
};

const Row: React.FC<{
  item: FileItemDTO;
  onDelete: (id: string) => void;
  onDownload: () => void;
  onUpdate: (id: string, desc: string, tags: string) => void;
}> = ({ item, onDelete, onDownload, onUpdate }) => {
  const [desc, setDesc] = useState<string>(item.description || '');
  const [tags, setTags] = useState<string>((item.tags || []).join(', '));
  const sizeStr = useMemo(() => formatSize(item.fileSize || 0), [item.fileSize]);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr 1fr', padding: '10px 12px', borderTop: '1px solid #f0f0f0', alignItems: 'center', gap: 8 }}>
      <div title={item.filename}>{item.filename}</div>
      <div>{sizeStr}</div>
      <div title={item.ownerId}>{item.ownerId}</div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <input
          type="text"
          value={desc}
          onChange={e => setDesc(e.target.value)}
          placeholder="Description"
          style={{ padding: '4px 6px', width: 180 }}
        />
        <input
          type="text"
          value={tags}
          onChange={e => setTags(e.target.value)}
          placeholder="tags"
          style={{ padding: '4px 6px', width: 160 }}
        />
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onDownload}>Download</button>
        <button onClick={() => onDelete(item.id)}>Delete</button>
      </div>
    </div>
  );
};

function formatSize(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let n = bytes;
  while (n >= 1024 && i < units.length - 1) {
    n = n / 1024;
    i += 1;
  }
  return `${n.toFixed(1)} ${units[i]}`;
}


