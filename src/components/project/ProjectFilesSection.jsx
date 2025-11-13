import React, { useState } from "react";
import fileService from "../../services/api/fileService";

const ProjectFilesSection = ({
  project,
  activeFile,
  onFileSelect,
  onProjectUpdate,
  isOwner,
  notifications,
  showNotifications,
  setShowNotifications,
}) => {
  const [creating, setCreating] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isShowAssign, setIsShowAssign] = useState(false);
  const [activeAssignFileId, setActiveAssignFileId] = useState(null);

  const userId = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"))?.id || null;
    } catch {
      return null;
    }
  })();

  const handleCreateFile = async (e) => {
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
    } catch (err) {
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

  const handleUnassignFile = async (fileId, fileStatus) => {
    if (!isOwner) {
      setError("Only project owners can unassign files");
      return;
    }
    if (fileStatus === "Progress") {
      setError("Cannot unassign a file in Progress status");
      return;
    }
    if (!window.confirm("Are you sure you want to unassign this file?")) return;
    try {
      await fileService.unassign(fileId);
      onProjectUpdate();
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

  const handleStartProject = async (fileId) => {
    try {
      await fileService.startEdit(fileId);
      onProjectUpdate();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start project");
    }
  };

  return (
    <div className="card h-100 d-flex flex-column position-relative">
      {/* Notification Button */}
      <button
        className="btn btn-outline-info position top-0 end-0 m-2"
        style={{ zIndex: 10 }}
        onClick={() => setShowNotifications(true)}
      >
        🔔 Notifications ({notifications.length})
      </button>

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

      <div
        className="card-body d-flex flex-column p-3 flex-grow-1 overflow-auto"
        style={{ maxHeight: "400px" }}
      >
        {isOwner && showCreateForm && (
          <div className="mb-3">
            <form onSubmit={handleCreateFile} className="d-flex gap-2">
              <input
                className="form-control form-control-sm flex-grow-1"
                placeholder="File name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                required
                autoFocus
              />
              <button
                className="btn btn-sm btn-success"
                type="submit"
                disabled={creating}
                style={{ minWidth: "10px" }}
              >
                {creating ? (
                  <span className="spinner-border spinner-border-sm"></span>
                ) : (
                  <i className="bi bi-check"></i>
                )}
              </button>
            </form>
          </div>
        )}

        {project.files?.length === 0 ? (
          <div className="text-center text-muted py-5">
            <i className="bi bi-file-earmark fs-3 mb-2"></i>
            <p className="mb-0 small">No files yet</p>
          </div>
        ) : (
          <div className="list-group list-group-flush">
            {project.files.map((file) => (
              <div
                key={file.id}
                className={`list-group-item list-group-item-action d-flex flex-column justify-content-between align-items-center px-3 py-2 ${
                  activeFile?.id === file.id ? "active" : ""
                }`}
                style={{
                  cursor: "pointer",
                  borderRadius: "6px",
                  margin: "4px 8px",
                }}
                onClick={() => onFileSelect(file)}
              >
                <div className="flex-grow-1 me-3 ">
                  <div
                    className="fw-semibold small text-truncate"
                    title={file.fileName}
                  >
                    {file.fileName}
                  </div>
                  <small className="text-muted d-block">
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
                <br />

                <div className="btn-group btn-group-sm" role="group">
                  {/* Start Project button visible only to assigned user and if not already in Progress */}
                  {file.assignedTo === userId && file.status === "Assigned" && (
                    <button
                      className={`btn ${
                        activeFile?.id === file.id
                          ? "btn-success"
                          : "btn-outline-success"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartProject(file.id);
                      }}
                      title="Start Editing file"
                      aria-label={`Start file for ${file.fileName}`}
                    >
                      <i className="bi bi-play-circle"></i>Start Editing
                    </button>
                  )}

                  {/* Owner buttons */}
                  {isOwner && file.status !== "Progress" && (
                    <>
                      <button
                        className="btn btn-outline-info"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignFile(file.id);
                        }}
                        title="Assign"
                        aria-label={`Assign ${file.fileName}`}
                      >
                        <i className="bi bi-person-plus"></i>
                      </button>
                      <button
                        className="btn btn-outline-warning"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnassignFile(file.id, file.status);
                        }}
                        title="Unassign"
                        aria-label={`Unassign ${file.fileName}`}
                        disabled={file.status === "Progress"}
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
                        aria-label={`Rename ${file.fileName}`}
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
                        aria-label={`Delete ${file.fileName}`}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {error && (
          <div
            className="alert alert-danger small mt-3 mb-0 text-center"
            role="alert"
          >
            {error}
          </div>
        )}

        {isOwner && (
          <div className="text-muted small mt-3 d-flex align-items-center gap-1 justify-content-center">
            <i className="bi bi-info-circle"></i>
            Owner controls enabled
          </div>
        )}
      </div>

      {/* Modal for Assign File (unchanged) */}
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
                              } catch (err) {
                                setError(
                                  err.response?.data?.message ||
                                    "Failed to assign"
                                );
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

// import React, { useState, useEffect } from "react";
// import fileService from "../../services/api/fileService";
// import * as signalR from "@microsoft/signalr";

// const ProjectFilesSection = ({
//   project,
//   activeFile,
//   onFileSelect,
//   onProjectUpdate,
//   isOwner,
// }) => {
//   const [creating, setCreating] = useState(false);
//   const [fileName, setFileName] = useState("");
//   const [error, setError] = useState(null);
//   const [showCreateForm, setShowCreateForm] = useState(false);
//   const [isShowAssign, setIsShowAssign] = useState(false);
//   const [activeAssignFileId, setActiveAssignFileId] = useState(null);

//   // Notification States (unchanged)
//   const [notifications, setNotifications] = useState([]);
//   const [showNotifications, setShowNotifications] = useState(false);

//   // Setup SignalR Connection (unchanged)
//   useEffect(() => {
//     const hub = new signalR.HubConnectionBuilder()
//       .withUrl(`${import.meta.env.VITE_API_BASE_URL}/hubs/notification`, {
//         accessTokenFactory: () => localStorage.getItem("token"),
//       })
//       .withAutomaticReconnect()
//       .configureLogging(signalR.LogLevel.Information)
//       .build();

//     hub.on("ReceiveNotification", (notification) => {
      
//       onProjectUpdate();
//       setNotifications((prev) => [
//         ...prev,
//         {
//           title: notification.title,
//           message: notification.message,
//           time: new Date(notification.time).toLocaleString(),
//         },
//       ]);
//       setTimeout(()=>{}, 2000);
//     });

//     const start = async () => {
//       try {
//         await hub.start();
//         console.log(" NotificationHub Connected");
//         await hub.invoke("JoinProjectGroup",project.id.toString());
//         console.log(` from file noti joined project ${project.id}`);
        
//       } catch (err) {
//         console.error(" NotificationHub connection error:", err);
//       }
//     };

//     start();

//     return () => {
//       hub.stop();
//     };
//   }, []);

//   const userId = (() => {
//     try {
//       return JSON.parse(localStorage.getItem("user"))?.id || null;
//     } catch {
//       return null;
//     }
//   })();
//   console.log("from file " + userId);

//   const handleCreateFile = async (e) => {
//     e.preventDefault();
//     if (!isOwner) {
//       setError("Only project owners can create files");
//       return;
//     }
//     setError(null);
//     setCreating(true);
//     try {
//       await fileService.createFile({ fileName, projectId: project.id });
//       setFileName("");
//       setShowCreateForm(false);
//       onProjectUpdate();
//     } catch (err) {
//       setError(err.message || "Failed to create file");
//     } finally {
//       setCreating(false);
//     }
//   };

//   const handleDeleteFile = async (fileId) => {
//     if (!isOwner) {
//       setError("Only project owners can delete files");
//       return;
//     }
//     if (!window.confirm("Are you sure you want to delete this file?")) return;
//     try {
//       await fileService.deleteFile(fileId);
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to delete file");
//     }
//   };

//   const handleAssignFile = (fileId) => {
//     if (!isOwner) {
//       setError("Only project owners can assign files");
//       return;
//     }
//     setActiveAssignFileId(fileId);
//     setIsShowAssign(true);
//   };

//   const handleUnassignFile = async (fileId, fileStatus) => {
//     if (!isOwner) {
//       setError("Only project owners can unassign files");
//       return;
//     }
//     if (fileStatus === "Progress") {
//       setError("Cannot unassign a file in Progress status");
//       return;
//     }
//     if (!window.confirm("Are you sure you want to unassign this file?")) return;
//     try {
//       await fileService.unassign(fileId);
//       onProjectUpdate();
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to unassign file");
//     }
//   };

//   const handleRenameFile = async (fileId, currentName) => {
//     if (!isOwner) {
//       setError("Only project owners can rename files");
//       return;
//     }
//     const newName = window.prompt("Enter new file name:", currentName);
//     if (!newName || newName.trim() === "") return;
//     try {
//       await fileService.updateFile({
//         id: fileId,
//         fileName: newName.trim(),
//         content: project.files.find((f) => f.id === fileId)?.content || "",
//         projectId: project.id,
//       });
//       onProjectUpdate();
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to rename file");
//     }
//   };

//   const handleStartProject = async (fileId) => {
//     try {
//       await fileService.startEdit(fileId);
//       onProjectUpdate();
//     } catch (err) {
//       setError(err.response?.data?.message || "Failed to start project");
//     }
//   };


//   console.log("from file notify"+notifications);
  
//   return (
//     <div className="card h-100 d-flex flex-column position-relative">
//       {/* Notification Button */}
//       <button
//         className="btn btn-outline-info position top-0 end-0 m-2"
//         style={{ zIndex: 10 }}
//         onClick={() => setShowNotifications(true)}
//       >
//         🔔 Notifications ({notifications.length})
//       </button>

//       <div className="card-header d-flex  justify-content-between align-items-center">
//         <h6 className="mb-0">
//           <i className="bi bi-files me-1"></i>Files
//           <span className="badge bg-primary ms-2">
//             {project.files?.length || 0}
//           </span>
//         </h6>
//         {isOwner && (
//           <button
//             className="btn btn-sm btn-outline-primary"
//             onClick={() => setShowCreateForm(!showCreateForm)}
//             title="Create new file"
//           >
//             <i className="bi bi-plus fs-5"></i>
//           </button>
//         )}
//       </div>

//       <div
//         className="card-body d-flex flex-column p-3 flex-grow-1 overflow-auto"
//         style={{ maxHeight: "400px" }}
//       >
//         {isOwner && showCreateForm && (
//           <div className="mb-3">
//             <form onSubmit={handleCreateFile} className="d-flex gap-2">
//               <input
//                 className="form-control form-control-sm flex-grow-1"
//                 placeholder="File name"
//                 value={fileName}
//                 onChange={(e) => setFileName(e.target.value)}
//                 required
//                 autoFocus
//               />
//               <button
//                 className="btn btn-sm btn-success"
//                 type="submit"
//                 disabled={creating}
//                 style={{ minWidth: "10px" }}
//               >
//                 {creating ? (
//                   <span className="spinner-border spinner-border-sm"></span>
//                 ) : (
//                   <i className="bi bi-check"></i>
//                 )}
//               </button>
//             </form>
//           </div>
//         )}

//         {project.files?.length === 0 ? (
//           <div className="text-center text-muted py-5">
//             <i className="bi bi-file-earmark fs-3 mb-2"></i>
//             <p className="mb-0 small">No files yet</p>
//           </div>
//         ) : (
//           <div className="list-group list-group-flush">
//             {project.files.map((file) => (
//               <div
//                 key={file.id}
//                 className={`list-group-item list-group-item-action d-flex flex-column justify-content-between align-items-center px-3 py-2 ${
//                   activeFile?.id === file.id ? "active" : ""
//                 }`}
//                 style={{
//                   cursor: "pointer",
//                   borderRadius: "6px",
//                   margin: "4px 8px",
//                 }}
//                 onClick={() => onFileSelect(file)}
//               >
//                 <div className="flex-grow-1 me-3 ">
//                   <div
//                     className="fw-semibold small text-truncate"
//                     title={file.fileName}
//                   >
//                     {file.fileName}
//                   </div>
//                   <small className="text-muted d-block">
//                     {(() => {
//                       const assignedUser = project.members.find(
//                         (m) => m.id === file.assignedTo
//                       );
//                       if (assignedUser && assignedUser.id !== project.ownerId)
//                         return `Assigned to ${assignedUser.userName}`;
//                       if (file.assignedTo === project.ownerId) return "Owner";
//                       return "Unassigned";
//                     })()}
//                   </small>
//                   <small className="text-muted d-block">{file.status}</small>
//                 </div>
//                 <br/>

//                 <div className="btn-group btn-group-sm" role="group">
//                   {/* Start Project button visible only to assigned user and if not already in Progress */}
//                   {file.assignedTo === userId && file.status === "Assigned" && (
//                     <button
//                       className={`btn ${
//                         activeFile?.id === file.id
//                           ? "btn-success"
//                           : "btn-outline-success"
//                       }`}
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         handleStartProject(file.id);
//                       }}
//                       title="Start Editing file"
//                       aria-label={`Start file for ${file.fileName}`}
//                     >
//                       <i className="bi bi-play-circle"></i>Start Editing
//                     </button>
                    
//                   )}

//                   {/* Owner buttons */}
//                   {isOwner && file.status!=="Progress" && (
                    
//                     <>
//                       <button
//                         className="btn btn-outline-info"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleAssignFile(file.id);
//                         }}
//                         title="Assign"
//                         aria-label={`Assign ${file.fileName}`}
//                       >
//                         <i className="bi bi-person-plus"></i>
//                       </button>
//                       <button
//                         className="btn btn-outline-warning"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleUnassignFile(file.id, file.status);
//                         }}
//                         title="Unassign"
//                         aria-label={`Unassign ${file.fileName}`}
//                         disabled={file.status === "Progress"}
//                       >
//                         <i className="bi bi-person-dash"></i>
//                       </button>
//                       <button
//                         className="btn btn-outline-info"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleRenameFile(file.id, file.fileName);
//                         }}
//                         title="Rename"
//                         aria-label={`Rename ${file.fileName}`}
//                       >
//                         <i className="bi bi-pencil"></i>
//                       </button>
//                       <button
//                         className="btn btn-outline-danger"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           handleDeleteFile(file.id);
//                         }}
//                         title="Delete"
//                         aria-label={`Delete ${file.fileName}`}
//                       >
//                         <i className="bi bi-trash"></i>
//                       </button>
//                     </>
//                   )}
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}

//         {error && (
//           <div
//             className="alert alert-danger small mt-3 mb-0 text-center"
//             role="alert"
//           >
//             {error}
//           </div>
//         )}

//         {isOwner && (
//           <div className="text-muted small mt-3 d-flex align-items-center gap-1 justify-content-center">
//             <i className="bi bi-info-circle"></i>
//             Owner controls enabled
//           </div>
//         )}
//       </div>

//       {/* Notifications Modal (unchanged) */}
//       {showNotifications && (
//         <>
//           <div
//             className="modal-backdrop fade show"
//             style={{ zIndex: 1040 }}
//             onClick={() => setShowNotifications(false)}
//           ></div>
//           <div
//             className="modal fade show d-block"
//             style={{ zIndex: 1050 }}
//             tabIndex="-1"
//           >
//             <div className="modal-dialog modal-dialog-centered modal-lg">
//               <div className="modal-content">
//                 <div className="modal-header bg-info text-white">
//                   <h5 className="modal-title">Notifications</h5>
//                   <button
//                     type="button"
//                     className="btn-close btn-close-white"
//                     onClick={() => setShowNotifications(false)}
//                   ></button>
//                 </div>
//                 <div className="modal-body">
//                   {notifications.length === 0 ? (
//                     <p className="text-center text-muted">
//                       No notifications yet.
//                     </p>
//                   ) : (
//                     <ul className="list-group">
//                       {notifications
//                         .slice()
//                         .reverse()
//                         .map((n, i) => (
//                           <li
//                             key={i}
//                             className="list-group-item d-flex justify-content-between align-items-start"
//                           >
//                             <div>
//                               <strong>{n.title}</strong>
//                               <p className="mb-1 small">{n.message}</p>
//                               <small className="text-muted">{n.time}</small>
//                             </div>
//                           </li>
//                         ))}
//                     </ul>
//                   )}
//                 </div>
//                 <div className="modal-footer">
//                   <button
//                     className="btn btn-secondary"
//                     onClick={() => setShowNotifications(false)}
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Modal for Assign File (unchanged) */}
//       {isShowAssign && (
//         <>
//           <div
//             className="modal-backdrop fade show"
//             style={{ zIndex: 1040 }}
//             onClick={() => setIsShowAssign(false)}
//           ></div>
//           <div
//             className="modal fade show d-block"
//             style={{ zIndex: 1050 }}
//             tabIndex="-1"
//           >
//             <div className="modal-dialog modal-dialog-centered">
//               <div className="modal-content">
//                 <div className="modal-header bg-primary text-white">
//                   <h5 className="modal-title">Assign File</h5>
//                   <button
//                     type="button"
//                     className="btn-close btn-close-white"
//                     onClick={() => setIsShowAssign(false)}
//                   ></button>
//                 </div>
//                 <div className="modal-body p-0">
//                   <ul className="list-group list-group-flush">
//                     {project.members?.length > 0 ? (
//                       project.members.map((member) => (
//                         <li
//                           key={member.id}
//                           className="list-group-item d-flex justify-content-between align-items-center"
//                         >
//                           <span>
//                             <i className="bi bi-person me-2"></i>
//                             {member.userName}
//                           </span>
//                           <button
//                             className="btn btn-sm btn-success"
//                             onClick={async (e) => {
//                               e.stopPropagation();
//                               try {
//                                 await fileService.assign({
//                                   fileId: activeAssignFileId,
//                                   targetUserId: member.id,
//                                 });
//                                 onProjectUpdate();
//                               } catch (err) {
//                                 setError(
//                                   err.response?.data?.message ||
//                                     "Failed to assign"
//                                 );
//                               } finally {
//                                 setIsShowAssign(false);
//                                 setActiveAssignFileId(null);
//                               }
//                             }}
//                           >
//                             Assign
//                           </button>
//                         </li>
//                       ))
//                     ) : (
//                       <li className="list-group-item text-center text-muted">
//                         No members
//                       </li>
//                     )}
//                   </ul>
//                 </div>
//                 <div className="modal-footer">
//                   <button
//                     className="btn btn-secondary"
//                     onClick={() => setIsShowAssign(false)}
//                   >
//                     Close
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default ProjectFilesSection;
