import React from 'react';
import ContactForm from '../components/ContactForm';

const ContactPage = () => {
  console.log("ContactPage component rendered");
  return (
    <div className="container py-5">
      {console.log("Rendering container")}
      <div className="row justify-content-center">
        {console.log("Rendering row")}
        <div className="col-md-8">
          {console.log("Rendering column")}
          <h2>Contact Us</h2>
          {console.log("Rendering heading")}
          <p className="text-muted">Have questions or feedback? Send us a message and we'll respond as soon as possible.</p>
          {console.log("Rendering description")}
          <ContactForm />
          {console.log("ContactForm rendered")}
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
