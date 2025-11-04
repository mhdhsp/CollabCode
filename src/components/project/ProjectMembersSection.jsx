import React, { useState } from 'react';
import projectService from '../../services/api/projectService';

const ProjectMembersSection = ({ project, onProjectUpdate, isOwner }) => {
  const [error, setError] = useState(null);
  const [showJoinCode, setShowJoinCode] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [password, setPassword] = useState('');

  const handleRemoveMember = async (memberId) => {
    if (!isOwner) return setError('Only owners can remove members');
    if (!window.confirm('Remove this member?')) return;
    try {
      await projectService.removeMember(project.id, memberId);
      onProjectUpdate();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const handleLeaveProject = async () => {
    if (isOwner) return setError('Owner cannot leave');
    if (!window.confirm('Leave project?')) return;
    try {
      await projectService.leaveProject(project.id);
      window.location.href = '/projects';
    } catch (err) {
      setError(err.response?.data?.message || 'Failed');
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!isOwner) return setError('Only owners can add');
    try {
      await projectService.joinProject({ joinCode, passWord: password });
      setJoinCode(''); setPassword(''); setShowAddMember(false);
      onProjectUpdate();
    } catch (err) {
      setError(err.message || 'Failed');
    }
  };

  const copyJoinCode = () => {
    navigator.clipboard.writeText(project.joinCode);
    setShowJoinCode(true);
    setTimeout(() => setShowJoinCode(false), 2000);
  };

  return (
    <div className="card mb-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0">
          <i className="bi bi-people"></i> Members
          <span className="badge bg-primary ms-1">{project.members?.length || 0}</span>
        </h6>
        {isOwner && (
          <button className="btn btn-sm btn-outline-primary" onClick={() => setShowAddMember(!showAddMember)}>
            <i className="bi bi-person-plus"></i>
          </button>
        )}
      </div>
      <div className="card-body p-2">
        {isOwner && (
          <div className="mb-2">
            <label className="form-label small">Join Code</label>
            <div className="input-group input-group-sm">
              <input type="text" className="form-control" value={project.joinCode || ''} readOnly />
              <button className="btn btn-outline-secondary" onClick={copyJoinCode}>
                <i className="bi bi-copy"></i>
              </button>
            </div>
            {showJoinCode && <small className="text-success">Copied!</small>}
          </div>
        )}

        {isOwner && showAddMember && (
          <form onSubmit={handleAddMember} className="mb-2">
            <input className="form-control form-control-sm mb-1" placeholder="Join code" value={joinCode} onChange={e => setJoinCode(e.target.value)} required />
            <input type="password" className="form-control form-control-sm mb-1" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} />
            <div className="d-flex gap-1">
              <button className="btn btn-sm btn-outline-success flex-grow-1" type="submit">Add</button>
              <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => { setShowAddMember(false); setJoinCode(''); setPassword(''); }}>Cancel</button>
            </div>
          </form>
        )}

        <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
          {project.members?.length === 0 ? (
            <p className="text-center text-muted small py-2">No members</p>
          ) : (
            <div className="list-group list-group-flush">
              {project.members.map(m => (
                <div key={m.id} className="list-group-item p-2">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <small className="fw-bold">{m.userName}</small>
                      {m.id === project.ownerId && <small className="text-primary d-block">Owner</small>}
                    </div>
                    {isOwner && m.id !== project.ownerId && (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleRemoveMember(m.id)}>
                        <i className="bi bi-person-dash"></i>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div className="alert alert-danger small mt-2 mb-0">{error}</div>}

        {!isOwner && (
          <button className="btn btn-outline-warning btn-sm w-100 mt-2" onClick={handleLeaveProject}>
            Leave Project
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectMembersSection;