import { getConstants } from './constants.js';

let otpCountdown = null;
let otpValidityCountdown = null;

document.addEventListener("DOMContentLoaded", async () => {
  const { BACKEND_URL } = getConstants();
  const softwareSelect = document.getElementById("softwareName");
  const note = document.getElementById("otpNote");

const softwareList = ["ChatGPT Plus", "ChatGPT Pro", "Grok Ai", "Claude AI", "NetFlix", "Keysearch", "VOC_AI", "Canva"];
softwareList.forEach(name => {
  const option = document.createElement("option");
  option.value = name;
  option.textContent = name;
  softwareSelect.appendChild(option);
});

// Đặt ChatGPT Plus là giá trị mặc định
softwareSelect.value = "ChatGPT Plus";


  if (note) {
    note.style.display = "none";
  }
});

document.getElementById("btnGetOtp").addEventListener("click", async () => {
  const email = document.getElementById("emailDangKy").value.trim();
  const software = "ChatGPT Plus"; // Mặc định là ChatGPT Plus
  const otpSource = "authy"; // mặc định luôn dùng Authy
  const output = document.getElementById("otpResult");
  const btn = document.getElementById("btnGetOtp");

  btn.disabled = true;
  btn.textContent = "⏳ Đang xử lý...";
  output.innerHTML = `<div class="message-box message-processing">🔄 Đang kiểm tra thông tin và lấy OTP...</div>`;


  if (!email) {
    alert("Vui lòng nhập email của bạn!");
    btn.disabled = false;
    btn.textContent = "Lấy OTP";
    return;
  }

  const { BACKEND_URL } = getConstants();

  // Step 1: Gọi check
  const checkRes = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "getOtpCheck",
      email,
      software,
      otpSource
    })
  });

  const checkResult = await checkRes.json();

  if (checkResult.status === "error") {
    const messageClass = checkResult.message.includes("hết hạn") ? "message-warning" : "message-error";
    output.innerHTML = `<div class="message-box ${messageClass} message-multiline">${checkResult.message}</div>`;
    btn.disabled = false;
    btn.textContent = "Lấy OTP";
    return;
  }

const now = Date.now();
const msUntilNextOtp = 30000 - (now % 30000);
const secondsLeft = Math.ceil(msUntilNextOtp / 1000);

if (secondsLeft < 20) {
  const delay = msUntilNextOtp + 1000; // đợi sang chu kỳ kế tiếp
  let seconds = Math.ceil(delay / 1000);

  output.innerHTML = `<div class="message-box message-info">⏳ Vui lòng đợi ${seconds}s để lấy mã OTP...</div>`;
  clearInterval(otpCountdown);
  otpCountdown = setInterval(() => {
    seconds--;
    output.innerHTML = `<div class="message-box message-info">⏳ Vui lòng đợi ${seconds}s để lấy mã OTP...</div>`;
    if (seconds <= 0) {
      clearInterval(otpCountdown);
      fetchFinalOtp(email, software, otpSource);
    }
  }, 1000);
} else{
  fetchFinalOtp(email, software, otpSource);
}
});

async function fetchFinalOtp(email, software, otpSource) {
  const { BACKEND_URL } = getConstants();
  const output = document.getElementById("otpResult");

  const response = await fetch(BACKEND_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      action: "getOtpFinal",
      email,
      software,
      otpSource
    })
  });

  const result = await response.json();

  if (result.status === "success") {
    const container = document.createElement("div");
    container.className = "otp-success-box";
    container.id = "otpBox";

    const successIcon = document.createElement("div");
    successIcon.textContent = "✅ Lấy mã OTP thành công!";
    successIcon.style.color = "#2E7D32";
    successIcon.style.fontWeight = "500";
    successIcon.style.marginBottom = "16px";

    const otpCode = document.createElement("div");
    otpCode.textContent = result.otp;
    otpCode.className = "otp-code";

    const copyHint = document.createElement("div");
    copyHint.textContent = "👆 Click để sao chép mã";
    copyHint.className = "otp-hint";

    const expireNote = document.createElement("div");
    expireNote.id = "otpExpireNote";
    expireNote.className = "otp-timer";

    const deviceNote = document.createElement("div");
    deviceNote.textContent = result.message || "";
    deviceNote.className = "device-info";

    container.appendChild(successIcon);
    container.appendChild(otpCode);
    container.appendChild(copyHint);
    container.appendChild(expireNote);
    container.appendChild(deviceNote);

    container.addEventListener("click", () => {
      navigator.clipboard.writeText(result.otp);
      // Tạo thông báo tạm thời thay vì alert
      const toast = document.createElement("div");
      toast.className = "message-box message-success";
      toast.textContent = "Đã sao chép mã OTP vào clipboard!";
      toast.style.position = "fixed";
      toast.style.top = "20px";
      toast.style.left = "50%";
      toast.style.transform = "translateX(-50%)";
      toast.style.zIndex = "9999";
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    });

    output.innerHTML = "";
    output.appendChild(container);

    let remain = 30;
    expireNote.textContent = `⏱️ Mã OTP còn hiệu lực trong ${remain}s`;
    clearInterval(otpValidityCountdown);
    otpValidityCountdown = setInterval(() => {
      remain--;
      if (remain > 0) {
        expireNote.textContent = `⏱️ Mã OTP còn hiệu lực trong ${remain}s`;
      } else {
        clearInterval(otpValidityCountdown);
        output.innerHTML = "";
      }
    }, 1000);
  } else {
    const messageClass = result.message && result.message.includes("hết hạn") ? "message-warning" : "message-error";
    output.innerHTML = `<div class="message-box ${messageClass} message-multiline">${result.message || "Không thể lấy OTP."}</div>`;
  }
  const btn = document.getElementById("btnGetOtp");
  btn.disabled = false;
  btn.textContent = "Lấy OTP";
}