import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
  return (
    <>
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          <Link className="navbar-brand" to="/">OneClickSMIS</Link>
          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav ms-auto">
              <li className="nav-item"><a className="nav-link" href="#features">Features</a></li>
              <li className="nav-item"><a className="nav-link" href="#pricing">Pricing</a></li>
              <li className="nav-item"><a className="nav-link" href="#faq">FAQ</a></li>
              <li className="nav-item"><Link className="nav-link" to="/blog">Blog</Link></li>
              <li className="nav-item"><Link className="nav-link btn btn-secondary text-white" to="/login">Get Started</Link></li>
            </ul>
          </div>
        </div>
      </nav>

      <header className="container my-5 text-center">
        <div className="row">
          <div className="col-md-6">
            <h1>Welcome to OneClickSMIS</h1>
            <p className="slogan text-secondary">Empowering Education with Intelligent Solutions</p>
            <p className="lead">OneClickSMIS is a next-generation school management platform designed to automate and enhance educational administration.</p>
            <Link to="/login" className="btn btn-primary">Get Started</Link>
          </div>
          <div className="col-md-6">
            <img src="/images/platform-preview.jpg" alt="OneClickSMIS Platform" className="img-fluid"/>
          </div>
        </div>
      </header>

      <section id="features" className="container my-5">
        <h2 className="text-center mb-5">Core Features</h2>
        <div className="row text-center">
          <div className="col-md-4 mb-4">
            <div className="feature-icon">📅</div>
            <h4>Automated Timetabling</h4>
            <p>Optimize schedules with AI-powered timetable generation.</p>
          </div>
          <div className="col-md-4 mb-4">
            <div className="feature-icon">📈</div>
            <h4>Student Performance Tracking</h4>
            <p>Analyze student progress with data-driven insights.</p>
          </div>
          <div className="col-md-4 mb-4">
            <div className="feature-icon">💳</div>
            <h4>Payment Integration</h4>
            <p>Seamless Mpesa and bank systems integration.</p>
          </div>
        </div>
      </section>

      <div className="testimonial-section">
        <div className="container">
          <h2 className="text-center mb-5">What Our Clients Say</h2>
          <div id="testimonialCarousel" className="carousel slide" data-bs-ride="carousel">
            <div className="carousel-inner">
              <div className="carousel-item active">
                <div className="testimonial-slide text-center">
                  <img src="/images/testimonials/client1.jpg" alt="Client" className="img-fluid"/>
                  <p className="lead">"OneClickSMIS has transformed our administrative processes!"</p>
                  <p><strong>- Green Valley School</strong></p>
                </div>
              </div>
              <div className="carousel-item">
                <div className="testimonial-slide text-center">
                  <img src="/images/testimonials/client2.jpg" alt="Client" className="img-fluid"/>
                  <p className="lead">"Reliable system that tracks student performance efficiently."</p>
                  <p><strong>- Riverside Academy</strong></p>
                </div>
              </div>
            </div>
            <button className="carousel-control-prev" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="prev">
              <span className="carousel-control-prev-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Previous</span>
            </button>
            <button className="carousel-control-next" type="button" data-bs-target="#testimonialCarousel" data-bs-slide="next">
              <span className="carousel-control-next-icon" aria-hidden="true"></span>
              <span className="visually-hidden">Next</span>
            </button>
          </div>
        </div>
      </div>

      <section id="pricing" className="container my-5">
        {/* ... Pricing section content ... */}
      </section>

      <section id="faq" className="container my-5">
        {/* ... FAQ section content ... */}
      </section>

      <section id="resources" className="container my-5">
        <h2 className="text-center mb-5">Resources</h2>
        <div className="row">
          <div className="col-md-4">
            <h5>Whitepaper: AI in Education</h5>
            <p>Download our in-depth analysis on AI in education.</p>
            <button 
              onClick={() => window.location.href = '/api/resources/download/whitepaper'} 
              className="btn btn-primary"
            >
              Download
            </button>
          </div>
          <div className="col-md-4">
            <h5>Case Study: School Success</h5>
            <p>See how schools benefit from OneClickSMIS.</p>
            <button 
              onClick={() => window.location.href = '/api/resources/download/case-study'} 
              className="btn btn-primary"
            >
              Download
            </button>
          </div>
          <div className="col-md-4">
            <h5>Product Brochure</h5>
            <p>Learn more about our features.</p>
            <button 
              onClick={() => window.location.href = '/api/resources/download/brochure'} 
              className="btn btn-primary"
            >
              Download
            </button>
          </div>
        </div>
      </section>

      <footer>
        <div className="container">
          <p>&copy; 2024 OneClickSMIS. All Rights Reserved.</p>
          <p>
            <Link to="/privacy">Privacy Policy</Link> | 
            <Link to="/terms">Terms of Service</Link> | 
            <Link to="/contact">Contact Us</Link>
          </p>
        </div>
      </footer>
    </>
  );
};

export default LandingPage;