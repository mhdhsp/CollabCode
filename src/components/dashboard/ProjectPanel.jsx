import React, { useState } from 'react';
import ProjectCreateModal from './ProjectCreateModal';
import ProjectJoinModal from './ProjectJoinModal';
import projectService from '../../services/api/projectService';
import userService from '../../services/api/userService';

const ProjectPanel = ({ projects, loading, onEnter, onProjectsChanged, activeProjectId }) => {
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);

  console.log('ProjectPanel rendered', { projects, loading, activeProjectId });

  const handleEnter = (projectId) => {
    console.log('Entering project', projectId);
    onEnter(projectId);
  };

  return (
    <div className="card h-100">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <h5 className="card-title mb-0">Projects</h5>
          <div>
            <button className="btn btn-sm btn-outline-primary me-1" onClick={() => { console.log('Open create modal'); setShowCreate(true); }}>New</button>
            <button className="btn btn-sm btn-outline-secondary" onClick={() => { console.log('Open join modal'); setShowJoin(true); }}>Join</button>
          </div>
        </div>

        {loading && <div>Loading...</div>}

        {!loading && !projects && <div>No projects found</div>}

        {!loading && projects && (
          <>
            <div className="mt-3">
              <strong>Owned</strong>
              <ul className="list-group list-group-flush my-2">
                {projects.ownedRooms.length === 0 && <li className="list-group-item">No owned projects</li>}
                {projects.ownedRooms.map((p) => (
                  <li
                    key={p.id}
                    className={`list-group-item d-flex justify-content-between align-items-center ${activeProjectId === p.id ? 'active' : ''}`}
                  >
                    <div style={{cursor: 'pointer'}} onClick={() => handleEnter(p.id)}>
                      <div>{p.projectName || 'Untitled'}</div>
                      <small className="text-muted">Join code: {p.joinCode}</small>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-light" onClick={() => handleEnter(p.id)}>Open</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-2">
              <strong>Joined</strong>
              <ul className="list-group list-group-flush my-2">
                {projects.joinedRooms.length === 0 && <li className="list-group-item">No joins</li>}
                {projects.joinedRooms.map((p) => (
                  <li key={p.id} className={`list-group-item d-flex justify-content-between align-items-center ${activeProjectId === p.id ? 'active' : ''}`}>
                    <div style={{cursor: 'pointer'}} onClick={() => handleEnter(p.id)}>
                      <div>{p.projectName || 'Untitled'}</div>
                    </div>
                    <div>
                      <button className="btn btn-sm btn-light" onClick={() => handleEnter(p.id)}>Open</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        <div className="mt-auto text-muted small">
          Projects update automatically when you create or join.
        </div>
      </div>

      <ProjectCreateModal show={showCreate} onClose={() => { console.log('Closing create modal'); setShowCreate(false); onProjectsChanged(); }} />
      <ProjectJoinModal show={showJoin} onClose={() => { console.log('Closing join modal'); setShowJoin(false); onProjectsChanged(); }} />
    </div>
  );
};

export default ProjectPanel;
