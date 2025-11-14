import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import * as signalR from "@microsoft/signalr";
import ProjectFilesSection from "../components/project/ProjectFilesSection";
import ProjectEditorSection from "../components/project/ProjectEditorSection";
import ProjectMembersSection from "../components/project/ProjectMembersSection";
import ProjectChatSection from "../components/project/ProjectChatSection";
import projectService from "../services/api/projectService";
import { getCurrentUser } from "../utils/authUtils";

const ProjectPage = () => {
  console.log("ProjectPage component rendered");
  const { projectId } = useParams();
  const navigate = useNavigate();
  const user = getCurrentUser();
  console.log("Current user:", user);

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFile, setActiveFile] = useState(null);

  // Notification state moved here
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  // SignalR connection for notifications
  useEffect(() => {
    if (!projectId) return;

    const hub = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_API_BASE_URL}/hubs/notification`, {
        accessTokenFactory: () => localStorage.getItem("token"),
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    hub.on("ReceiveNotification", (notification) => {
      setNotifications((prev) => [
        ...prev,
        {
          title: notification.title,
          message: notification.message,
          time: new Date(notification.time).toLocaleString(),
        },
      ]);
      fetchProject();
    });

    const start = async () => {
      try {
        await hub.start();
        console.log("NotificationHub Connected");
        await hub.invoke("JoinProjectGroup", projectId.toString());
        console.log(`Joined project group ${projectId}`);
      } catch (err) {
        console.error("NotificationHub connection error:", err);
      }
    };

    start();

    return () => {
      hub.stop();
    };
  }, [projectId]);

  useEffect(() => {
    console.log("useEffect triggered with projectId:", projectId);
    if (projectId) {
      fetchProject();
    }
  }, [projectId]);

  const fetchProject = async (retainActiveFile = false) => {
    try {
      setLoading(true);
      const res = await projectService.enterProject(projectId);
      setProject({ ...res, id: projectId });

      if (retainActiveFile && activeFile) {
        const updatedFile = res.files.find((f) => f.id === activeFile.id);
        if (updatedFile) {
          setActiveFile(updatedFile);
          return;
        }
      }

      if (res.files?.length > 0) {
        setActiveFile(res.files[0]);
      }
    } catch (err) {
      setError(err.message || "Failed to load project");
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (file) => {
    console.log("File selected:", file);
    setActiveFile(file);
  };

  const handleProjectUpdate = () => {
    console.log("project update");
    fetchProject(true);
  };

  const handleBackToProjects = () => {
    console.log("Navigating back to project listing");
    navigate("/projects");
  };

  if (loading) {
    console.log("Loading project...");
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.log("Rendering error message:", error);
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger">
          <h4>Error Loading Project</h4>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={handleBackToProjects}>
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    console.log("Project not found or unauthorized access");
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <h4>Project Not Found</h4>
          <p>
            The project you're looking for doesn't exist or you don't have
            access to it.
          </p>
          <button className="btn btn-primary" onClick={handleBackToProjects}>
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const isOwner = project.ownerId === user?.id;
  console.log("Rendering project:", project);
  console.log("Is user owner:", isOwner);

  return (
    <div className="container-fluid py-3 px-2 px-md-4">
      {/* Header */}
      <div className="row align-items-center mb-3">
        <div className="col-12 text-center text-md-start">
          <h4 className="mb-0">{project.projectName || "Untitled Project"}</h4>
          <small className="text-muted">
            {isOwner ? "Owner" : "Member"} • {project.members?.length || 0} members
          </small>
        </div>
      </div>

      {/* Layout */}
      <div className="row g-3">
        {/* Files Section */}
        <div className="col-12 col-lg-2 order-2 order-lg-1">
          <div className="h-100">
            <ProjectFilesSection
              project={project}
              activeFile={activeFile}
              onFileSelect={handleFileSelect}
              onProjectUpdate={handleProjectUpdate}
              isOwner={isOwner}
              notifications={notifications}
              showNotifications={showNotifications}
              setShowNotifications={setShowNotifications}
            />
          </div>
        </div>

        {/* Editor Section */}
        <div className="col-12 col-lg-7 order-1 order-lg-2">
          <div className="h-100">
            <ProjectEditorSection
              project={project}
              activeFile={activeFile}
              onProjectUpdate={handleProjectUpdate}
              currentUserId={user?.id}
            />
          </div>
        </div>

        {/* Members + Chat Section */}
        <div className="col-12 col-lg-3 order-3">
          <div className="d-flex flex-column gap-3 h-100">
            <ProjectMembersSection
              project={project}
              onProjectUpdate={handleProjectUpdate}
              isOwner={isOwner}
            />
            <ProjectChatSection projectId={project.id} currentUserId={user?.id} />
          </div>
        </div>
      </div>

      {/* Notifications Modal moved here */}
      {showNotifications && (
        <>
          <div
            className="modal-backdrop fade show"
            style={{ zIndex: 1040 }}
            onClick={() => setShowNotifications(false)}
          ></div>
          <div
            className="modal fade show d-block"
            style={{ zIndex: 1050 }}
            tabIndex="-1"
          >
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-info text-white">
                  <h5 className="modal-title">Notifications</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowNotifications(false)}
                  ></button>
                </div>
                <div className="modal-body">
                  {notifications.length === 0 ? (
                    <p className="text-center text-muted">No notifications yet.</p>
                  ) : (
                    <ul className="list-group">
                      {[...notifications]
                        .reverse()
                        .map((n, i) => (
                          <li
                            key={i}
                            className="list-group-item d-flex justify-content-between align-items-start"
                          >
                            <div>
                              <strong>{n.title}</strong>
                              <p className="mb-1 small">{n.message}</p>
                              <small className="text-muted">{n.time}</small>
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}
                </div>
                <div className="modal-footer">
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowNotifications(false)}
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

export default ProjectPage;

// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import ProjectFilesSection from "../components/project/ProjectFilesSection";
// import ProjectEditorSection from "../components/project/ProjectEditorSection";
// import ProjectMembersSection from "../components/project/ProjectMembersSection";
// import projectService from "../services/api/projectService";
// import { getCurrentUser } from "../utils/authUtils";
// import ProjectChatSection from "../components/project/ProjectChatSection";

// const ProjectPage = () => {
//   console.log("ProjectPage component rendered");
//   const { projectId } = useParams();
//   const navigate = useNavigate();
//   const user = getCurrentUser();
//   console.log("Current user:", user);
//   const [project, setProject] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [activeFile, setActiveFile] = useState(null);

//   useEffect(() => {
//     console.log("useEffect triggered with projectId:", projectId);
//     if (projectId) {
//       fetchProject();
//     }
//   }, [projectId]);

//   const fetchProject = async (retainActiveFile = false) => {
//     try {
//       setLoading(true);
//       const res = await projectService.enterProject(projectId);
//       setProject({ ...res, id: projectId });

//       if (retainActiveFile && activeFile) {
//         const updatedFile = res.files.find((f) => f.id === activeFile.id);
//         if (updatedFile) {
//           setActiveFile(updatedFile);
//           return;
//         }
//       }

//       if (res.files?.length > 0) {
//         setActiveFile(res.files[0]);
//       }
//     } catch (err) {
//       setError(err.message || "Failed to load project");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleFileSelect = (file) => {
//     console.log("File selected:", file);
//     setActiveFile(file);
//   };

//   const handleProjectUpdate = () => {
//     console.log("project update");
//     fetchProject(true);
//   };

//   const handleBackToProjects = () => {
//     console.log("Navigating back to project listing");
//     navigate("/projects");
//   };

//   if (loading) {
//     console.log("Loading project...");
//     return (
//       <div className="container-fluid py-4">
//         <div className="text-center">
//           <div className="spinner-border" role="status">
//             <span className="visually-hidden">Loading...</span>
//           </div>
//           <p className="mt-2">Loading project...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     console.log("Rendering error message:", error);
//     return (
//       <div className="container-fluid py-4">
//         <div className="alert alert-danger">
//           <h4>Error Loading Project</h4>
//           <p>{error}</p>
//           <button className="btn btn-primary" onClick={handleBackToProjects}>
//             Back to Projects
//           </button>
//         </div>
//       </div>
//     );
//   }

//   if (!project) {
//     console.log("Project not found or unauthorized access");
//     return (
//       <div className="container-fluid py-4">
//         <div className="alert alert-warning">
//           <h4>Project Not Found</h4>
//           <p>
//             The project you're looking for doesn't exist or you don't have
//             access to it.
//           </p>
//           <button className="btn btn-primary" onClick={handleBackToProjects}>
//             Back to Projects
//           </button>
//         </div>
//       </div>
//     );
//   }

//   const isOwner = project.ownerId === user?.id;
//   console.log("Rendering project:", project);
//   console.log("Is user owner:", isOwner);

//   return (
//     <div className="container-fluid py-3 px-2 px-md-4">
//       {/* Header */}
//       <div className="row align-items-center mb-3">
//         <div className="col-12 text-center text-md-start">
//           <h4 className="mb-0">{project.projectName || "Untitled Project"}</h4>
//           <small className="text-muted">
//             {isOwner ? "Owner" : "Member"} • {project.members?.length || 0} members
//           </small>
//         </div>
//       </div>

//       {/* Layout */}
//       <div className="row g-3">
//         {/* Files Section */}
//         <div className="col-12 col-lg-2 order-2 order-lg-1">
//           <div className="h-100">
//             <ProjectFilesSection
//               project={project}
//               activeFile={activeFile}
//               onFileSelect={handleFileSelect}
//               onProjectUpdate={handleProjectUpdate}
//               isOwner={isOwner}
//             />
//           </div>
//         </div>

//         {/* Editor Section */}
//         <div className="col-12 col-lg-7 order-1 order-lg-2">
//           <div className="h-100">
//             <ProjectEditorSection
//               project={project}
//               activeFile={activeFile}
//               onProjectUpdate={handleProjectUpdate}
//               currentUserId={user?.id}
//             />
//           </div>
//         </div>

//         {/* Members + Chat Section */}
//         <div className="col-12 col-lg-3 order-3">
//           <div className="d-flex flex-column gap-3 h-100">
//             <ProjectMembersSection
//               project={project}
//               onProjectUpdate={handleProjectUpdate}
//               isOwner={isOwner}
//             />
//             <ProjectChatSection
//               projectId={project.id}
//               currentUserId={user?.id}
//             />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProjectPage;
