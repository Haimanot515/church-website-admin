import React from "react";

const SkillCard = ({ skill }) => (
  <div className="skill-card">
    <h4>{skill.name}</h4>
    <p>{skill.level}</p>
  </div>
);

export default SkillCard;
