// src/components/dashboard/EditorPanel.jsx
import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react'; // ✅ default export is enough
import fileService from '../../services/api/fileService';

const EditorPanel = ({ project, onProjectUpdated, currentUserId }) => {
  console.log("EditorPanel initialized with project:", project, "and currentUserId:", currentUserId);
  const [activeFile, setActiveFile] = useState(null);
  const [content, setContent] = useState('');
  const [editing, setEditing] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  console.log(currentUserId);
  console.log("from editor");

  useEffect(() => {
    console.log("useEffect triggered, project:", project);
    if (!project || (project.files && project.files.length === 0)) {
      console.log("No project or files found");
      setActiveFile(null);
      setContent('');
      return;
    }
    const first = project.files[0];
    console.log("Setting first active file:", first);
    setActiveFile(first);
    setContent(first.content ?? '');
  }, [project]);

  const canEdit = (file) => {
    const editable = file && file.assignedTo !== null && Number(file.assignedTo) === Number(currentUserId);
    console.log("canEdit check for file:", file, "result:", editable);
    return editable;
  };

  const handleSave = async () => {
    console.log("Save clicked for file:", activeFile);
    if (!activeFile) return;
    setStatusMsg(null);
    setEditing(true);
    try {
      console.log("Saving file with content length:", content.length);
      await fileService.updateFile({
        id: activeFile.id,
        fileName: activeFile.fileName,
        content,
        projectId: project.id,
      });
      console.log("File saved successfully");
      setStatusMsg('Saved');
      onProjectUpdated();
    } catch (err) {
      console.log("Save failed:", err);
      setStatusMsg(err?.message || 'Save failed');
    } finally {
      setEditing(false);
      setTimeout(() => setStatusMsg(null), 2000);
    }
  };

  const handleDelete = async () => {
    console.log("Delete clicked for file:", activeFile);
    if (!activeFile) return;
    if (!window.confirm('Delete this file?')) return;
    try {
      await fileService.deleteFile(activeFile.id);
      console.log("File deleted successfully");
      onProjectUpdated();
    } catch (err) {
      console.log("Delete failed:", err);
      setStatusMsg(err?.message || 'Delete failed');
    }
  };

  const handleRename = async () => {
    console.log("Rename clicked for file:", activeFile);
    const newName = window.prompt('New filename', activeFile.fileName);
    if (!newName || newName.trim() === '') return;
    try {
      console.log("Renaming to:", newName);
      await fileService.updateFile({
        id: activeFile.id,
        fileName: newName.trim(),
        content,
        projectId: project.id,
      });
      console.log("Rename successful");
      onProjectUpdated();
    } catch (err) {
      console.log("Rename failed:", err);
      setStatusMsg(err?.message || 'Rename failed');
    }
  };

  const handleAssign = async () => {
    console.log("Assign clicked for file:", activeFile);
    const id = parseInt(window.prompt('Assign to user id (numeric)'), 10);
    if (!id) return;
    try {
      console.log("Assigning to user id:", id);
      await fileService.assign({ fileId: activeFile.id, targetUserId: id });
      console.log("Assign successful");
      onProjectUpdated();
    } catch (err) {
      console.log("Assign failed:", err);
      setStatusMsg(err?.message || 'Assign failed');
    }
  };

  const handleUnassign = async () => {
    console.log("Unassign clicked for file:", activeFile);
    try {
      await fileService.unassign(activeFile.id);
      console.log("Unassign successful");
      onProjectUpdated();
    } catch (err) {
      console.log("Unassign failed:", err);
      setStatusMsg(err?.message || 'Unassign failed');
    }
  };

  console.log("Rendering EditorPanel with activeFile:", activeFile, "statusMsg:", statusMsg);

  if (!project) {
    return <div className="card"><div className="card-body">Open a project to edit files</div></div>;
  }

  return (
    <div className="card h-100">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <h6 className="mb-0">{activeFile ? activeFile.fileName : 'No file selected'}</h6>
            <small className="text-muted">Assigned: {activeFile?.assignedTo ?? 'unassigned'}</small>
          </div>
          <div>
            <button className="btn btn-sm btn-outline-secondary me-1" onClick={handleRename} disabled={!activeFile}>Rename</button>
            <button className="btn btn-sm btn-outline-danger me-1" onClick={handleDelete} disabled={!activeFile}>Delete</button>
            <button className="btn btn-sm btn-outline-primary me-1" onClick={handleAssign} disabled={!activeFile}>Assign</button>
            <button className="btn btn-sm btn-outline-warning" onClick={handleUnassign} disabled={!activeFile}>Unassign</button>
          </div>
        </div>

        <div className="flex-grow-1" style={{ minHeight: 400 }}>
          {activeFile ? (
            <Editor
              height="60vh"
              defaultLanguage="javascript"
              value={content}
              onChange={(value) => {
                console.log("Editor content changed, length:", value?.length);
                setContent(value ?? '');
              }}
              options={{ readOnly: !canEdit(activeFile), automaticLayout: true }}
            />
          ) : (
            <div>Select a file to edit</div>
          )}
        </div>

        <div className="mt-2 d-flex justify-content-between align-items-center">
          <div className="text-muted small">{statusMsg}</div>
          <div>
            <button className="btn btn-sm btn-success" disabled={!activeFile || editing || !canEdit(activeFile)} onClick={handleSave}>Save</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
