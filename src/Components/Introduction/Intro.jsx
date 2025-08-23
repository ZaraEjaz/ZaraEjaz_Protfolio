import React from 'react';
import './intro.css';
import Custombtn from '../LetsTalkbtn/Custombtn';

const Intro = () => {
  return (
    <>
      <div className='container' id='Intro'>
        <br/>
      </div>
      <div className="container Introcontainer">
        <div className="row align-items-center">
          <div className="col-lg-7 col-md-6 col-sm-12 intro-text">
            <p className="tracking-in-expand-fwd-bottom mb-5">About me .____________________</p>
            <h1 className="tracking-in-expand-fwd-bottom">Zara Ejaz</h1>
            <p className="intro-paragraph tracking-in-expand-fwd-bottom">
              Hello, I'm Zara Ejaz — a passionate software engineering student who has explored the world of web design and development with curiosity and dedication. 
              <br />
              I began my professional journey at <b>Quantaflix</b>, where I completed my internship as a <b>Frontend Developer</b> and later worked as a <b>Web Developer</b>, focusing on frontend development, API integrations and system functionality. 
              <br />
              Afterwards, I joined <b>Abidi Solutions</b>, where I contributed to building efficient, scalable, and user-friendly solutions while strengthening my skills in full-stack development. 
              </p>
          </div>

          <div className="col-lg-5 col-md-6 col-sm-12 intro-image text-center tracking-in-expand-fwd-bottom mt-2">
            <img src="./Images/dev.jpg" alt="Zara Ejaz" className="intro-img" />
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
            <div className="bubble"></div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Intro;
