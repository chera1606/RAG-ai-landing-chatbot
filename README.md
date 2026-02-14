 Modern AI RAG Chatbot & Landing Page
 A full-stack, production-ready AI solution that combines a modern landing page with a powerful RAG (Retrieval-Augmented Generation) chatbot. Built with Node.js, EJS, and MongoDB, it allows users to chat with a knowledge base grounded in uploaded documents, ensuring zero hallucinations and high-context accuracy.
✨ Key Features
🔐 Security & Auth
User Authentication: Secure signup/login using Email/Username and Password.
Session Management: JWT-based protected routes for the Chatbot and Admin Dashboard.
Access Control: Public landing page, but AI features and document management are restricted to authorized users.
🧠 AI & RAG Pipeline
Smart Retrieval: Uses Google Gemini (text-embedding-004) to convert queries into vectors.
Context-Aware Chat: Maintains conversation history and retrieves relevant document chunks from MongoDB Atlas.
Streaming Responses: Real-time "typing" indicators and streaming text output for a premium UX.
Strict Grounding: The AI is instructed to answer only based on provided context (No Hallucinations).
🛠 Admin & Data Management
Document Processing: Upload PDF or TXT files.
Auto-Chunking: Implements RecursiveCharacterTextSplitter (Size: 700, Overlap: 60) for optimal retrieval.
History Storage: Every conversation is saved to MongoDB, allowing users to resume past chats seamlessly.
🛠 Tech Stack
Frontend: EJS (Templates), CSS3, Vanilla JavaScript.
Backend: Node.js, Express.js.
Database: MongoDB Atlas (Vector Search enabled).
AI Framework: LangChain.js & Google Generative AI (Gemini).
File Handling: Multer (Uploads) & WebPDFLoader (Extraction).
📋 Prerequisites
Node.js: v18.x or higher.
MongoDB Atlas Account: Required for Vector Search capabilities.
Google AI API Key: Obtain from Google AI Studio.   
🚀 Usage Guide
Register: Create an account to access the dashboard.
Admin Sync: Go to the Admin panel and upload a PDF (e.g., a company handbook).
Wait for Embedding: The system will split the text into chunks, generate vectors, and save them to Atlas.
Chat: Open the floating chat widget on the landing page and ask questions related to the document. 

🤝 Contact
cherinetderbie@gmail.com
Project Link:https://github.com/chera1606/RAG-ai-landing-chatbot
