document.addEventListener("DOMContentLoaded", () => {
  const uploadBtn = document.getElementById("upload-btn");
  const textBtn = document.getElementById("text-btn");
  const statusDiv = document.getElementById("status");
  const fileInput = document.getElementById("file-input");
  const fileNameSpan = document.getElementById("file-name");
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.href = "/login";
    return;
  }

  const dropZone = document.getElementById("drop-zone");
  if (dropZone) {
    dropZone.addEventListener("click", () => fileInput.click());

    fileInput.addEventListener("change", () => {
      if (fileInput.files.length > 0) {
        fileNameSpan.textContent = fileInput.files[0].name;
      }
    });

    // Simple Drag & Drop fail-safe
    dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
      dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropZone.classList.remove("dragover");
      if (e.dataTransfer.files.length) {
        fileInput.files = e.dataTransfer.files;
        fileNameSpan.textContent = fileInput.files[0].name;
      }
    });
  }

  if (uploadBtn) {
    uploadBtn.onclick = async () => {
      if (!fileInput.files.length) return alert("Select a file.");
      const formData = new FormData();
      formData.append("file", fileInput.files[0]);

      statusDiv.innerText = "Indexing...";
      try {
        const res = await fetch("/api/upload/file", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        const data = await res.json();
        statusDiv.innerText = data.success ? "Success!" : data.error;
      } catch (err) {
        statusDiv.innerText = "Error uploading.";
      }
    };
  }

  if (textBtn) {
    textBtn.onclick = async () => {
      const text = document.getElementById("raw-text").value;
      try {
        const res = await fetch("/api/upload/text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ text }),
        });
        const data = await res.json();
        statusDiv.innerText = data.success ? "Text Synced!" : data.error;
      } catch (err) {
        statusDiv.innerText = "Error syncing.";
      }
    };
  }
});
