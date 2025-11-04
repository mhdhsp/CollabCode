import React, { useState } from 'react';
import projectService from '../../services/api/projectService';

const ProjectCreateModal = ({ show, onClose }) => {
  const [projectName, setProjectName] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await projectService.createProject({
        projectName,
        isPublic,
        passWordHash: isPublic ? null : password
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog">
          <form className="modal-content" onSubmit={handleCreate}>
            <div className="modal-header">
              <h5 className="modal-title">Create Project</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="mb-3">
                <label className="form-label">Project Name</label>
                <input className="form-control" value={projectName} onChange={(e) => setProjectName(e.target.value)} required />
              </div>
              <div className="mb-3 form-check">
                <input id="isPublic" className="form-check-input" type="checkbox" checked={isPublic} onChange={(e)=>setIsPublic(e.target.checked)} />
                <label htmlFor="isPublic" className="form-check-label">Public</label>
              </div>
              {!isPublic && (
                <div className="mb-3">
                  <label className="form-label">Password</label>
                  <input type="password" className="form-control" value={password} onChange={(e)=>setPassword(e.target.value)} required />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting? 'Creating...':'Create'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectCreateModal;