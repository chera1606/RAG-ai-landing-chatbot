document.addEventListener("DOMContentLoaded", () => {
  const trigger = document.getElementById("chat-trigger");
  const windowEl = document.getElementById("chat-window");
  const chatForm = document.getElementById("chat-form");
  const chatBody = document.getElementById("chat-body");
  const chatInput = document.getElementById("chat-input");
  const typing = document.getElementById("typing-indicator");
  const historyList = document.getElementById("chat-history-list");
  const newChatBtn = document.getElementById("new-chat-btn");

  let currentConversationId = null;

  // Toggle Chat Window
  if (trigger) trigger.onclick = () => windowEl.classList.toggle("hidden");

  // Start Chatting Button (Hero Section)
  const startChatBtn = document.getElementById("start-chat-btn");
  if (startChatBtn) {
    startChatBtn.onclick = () => {
      const token = localStorage.getItem("token");
      if (token) {
        windowEl.classList.remove("hidden");
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        loadHistory(); // Load history when opening
      } else {
        window.location.href = "/login";
      }
    };
  }

  // Close Chat
  const closeBtn = document.getElementById("close-chat");
  if (closeBtn) {
    closeBtn.onclick = () => windowEl.classList.add("hidden");
  }

  // New Chat Button
  if (newChatBtn) {
    newChatBtn.onclick = () => {
      currentConversationId = null;
      chatBody.innerHTML = `
        <div class="msg ai">
          Hello! I can answer questions about ASTU documents. How can I help?
        </div>`;

      // Remove active class from history items
      document.querySelectorAll(".history-item").forEach(el => el.classList.remove("active"));
    };
  }

  // Load History Function
  async function loadHistory() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/rag/history", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const conversations = await res.json();

      historyList.innerHTML = "";
      conversations.forEach(conv => {
        const div = document.createElement("div");
        div.className = "history-item";
        if (conv._id === currentConversationId) div.classList.add("active");
        div.innerText = conv.title || "New Conversation";
        div.onclick = () => loadConversation(conv._id);
        historyList.appendChild(div);
      });
    } catch (err) {
      console.error("Failed to load history", err);
    }
  }

  // Load Specific Conversation
  async function loadConversation(id) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`/api/rag/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const conv = await res.json();

      currentConversationId = conv._id;
      chatBody.innerHTML = ""; // Clear current chat

      conv.messages.forEach(msg => {
        appendMessage(msg.role === "user" ? "user" : "ai", msg.content);
      });

      // Update Active State in Sidebar
      document.querySelectorAll(".history-item").forEach(el => el.classList.remove("active"));
      // Refetch history to update UI (lazy way to set active class properly if DOM rebuilt)
      loadHistory();
    } catch (err) {
      console.error("Failed to load conversation", err);
    }
  }

  // Send Message
  if (chatForm) {
    chatForm.onsubmit = async (e) => {
      e.preventDefault();
      const query = chatInput.value.trim();
      const token = localStorage.getItem("token");
      if (!query || !token) return;

      chatInput.value = "";
      appendMessage("user", query);
      typing.classList.remove("hidden");

      const aiBubble = appendMessage("ai", "");
      try {
        const response = await fetch("/api/rag/query", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ query, conversationId: currentConversationId }),
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        typing.classList.add("hidden");

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          aiBubble.innerText += decoder.decode(value);
          chatBody.scrollTop = chatBody.scrollHeight;
        }

        // Refresh history list to show new conversation title if it was new
        if (!currentConversationId) {
          // Wait a bit or assume the backend created it. 
          // Ideally backend returns the new ID in headers or we reload list.
          setTimeout(loadHistory, 1000);
        }

      } catch (err) {
        typing.classList.add("hidden");
        aiBubble.innerText = "Error connecting to AI.";
      }
    };
  }

  function appendMessage(role, text) {
    const div = document.createElement("div");
    div.className = `msg ${role}`;
    div.innerText = text; // Uses innerText for safety, but innerHTML needed for markdown rendering if we wanted that.
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
    return div;
  }

  // Initial load if already logged in and widget open? 
  // Maybe just call loadHistory on page load if token exists?
  if (localStorage.getItem("token")) {
    loadHistory();
  }
});
