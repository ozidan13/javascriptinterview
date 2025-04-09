# JavaScript Interview Q&A

A comprehensive Next.js application featuring a collection of JavaScript interview questions and answers, designed to help developers prepare for technical interviews.

![JavaScript Interview Q&A Screenshot](https://your-screenshot-url-here.png)

## 🚀 Features

- **Extensive Question Collection**: Over 470+ JavaScript interview questions and answers
- **Topic Categorization**: Questions categorized by topics (Basics, Functions, Objects, Arrays, Advanced)
- **Interactive Dashboard**: Visual representation of question distribution using Chart.js
- **Search Functionality**: Easily search through questions to find specific topics
- **Bookmarking System**: Save your favorite questions for later review
- **Recently Viewed**: Keep track of questions you've recently studied
- **Dark/Light Theme**: Toggle between dark and light modes for comfortable reading
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Syntax Highlighting**: Code examples with proper syntax highlighting

## 🛠️ Tech Stack

- **Framework**: Next.js 15.2.5
- **Language**: TypeScript
- **Styling**: CSS with custom variables for theming
- **Visualization**: Chart.js for topic distribution graph
- **Markdown Processing**: Marked.js for rendering answer content
- **Syntax Highlighting**: Highlight.js for code examples
- **Icons**: Font Awesome for UI icons

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v18.0.0 or later)
- npm (v8.0.0 or later)

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/ozidan13/javascriptinterview.git
cd javascriptinterview
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

## 🚀 Deployment

This application is set up for easy deployment on Vercel. The build configuration has been optimized to ensure smooth deployment.

```bash
# Build for production
npm run build

# Start the production server
npm start
```

## 📄 Project Structure

```
javascriptinterview/
├── public/                 # Static files
│   ├── datajs.json         # Questions and answers data
│   └── ...                 # Other static assets
├── src/                    # Source code
│   ├── app/                # Next.js app directory
│   │   ├── page.tsx        # Main application component
│   │   ├── layout.tsx      # Layout component with Font Awesome integration
│   │   ├── js-qa-styles.css # Application styles
│   │   └── globals.css     # Global styles
│   └── ...                 # Other source files
├── .eslintrc.json          # ESLint configuration
├── next.config.js          # Next.js configuration
├── package.json            # Project dependencies and scripts
└── tsconfig.json           # TypeScript configuration
```

## 📱 Usage

- **Dashboard**: View statistics about question distribution by topic
- **All Questions**: Browse and search through all available questions
- **Bookmarks**: Access your saved questions
- **Search**: Find specific questions by typing in the search box
- **Filtering**: Filter questions by topic using the category buttons
- **Sorting**: Sort questions by ID or alphabetically
- **Theme Toggle**: Switch between light and dark themes

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👏 Acknowledgments

- Special thanks to all contributors who have helped to build this resource
- JavaScript community for providing valuable interview insights
- Next.js team for their excellent framework

---

Made with ❤️ by [Osama Zidan](https://github.com/ozidan13)
