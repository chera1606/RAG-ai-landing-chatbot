# 🤖 Modern AI RAG Chatbot & Landing Page

A full-stack, production-ready AI solution that combines a modern landing page with a powerful RAG (Retrieval-Augmented Generation) chatbot. Built with Node.js, EJS, and MongoDB, it allows users to chat with a knowledge base grounded in uploaded documents, ensuring zero hallucinations and high-context accuracy.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)

---

## ✨ Key Features

### 🔐 Security & Authentication
- **User Authentication**: Secure signup/login using Email/Username and Password
- **Session Management**: JWT-based protected routes for the Chatbot and Admin Dashboard
- **Access Control**: Public landing page, but AI features and document management are restricted to authorized users
- **Google OAuth**: Optional social login integration

### 🧠 AI & RAG Pipeline
- **Smart Retrieval**: Uses Google Gemini (`text-embedding-004`) to convert queries into vectors
- **Context-Aware Chat**: Maintains conversation history and retrieves relevant document chunks from MongoDB Atlas
- **Streaming Responses**: Real-time "typing" indicators and streaming text output for a premium UX
- **Strict Grounding**: The AI is instructed to answer only based on provided context (No Hallucinations)
- **Vector Search**: MongoDB Atlas Vector Search for efficient similarity matching

### 🛠 Admin & Data Management
- **Document Processing**: Upload PDF or TXT files through the admin dashboard
- **Auto-Chunking**: Implements RecursiveCharacterTextSplitter (Size: 700, Overlap: 60) for optimal retrieval
- **History Storage**: Every conversation is saved to MongoDB, allowing users to resume past chats seamlessly
- **Document Management**: View, delete, and manage uploaded documents

### 🎨 Modern UI/UX
- **Professional Design**: Gradient accents, smooth animations, and modern aesthetics
- **Dark Mode**: Full dark mode support across all pages
- **Responsive Layout**: Mobile-friendly design that works on all devices
- **Interactive Chat**: Floating chat widget with history sidebar
- **Animated Components**: Smooth transitions and hover effects throughout

---

## 🛠 Tech Stack

### Frontend
- **EJS Templates**: Server-side rendering for dynamic pages
- **CSS3**: Modern styling with CSS variables and gradients
- **Vanilla JavaScript**: No framework dependencies for lightweight performance

### Backend
- **Node.js**: Runtime environment (v18.x or higher)
- **Express.js**: Web application framework
- **Multer**: File upload handling
- **Passport.js**: Authentication middleware

### Database
- **MongoDB Atlas**: Cloud database with Vector Search enabled
- **Mongoose**: ODM for MongoDB

### AI Framework
- **LangChain.js**: Framework for building AI applications
- **Google Generative AI (Gemini)**: LLM for chat responses
- **WebPDFLoader**: PDF text extraction
- **RecursiveCharacterTextSplitter**: Document chunking

### Security
- **JWT**: JSON Web Tokens for session management
- **bcrypt**: Password hashing
- **express-session**: Session middleware

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed and configured:

