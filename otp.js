import { getConstants } from './constants.js';

let countdownInterval = null;
let progressInterval = null;

document.addEventListener("DOMContentLoaded", async () => {
  const { BACKEND_URL } = getConstants();
  const softwareSelect = document.getElementById("softwareName");
  const note = document.getElementById("otpNote");

  // Tải danh sách phần mềm
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

  // Ghi chú hướng dẫn
  if (note) {
    note.innerHTML = `💡 <strong>Hướng dẫn:</strong> Nếu phần mềm yêu cầu nhập mã từ ứng dụng xác minh, chọn "<strong>Ứng dụng Authy</strong>".<br />
    Nếu phần mềm gửi mã về email đăng nhập, chọn "<strong>Email</strong>".`;
  }

  // Luôn hiển thị đồng hồ đếm ngược
  startOtpCountdownDisplay();
});

document.getElementById("btnGetOtp").addEventListener("click", () => {
  const now = Date.now();
  const msUntilNextOtp = 30000 - (now % 30000);

  if (msUntilNextOtp < 10000) {
    const waitMs = msUntilNextOtp + 30000;
    let seconds = Math.ceil(waitMs / 1000);
    updateOtpResult(`⏳ Vui lòng đợi ${seconds}s để lấy mã OTP mới...`);
    let countdown = setInterval(() => {
      seconds--;
      updateOtpResult(`⏳ Vui lòng đợi ${seconds}s để lấy mã OTP mới...`);
      if (seconds <= 0) {
        clearInterval(countdown);
        requestOtp();
      }
    }, 1000);
  } else {
    requestOtp();
  }
});

function updateOtpResult(message) {
  const output = document.getElementById("otpResult");
  output.innerHTML = `<div style="color:#555; font-size:0.95em;">${message}</div>`;
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
    output.innerHTML = `
      <strong>Mã OTP:</strong>
      <code id="otpCode" style="cursor:pointer; color:#1a73e8; font-weight:bold;">${result.otp}</code>
      <div style="font-size:0.85em; color:#888; margin-top:4px;">(Click vào mã OTP để sao chép)</div>
      <div id="otpProgressContainer" style="margin-top:10px;">
        <svg height="36" width="36">
          <circle cx="18" cy="18" r="16" stroke="#ccc" stroke-width="3" fill="none"></circle>
          <circle id="otpProgressCircle" cx="18" cy="18" r="16" stroke="#1a73e8" stroke-width="3" fill="none"
            stroke-dasharray="100" stroke-dashoffset="0" transform="rotate(-90 18 18)" />
        </svg>
      </div>
    `;

    document.getElementById("otpCode").addEventListener("click", () => {
      navigator.clipboard.writeText(result.otp);
      alert("✅ Mã OTP đã được sao chép!");
    });

    if (result.message) {
      output.innerHTML += `<div style="margin-top:10px; font-size:0.9em; color:#444;">${result.message}</div>`;
    }

    animateOtpCircle();
  } else {
    output.textContent = "❌ " + (result.message || "Không thể lấy OTP.");
  }
}

function animateOtpCircle() {
  const circle = document.getElementById("otpProgressCircle");
  let progress = 0;
  if (circle) {
    clearInterval(progressInterval);
    progress = 0;
    const step = 100 / 30;
    progressInterval = setInterval(() => {
      progress += step;
      circle.setAttribute("stroke-dashoffset", 100 - progress);
      if (progress >= 100) {
        clearInterval(progressInterval);
      }
    }, 1000);
  }
}

function startOtpCountdownDisplay() {
  const otpNote = document.getElementById("otpNoteTimer");
  if (!otpNote) return;

  setInterval(() => {
    const now = Date.now();
    const msUntilNextOtp = 30000 - (now % 30000);
    const seconds = Math.floor(msUntilNextOtp / 1000);
    otpNote.innerHTML = `🕒 Mã OTP mới sẽ được sinh ra sau <strong>${seconds}s</strong>`;
  }, 1000);
}
