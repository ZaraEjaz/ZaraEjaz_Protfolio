import './Projects.css';
import React, { useEffect } from 'react';
import 'aos/dist/aos.css';
import Aos from 'aos'; // Make sure to import Aos logic if you haven't already

const projectsData = [
  {
    title: "Quantaflix Website",
    description: "I developed the official Quantaflix website based on the design shared by the team. The project was built using React (Vite) for fast performance and a modern development workflow, along with CSS for styling and responsiveness.",
    image: "./Images/first.png",
    boxClass: "project-box5", // Preserving your specific styling classes
    liveLink: "https://quantaflix.com/",
    githubLink: null
  },
  {
    title: "My Portfolio",
    description: "My portfolio website is developed using React with Vite for a fast and efficient build process, styled with modern CSS frameworks and custom animations to ensure responsiveness, interactivity, and a seamless user experience.",
    image: "./Images/myportfolio.png",
    boxClass: "project-box2",
    liveLink: null,
    githubLink: null
  },
  {
    title: "TriTechTitan Website",
    description: "Designed & Developed the official TriTechTitan website. The project was built using React (Vite) and Typescript for fast performance and a modern development workflow, along with Tailwind CSS for styling and responsiveness.",
    image: "./Images/T3mainwebsite.png",
    boxClass: "project-box2",
    liveLink: "https://tritechtitan.com/",
    githubLink: null
  },
  {
    title: "TriTechTitan Blog",
    description: "TriTechTitan is a modern WordPress-based tech blog sharing insights, tutorials, and trends in technology and innovation.",
    image: "./Images/T3blog.png",
    boxClass: "project-box2",
    liveLink: "https://tritechtitan.blog/",
    githubLink: null
  },
  {
    title: "CPU SCHEDULING SIMULATOR",
    description: "Web app using JavaScript, HTML, and CSS to simulate CPU scheduling and page replacement algorithms, providing visualization and performance metrics.",
    image: "./Images/CPUS.jpg",
    boxClass: "project-box5",
    liveLink: null,
    githubLink: "https://github.com/ZaraEjaz/CPU-SCHEDULAR"
  },
  {
    title: "Algorithm Visualizer",
    description: "Project demonstrates CPU scheduling and page replacement algorithms to enhance understanding of process management and memory usage in operating systems.",
    image: "./Images/AlgorithmVisualizer.png",
    boxClass: "project-box5",
    liveLink: null,
    githubLink: "https://github.com/ZaraEjaz/Algorithm-Visualizer"
  }
];

const Projects = () => {
  
  // Ensure AOS initializes
  useEffect(() => {
    Aos.init({ duration: 1000 });
  }, []);

  return (
    <>
      <div className='container' id="projects">
        <br />
        <br />
      </div>
      <div className="col-lg-7 col-md-6 col-sm-12 intro-text mt-5">
        <p className="tracking-in-expand-fwd-bottom" data-aos="fade-up">Projects .______________________</p>
      </div>
      
      <section className="projects-section-container">
        <div className="projects-section-div">
          <div className="project-boxes-div">
            
            {projectsData.map((project, index) => (
              <div className="project-box-wrapper" data-aos="fade-up" key={index}>
                <div className={`project-box ${project.boxClass}`} id={project.boxClass}>
                  <div className="info-div">
                    <article className="ProjectHeading">{project.title}</article>
                    <p className="ProjectDescription">
                      {project.description}
                    </p>
                    
                    {/* Conditionally render buttons container only if a link exists */}
                    {(project.liveLink || project.githubLink) && (
                      <div className="project-buttons">
                        
                        {/* Logic for Live View Button */}
                        {project.liveLink && (
                          <a href={project.liveLink} target="_blank" rel="noopener noreferrer" className="cta" aria-label={`${project.title} Live`}>
                            <span>Live view</span>
                            <svg viewBox="0 0 13 10" height="10px" width="15px">
                              <path d="M1,5 L11,5"></path>
                              <polyline points="8 1 12 5 8 9"></polyline>
                            </svg>
                          </a>
                        )}

                        {/* Logic for GitHub Button */}
                        {project.githubLink && (
                          <a href={project.githubLink} target="_blank" rel="noopener noreferrer" className="github-redirect" aria-label="Visit on GitHub">
                            <img src="./svg/github.svg" alt="github redirect button" />
                          </a>
                        )}
                        
                      </div>
                    )}
                  </div>
                  
                  <div className="image-div">
                    <img src={project.image} alt={project.title} />
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </section>
    </>
  );
};

export default Projects;