- **Node.js**: v18.x or higher ([Download](https://nodejs.org/))
- **MongoDB Atlas Account**: Required for Vector Search capabilities ([Sign up](https://www.mongodb.com/cloud/atlas))
- **Google AI API Key**: Obtain from [Google AI Studio](https://makersuite.google.com/app/apikey)
- **Git**: For version control

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/chera1606/RAG-ai-landing-chatbot.git
cd RAG-ai-landing-chatbot
```


### 5. Start the Application

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The application will be available at `http://localhost:5019`

---

## 📖 Usage Guide

### For Users

1. **Register**: Create an account to access the dashboard
2. **Login**: Sign in with your credentials or use Google OAuth
3. **Chat**: Click the floating chat widget on the landing page
4. **Ask Questions**: Type questions related to uploaded documents
5. **View History**: Access previous conversations from the sidebar

### For Administrators

1. **Access Admin Panel**: Navigate to `/admin` after logging in
2. **Upload Documents**: 
   - Click "Upload Document" 
   - Select a PDF or TXT file
   - Wait for processing and embedding
3. **Manage Documents**: View, download, or delete uploaded documents
4. **Monitor Usage**: Track user interactions and chat history

### Document Processing Flow

```
Upload PDF/TXT → Extract Text → Split into Chunks → Generate Embeddings → Store in MongoDB
```

When a user asks a question:
```
User Query → Generate Query Embedding → Vector Search → Retrieve Relevant Chunks → Generate Response
```

---

## 📁 Project Structure

```
RAG-ai-landing-chatbot/
├── src/
│   ├── config/
│   │   ├── mongo.js           # MongoDB connection
│   │   └── passport.js        # Authentication strategies
│   ├── module/
│   │   ├── auth/
│   │   │   ├── auth.controller.js
│   │   │   ├── auth.service.js
│   │   │   └── auth.routes.js
│   │   ├── rag/
│   │   │   ├── rag.controller.js
│   │   │   ├── rag.service.js
│   │   │   └── rag.routes.js
│   │   └── admin/
│   │       └── admin.routes.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Document.js
│   │   └── ChatHistory.js
│   ├── public/
│   │   ├── css/
│   │   │   └── style.css
│   │   └── js/
│   │       ├── chat.js
│   │       ├── auth.js
│   │       └── theme.js
│   ├── views/
│   │   ├── layout.ejs
│   │   ├── index.ejs
│   │   ├── login.ejs
│   │   ├── register.ejs
│   │   └── admin.ejs
│   └── app.js                 # Express app setup
├── uploads/                   # Temporary file storage
├── .env                       # Environment variables
├── .gitignore
├── package.json
└── README.md
```

---

## 🎯 Features in Detail

### RAG Pipeline Configuration

- **Chunk Size**: 700 characters
- **Chunk Overlap**: 60 characters
- **Embedding Model**: Google `gemini-embedding-001`
- **LLM Model**: Google `gemini-flash-latest` (Primary) / `gemini-pro-latest` (Failover)
- **Vector Dimensions**: 768
- **Similarity Metric**: Cosine similarity

### Chat Features

- ✅ Real-time streaming responses
- ✅ Conversation history persistence
- ✅ Context-aware follow-up questions
- ✅ Typing indicators
- ✅ Message timestamps
- ✅ Chat history sidebar
- ✅ New chat creation
- ✅ Dark mode support

### Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token authentication
- ✅ Protected API routes
- ✅ Session management
- ✅ CORS configuration
- ✅ Input validation
- ✅ SQL injection prevention

---

## 🔧 Configuration Options

### Chunking Strategy

Modify in `src/module/rag/rag.service.js`:

```javascript
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 700,      // Adjust for longer/shorter chunks
  chunkOverlap: 60,    // Adjust overlap for better context
});
```

### AI Model Settings

```javascript
const model = new ChatGoogleGenerativeAI({
  modelName: "gemini-2.0-flash-exp",
  temperature: 0.3,    // Lower = more focused, Higher = more creative
  maxOutputTokens: 2048,
});
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Verify your connection string in `.env`
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure Vector Search is enabled

**Gemini API Errors**
- Verify your API key is valid
- Check API quota limits
- Ensure you're using the correct model name

**File Upload Issues**
- Check `uploads/` directory permissions
- Verify file size limits in `multer` configuration
- Ensure supported file types (PDF, TXT)

**Chat Not Working**
- Check browser console for errors
- Verify JWT token is valid
- Ensure MongoDB connection is active

---

## 📧 Contact

**Developer**: Cherinet Derbie  
**Email**: cherinetderbie@gmail.com  
**Project Link**: [https://github.com/chera1606/RAG-ai-landing-chatbot](https://github.com/chera1606/RAG-ai-landing-chatbot)

---

## 🙏 Acknowledgments

- [LangChain.js](https://js.langchain.com/) - AI framework
- [Google Gemini](https://ai.google.dev/) - LLM provider
- [MongoDB Atlas](https://www.mongodb.com/atlas) - Vector database
- [Express.js](https://expressjs.com/) - Web framework

---

<div align="center">
  <p>Made with ❤️ by Cherinet Derbie</p>
  <p>⭐ Star this repo if you find it helpful!</p>
</div>
