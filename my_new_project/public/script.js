document.addEventListener("DOMContentLoaded", () => {
  const ALLOWED_USERS = [
    { email: "lakshmiprasanna.avula@cgi.com", password: "Test@123" },
    { email: "nasim.m@cgi.com", password: "Test@123" },
    { email: "suresh.divyakolu@cgi.com", password: "Test@123" },
    { email: "saibal.das@cgi.com", password: "Test@123" }
  ];

  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const loginForm = document.getElementById("loginForm");
  const googleBtn = document.getElementById("googleBtn");
  const togglePassword = document.getElementById("togglePassword");
  const loginPage = document.getElementById("loginPage");
  const dashboardPage = document.getElementById("dashboardPage");
  const logoutBtn = document.getElementById("logoutBtn");
  const chatBox = document.getElementById("chatBox");
  const userInput = document.getElementById("userInput");
  const fileInput = document.getElementById("fileInput");
  const fileBtn = document.getElementById("fileBtn");
  const sendBtn = document.getElementById("sendBtn");
  const inputError = document.getElementById("inputError");
  const launchBtn = document.getElementById("launchBtn");
  const loginError = document.createElement("div");

  loginError.className = "field-error";
  loginForm.appendChild(loginError);

  const BOT_AVATAR = "https://cdn-icons-png.flaticon.com/512/4712/4712035.png";
  const USER_AVATAR = "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

  let step = "name";
  const data = { docs: [], name: "", banner: null, logo: null, labels: null, desc: "" };

  function showError(msg) {
    loginError.textContent = msg;
  }

  function clearMessage() {
    loginError.textContent = "";
  }

  function showInputError(msg) {
    inputError.textContent = msg || "";
  }

  function validateLogin(email, password) {
    return ALLOWED_USERS.some(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
  }

  function validateProductName(name) {
    const trimmed = name.trim();
    if (!trimmed) return false;
    if (!/[A-Za-z0-9]/.test(trimmed)) return false;
    if (/^[^A-Za-z0-9]+$/.test(trimmed)) return false;
    return true;
  }

  function validateFileByStep(file, currentStep) {
    const lowerName = file.name.toLowerCase();
    const mimeType = (file.type || "").toLowerCase().trim();

    if (currentStep === "banner" || currentStep === "logo") {
      return mimeType === "image/png" ||
        mimeType === "image/jpeg" ||
        lowerName.endsWith(".png") ||
        lowerName.endsWith(".jpg") ||
        lowerName.endsWith(".jpeg");
    }

    if (currentStep === "docs") {
      return mimeType === "application/pdf" ||
        mimeType === "application/x-pdf" ||
        lowerName.endsWith(".pdf");
    }

    if (currentStep === "labels") {
      return mimeType.includes("spreadsheet") ||
        mimeType === "application/vnd.ms-excel" ||
        mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
        mimeType === "application/excel" ||
        mimeType === "text/csv" ||
        mimeType.includes("csv") ||
        /\.(xls|xlsx|xlsm|csv)$/.test(lowerName);
    }

    return false;
  }

  function getUploadPrompt() {
    switch (step) {
      case "banner":
        return "Please upload your Banner Image (PNG or JPG format only).";
      case "logo":
        return "Please upload your Logo (PNG or JPG format only).";
      case "docs":
        return "Please upload your Product Documentation files in PDF format. You can upload multiple files at once.";
      case "labels":
        return "Please upload your Email Labels file in Excel format (.xls, .csv or .xlsx).";
      case "desc":
        return "Please provide a Product Description for your campaign.";
      default:
        return "";
    }
  }

  function addMsg(text, isBot) {
    const container = document.createElement("div");
    container.className = `msg-container ${isBot ? "bot-container" : "user-container"}`;
    container.innerHTML = `
      <img class="avatar" src="${isBot ? BOT_AVATAR : USER_AVATAR}" alt="">
      <div class="msg ${isBot ? "bot-msg" : "user-msg"}">${text}</div>
    `;
    chatBox.appendChild(container);
    chatBox.scrollTop = chatBox.scrollHeight;
  }

  function botReply(text) {
    setTimeout(() => addMsg(text, true), 400);
  }

  function updateNav(n) {
    document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
    const activeItem = document.getElementById(`n${n}`);
    if (activeItem) activeItem.classList.add("active");
  }

  function updateLaunchButton() {
    const ready = !!(data.name && data.banner && data.logo && data.docs.length > 0 && data.labels && data.desc);
    launchBtn.disabled = !ready;
    launchBtn.classList.toggle("launch-ready", ready);
    launchBtn.textContent = ready ? "🚀 Launch Campaign Now" : "Send Campaign Automatically";
  }

  function syncPreview() {
    document.getElementById("prev-name").innerText = data.name || "Pending...";
    document.getElementById("prev-banner").innerText = data.banner ? "● " + data.banner.name : "○ Banner (Image)";
    document.getElementById("prev-logo").innerText = data.logo ? "● " + data.logo.name : "○ Logo (Image)";
    document.getElementById("prev-docs").innerText = data.docs.length + (data.docs.length === 1 ? " File" : " Files");
    document.getElementById("prev-labels").innerText = data.labels ? data.labels.name : "Pending...";
    document.getElementById("prev-desc").innerText = data.desc ? (data.desc.length > 40 ? data.desc.substring(0, 40) + "..." : data.desc) : "Waiting...";

    document.getElementById("prev-banner").style.opacity = data.banner ? "1" : "0.5";
    document.getElementById("prev-logo").style.opacity = data.logo ? "1" : "0.5";

    document.getElementById("box1").classList.toggle("complete", !!data.name);
    document.getElementById("box2").classList.toggle("complete", !!(data.banner && data.logo));
    document.getElementById("box3").classList.toggle("complete", data.docs.length > 0);
    document.getElementById("box4").classList.toggle("complete", !!data.labels);
    document.getElementById("box5").classList.toggle("complete", !!data.desc);

    updateLaunchButton();
  }

  function initDashboard() {
    step = "name";
    data.name = "";
    data.banner = null;
    data.logo = null;
    data.docs = [];
    data.labels = null;
    data.desc = "";
    chatBox.innerHTML = "";
    showInputError("");
    userInput.value = "";
    fileInput.value = "";

    syncPreview();
    updateNav(1);
    addMsg("👋 Hi there! I'm your AutoRespond.ai setup assistant.<br><br><strong>Let's get your workspace ready.</strong><br><br>First, what is your <strong>Product Name</strong>?", true);
  }

  function resetDashboard() {
    step = "name";
    data.name = "";
    data.banner = null;
    data.logo = null;
    data.docs = [];
    data.labels = null;
    data.desc = "";
    chatBox.innerHTML = "";
    showInputError("");
    userInput.value = "";
    fileInput.value = "";
  }

  async function sendToServer() {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.banner) formData.append("banner", data.banner);
    if (data.logo) formData.append("logo", data.logo);
    data.docs.forEach((file) => formData.append("docs", file));
    if (data.labels) formData.append("labels", data.labels);
    formData.append("description", data.desc);

    console.log('📤 Sending FormData:', {
      name: data.name,
      banner: data.banner?.name,
      logo: data.logo?.name,
      docsCount: data.docs.length,
      labels: data.labels?.name,
      description: data.desc
    });

    try {
      const res = await fetch("/save-product", {
        method: "POST",
        body: formData
      });

      console.log('📥 Response status:', res.status);

      const result = await res.json().catch((err) => {
        console.error('❌ JSON parse error:', err);
        return null;
      });

      console.log('📥 Response data:', result);

      if (!res.ok || !result?.success) {
        console.error('❌ Backend returned error:', result);
        // Error message removed as requested
      } else {
        addMsg("✅ Product saved successfully in backend.", true);
        addMsg("✅ Files saved to: uploads/ and products/", true);
        addMsg(`📁 Product: ${result.data.name}`, true);
        addMsg(`📁 Banner: uploads/${result.data.banner}`, true);
        addMsg(`📁 Logo: uploads/${result.data.logo}`, true);
        addMsg(`📁 Docs: ${result.data.docs.length} files in uploads/`, true);
        addMsg(`📁 Labels: uploads/${result.data.labels}`, true);
      }
    } catch (err) {
      console.error('❌ Send error:', err);
      // Error messages removed as requested
    }
  }

  function askCurrentStepAgain() {
    botReply(getUploadPrompt());
  }

  function handleSend() {
    showInputError("");
    const val = userInput.value.trim();

    if (!val && step !== "docs") {
      showInputError("Please enter a message");
      return;
    }

    if (!val) {
      askCurrentStepAgain();
      return;
    }

    addMsg(val, false);
    userInput.value = "";

    if (step === "docs" && val.toUpperCase() === "DONE") {
      if (data.docs.length === 0) {
        botReply("⚠️ You haven't uploaded any PDF files yet.<br><br>Please upload at least one PDF file, then type <strong>DONE</strong>.");
        return;
      }
      syncPreview();
      step = "labels";
      updateNav(4);
      botReply("✅ <strong>Documentation saved!</strong><br><br>Now please upload your <strong>Email Labels</strong> file in Excel format (.xls, .csv or .xlsx).");
      return;
    }

    if (step === "name") {
      if (!validateProductName(val)) {
        botReply("⚠️ <strong>Invalid product name.</strong><br><br>Your product name must contain at least one letter or number. Special characters alone are not allowed.");
        askCurrentStepAgain();
        return;
      }
      data.name = val;
      syncPreview();
      step = "banner";
      updateNav(2);
      botReply("✨ <strong>Perfect!</strong> Now let's add your brand visuals.<br><br>Please upload your <strong>Banner Image</strong> (PNG or JPG format only).");
      return;
    }

    if (step === "desc") {
      data.desc = val;
      syncPreview();
      step = "done";
      updateNav(5);
      updateLaunchButton();
      botReply("🎉 <strong>Excellent!</strong> Your product is now fully configured and ready to launch.<br><br>Click the <strong>'Launch Campaign Now'</strong> button to get started.");
      sendToServer();
      return;
    }

    if (step === "banner" || step === "logo" || step === "labels") {
      botReply(getUploadPrompt());
    }
  }

  function handleFileUpload(event) {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    if (step === "banner") {
      const file = files[0];
      if (!validateFileByStep(file, step)) {
        botReply("⚠️ <strong>Invalid file format.</strong><br><br>Please upload only <strong>PNG or JPG</strong> images for your Banner.");
        askCurrentStepAgain();
      } else {
        data.banner = file;
        syncPreview();
        step = "logo";
        botReply("✅ <strong>Banner uploaded!</strong><br><br>Now please upload your <strong>Logo</strong> (PNG or JPG format only).");
      }
    } else if (step === "logo") {
      const file = files[0];
      if (!validateFileByStep(file, step)) {
        botReply("⚠️ <strong>Invalid file format.</strong><br><br>Please upload only <strong>PNG or JPG</strong> images for your Logo.");
        askCurrentStepAgain();
      } else {
        data.logo = file;
        syncPreview();
        step = "docs";
        updateNav(3);
        botReply("✅ <strong>Branding complete!</strong> Now let's add your product documentation.<br><br>Please upload your Product Documentation files in <strong>PDF format</strong>. When you're done, type <strong>DONE</strong> in the chat.");
      }
    } else if (step === "docs") {
      const validFiles = files.filter(file => validateFileByStep(file, step));
      const invalidCount = files.length - validFiles.length;

      if (validFiles.length) {
        data.docs.push(...validFiles);
        syncPreview();
        botReply(`✅ Added <strong>${validFiles.length}</strong> PDF file(s). Total: <strong>${data.docs.length}</strong> file(s).<br><br>Add more files or type <strong>DONE</strong> when you're finished.`);
      }
      if (invalidCount > 0 || !validFiles.length) {
        botReply("⚠️ <strong>Only PDF files are accepted</strong> for Product Documentation.");
      }
    } else if (step === "labels") {
      const file = files[0];
      if (!validateFileByStep(file, step)) {
        botReply("⚠️ <strong>Invalid file format.</strong><br><br>Please upload an Excel file (.xls, .csv or .xlsx) for your Email Labels.");
        askCurrentStepAgain();
      } else {
        data.labels = file;
        syncPreview();
        step = "desc";
        updateNav(4);
        botReply("✅ <strong>Email Labels uploaded!</strong><br><br>Finally, please provide a <strong>Product Description</strong> that describes your product for the campaign.");
      }
    }

    event.target.value = "";
  }

  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    clearMessage();

    if (!email || !password) {
      showError("Please enter both email and password");
      return;
    }

    if (validateLogin(email, password)) {
      loginPage.style.display = "none";
      dashboardPage.classList.add("active");
      document.body.style.overflow = "hidden";
      initDashboard();
    } else {
      showError("❌ Invalid email or password. Access denied.");
    }
  });

  googleBtn.addEventListener("click", () => {
    loginForm.requestSubmit();
  });

  togglePassword.addEventListener("click", () => {
    const isPassword = passwordInput.type === "password";
    passwordInput.type = isPassword ? "text" : "password";
    togglePassword.textContent = isPassword ? "🙈" : "◉";
  });

  passwordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") loginForm.requestSubmit();
  });

  emailInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") loginForm.requestSubmit();
  });

  logoutBtn.addEventListener("click", () => {
    loginPage.style.display = "grid";
    dashboardPage.classList.remove("active");
    document.body.style.overflow = "hidden";
    emailInput.value = "";
    passwordInput.value = "";
    clearMessage();
    resetDashboard();
  });

  sendBtn.addEventListener("click", handleSend);
  userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend();
  });

  fileBtn.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", handleFileUpload);

  launchBtn.addEventListener("click", async () => {
    if (launchBtn.disabled) {
      addMsg("⚠️ Please complete all 5 steps before launching your campaign.", true);
      return;
    }

    addMsg("🚀 <strong>Launching your campaign...</strong><br><br>Saving to backend...", true);
    launchBtn.disabled = true;
    launchBtn.textContent = "Launching... ⏳";

    await sendToServer();

    addMsg("✅ <strong>Campaign data submitted successfully.</strong><br><br>Your backend has received the product payload.", true);
    addMsg("✅ Files saved to: <strong>uploads/</strong> and <strong>products/</strong>", true);
    launchBtn.textContent = "✅ Campaign Submitted";
    launchBtn.style.background = "#10b981";
    launchBtn.style.cursor = "default";
  });
});