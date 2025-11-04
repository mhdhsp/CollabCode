import React, { useState } from 'react';
import projectService from '../../services/api/projectService';

const MembersPanel = ({ project, onProjectChanged }) => {
  const [error, setError] = useState(null);

  console.log('MembersPanel rendered', { project });

  if (!project) {
    console.log('No project loaded in MembersPanel');
    return <div className="card"><div className="card-body">Open a project to view members</div></div>;
  }

  const removeMember = async (memberDto) => {
    console.log('Remove member triggered', memberDto);
    if (!confirm(`Remove ${memberDto.userName}?`)) {
      console.log('Remove member cancelled');
      return;
    }
    try {
      console.log('Removing member from project:', project.id, 'memberId:', memberDto.id);
      await projectService.removeMember(project.id, memberDto.id);
      console.log('Member removed successfully');
      onProjectChanged();
    } catch (err) {
      console.error('Error removing member:', err);
      setError(err.message || 'Remove failed');
    }
  };

  return (
    <div className="card h-100">
      <div className="card-body d-flex flex-column">
        <h6>Members</h6>
        <ul className="list-group list-group-flush mb-2">
          {project.members.length === 0 && <li className="list-group-item">No members</li>}
          {project.members.map(m => (
            <li key={m.id} className="list-group-item d-flex justify-content-between align-items-center">
              <div>{m.userName}</div>
              <div>
                <button className="btn btn-sm btn-danger" onClick={() => removeMember(m)}>Remove</button>
              </div>
            </li>
          ))}
        </ul>
        {error && <div className="alert alert-danger mt-auto">{error}</div>}
      </div>
    </div>
  );
};

export default MembersPanel;
