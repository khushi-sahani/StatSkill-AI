import { useEffect, useState } from "react";
import "./index.css";

function App() {
  // =========================================================
  // ASSESSMENT
  // =========================================================

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [showAssessment, setShowAssessment] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // =========================================================
  // AI QUIZ
  // =========================================================

  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedCompetency, setSelectedCompetency] = useState("");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizResult, setQuizResult] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);

  // =========================================================
  // DASHBOARD / PROGRESS
  // =========================================================

  const [dashboardVisible, setDashboardVisible] = useState(false);

  const [learningProgress, setLearningProgress] = useState(() => {
  return JSON.parse(
    localStorage.getItem("statskill_learning_progress") || "[]"
  );
});

  // =========================================================
  // LOAD SAVED RESULT
  // =========================================================

  useEffect(() => {
    const savedResult = localStorage.getItem(
      "statskill_assessment_result"
    );

    if (savedResult) {
      try {
        const parsedResult = JSON.parse(savedResult);

        setResult(parsedResult);
        setDashboardVisible(true);
      } catch (error) {
        console.error(
          "Unable to load saved progress:",
          error
        );
      }
    }
  }, []);

  // =========================================================
  // SAVE RESULT
  // =========================================================

  useEffect(() => {
    if (result) {
      localStorage.setItem(
        "statskill_assessment_result",
        JSON.stringify(result)
      );

      setDashboardVisible(true);
    }
  }, [result]);

  // =========================================================
  // START ASSESSMENT
  // =========================================================

  const startAssessment = async () => {
    try {
      setLoading(true);

      setResult(null);
      setDashboardVisible(false);
      setAnswers({});
      setShowAssessment(true);

      const response = await fetch(
        "http://127.0.0.1:8000/assessment"
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load assessment"
        );
      }

      const data = await response.json();

      setQuestions(data.questions || []);

      setTimeout(() => {
        document
          .getElementById("assessment")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 100);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to load assessment. Please make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // ASSESSMENT ANSWER
  // =========================================================

  const handleAnswerChange = (
    questionId,
    answerIndex
  ) => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [questionId]: Number(answerIndex),
    }));
  };

  // =========================================================
  // SUBMIT ASSESSMENT
  // =========================================================

  const submitAssessment = async () => {
    if (questions.length === 0) {
      alert("No questions available.");
      return;
    }

    if (
      Object.keys(answers).length !==
      questions.length
    ) {
      alert(
        "Please answer all questions before submitting."
      );
      return;
    }

    try {
      setLoading(true);

      const payload = {
        answers: Object.entries(answers).map(
          ([questionId, answer]) => ({
            question_id: Number(questionId),
            answer: Number(answer),
          })
        ),
      };

      const response = await fetch(
        "http://127.0.0.1:8000/assessment/submit",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to submit assessment"
        );
      }

      const data = await response.json();

      setResult(data);
      setShowAssessment(false);
      setDashboardVisible(true);

      setTimeout(() => {
        document
          .getElementById("dashboard")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 200);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to submit assessment."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LEARNING TOPICS
  // =========================================================

  const getLearningTopics = (competency) => {
    const topics = {
      Sampling: [
        "Population and Sample",
        "Sampling Techniques",
        "Probability Sampling",
        "Non-Probability Sampling",
        "Sampling Bias",
      ],

      Python: [
        "Python Fundamentals",
        "Variables and Data Types",
        "Loops and Conditions",
        "Functions",
        "Lists and Dictionaries",
      ],

      SQL: [
        "SELECT and WHERE",
        "GROUP BY and Aggregate Functions",
        "SQL JOINs",
        "Subqueries",
        "UPDATE and DELETE",
      ],

      "Data Privacy": [
        "Personal Data",
        "Consent and Privacy",
        "Data Protection Principles",
        "Encryption and Security",
        "Secure Data Handling",
      ],

      Communication: [
        "Effective Communication",
        "Active Listening",
        "Presentation Skills",
        "Team Communication",
        "Explaining Technical Concepts",
      ],
    };

    return topics[competency] || [];
  };

  // =========================================================
  // COMPETENCY PERCENTAGE
  // =========================================================

  const getCompetencyPercentage = (
    competency
  ) => {
    if (!result) {
      return 0;
    }

    if (
      result.competency_analysis &&
      result.competency_analysis[competency]
    ) {
      return Number(
        result.competency_analysis[competency]
          .percentage || 0
      );
    }

    return 0;
  };

  // =========================================================
  // GET COMPETENCIES
  // =========================================================

  const getCompetencies = () => {
    if (
      !result ||
      !result.competency_scores
    ) {
      return [];
    }

    return Object.keys(
      result.competency_scores
    );
  };

  // =========================================================
  // LEARNING PROGRESS
  // =========================================================

  const calculateLearningProgress = () => {
    const competencies =
      getCompetencies();

    if (competencies.length === 0) {
      return 0;
    }

    const total = competencies.reduce(
      (sum, competency) =>
        sum +
        getCompetencyPercentage(
          competency
        ),
      0
    );

    return Math.round(
      total / competencies.length
    );
  };

  // =========================================================
  // STRONGEST SKILL
  // =========================================================

  const getStrongestSkill = () => {
    const competencies =
      getCompetencies();

    if (competencies.length === 0) {
      return "—";
    }

    let strongest = competencies[0];

    competencies.forEach(
      (competency) => {
        if (
          getCompetencyPercentage(
            competency
          ) >
          getCompetencyPercentage(
            strongest
          )
        ) {
          strongest = competency;
        }
      }
    );

    return strongest;
  };

  // =========================================================
  // WEAKEST SKILL
  // =========================================================

  const getWeakestSkill = () => {
    const competencies =
      getCompetencies();

    if (competencies.length === 0) {
      return "—";
    }

    let weakest = competencies[0];

    competencies.forEach(
      (competency) => {
        if (
          getCompetencyPercentage(
            competency
          ) <
          getCompetencyPercentage(
            weakest
          )
        ) {
          weakest = competency;
        }
      }
    );

    return weakest;
  };

  // =========================================================
  // COMPLETED SKILLS
  // =========================================================

  const getCompletedSkills = () => {
    return getCompetencies().filter(
      (competency) =>
        getCompetencyPercentage(
          competency
        ) >= 60
    ).length;
  };

  // =========================================================
  // ACHIEVEMENTS
  // =========================================================

  const getAchievements = () => {
    const progress =
      calculateLearningProgress();

    const achievements = [];

    if (result) {
      achievements.push({
        icon: "🎓",
        title: "Assessment Complete",
        description:
          "Completed your initial skill assessment.",
        unlocked: true,
      });
    }

    if (progress >= 60) {
      achievements.push({
        icon: "🚀",
        title: "Skill Builder",
        description:
          "Reached 60% overall competency.",
        unlocked: true,
      });
    }

    if (progress >= 80) {
      achievements.push({
        icon: "🏆",
        title: "High Performer",
        description:
          "Reached 80% overall competency.",
        unlocked: true,
      });
    }

    if (
      getStrongestSkill() !== "—" &&
      getCompetencyPercentage(
        getStrongestSkill()
      ) >= 80
    ) {
      achievements.push({
        icon: "⭐",
        title: "Expertise Unlocked",
        description:
          "Achieved 80%+ in a competency.",
        unlocked: true,
      });
    }

    return achievements;
  };

  // =========================================================
  // START AI TOPIC QUIZ
  // =========================================================

  const startTopicQuiz = async (
    competency,
    topic
  ) => {
    try {
      setQuizLoading(true);

      setQuizResult(null);
      setQuizAnswers({});
      setSelectedCompetency(
        competency
      );
      setSelectedTopic(topic);
      setShowQuiz(true);

      const response = await fetch(
        "http://127.0.0.1:8000/generate-topic-quiz",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            competency,
            topic,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to generate quiz"
        );
      }

      const data = await response.json();

      setQuizQuestions(
        data.questions || []
      );

      setTimeout(() => {
        document
          .getElementById("ai-quiz")
          ?.scrollIntoView({
            behavior: "smooth",
          });
      }, 100);
    } catch (error) {
      console.error(error);

      alert(
        "Unable to generate AI quiz. Please check backend and Gemini API."
      );
    } finally {
      setQuizLoading(false);
    }
  };

  // =========================================================
  // QUIZ ANSWER
  // =========================================================

  const handleQuizAnswer = (
    questionIndex,
    answer
  ) => {
    setQuizAnswers(
      (previousAnswers) => ({
        ...previousAnswers,
        [questionIndex]: answer,
      })
    );
  };

  // =========================================================
  // SUBMIT QUIZ
  // =========================================================

  const submitTopicQuiz = async () => {
    if (
      quizQuestions.length === 0
    ) {
      alert(
        "No quiz questions available."
      );
      return;
    }

    if (
      Object.keys(quizAnswers)
        .length !==
      quizQuestions.length
    ) {
      alert(
        "Please answer all quiz questions."
      );
      return;
    }

    try {
      setQuizLoading(true);

      const payload = {
        questions:
          quizQuestions.map(
            (question) => ({
              question:
                question.question,
              answer:
                question.answer,
              explanation:
                question.explanation ||
                "",
            })
          ),

        answers:
          quizQuestions.map(
            (_, index) =>
              quizAnswers[index]
          ),
      };

      const response = await fetch(
        "http://127.0.0.1:8000/quiz/submit",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(
            payload
          ),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to submit quiz"
        );
      }

      const data =
        await response.json();

      setQuizResult(data);
      
      const existingProgress = JSON.parse(
  localStorage.getItem("statskill_learning_progress") || "[]"
);

const progressEntry = {
  competency: selectedCompetency,
  topic: selectedTopic,
  score: data.correct,
  total: data.total_questions,
  percentage: data.percentage,
  completedAt: new Date().toISOString(),
};

existingProgress.push(progressEntry);

localStorage.setItem(
  "statskill_learning_progress",
  JSON.stringify(existingProgress)
);
setLearningProgress(existingProgress);
    }
catch (error) {
      console.error(error);

      alert(
        "Unable to submit quiz."
      );
    } finally {
      setQuizLoading(false);
    }
  };

  // =========================================================
  // RETAKE QUIZ
  // =========================================================

  const retakeQuiz = () => {
  if (selectedCompetency && selectedTopic) {
    startTopicQuiz(
      selectedCompetency,
      selectedTopic
    );
  }
};

  // =========================================================
  // LEVEL
  // =========================================================

  const getLevelClass = (
    percentage
  ) => {
    if (percentage >= 80)
      return "strong";

    if (percentage >= 60)
      return "good";

    if (percentage >= 40)
      return "needs-improvement";

    return "weak";
  };

  // =========================================================
  // LEVEL TEXT
  // =========================================================

  const getLevelText = (
    percentage
  ) => {
    if (percentage >= 80)
      return "Strong";

    if (percentage >= 60)
      return "Good";

    if (percentage >= 40)
      return "Needs Improvement";

    return "Weak";
  };

  // =========================================================
  // DASHBOARD
  // =========================================================

  const renderDashboard = () => {
    if (!dashboardVisible || !result) {
      return null;
    }

    const progress =
      calculateLearningProgress();

    const strongest =
      getStrongestSkill();

    const weakest =
      getWeakestSkill();

    const completed =
      getCompletedSkills();

    const competencies =
      getCompetencies();

    const achievements =
      getAchievements();

    return (
      <section
        className="dashboard-section"
        id="dashboard"
      >

        <div className="dashboard-container">

          {/* DASHBOARD HEADER */}

          <div className="dashboard-header">

            <div>
              <span className="section-label">
                YOUR LEARNING DASHBOARD
              </span>

              <h2>
                Welcome to Your Skill Dashboard 👋
              </h2>

              <p>
                Track your progress, understand
                your strengths and improve your
                skill gaps.
              </p>
            </div>

            <button
              className="dashboard-assessment-btn"
              onClick={startAssessment}
            >
              Retake Assessment
            </button>

          </div>

          {/* STAT CARDS */}

          <div className="dashboard-stats">

            <div className="dashboard-stat-card">

              <div className="dashboard-stat-icon purple">
                🎯
              </div>

              <div>
                <span>
                  Overall Score
                </span>

                <strong>
                  {result.percentage || 0}%
                </strong>
              </div>

            </div>

            <div className="dashboard-stat-card">

              <div className="dashboard-stat-icon blue">
                📈
              </div>

              <div>
                <span>
                  Learning Progress
                </span>

                <strong>
                  {progress}%
                </strong>
              </div>

            </div>
            <div className="dashboard-stat-card">
              <div className="dashboard-stat-icon orange">
                🧠
                </div>
                <div>
                  <span>
                    Average Quiz Score
                    </span>
                    <strong>
                      {averageQuizScore}%
                      </strong>
                      </div>
                      
                      </div>
                      
                      <div className="dashboard-stat-card">
                        <div className="dashboard-stat-icon green">
                          💪
                          
                          </div>
                          
                          <div>
                            <span>
                              Strongest Skill
                              
                              </span>
                              
                              <strong className="small-stat">
                                {strongest}
                                </strong>
              </div>

            </div>

            <div className="dashboard-stat-card">

              <div className="dashboard-stat-icon orange">
                🎯
              </div>

              <div>
                <span>
                  AI Quizzes Completed
                  </span>
                  
                  <strong>
                    {completedQuizzes}
                    </strong>
                    
                    </div>
                    
                    </div>
                    
                    </div>

          {/* MAIN DASHBOARD GRID */}

          <div className="dashboard-main-grid">

            {/* PROGRESS CARD */}

            <div className="dashboard-panel progress-panel">

              <div className="panel-heading">

                <div>
                  <h3>
                    Learning Progress
                  </h3>

                  <p>
                    Your competency performance
                  </p>
                </div>

                <strong>
                  {progress}%
                </strong>

              </div>

              <div className="large-progress">

                <div
                  className="large-progress-fill"
                  style={{
                    width: `${progress}%`,
                  }}
                />

              </div>

              <div className="progress-status">

                <span>
                  Keep learning consistently
                </span>

                <span>
                  {progress >= 80
                    ? "Excellent"
                    : progress >= 60
                    ? "Good progress"
                    : "Keep improving"}
                </span>

              </div>

            </div>

            {/* SKILL INSIGHT */}

            <div className="dashboard-panel">

              <div className="panel-heading">

                <div>
                  <h3>
                    Skill Focus
                  </h3>

                  <p>
                    Where to focus next
                  </p>
                </div>

                <span className="focus-icon">
                  💡
                </span>

              </div>

              <div className="focus-box">

                <span>
                  Recommended Focus
                </span>

                <strong>
                  {weakest}
                </strong>

                <p>
                  This competency has your
                  lowest current score.
                </p>

                <button
                  onClick={() => {
                    const topics =
                      getLearningTopics(
                        weakest
                      );

                    if (
                      topics.length > 0
                    ) {
                      startTopicQuiz(
                        weakest,
                        topics[0]
                      );
                    }
                  }}
                >
                  Start Practice →
                </button>

              </div>

            </div>

          </div>

          {/* COMPETENCY PROGRESS */}

          <div className="dashboard-panel competency-progress-panel">

            <div className="panel-heading">

              <div>
                <h3>
                  Competency Progress
                </h3>

                <p>
                  Track every skill individually
                </p>
              </div>

            </div>

            <div className="dashboard-competency-list">

              {competencies.map(
                (competency) => {

                  const percentage =
                    getCompetencyPercentage(
                      competency
                    );

                  return (
                    <div
                      className="dashboard-competency"
                      key={competency}
                    >

                      <div className="dashboard-competency-info">

                        <div>

                          <strong>
                            {competency}
                          </strong>

                          <span
                            className={`level-badge ${getLevelClass(
                              percentage
                            )}`}
                          >
                            {getLevelText(
                              percentage
                            )}
                          </span>

                        </div>

                        <strong>
                          {percentage}%
                        </strong>

                      </div>

                      <div className="dashboard-progress-bar">

                        <div
                          className={`dashboard-progress-fill ${getLevelClass(
                            percentage
                          )}`}
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

          {/* ACHIEVEMENTS */}

          <div className="dashboard-panel achievements-panel">

            <div className="panel-heading">

              <div>
                <h3>
                  Achievements
                </h3>

                <p>
                  Milestones unlocked through learning
                </p>
              </div>

              <span className="achievement-count">
                {achievements.length}
              </span>

            </div>

            <div className="achievement-grid">

              {achievements.map(
                (achievement) => (

                  <div
                    className="achievement-card"
                    key={achievement.title}
                  >

                    <div className="achievement-icon">
                      {achievement.icon}
                    </div>

                    <div>

                      <strong>
                        {achievement.title}
                      </strong>

                      <p>
                        {achievement.description}
                      </p>

                    </div>

                  </div>

                )
              )}

            </div>

          </div>

          {/* QUICK LEARNING */}

          <div className="dashboard-panel">

            <div className="panel-heading">

              <div>
                <h3>
                  Continue Learning
                </h3>

                <p>
                  Recommended topics based on your
                  assessment
                </p>
              </div>

            </div>

            <div className="quick-learning-grid">

              {competencies
                .slice(0, 4)
                .map((competency) => {

                  const topics =
                    getLearningTopics(
                      competency
                    );

                  const percentage =
                    getCompetencyPercentage(
                      competency
                    );

                  return (
                    <div
                      className="quick-learning-card"
                      key={competency}
                    >

                      <div className="quick-learning-top">

                        <span>
                          {competency}
                        </span>

                        <strong>
                          {percentage}%
                        </strong>

                      </div>

                      <p>
                        Next recommended topic
                      </p>

                      <button
                        onClick={() =>
                          startTopicQuiz(
                            competency,
                            topics[0]
                          )
                        }
                      >
                        Practice{" "}
                        {topics[0]}
                        {" →"}
                      </button>

                    </div>
                  );
                })}

            </div>

          </div>

        </div>

      </section>
    );
  };

  // =========================================================
  // RENDER
  // =========================================================
const completedQuizzes = learningProgress.length;

const completedTopics = [
  ...new Set(
    learningProgress.map((item) => item.topic)
  ),
];

const averageQuizScore =
  completedQuizzes > 0
    ? Math.round(
        learningProgress.reduce(
          (sum, item) => sum + item.percentage,
          0
        ) / completedQuizzes
      )
    : 0;
  return (
    <div className="app">

      {/* NAVBAR */}

      <nav className="navbar">

        <div className="logo">
          <span className="logo-icon">
            📊
          </span>

          <span>
            StatSkill AI
          </span>
        </div>

        <div className="nav-links">

          <a href="#home">
            Home
          </a>

          <a href="#features">
            Features
          </a>

          {result && (
            <a href="#dashboard">
              Dashboard
            </a>
          )}

          <a href="#assessment">
            Assessment
          </a>

          <a href="#ai-quiz">
            AI Quiz
          </a>

        </div>

      </nav>

      {/* HERO */}

      <section
        className="hero"
        id="home"
      >

        <div className="hero-content">

          <div className="hero-text">

            <span className="hero-badge">
              AI-Powered Skill Assessment
            </span>

            <h1>
              Build Skills.
              <br />
              <span>
                Measure Progress.
              </span>
            </h1>

            <p>
              StatSkill AI helps learners identify
              strengths, discover skill gaps and
              follow personalized learning paths
              using AI.
            </p>

            <div className="hero-buttons">

              <button
                className="primary-btn"
                onClick={startAssessment}
              >
                Start Assessment →
              </button>

              {result && (
                <a
                  href="#dashboard"
                  className="secondary-btn"
                >
                  View Dashboard
                </a>
              )}

            </div>

          </div>

          <div className="hero-card">

            <div className="hero-card-header">

              <span>
                Skill Analysis
              </span>

              <span>
                AI
              </span>

            </div>

            <div className="mini-score">

              <div className="mini-score-circle">
                <strong>
                  AI
                </strong>
              </div>

              <div>

                <h3>
                  Personalized
                </h3>

                <p>
                  Learning Insights
                </p>

              </div>

            </div>

            <div className="mini-bars">

              <div className="mini-bar-row">

                <span>
                  Python
                </span>

                <div className="mini-bar">
                  <div
                    className="mini-bar-fill"
                    style={{
                      width: "80%",
                    }}
                  />
                </div>

              </div>

              <div className="mini-bar-row">

                <span>
                  SQL
                </span>

                <div className="mini-bar">
                  <div
                    className="mini-bar-fill"
                    style={{
                      width: "65%",
                    }}
                  />
                </div>

              </div>

              <div className="mini-bar-row">

                <span>
                  Sampling
                </span>

                <div className="mini-bar">
                  <div
                    className="mini-bar-fill"
                    style={{
                      width: "50%",
                    }}
                  />
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* FEATURES */}

      <section
        className="features-section"
        id="features"
      >

        <div className="section-heading">

          <span className="section-label">
            PLATFORM FEATURES
          </span>

          <h2>
            Learn Smarter with AI
          </h2>

          <p>
            A complete skill-development ecosystem
            designed around your learning needs.
          </p>

        </div>

        <div className="features-grid">

          <div className="feature-card">
            <div className="feature-icon">
              📝
            </div>

            <h3>
              Skill Assessment
            </h3>

            <p>
              Evaluate your knowledge across
              important professional competencies.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              🤖
            </div>

            <h3>
              AI Analysis
            </h3>

            <p>
              Get AI-powered insights into your
              strengths and areas for improvement.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              🎯
            </div>

            <h3>
              Skill Gap Detection
            </h3>

            <p>
              Identify competencies that need
              more attention and practice.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">
              📚
            </div>

            <h3>
              Personalized Learning
            </h3>

            <p>
              Follow targeted learning topics
              based on your assessment results.
            </p>
          </div>

        </div>

      </section>

      {/* =====================================================
          DASHBOARD
      ===================================================== */}

      {renderDashboard()}

      {/* =====================================================
          ASSESSMENT
      ===================================================== */}

      <section
        className="assessment-section"
        id="assessment"
      >

        <div className="section-heading">

          <span className="section-label">
            ASSESSMENT
          </span>

          <h2>
            Test Your Skills
          </h2>

          <p>
            Answer 5 questions covering Sampling,
            Python, SQL, Data Privacy and Communication.
          </p>

        </div>

        {!showAssessment &&
          !result && (

            <div className="assessment-start-card">

              <div className="assessment-start-icon">
                🎓
              </div>

              <h3>
                Ready to discover your skill level?
              </h3>

              <p>
                The assessment contains 5 questions.
                One question is selected from each
                competency.
              </p>

              <button
                className="primary-btn"
                onClick={startAssessment}
              >
                Begin Assessment
              </button>

            </div>

          )}

        {showAssessment && (

          <div className="assessment-container">

            {loading && (
              <div className="loading-box">
                Loading assessment...
              </div>
            )}

            {!loading &&
              questions.map(
                (question, index) => (

                  <div
                    className="question-card"
                    key={question.id}
                  >

                    <div className="question-header">

                      <span className="question-number">
                        Question {index + 1}
                      </span>

                      <span className="competency-badge">
                        {question.competency}
                      </span>

                    </div>

                    <h3>
                      {question.question}
                    </h3>

                    <div className="options">

                      {question.options.map(
                        (
                          option,
                          optionIndex
                        ) => (

                          <label
                            className={`option ${
                              answers[
                                question.id
                              ] === optionIndex
                                ? "selected"
                                : ""
                            }`}
                            key={optionIndex}
                          >

                            <input
                              type="radio"
                              name={`question-${question.id}`}
                              checked={
                                answers[
                                  question.id
                                ] ===
                                optionIndex
                              }
                              onChange={() =>
                                handleAnswerChange(
                                  question.id,
                                  optionIndex
                                )
                              }
                            />

                            <span className="option-letter">
                              {String.fromCharCode(
                                65 +
                                  optionIndex
                              )}
                            </span>

                            <span className="option-text">
                              {option}
                            </span>

                          </label>

                        )
                      )}

                    </div>

                  </div>

                )
              )}

            {!loading &&
              questions.length > 0 && (

                <div className="assessment-submit">

                  <button
                    className="primary-btn"
                    onClick={
                      submitAssessment
                    }
                  >
                    Submit Assessment
                  </button>

                </div>

              )}

          </div>

        )}

      </section>

      {/* =====================================================
          RESULT
      ===================================================== */}

      {result && (

        <section className="result-section">

          <div className="section-heading">

            <span className="section-label">
              ASSESSMENT RESULT
            </span>

            <h2>
              Your Skill Analysis
            </h2>

            <p>
              Your assessment has been converted
              into a personalized learning plan.
            </p>

          </div>

          <div className="overall-result-card">

            <div className="overall-score">

              <span className="score-label">
                Overall Score
              </span>

              <strong>
                {result.percentage || 0}%
              </strong>

              <span className="score-detail">
                {result.score || 0} /{" "}
                {result.total_questions || 0}
                {" "}correct
              </span>

            </div>

            <div className="overall-message">

              <h3>
                Your Learning Progress
              </h3>

              <p>
                Your dashboard has been updated
                with your latest assessment.
              </p>

              <div className="progress-container">

                <div className="progress-info">

                  <span>
                    Overall Progress
                  </span>

                  <strong>
                    {calculateLearningProgress()}%
                  </strong>

                </div>

                <div className="progress-bar">

                  <div
                    className="progress-fill"
                    style={{
                      width: `${calculateLearningProgress()}%`,
                    }}
                  />

                </div>

              </div>

            </div>

          </div>

          {/* COMPETENCY */}

          <div className="result-block">

            <h2>
              Competency Scores
            </h2>

            <div className="competency-grid">

              {getCompetencies().map(
                (competency) => {

                  const percentage =
                    getCompetencyPercentage(
                      competency
                    );

                  return (
                    <div
                      className="competency-card"
                      key={competency}
                    >

                      <div className="competency-card-top">

                        <h3>
                          {competency}
                        </h3>

                        <span
                          className={`level-badge ${getLevelClass(
                            percentage
                          )}`}
                        >
                          {getLevelText(
                            percentage
                          )}
                        </span>

                      </div>

                      <div className="competency-percentage">
                        <strong>
                          {percentage}%
                        </strong>
                      </div>

                      <div className="competency-progress">

                        <div
                          className="competency-progress-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                      {result
                        .competency_analysis?.[
                        competency
                      ]?.recommendation && (

                        <p>
                          {
                            result
                              .competency_analysis[
                              competency
                            ].recommendation
                          }
                        </p>

                      )}

                    </div>
                  );
                }
              )}

            </div>

          </div>

          {/* STRENGTHS / GAPS */}

          <div className="insights-grid">

            <div className="insight-card strengths-card">

              <div className="insight-icon">
                💪
              </div>

              <h3>
                Strengths
              </h3>

              {result.strengths &&
              result.strengths.length > 0 ? (

                result.strengths.map(
                  (item, index) => (
                    <p key={index}>
                      ✓ {item}
                    </p>
                  )
                )

              ) : (

                <p>
                  Keep practicing to build
                  stronger competencies.
                </p>

              )}

            </div>

            <div className="insight-card gaps-card">

              <div className="insight-icon">
                🎯
              </div>

              <h3>
                Skill Gaps
              </h3>

              {result.skill_gaps &&
              result.skill_gaps.length > 0 ? (

                result.skill_gaps.map(
                  (item, index) => (
                    <p key={index}>
                      • {item}
                    </p>
                  )
                )

              ) : (

                <p>
                  No major skill gaps detected.
                </p>

              )}

            </div>

          </div>

          {/* AI RECOMMENDATIONS */}

          <div className="recommendation-section">

            <h2>
              AI Recommendations
            </h2>

            {result.recommendations &&
            result.recommendations.length > 0 ? (

              result.recommendations.map(
                (item, index) => (

                  <div
                    className="recommendation-card"
                    key={index}
                  >

                    <span>
                      {index + 1}
                    </span>

                    <div>

                      <strong>
                        {item.competency}
                      </strong>

                      <p>
                        {item.recommendation}
                      </p>

                    </div>

                  </div>

                )
              )

            ) : (

              <p>
                Continue practicing your weaker
                competencies regularly.
              </p>

            )}

          </div>

          {/* LEARNING PATH */}

          <div className="learning-path-section">

            <div className="section-heading">

              <span className="section-label">
                PERSONALIZED PATH
              </span>

              <h2>
                Your Learning Path
              </h2>

              <p>
                Select a topic to practice with
                AI-generated questions.
              </p>

            </div>

            <div className="learning-path-grid">

              {getCompetencies().map(
                (competency) => {

                  const percentage =
                    getCompetencyPercentage(
                      competency
                    );

                  const topics =
                    getLearningTopics(
                      competency
                    );

                  return (
                    <div
                      className="learning-card"
                      key={competency}
                    >

                      <div className="learning-card-header">

                        <h3>
                          {competency}
                        </h3>

                        <span>
                          {percentage}%
                        </span>

                      </div>

                      <p>
                        Recommended topics for
                        improving your{" "}
                        {competency} skills.
                      </p>

                      <div className="topic-list">

                        {topics.map(
                          (
                            topic,
                            topicIndex
                          ) => (

                            <button
                              className="topic-button"
                              key={topicIndex}
                              onClick={() =>
                                startTopicQuiz(
                                  competency,
                                  topic
                                )
                              }
                            >

                              <span>
                                {topicIndex + 1}
                              </span>

                              {topic}

                              <span>
                                →
                              </span>

                            </button>

                          )
                        )}

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </div>

        </section>

      )}

      {/* =====================================================
          AI QUIZ
      ===================================================== */}

      <section
        className="ai-quiz-section"
        id="ai-quiz"
      >

        <div className="section-heading">

          <span className="section-label">
            AI LEARNING
          </span>

          <h2>
            AI Topic Quiz
          </h2>

          <p>
            Practice any topic using AI-generated
            questions.
          </p>

        </div>

        {!showQuiz && (

          <div className="quiz-intro-card">

            <div className="quiz-intro-icon">
              🤖
            </div>

            <h3>
              Personalized AI Practice
            </h3>

            <p>
              Choose a topic from your learning
              path to start practicing.
            </p>

          </div>

        )}

        {showQuiz && (

          <div className="quiz-container">

            <div className="quiz-header-card">

              <div>

                <span className="section-label">
                  CURRENT QUIZ
                </span>

                <h2>
                  {selectedTopic}
                </h2>

                <p>
                  Competency:{" "}
                  <strong>
                    {selectedCompetency}
                  </strong>
                </p>

              </div>

              <div className="quiz-count">
                {quizQuestions.length}
                {" "}Questions
              </div>

            </div>

            {quizLoading && (
              <div className="loading-box">
                Generating your AI quiz...
              </div>
            )}

            {!quizLoading &&
              !quizResult &&
              quizQuestions.length >
                0 && (

                <>

                  {quizQuestions.map(
                    (
                      question,
                      index
                    ) => (

                      <div
                        className="question-card"
                        key={index}
                      >

                        <div className="question-header">

                          <span className="question-number">
                            Question{" "}
                            {index + 1}
                          </span>

                          <span className="competency-badge">
                            AI Generated
                          </span>

                        </div>

                        <h3>
                          {question.question}
                        </h3>

                        <div className="options">

                          {question.options &&
                            question.options.map(
                              (
                                option,
                                optionIndex
                              ) => (

                                <label
                                  className={`option ${
                                    quizAnswers[
                                      index
                                    ] ===
                                    option
                                      ? "selected"
                                      : ""
                                  }`}
                                  key={
                                    optionIndex
                                  }
                                >

                                  <input
                                    type="radio"
                                    name={`quiz-${index}`}
                                    checked={
                                      quizAnswers[
                                        index
                                      ] ===
                                      option
                                    }
                                    onChange={() =>
                                      handleQuizAnswer(
                                        index,
                                        option
                                      )
                                    }
                                  />

                                  <span className="option-letter">
                                    {String.fromCharCode(
                                      65 +
                                        optionIndex
                                    )}
                                  </span>

                                  <span className="option-text">
                                    {option}
                                  </span>

                                </label>

                              )
                            )}

                        </div>

                      </div>

                    )
                  )}

                  <div className="assessment-submit">

                    <button
                      className="primary-btn"
                      onClick={
                        submitTopicQuiz
                      }
                    >
                      Submit AI Quiz
                    </button>

                  </div>

                </>

              )}

            {quizResult && (

              <div className="quiz-result">

                <div className="quiz-score-card">

                  <span>
                    Quiz Score
                  </span>

                  <strong>
                    {quizResult.percentage || 0}%
                  </strong>

                  <p>
                    {quizResult.correct || 0}
                    {" "}correct out of{" "}
                    {quizResult.total_questions || 0}
                  </p>

                </div>

                <div className="answer-review">

                  <h2>
                    Answer Review
                  </h2>

                  {quizResult.results &&
                    quizResult.results.map(
                      (
                        item,
                        index
                      ) => (

                        <div
                          className={`review-card ${
                            item.is_correct
                              ? "correct"
                              : "wrong"
                          }`}
                          key={index}
                        >

                          <div className="review-header">

                            <span>
                              Question{" "}
                              {index + 1}
                            </span>

                            <strong>
                              {item.is_correct
                                ? "✓ Correct"
                                : "✗ Incorrect"}
                            </strong>

                          </div>

                          <h3>
                            {item.question}
                          </h3>

                          <p>
                            <strong>
                              Your answer:
                            </strong>{" "}
                            {item.user_answer ||
                              "Not answered"}
                          </p>

                          {!item.is_correct && (

                            <p>
                              <strong>
                                Correct answer:
                              </strong>{" "}
                              {
                                item.correct_answer
                              }
                            </p>

                          )}

                          {item.explanation && (

                            <p>
                              <strong>
                                Explanation:
                              </strong>{" "}
                              {
                                item.explanation
                              }
                            </p>

                          )}

                        </div>

                      )
                    )}

                </div>

                <div className="quiz-actions">

                  <button
                    className="primary-btn"
                    onClick={
                      retakeQuiz
                    }
                  >
                    Retake Quiz
                  </button>

                </div>

              </div>

            )}

          </div>

        )}

      </section>

      {/* FOOTER */}

      <footer className="footer">

        <div className="footer-content">

          <div className="footer-brand">

            <div className="logo">

              <span className="logo-icon">
                📊
              </span>

              <span>
                StatSkill AI
              </span>

            </div>

            <p>
              AI-powered skill assessment and
              personalized learning platform.
            </p>

          </div>

          <div className="footer-links">

            <a href="#home">
              Home
            </a>

            <a href="#dashboard">
              Dashboard
            </a>

            <a href="#assessment">
              Assessment
            </a>

            <a href="#ai-quiz">
              AI Quiz
            </a>

          </div>

        </div>

        <div className="footer-bottom">

          <p>
            © 2026 StatSkill AI. Built for
            Smart India Hackathon.
          </p>

        </div>

      </footer>

    </div>
  );
}

export default App;