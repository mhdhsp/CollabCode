import React, { useEffect, useState } from 'react';
import ProjectPanel from '../components/dashboard/ProjectPanel';
import FilesPanel from '../components/dashboard/FilesPanel';
import EditorPanel from '../components/dashboard/EditorPanel';
import MembersPanel from '../components/dashboard/MembersPanel';
import projectService from '../services/api/projectService';
import userService from '../services/api/userService';
import { getCurrentUser } from '../utils/authUtils';  // Changed import

const Dashboard = () => {
  const [userProjects, setUserProjects] = useState(null);
  const [activeProject, setActiveProject] = useState(null); 
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [error, setError] = useState(null);

  const user = getCurrentUser();  // Use util
  console.log("from dash "+user);
  
  const userId = user?.id ?? null;
  console.log("from dash"+userId);
  console.log("Dashboard component rendered");

  useEffect(() => {
    console.log("useEffect - fetchUserProjects called");
    fetchUserProjects();
  }, []);

  const fetchUserProjects = async () => {
    console.log("fetchUserProjects started");
    try {
      setLoadingProjects(true);
      const res = await userService.getUserRooms();
      console.log("fetchUserProjects success", res);
      setUserProjects(res);
    } catch (err) {
      console.log("fetchUserProjects failed", err);
      setError(err.message || 'Failed to load projects');
    } finally {
      console.log("fetchUserProjects finally");
      setLoadingProjects(false);
    }
  };

  const enterProject = async (projectId) => {
    console.log("enterProject called with", projectId);
    try {
      const res = await projectService.enterProject(projectId);
      console.log("enterProject success", res);
      setActiveProject({ ...res, id: projectId });
    } catch (err) {
      console.log("enterProject failed", err);
      setError(err.message || 'Failed to open project');
    }
  };

  const onProjectsChanged = () => {
    console.log("onProjectsChanged called");
    fetchUserProjects();
  };

  console.log("Rendering Dashboard UI", { userProjects, activeProject, loadingProjects });

  return (
    <div className="container-fluid py-4">
      <div className="row g-3">
        <div className="col-12">
          <h3>Dashboard</h3>
        </div>

        <div className="col-lg-3 col-md-12">
          <ProjectPanel
            projects={userProjects}
            loading={loadingProjects}
            onEnter={enterProject}
            onProjectsChanged={onProjectsChanged}
            activeProjectId={activeProject?.id}
          />
        </div>

        <div className="col-lg-2 col-md-12">
          <FilesPanel
            project={activeProject}
            onFileOpen={(file) => { console.log("onFileOpen called", file); }}
            onProjectChanged={() => { console.log("FilesPanel onProjectChanged"); enterProject(activeProject?.id); }}
          />
        </div>

        <div className="col-lg-4 col-md-12">
          <EditorPanel
            project={activeProject}
            onProjectUpdated={() => { console.log("EditorPanel onProjectUpdated"); enterProject(activeProject?.id); }}
          />
        </div>

        <div className="col-lg-3 col-md-12">
          <MembersPanel
            project={activeProject}
            onProjectChanged={() => { console.log("MembersPanel onProjectChanged"); enterProject(activeProject?.id); }}
          />
        </div>
      </div>
      {error && <div className="mt-3 alert alert-danger">{error}</div>}
    </div>
  );
};

export default Dashboard;
