import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axiosInstance from '../services/api/axiosInstance';
import { isEmail, minLength } from '../utils/validators';

const ContactForm = ({ onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ name: null, email: null, message: null });
  const [submitting, setSubmitting] = useState(false);
  const [topError, setTopError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const validate = () => {
    console.log('Validating form fields');
    const fe = { name: null, email: null, message: null };
    let ok = true;
    if (!name.trim()) { fe.name = 'Name is required.'; ok = false; }
    if (!email.trim()) { fe.email = 'Email is required.'; ok = false; }
    else if (!isEmail(email)) { fe.email = 'Please enter a valid email.'; ok = false; }
    if (!minLength(message, 10)) { fe.message = 'Message must be at least 10 characters.'; ok = false; }
    setFieldErrors(fe);
    console.log('Validation result:', ok, fe);
    return ok;
  };

  const handleSubmit = async (e) => {
    console.log('Form submit triggered');
    e.preventDefault();
    setTopError(null);
    setSuccessMsg(null);
    if (!validate()) return;

    setSubmitting(true);
    console.log('Submitting form with data:', { name, email, message });
    try {
      const payload = { name: name.trim(), email: email.trim(), message: message.trim() };
      console.log('Payload prepared:', payload);
      await axiosInstance.post('/api/Contact', payload);
      console.log('Form submission successful');
      setSuccessMsg('Message sent — we will get back to you shortly.');
      setName(''); setEmail(''); setMessage('');
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error('Error submitting form:', err);
      const serverMsg = err.response?.data?.Message || err.response?.data?.message || err.message;
      setTopError(serverMsg || 'Failed to send message. If this persists, contact admin@example.com.');
    } finally {
      console.log('Submission process ended');
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate>
      {topError && <div className="alert alert-danger">{topError}</div>}
      {successMsg && <div className="alert alert-success">{successMsg}</div>}

      <div className="mb-3">
        <label className="form-label">Name</label>
        <input
          type="text"
          className={`form-control ${fieldErrors.name ? 'is-invalid' : ''}`}
          value={name}
          onChange={(e) => { setName(e.target.value); setFieldErrors(s => ({ ...s, name: null })); }}
          required
        />
        {fieldErrors.name && <div className="invalid-feedback">{fieldErrors.name}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          type="email"
          className={`form-control ${fieldErrors.email ? 'is-invalid' : ''}`}
          value={email}
          onChange={(e) => { setEmail(e.target.value); setFieldErrors(s => ({ ...s, email: null })); }}
          required
        />
        {fieldErrors.email && <div className="invalid-feedback">{fieldErrors.email}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label">Message</label>
        <textarea
          className={`form-control ${fieldErrors.message ? 'is-invalid' : ''}`}
          value={message}
          onChange={(e) => { setMessage(e.target.value); setFieldErrors(s => ({ ...s, message: null })); }}
          rows="6"
          required
        />
        {fieldErrors.message && <div className="invalid-feedback">{fieldErrors.message}</div>}
      </div>

      <button type="submit" className="btn btn-primary" disabled={submitting}>
        {submitting ? 'Sending...' : 'Send Message'}
      </button>
    </form>
  );
};

ContactForm.propTypes = {
  onSuccess: PropTypes.func,
};

ContactForm.defaultProps = {
  onSuccess: null,
};

export default ContactForm;
