import { getConstants } from './constants.js';

let otpCountdown = null;
let otpValidityCountdown = null;

document.addEventListener("DOMContentLoaded", async () => {
  const { BACKEND_URL } = getConstants();
  const softwareSelect = document.getElementById("softwareName");
  const note = document.getElementById("otpNote");

  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "getSoftwareListUnique" })
  });

  const result = await response.json();
  if (result.status === "success" && Array.isArray(result.list)) {
    result.list.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      softwareSelect.appendChild(option);
    });
  }

  if (note) {
    note.innerHTML = `💡 <strong>Hướng dẫn:</strong> Nếu phần mềm yêu cầu nhập mã từ ứng dụng xác minh, chọn "<strong>Ứng dụng Authy</strong>".<br />
    Nếu phần mềm gửi mã về email đăng nhập, chọn "<strong>Email</strong>".`;
  }

  //startOtpCountdownTimer(); // hiển thị đồng hồ đếm ngược OTP
});

document.getElementById("btnGetOtp").addEventListener("click", () => {
  const now = Date.now();
  const msUntilNextOtp = 30000 - (now % 30000);

  if (msUntilNextOtp < 10000) {
    const delay = msUntilNextOtp + 30000;
    let seconds = Math.ceil(delay / 1000);
    showMessage(`⏳ Vui lòng đợi ${seconds}s để lấy mã OTP mới...`);
    clearInterval(otpCountdown);
    otpCountdown = setInterval(() => {
      seconds--;
      showMessage(`⏳ Vui lòng đợi ${seconds}s để lấy mã OTP mới...`);
      if (seconds <= 0) {
        clearInterval(otpCountdown);
        requestOtp();
      }
    }, 1000);
  } else {
    requestOtp();
  }
});

function showMessage(text) {
  const output = document.getElementById("otpResult");
  output.innerHTML = `<div style="color:#555; font-size:0.95em;">${text}</div>`;
}

async function requestOtp() {
  const emailDangKy = document.getElementById("emailDangKy").value.trim();
  const software = document.getElementById("softwareName").value;
  const otpSource = document.getElementById("otpSource").value;
  const output = document.getElementById("otpResult");

  if (!emailDangKy || !software || !otpSource) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  const { BACKEND_URL } = getConstants();

  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "getOtpByRequest",
      email: emailDangKy,
      software,
      otpSource
    })
  });

  const result = await response.json();

  if (result.status === "success") {
    // Tạo khung hiển thị OTP
    const container = document.createElement("div");
    container.style.border = "1px dashed #1a73e8";
    container.style.padding = "14px";
    container.style.borderRadius = "8px";
    container.style.backgroundColor = "#f1f8ff";
    container.style.textAlign = "center";
    container.style.cursor = "pointer";
    container.id = "otpBox";

    const otpCode = document.createElement("div");
    otpCode.textContent = result.otp;
    otpCode.style.fontSize = "1.6em";
    otpCode.style.fontWeight = "bold";
    otpCode.style.color = "#1a73e8";
    otpCode.style.marginBottom = "8px";

    const copyHint = document.createElement("div");
    copyHint.textContent = "(Click vào mã OTP để sao chép)";
    copyHint.style.fontSize = "0.85em";
    copyHint.style.color = "#777";

    const expireNote = document.createElement("div");
    expireNote.id = "otpExpireNote";
    expireNote.style.fontSize = "0.85em";
    expireNote.style.color = "#555";
    expireNote.style.marginTop = "10px";

    const deviceNote = document.createElement("div");
    deviceNote.textContent = result.message || "";
    deviceNote.style.marginTop = "6px";

    container.appendChild(otpCode);
    container.appendChild(copyHint);
    container.appendChild(expireNote);
    container.appendChild(deviceNote);

    container.addEventListener("click", () => {
      navigator.clipboard.writeText(result.otp);
      alert("✅ Mã OTP đã được sao chép!");
    });

    output.innerHTML = "";
    output.appendChild(container);

    // Đếm ngược 30s hiệu lực OTP
    let remain = 30;
    expireNote.textContent = `⏱️ Mã OTP còn hiệu lực trong ${remain}s`;
    clearInterval(otpValidityCountdown);
    otpValidityCountdown = setInterval(() => {
      remain--;
      if (remain > 0) {
        expireNote.textContent = `⏱️ Mã OTP còn hiệu lực trong ${remain}s`;
      } else {
        clearInterval(otpValidityCountdown);
        output.innerHTML = ""; // Ẩn toàn bộ khung
      }
    }, 1000);
  } else {
    output.textContent = "❌ " + (result.message || "Không thể lấy OTP.");
  }
}

function startOtpCountdownTimer() {
  const otpNote = document.getElementById("otpNoteTimer");
  if (!otpNote) return;

  setInterval(() => {
    const now = Date.now();
    const msUntilNext = 30000 - (now % 30000);
    const seconds = Math.floor(msUntilNext / 1000);
    otpNote.innerHTML = `🕒 Mã OTP mới sẽ được sinh ra sau <strong>${seconds}s</strong>`;
  }, 1000);
}
