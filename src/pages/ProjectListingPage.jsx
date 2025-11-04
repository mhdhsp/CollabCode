import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ProjectCreateModal from '../components/dashboard/ProjectCreateModal';
import ProjectJoinModal from '../components/dashboard/ProjectJoinModal';
import userService from '../services/api/userService';
import projectService from '../services/api/projectService';

const ProjectListingPage = () => {
  console.log("ProjectListingPage component rendered");
  const [projects, setProjects] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log("useEffect triggered");
    console.log("Token:", localStorage.getItem("token"));
    fetchUserProjects();
  }, []);

  const fetchUserProjects = async () => {
    console.log("Fetching user projects...");
    try {
      setLoading(true);
      const res = await userService.getUserProjects();
      console.log("Projects fetched successfully:", res);
      setProjects(res);
    } catch (err) {
      console.log("Error fetching projects:", err);
      setError(err.message || 'Failed to load projects');
    } finally {
      console.log("Fetch user projects completed");
      setLoading(false);
    }
  };


  const handleProjectSelect = (projectId) => {
    console.log("Project selected:", projectId);
    navigate(`/project/${projectId}`);
  };

  const handleLeaveProject = async (projectId) => {
    console.log("Attempting to leave project:", projectId);
    if (!window.confirm('Are you sure you want to leave this project?')) {
      console.log("Leave project canceled by user");
      return;
    }
    try {
      await projectService.leaveProject(projectId);
      console.log("Left project successfully");
      fetchUserProjects();
    } catch (err) {
      console.log("Error leaving project:", err);
      setError(err.response.data.message || 'Failed to leave project');
    }
  };

  const handleDestroyProject = async (projectId) => {
    console.log("Attempting to delete project:", projectId);
    if (!window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      console.log("Delete project canceled by user");
      return;
    }
    try {
      await projectService.destroyProject(projectId);
      console.log("Deleted project successfully");
      fetchUserProjects();
    } catch (err) {
      console.log("Error deleting project:", err);
      setError(err.message || 'Failed to delete project');
    }
  };

  if (loading) {
    console.log("Loading projects...");
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading your projects...</p>
        </div>
      </div>
    );
  }

  console.log("Rendering project list");
  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>My Projects</h2>
            <div>
              <button className="btn btn-primary me-2" onClick={() => { console.log("Opening create modal"); setShowCreate(true); }}>
                <i className="bi bi-plus-circle"></i> Create Project
              </button>
              <button className="btn btn-outline-secondary" onClick={() => { console.log("Opening join modal"); setShowJoin(true); }}>
                <i className="bi bi-people"></i> Join Project
              </button>
            </div>
          </div>

          {error && <div className="alert alert-danger">{error}</div>}

          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-person-badge"></i> Owned Projects
                    <span className="badge bg-primary ms-2">{projects?.ownedRooms?.length || 0}</span>
                  </h5>
                </div>
                <div className="card-body">
                  {projects?.ownedRooms?.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      <i className="bi bi-folder-x fs-1"></i>
                      <p className="mt-2">No owned projects yet</p>
                      <button className="btn btn-primary" onClick={() => { console.log("Creating first project"); setShowCreate(true); }}>
                        Create Your First Project
                      </button>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {projects?.ownedRooms?.map((project) => (
                        <div key={project.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="flex-grow-1">
                              <h6 className="mb-1">{project.projectName || 'Untitled Project'}</h6>
                              <small className="text-muted">Join Code: {project.joinCode}</small>
                            </div>
                            <div className="btn-group" role="group">
                              <button 
                                className="btn btn-sm btn-primary"
                                onClick={() => handleProjectSelect(project.id)}
                              >
                                Open
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDestroyProject(project.id)}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="col-md-6 mb-4">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-people"></i> Joined Projects
                    <span className="badge bg-success ms-2">{projects?.joinedRooms?.length || 0}</span>
                  </h5>
                </div>
                <div className="card-body">
                  {projects?.joinedRooms?.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      <i className="bi bi-person-plus fs-1"></i>
                      <p className="mt-2">No joined projects yet</p>
                      <button className="btn btn-outline-secondary" onClick={() => { console.log("Joining a project"); setShowJoin(true); }}>
                        Join a Project
                      </button>
                    </div>
                  ) : (
                    <div className="list-group list-group-flush">
                      {projects?.joinedRooms?.map((project) => (
                        <div key={project.id} className="list-group-item">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="flex-grow-1">
                              <h6 className="mb-1">{project.projectName || 'Untitled Project'}</h6>
                              <small className="text-muted">Member</small>
                            </div>
                            <div className="btn-group" role="group">
                              <button 
                                className="btn btn-sm btn-primary"
                                onClick={() => handleProjectSelect(project.id)}
                              >
                                Open
                              </button>
                              <button 
                                className="btn btn-sm btn-outline-warning"
                                onClick={() => handleLeaveProject(project.id)}
                              >
                                Leave
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProjectCreateModal 
        show={showCreate} 
        onClose={() => { 
          console.log("Closing create modal and refreshing projects");
          setShowCreate(false); 
          fetchUserProjects(); 
        }} 
      />
      <ProjectJoinModal 
        show={showJoin} 
        onClose={() => { 
          console.log("Closing join modal and refreshing projects");
          setShowJoin(false); 
          fetchUserProjects();
        }} 
      />
    </div>
  );
};

export default ProjectListingPage;
