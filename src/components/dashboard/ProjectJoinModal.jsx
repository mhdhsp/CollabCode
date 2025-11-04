import React, { useState } from 'react';
import projectService from '../../services/api/projectService';

const ProjectJoinModal = ({ show, onClose }) => {
  const [joinCode, setJoinCode] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleJoin = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await projectService.joinProject({ joinCode, passWord: password });
      onClose();
    } catch (err) {
      setError(err.response.data.message || 'Join failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;
  return (
    <div className="modal-backdrop">
      <div className="modal d-block" tabIndex="-1">
        <div className="modal-dialog">
          <form className="modal-content" onSubmit={handleJoin}>
            <div className="modal-header">
              <h5 className="modal-title">Join Project</h5>
              <button type="button" className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger">{error}</div>}
              <div className="mb-3">
                <label className="form-label">Join Code</label>
                <input className="form-control" value={joinCode} onChange={(e)=>setJoinCode(e.target.value)} required />
              </div>
              <div className="mb-3">
                <label className="form-label">Password (if required)</label>
                <input type="password" className="form-control" value={password} onChange={(e)=>setPassword(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Joining...' : 'Join'}</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProjectJoinModal;