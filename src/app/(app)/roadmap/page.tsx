'use client';

import { useState } from 'react';

type WeekTopic = {
  title: string;
  description: string;
  icon: string;
};

type Topic = {
  title: string;
  description: string;
  timeComplexity?: string;
  spaceComplexity?: string;
  features: string[];
};

export default function RoadmapPage() {
  const [activeWeek, setActiveWeek] = useState(1);

  const weeks: Record<number, { title: string; description: string; topics: WeekTopic[] }> = {
    1: {
      title: "JavaScript Fundamentals",
      description: "Master the core concepts of JavaScript that form the foundation of all web development. This week covers essential syntax, data types, and control structures.",
      topics: [
        { title: "Variables & Data Types", description: "Understanding variables, primitives, and reference types", icon: "fa-code" },
        { title: "Operators & Expressions", description: "Using arithmetic, comparison, and logical operators", icon: "fa-equals" },
        { title: "Control Flow", description: "Working with conditional statements and loops", icon: "fa-code-branch" },
        { title: "Functions", description: "Creating and using functions, parameters, and return values", icon: "fa-function" },
        { title: "Objects & Arrays", description: "Understanding object and array fundamentals", icon: "fa-layer-group" }
      ]
    },
    2: {
      title: "Advanced JavaScript Concepts",
      description: "Dive deeper into JavaScript's powerful features like closures, prototypes, and asynchronous programming that separate beginners from professionals.",
      topics: [
        { title: "Scope & Closures", description: "Understanding lexical scope and closure patterns", icon: "fa-box" },
        { title: "Prototypes & Inheritance", description: "Working with JavaScript's prototype-based inheritance", icon: "fa-sitemap" },
        { title: "Error Handling", description: "Implementing try/catch and custom error types", icon: "fa-bug" },
        { title: "Asynchronous JavaScript", description: "Using callbacks, promises, and async/await", icon: "fa-clock" },
        { title: "ES6+ Features", description: "Leveraging modern JavaScript capabilities", icon: "fa-rocket" }
      ]
    },
    3: {
      title: "DOM Manipulation & Events",
      description: "Learn how to interact with the Document Object Model to create dynamic, interactive web applications that respond to user actions.",
      topics: [
        { title: "DOM Selection", description: "Finding and selecting DOM elements efficiently", icon: "fa-search" },
        { title: "DOM Manipulation", description: "Creating, modifying, and removing elements", icon: "fa-edit" },
        { title: "Event Handling", description: "Working with event listeners and the event object", icon: "fa-bolt" },
        { title: "Form Handling", description: "Validating and processing form inputs", icon: "fa-wpforms" },
        { title: "Browser Storage", description: "Using cookies, localStorage, and sessionStorage", icon: "fa-database" }
      ]
    },
    4: {
      title: "Advanced Web Development",
      description: "Explore advanced concepts like API integration, performance optimization, and modern development practices that are essential for building professional applications.",
      topics: [
        { title: "Fetch API & AJAX", description: "Making HTTP requests and handling responses", icon: "fa-server" },
        { title: "ES Modules", description: "Organizing code with ES modules and imports/exports", icon: "fa-cubes" },
        { title: "Performance Optimization", description: "Techniques for faster JavaScript execution", icon: "fa-tachometer-alt" },
        { title: "Security Best Practices", description: "Preventing XSS, CSRF, and other vulnerabilities", icon: "fa-shield-alt" },
        { title: "Testing & Debugging", description: "Unit testing and debugging strategies", icon: "fa-vial" }
      ]
    }
  };

  const weekTopics: Record<number, Topic[]> = {
    1: [
      {
        title: "Variables & Data Types",
        description: "Understand JavaScript's dynamic typing and key data types including string, number, boolean, null, undefined, symbol, and object. Learn variable declaration with var, let, and const, and their scope differences.",
        features: [
          "Type conversion and coercion examples",
          "Primitive vs reference type comparisons",
          "Variable scope visualization"
        ]
      },
      {
        title: "Functions",
        description: "Master JavaScript functions including function declarations, expressions, arrow functions, and IIFE patterns. Understand 'this' keyword binding and function context.",
        features: [
          "Function parameter handling",
          "Arrow function scope demo",
          "Function currying examples"
        ]
      },
      {
        title: "Objects & Arrays",
        description: "Learn object creation patterns, property access, and array manipulation. Explore methods like map, filter, reduce and understand object property descriptors.",
        features: [
          "Object methods and property attributes",
          "Array transformation visualizations",
          "Destructuring patterns"
        ]
      }
    ],
    2: [
      {
        title: "Scope & Closures",
        description: "Understand lexical scope, closure creation, and practical applications in JavaScript. Learn module patterns and data encapsulation techniques.",
        features: [
          "Closure visualization",
          "Practical closure examples",
          "Memory management considerations"
        ]
      },
      {
        title: "Asynchronous JavaScript",
        description: "Master JavaScript's asynchronous patterns including callbacks, promises, async/await, and generators. Learn error handling for asynchronous operations.",
        timeComplexity: "N/A - Event-driven",
        spaceComplexity: "O(1) to O(n) depending on operations",
        features: [
          "Promise chain visualization",
          "Async/await flow diagrams",
          "Real-world API integration examples"
        ]
      },
      {
        title: "ES6+ Features",
        description: "Explore modern JavaScript features including template literals, spread/rest operators, default parameters, destructuring, optional chaining, and nullish coalescing.",
        features: [
          "Syntax comparison with older JavaScript",
          "Performance improvement examples",
          "Browser compatibility considerations"
        ]
      }
    ],
    3: [
      {
        title: "DOM Manipulation",
        description: "Learn efficient DOM manipulation techniques including creation, traversal, and modification. Understand performance considerations and browser rendering.",
        features: [
          "DOM tree visualization",
          "Performance optimization techniques",
          "Dynamic content generation demo"
        ]
      },
      {
        title: "Event Handling",
        description: "Master event propagation, delegation, and custom events. Learn to optimize event listeners and prevent memory leaks in single-page applications.",
        features: [
          "Event bubbling and capturing visualizations",
          "Event delegation patterns",
          "Custom event implementation"
        ]
      },
      {
        title: "Fetch API & AJAX",
        description: "Understand modern HTTP requests using Fetch API, JSON handling, and error management. Compare with older XMLHttpRequest approaches.",
        features: [
          "Request/response cycle visualization",
          "Error handling strategies",
          "Async data fetching patterns"
        ]
      }
    ],
    4: [
      {
        title: "Performance Optimization",
        description: "Learn techniques for optimizing JavaScript execution including memoization, debouncing, throttling, and efficient DOM operations. Understand browser rendering pipeline.",
        features: [
          "Memory usage profiling",
          "Runtime optimization techniques",
          "Code splitting strategies"
        ]
      },
      {
        title: "Security Best Practices",
        description: "Master essential security concepts including input validation, output encoding, and safe API usage. Learn to identify and prevent common vulnerabilities.",
        features: [
          "Common vulnerability demonstrations",
          "Secure coding patterns",
          "Security testing approaches"
        ]
      },
      {
        title: "Testing & Debugging",
        description: "Implement comprehensive testing strategies including unit, integration, and end-to-end testing. Master debugging tools and techniques for complex applications.",
        features: [
          "Testing framework integration",
          "Debugging workflow optimization",
          "Error tracking and logging"
        ]
      }
    ]
  };

  return (
    <div className="learning-roadmap">
      <div className="roadmap-header">
        <h1>JavaScript Learning Roadmap</h1>
        <p>A comprehensive guide to mastering JavaScript for interviews and real-world development</p>
      </div>

      <div className="week-selector">
        {Object.keys(weeks).map((week) => (
          <button
            key={week}
            className={`week-btn ${parseInt(week) === activeWeek ? 'active' : ''}`}
            onClick={() => setActiveWeek(parseInt(week))}
          >
            Week {week}
          </button>
        ))}
      </div>

      <div className="week-content">
        <div className="week-header">
          <h2>{weeks[activeWeek].title}</h2>
          <p>{weeks[activeWeek].description}</p>
        </div>

        <div className="week-topics">
          {weeks[activeWeek].topics.map((topic, index) => (
            <div className="topic-card" key={index}>
              <div className="topic-icon">
                <i className={`fas ${topic.icon}`}></i>
              </div>
              <div className="topic-content">
                <h3>{topic.title}</h3>
                <p>{topic.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="detailed-topics">
          <h2>Detailed Topic Exploration</h2>
          <div className="topic-grid">
            {weekTopics[activeWeek].map((topic, index) => (
              <div className="detailed-topic-card" key={index}>
                <h3>{topic.title}</h3>
                <p>{topic.description}</p>
                
                {(topic.timeComplexity || topic.spaceComplexity) && (
                  <div className="complexity-info">
                    {topic.timeComplexity && (
                      <div className="complexity">
                        <span>Time Complexity:</span> {topic.timeComplexity}
                      </div>
                    )}
                    {topic.spaceComplexity && (
                      <div className="complexity">
                        <span>Space Complexity:</span> {topic.spaceComplexity}
                      </div>
                    )}
                  </div>
                )}
                
                <div className="feature-list">
                  <h4>Key Features</h4>
                  <ul>
                    {topic.features.map((feature, idx) => (
                      <li key={idx}>
                        <i className="fas fa-check-circle"></i>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div className="topic-footer">
                  <button className="explore-btn">
                    <i className="fas fa-external-link-alt"></i> Explore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 