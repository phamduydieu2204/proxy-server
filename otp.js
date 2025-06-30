import { getConstants } from './constants.js';
import { MessageRenderer } from './messageRenderer.js';

let otpCountdown = null;
let otpValidityCountdown = null;
let messageRenderer = null;

document.addEventListener("DOMContentLoaded", async () => {
  const { BACKEND_URL } = getConstants();
  const softwareSelect = document.getElementById("softwareName");
  const note = document.getElementById("otpNote");
  const output = document.getElementById("otpResult");
  
  // Khởi tạo message renderer
  messageRenderer = new MessageRenderer(output);

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
  messageRenderer.render('WAITING_FOR_OTP');


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
    messageRenderer.render(checkResult.code || 'SYSTEM_ERROR', checkResult.data);
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

  messageRenderer.render('COUNTDOWN_WAITING', { seconds });
  clearInterval(otpCountdown);
  otpCountdown = setInterval(() => {
    seconds--;
    messageRenderer.render('COUNTDOWN_WAITING', { seconds });
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
    const otpData = {
      otp: result.otp,
      deviceInfo: result.data ? `Đã sử dụng ${result.data.currentDevices}/${result.data.maxDevices} thiết bị` : null
    };
    messageRenderer.renderOTPSuccess(otpData);
  } else {
    messageRenderer.render(result.code || 'SYSTEM_ERROR', result.data);
  }
  const btn = document.getElementById("btnGetOtp");
  btn.disabled = false;
  btn.textContent = "Lấy OTP";
}