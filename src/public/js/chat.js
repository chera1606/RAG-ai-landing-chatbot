document.addEventListener("DOMContentLoaded", () => {
  const trigger = document.getElementById("chat-trigger");
  const windowEl = document.getElementById("chat-window");
  const chatForm = document.getElementById("chat-form");
  const chatBody = document.getElementById("chat-body");
  const chatInput = document.getElementById("chat-input");
  const typing = document.getElementById("typing-indicator");

  if (trigger) trigger.onclick = () => windowEl.classList.toggle("hidden");

  const startChatBtn = document.getElementById("start-chat-btn");
  if (startChatBtn) {
    startChatBtn.onclick = () => {
      const token = localStorage.getItem("token");
      if (token) {
        windowEl.classList.remove("hidden");
        // Scroll to chat
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      } else {
        window.location.href = "/login";
      }
    };
  }

  const closeBtn = document.getElementById("close-chat");
  if (closeBtn) {
    closeBtn.onclick = () => windowEl.classList.add("hidden");
  }

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
          body: JSON.stringify({ query }),
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
      } catch (err) {
        typing.classList.add("hidden");
        aiBubble.innerText = "Error connecting to AI.";
      }
    };
  }

  function appendMessage(role, text) {
    const div = document.createElement("div");
    div.className = `msg ${role}`;
    div.innerText = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
    return div;
  }
});
