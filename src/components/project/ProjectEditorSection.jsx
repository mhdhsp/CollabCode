import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import fileService from "../../services/api/fileService";
import signalRConnectionService from "../../services/signalRConnection";

const ProjectEditorSection = ({
  project,
  activeFile,
  onProjectUpdate,
  currentUserId,
}) => {
  const [content, setContent] = useState("");
  const [editing, setEditing] = useState(false);
  const [statusMsg, setStatusMsg] = useState(null);

  useEffect(() => {
    if (!project?.id) return;

    // Start connection and join group
    signalRConnectionService.startConnection(project.id).catch(console.error);

    // Register Receive handler
    signalRConnectionService.onReceive(() => {
      console.log("Received update via SignalR");
      onProjectUpdate();
    });

    // Cleanup on unmount or project change
    return () => {
      // Optional: do not stop connection to reuse it, or stop if you want
      // signalRConnectionService.stopConnection();
    };
  }, [project?.id, onProjectUpdate]);

  useEffect(() => {
    if (activeFile) {
      setContent(activeFile.content || "");
    } else {
      setContent("");
    }
  }, [activeFile]);

  const canEdit = (file) => {
    if (!file) return false;
    if (Number(file.assignedTo) === Number(currentUserId)) {
      return file.accessLevel !== "private";
    }
    return false;
  };

  const canView = (file) => {
    if (!file) return false;
    if (project.ownerId === currentUserId) return true;
    if (file.accessLevel === "private") return false;
    return true;
  };

  const handleSave = async () => {
    if (!activeFile) return;
    setStatusMsg(null);
    setEditing(true);

    try {
      await fileService.saveFile({
        fileId: activeFile.id,
        content,
        projectId: project.id,
      });
      setStatusMsg("Saved successfully");
      await new Promise((r) => setTimeout(r, 300));
      onProjectUpdate();

      await signalRConnectionService.sendUpdate(project.id);
    } catch (err) {
      setStatusMsg(err?.message || "Save failed");
    } finally {
      setEditing(false);
      setTimeout(() => setStatusMsg(null), 3000);
    }
  };

  const handleRename = async () => {
    if (!activeFile) return;
    const newName = window.prompt("New filename", activeFile.fileName);
    if (!newName?.trim()) return;
    try {
      await fileService.updateFile({
        id: activeFile.id,
        fileName: newName.trim(),
        content,
        projectId: project.id,
      });
      onProjectUpdate();
    } catch (err) {
      setStatusMsg(err?.response?.data?.message || "Rename failed");
    }
  };

  if (!project) {
    return (
      <div className="card h-100">
        <div className="card-body d-flex align-items-center justify-content-center">
          <div className="text-center text-muted">
            <i className="bi bi-file-earmark-x fs-1"></i>
            <p>No project selected</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card h-100 d-flex flex-column">
      <div className="card-header">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">
            <i className="bi bi-code-square"></i> Code Editor
          </h5>
          {activeFile && (
            <div>
              <button
                className="btn btn-sm btn-outline-secondary me-1"
                onClick={handleRename}
              >
                <i className="bi bi-pencil"></i> Rename
              </button>
              <button
                className="btn btn-sm btn-success"
                disabled={!canEdit(activeFile) || editing}
                onClick={handleSave}
              >
                {editing ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="card-body d-flex flex-column flex-grow-1 p-0">
        {activeFile && (
          <div className="border-bottom p-3 bg-light">
            <h6 className="mb-1">{activeFile.fileName}</h6>
            <small className="text-muted">
              {canEdit(activeFile) ? (
                <span className="text-success">
                  <i className="bi bi-check-circle"></i> Editable
                </span>
              ) : !canView(activeFile) ? (
                <span className="text-danger">
                  <i className="bi bi-lock"></i> Private
                </span>
              ) : (
                <span className="text-warning">
                  <i className="bi bi-person-lock"></i> Assigned
                </span>
              )}
            </small>
          </div>
        )}

        <div className="flex-grow-1" style={{ minHeight: 0 }}>
          {activeFile ? (
            !canView(activeFile) ? (
              <div className="h-100 d-flex align-items-center justify-content-center p-4">
                <div className="text-center text-danger">
                  <i className="bi bi-shield-lock fs-1"></i>
                  <p>Access Denied</p>
                </div>
              </div>
            ) : (
              <Editor
                height="100%"
                defaultLanguage="javascript"
                value={content}
                onChange={(v) => setContent(v ?? "")}
                options={{
                  readOnly: !canEdit(activeFile),
                  automaticLayout: true,
                  minimap: { enabled: false },
                  wordWrap: "on",
                  fontSize: 14,
                  tabSize: 2,
                  scrollBeyondLastLine: false,
                }}
              />
            )
          ) : (
            <div className="h-100 d-flex align-items-center justify-content-center text-muted">
              <div className="text-center">
                <i className="bi bi-file-earmark-text fs-1"></i>
                <p>Select a file to edit</p>
              </div>
            </div>
          )}
        </div>

        {statusMsg && (
          <div className="p-2">
            <div
              className={`alert ${
                statusMsg.includes("success") ? "alert-success" : "alert-danger"
              } small mb-0`}
            >
              {statusMsg}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectEditorSection;