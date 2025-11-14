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

  // New state for versions modal
  const [showVersionsModal, setShowVersionsModal] = useState(false);
  const [fileVersions, setFileVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [versionsError, setVersionsError] = useState(null);

  useEffect(() => {
    if (!project?.id) return;

    signalRConnectionService.startConnection(project.id).catch(console.error);

    signalRConnectionService.onReceive(() => {
      console.log("Received update via SignalR");
      onProjectUpdate();
    });

    return () => {
      // cleanup if needed
    };
  }, [project?.id, onProjectUpdate]);

  useEffect(() => {
    if (activeFile) {
      const savedContent = localStorage.getItem(`fileContent_${activeFile.id}`);
       setContent(savedContent !== null ? savedContent : activeFile.content || "");
    } else {
      setContent("");
    }
  }, [activeFile]);


  const canEdit = (file) => {
    if (!file) return false;
    if (
      Number(file.assignedTo) === Number(currentUserId) &&
      file.status == "Progress"
    )
      return true;

    if (
      Number(file.assignedTo) === Number(currentUserId) &&
      file.status == "UnAssigned"
    )
      return true;
    if (
      Number(file.assignedTo) === Number(currentUserId) &&
      file.status == "Saved"
    )
      return true;

    return false;
  };

  const canView = (file) => {
    if (!file) return false;
    if (project.ownerId === currentUserId) return true;
    // if (file.accessLevel === "private") return false;
    return true;
  };

  // Fetch versions from backend when modal opens
  const openVersionsModal = async () => {
    if (!activeFile) return;
    setShowVersionsModal(true);
    setLoadingVersions(true);
    setVersionsError(null);
    try {
      const versions = await fileService.getAllVersions(activeFile.id);
      setFileVersions(versions);
    } catch (err) {
      setVersionsError(
        err?.response?.data?.message || "Failed to load versions"
      );
    } finally {
      setLoadingVersions(false);
    }
  };

  const closeVersionsModal = () => {
    setShowVersionsModal(false);
    setFileVersions([]);
    setVersionsError(null);
  };

  const handleSave = async () => {
    if (!activeFile || editing) return;
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
      await onProjectUpdate();
      localStorage.removeItem(`fileContent_${activeFile.id}`);

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

  const onChange = (v) => {
    setContent(v ?? "");
    if (activeFile) {
      localStorage.setItem(`fileContent_${activeFile.id}`, v ?? "");
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
    <>
      <div className="card h-100 d-flex flex-column">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">
              <i className="bi bi-code-square"></i> Code Editor
            </h5>
            {activeFile && (
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={handleRename}
                >
                  <i className="bi bi-pencil"></i> Rename
                </button>
                <button
                  className="btn btn-sm btn-outline-info"
                  onClick={openVersionsModal}
                >
                  <i className="bi bi-clock-history"></i> Versions
                </button>
                <button
                  className={`btn ${
                    activeFile?.status === "Progress"
                      ? "btn-success"
                      : "btn-warning"
                  }`}
                  onClick={handleSave}
                >
                  {activeFile?.status !== "Saved" ? "Save" : "Update"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="card-body d-flex flex-column flex-grow-1 p-0">
          {activeFile && (
            <div className="border-bottom p-3 bg-light">
              {/* <h6 className="mb-1">{activeFile.fileName}</h6> */}
              {/* <small className="text-muted">
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
              </small> */}

              {/* ✅ Status message moved here above the editor */}
              {statusMsg && (
                <div
                  className={`alert mt-2 small mb-0 ${
                    statusMsg.toLowerCase().includes("success")
                      ? "alert-success"
                      : "alert-danger"
                  }`}
                >
                  {statusMsg}
                </div>
              )}
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
                  onChange={onChange}
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
        </div>
      </div>

      {/* Versions Modal */}
      {showVersionsModal && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040 }}
            onClick={closeVersionsModal}
          />
          <div
            className="modal fade show d-block"
            style={{ zIndex: 1050, maxWidth: "700px" }}
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
            aria-labelledby="versionsModalLabel"
          >
            <div className="modal-dialog modal-dialog-scrollable modal-lg modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title" id="versionsModalLabel">
                    File Versions - {activeFile?.fileName}
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    aria-label="Close"
                    onClick={closeVersionsModal}
                  />
                </div>
                <div className="modal-body">
                  {loadingVersions ? (
                    <div className="text-center py-4">
                      <div
                        className="spinner-border text-primary"
                        role="status"
                      />
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : versionsError ? (
                    <div className="alert alert-danger">{versionsError}</div>
                  ) : fileVersions.length === 0 ? (
                    <p className="text-center text-muted">
                      No versions available.
                    </p>
                  ) : (
                    <div>
                      {fileVersions.map((version) => (
                        <div
                          key={version.id}
                          tabIndex={0}
                          className="border rounded p-3 mb-3 bg-light"
                          style={{
                            whiteSpace: "pre-wrap",
                            fontFamily: "monospace",
                            outline: "none",
                          }}
                          onFocus={(e) =>
                            (e.currentTarget.style.boxShadow =
                              "0 0 8px #0d6efd")
                          }
                          onBlur={(e) =>
                            (e.currentTarget.style.boxShadow = "none")
                          }
                        >
                          <div className="d-flex justify-content-between mb-2">
                            <strong>{version.fileName}</strong>
                            <small className="text-muted">
                              Saved by: {version.savedBy}
                            </small>
                          </div>
                          <pre className="mb-0">{version.content}</pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={closeVersionsModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ProjectEditorSection;
