import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ProjectFilesSection from "../components/project/ProjectFilesSection";
import ProjectEditorSection from "../components/project/ProjectEditorSection";
import ProjectMembersSection from "../components/project/ProjectMembersSection";
import projectService from "../services/api/projectService";
import { getCurrentUser } from "../utils/authUtils";
import ProjectChatSection from "../components/project/ProjectChatSection";

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
            <ProjectChatSection
              projectId={project.id}
              currentUserId={user?.id}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectPage;
