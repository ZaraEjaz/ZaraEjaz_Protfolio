import React, { useEffect, useRef, useState } from "react";
import "./Section1.css";
import Custombtn from "../LetsTalkbtn/Custombtn";

const Section1 = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  // Typing effect state
  const [text, setText] = useState("");
  const fullText = "I'm a Web Developer.";
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  // Typing animation logic
  useEffect(() => {
    if (isVisible && index < fullText.length) {
      const timeout = setTimeout(() => {
        setText((prev) => prev + fullText[index]);
        setIndex(index + 1);
      }, 120); // speed of typing (ms)
      return () => clearTimeout(timeout);
    } else if (isVisible && index === fullText.length) {
      // Reset typing after a pause
      const resetTimeout = setTimeout(() => {
        setText("");
        setIndex(0);
      }, 2000); // pause before restarting
      return () => clearTimeout(resetTimeout);
    }
  }, [index, isVisible]);

  return (
    <>
      <div className="container" id="Section1">
        <br />
        <br />
        <br />
      </div>

      <section
        className={`landingpage container ${isVisible ? "visible" : ""}`}
        ref={sectionRef}
      >
        <div className="text-content">
          <p
            className={`tracking-in-expand-fwd-bottom ${
              isVisible ? "animate" : ""
            }`}
          >
            Hello <span className="wave">👋</span> I'm
          </p>
          <h1
            className={`name tracking-in-expand-fwd-bottom ${
              isVisible ? "animate" : ""
            }`}
          >
            Zara Ejaz.
          </h1>
          <p className={`work typing-text ${isVisible ? "animate" : ""}`}>
            {text}
            <span className="cursor"></span>
          </p>
        </div>
        <br />
        <p
          className={`info-para mb-5 ${isVisible ? "animate" : ""} text-justify`}
          data-aos="fade-up"
          data-aos-delay="600"
        >
          As a full-stack web developer, I specialize in building dynamic and scalable applications with a strong focus on both frontend design and backend development. <br />
          I enjoy creating seamless user experiences, integrating APIs, and collaborating with teams to deliver innovative solutions.
        </p>
        <Custombtn />
      </section>
    </>
  );
};

export default Section1;
