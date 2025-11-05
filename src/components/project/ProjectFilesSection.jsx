import React, { useState } from "react";
import fileService from "../../services/api/fileService";
import * as signalR from "@microsoft/signalr"; // 👈 import SignalR

const ProjectFilesSection = ({
  project,
  activeFile,
  onFileSelect,
  onProjectUpdate,
  isOwner,
}) => {
  console.log("ProjectFilesSection rendered", { project, activeFile, isOwner });
  const [creating, setCreating] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isShowAssign, setIsShowAssign] = useState(false);
  const [activeAssignFileId, setActiveAssignFileId] = useState(null);

  // 👇 Setup Notification Hub Connection (runs once)
  const notificationHub = new signalR.HubConnectionBuilder()
    .withUrl(`${import.meta.env.VITE_API_BASE_URL}/hubs/notification`, {
      accessTokenFactory: () => localStorage.getItem("token"),
    })
    .withAutomaticReconnect()
    .build();

  const startNotificationHub = async () => {
    try {
      if (notificationHub.state === signalR.HubConnectionState.Disconnected) {
        await notificationHub.start();
        console.log("🔔 NotificationHub connected");
      }
    } catch (err) {
      console.error("❌ NotificationHub connection error:", err);
    }
  };

  // 📢 Helper to send notification
  const sendNotification = async (userId, title, message) => {
    try {
      await startNotificationHub();
      await notificationHub.invoke("SendNotificationToUser", userId.toString(), title, message);
      console.log(`📩 Notification sent to User ${userId}: ${message}`);
    } catch (err) {
      console.error("❌ Failed to send notification:", err);
    }
  };

  // 📢 Helper to notify all members
  const notifyAllMembers = async (title, message) => {
    try {
      await startNotificationHub();
      for (const member of project.members) {
        await notificationHub.invoke("SendNotificationToUser", member.id.toString(), title, message);
      }
      console.log("📢 Notification sent to all project members");
    } catch (err) {
      console.error("❌ Failed to notify all members:", err);
    }
  };

  const handleCreateFile = async (e) => {
    console.log("handleCreateFile called", { fileName });
    e.preventDefault();
    if (!isOwner) {
      setError("Only project owners can create files");
      return;
    }

    setError(null);
    setCreating(true);
    try {
      await fileService.createFile({ fileName, projectId: project.id });
      setFileName("");
      setShowCreateForm(false);
      onProjectUpdate();

      // 🔔 Notify all members
      await notifyAllMembers(
        "📁 New File Created",
        `A new file "${fileName}" was added to project "${project.projectName}".`
      );
    } catch (err) {
      console.error("Error creating file", err);
      setError(err.message || "Failed to create file");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!isOwner) {
      setError("Only project owners can delete files");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await fileService.deleteFile(fileId);
      onProjectUpdate();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete file");
    }
  };

  const handleAssignFile = (fileId) => {
    if (!isOwner) {
      setError("Only project owners can assign files");
      return;
    }
    setActiveAssignFileId(fileId);
    setIsShowAssign(true);
  };

  const handleUnassignFile = async (fileId) => {
    if (!isOwner) {
      setError("Only project owners can unassign files");
      return;
    }
    const confirmed = window.confirm("Are you sure you want to unassign this file?");
    if (!confirmed) return;

    try {
      const res = await fileService.unassign(fileId);
      onProjectUpdate();

      // 🔔 Notify previously assigned user (if known)
      const file = project.files.find((f) => f.id === fileId);
      if (file?.assignedTo) {
        await sendNotification(
          file.assignedTo,
          "📄 File Unassigned",
          `The file "${file.fileName}" has been unassigned from you.`
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to unassign file");
    }
  };

  const handleRenameFile = async (fileId, currentName) => {
    if (!isOwner) {
      setError("Only project owners can rename files");
      return;
    }
    const newName = window.prompt("Enter new file name:", currentName);
    if (!newName || newName.trim() === "") return;

    try {
      await fileService.updateFile({
        id: fileId,
        fileName: newName.trim(),
        content: project.files.find((f) => f.id === fileId)?.content || "",
        projectId: project.id,
      });
      onProjectUpdate();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to rename file");
    }
  };

  return (
    <div className="card h-100 d-flex flex-column">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className="bi bi-files me-1"></i>Files
          <span className="badge bg-primary ms-2">
            {project.files?.length || 0}
          </span>
        </h6>
        {isOwner && (
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => setShowCreateForm(!showCreateForm)}
            title="Create new file"
          >
            <i className="bi bi-plus fs-5"></i>
          </button>
        )}
      </div>

      <div className="card-body d-flex flex-column p-3 flex-grow-1">
        {isOwner && showCreateForm && (
          <div className="mb-3">
            <form onSubmit={handleCreateFile}>
              <div className="input-group input-group-sm">
                <input
                  className="form-control"
                  placeholder="File name"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  required
                />
                <button
                  className="btn btn-outline-success"
                  type="submit"
                  disabled={creating}
                >
                  {creating ? "..." : <i className="bi bi-check fs-5"></i>}
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false);
                    setFileName("");
                  }}
                >
                  <i className="bi bi-x fs-5"></i>
                </button>
              </div>
            </form>
          </div>
        )}

        <div
          className="flex-grow-1 overflow-auto"
          style={{ maxHeight: "400px" }}
        >
          {project.files?.length === 0 ? (
            <div className="text-center text-muted py-3">
              <i className="bi bi-file-earmark fs-4"></i>
              <p className="mt-2 small">No files yet</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {project.files.map((file) => (
                <div
                  key={file.id}
                  className={`list-group-item list-group-item-action p-3 ${
                    activeFile?.id === file.id ? "active" : ""
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => onFileSelect(file)}
                >
                  <div className="d-flex flex-column justify-content-between align-items-start">
                    <div className="flex-grow-1 me-2">
                      <div className="fw-bold small">{file.fileName}</div>
                      <small className="text-muted">
                        {(() => {
                          const assignedUser = project.members.find(
                            (m) => m.id === file.assignedTo
                          );
                          if (assignedUser && assignedUser.id !== project.ownerId)
                            return `Assigned to ${assignedUser.userName}`;
                          if (file.assignedTo === project.ownerId) return "Owner";
                          return "Unassigned";
                        })()}
                      </small>
                      <small className="text-muted d-block">{file.status}</small>
                    </div>

                    {isOwner && file.status !== "Progress" && (
                      <div className="btn-group btn-group-sm" role="group">
                        <br />
                        <button
                          className="btn btn-outline-info"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAssignFile(file.id);
                          }}
                          title="Assign"
                        >
                          <i className="bi bi-person-plus"></i>
                        </button>
                        <button
                          className="btn btn-outline-warning"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnassignFile(file.id);
                          }}
                          title="Unassign"
                        >
                          <i className="bi bi-person-dash"></i>
                        </button>
                        <button
                          className="btn btn-outline-info"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameFile(file.id, file.fileName);
                          }}
                          title="Rename"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          className="btn btn-outline-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFile(file.id);
                          }}
                          title="Delete"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="alert alert-danger small mt-2 mb-0">{error}</div>
        )}

        {isOwner && (
          <div className="text-muted small mt-2">
            <i className="bi bi-info-circle me-1"></i> Owner controls available
          </div>
        )}
      </div>

      {/* Modal */}
      {isShowAssign && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040 }}
            onClick={() => setIsShowAssign(false)}
          ></div>
          <div
            className="modal fade show d-block"
            style={{ zIndex: 1050 }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">Assign File</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setIsShowAssign(false)}
                  ></button>
                </div>
                <div className="modal-body p-0">
                  <ul className="list-group list-group-flush">
                    {project.members?.length > 0 ? (
                      project.members.map((member) => (
                        <li
                          key={member.id}
                          className="list-group-item d-flex justify-content-between align-items-center"
                        >
                          <span>
                            <i className="bi bi-person me-2"></i>
                            {member.userName}
                          </span>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={async (e) => {
                              e.stopPropagation();
                              try {
                                await fileService.assign({
                                  fileId: activeAssignFileId,
                                  targetUserId: member.id,
                                });
                                onProjectUpdate();

                                // 🔔 Notify assigned user
                                await sendNotification(
                                  member.id,
                                  "📄 File Assigned",
                                  `You have been assigned a new file in project "${project.projectName}".`
                                );
                              } catch (err) {
                                setError(err.response?.data?.message || "Failed to assign");
                              } finally {
                                setIsShowAssign(false);
                                setActiveAssignFileId(null);
                              }
                            }}
                          >
                            Assign
                          </button>
                        </li>
                      ))
                    ) : (
                      <li className="list-group-item text-center text-muted">
                        No members
                      </li>
                    )}
                  </ul>
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsShowAssign(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProjectFilesSection;
