import { getConstants } from './constants.js';
import { MessageRenderer } from './messageRenderer.js';

let otpCountdown = null;
let otpValidityCountdown = null;
let messageRenderer = null;
let lastRequestTime = 0;
let isProcessing = false;
const RATE_LIMIT_DELAY = 5000; // 5 giây

document.addEventListener("DOMContentLoaded", async () => {
  const { SERVICES } = getConstants();
  const softwareSelect = document.getElementById("softwareName");
  const output = document.getElementById("otpResult");
  
  // Khởi tạo message renderer
  messageRenderer = new MessageRenderer(output);

  // Xóa các option hiện tại trừ option đầu tiên
  softwareSelect.innerHTML = '';
  
  // Thêm các dịch vụ từ constants
  SERVICES.forEach((service, index) => {
    const option = document.createElement("option");
    option.value = service.value;
    option.textContent = service.label;
    if (index === 0) option.selected = true; // ChatGPT Plus là mặc định
    softwareSelect.appendChild(option);
  });
});

document.getElementById("btnGetOtp").addEventListener("click", async () => {
  const email = document.getElementById("emailDangKy").value.trim();
  const software = document.getElementById("softwareName").value; // Lấy dịch vụ được chọn
  const otpSource = "authy"; // mặc định luôn dùng Authy
  const output = document.getElementById("otpResult");
  const btn = document.getElementById("btnGetOtp");

  // Rate limiting check
  const now = Date.now();
  if (isProcessing) {
    messageRenderer.render('SYSTEM_ERROR', {
      error: "Đang xử lý yêu cầu trước đó. Vui lòng đợi..."
    });
    return;
  }

  if (now - lastRequestTime < RATE_LIMIT_DELAY) {
    const remainingTime = Math.ceil((RATE_LIMIT_DELAY - (now - lastRequestTime)) / 1000);
    messageRenderer.render('SYSTEM_ERROR', {
      error: `Vui lòng đợi ${remainingTime} giây trước khi thử lại`
    });
    return;
  }

  isProcessing = true;
  lastRequestTime = now;
  btn.disabled = true;
  btn.textContent = "⏳ Đang xử lý...";
  messageRenderer.render('WAITING_FOR_OTP');


  if (!email) {
    alert("Vui lòng nhập email của bạn!");
    isProcessing = false;
    btn.disabled = false;
    btn.textContent = "Lấy OTP";
    return;
  }

  const { BACKEND_URL } = getConstants();

  // Step 1: Gọi check với timeout
  let checkResult;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const checkRes = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getOtpCheck",
        email,
        software,
        otpSource
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!checkRes.ok) {
      throw new Error(`Server error: ${checkRes.status}`);
    }

    checkResult = await checkRes.json();
  } catch (error) {
    console.error("Lỗi kiểm tra OTP:", error);
    if (error.name === 'AbortError') {
      messageRenderer.render('SYSTEM_ERROR', {
        error: "Yêu cầu kiểm tra hết thời gian chờ. Vui lòng thử lại."
      });
    } else {
      messageRenderer.render('SYSTEM_ERROR', {
        error: "Không thể kết nối tới server. Vui lòng thử lại sau."
      });
    }
    isProcessing = false;
    btn.disabled = false;
    btn.textContent = "Lấy OTP";
    return;
  }

  if (checkResult.status === "error") {
    messageRenderer.render(checkResult.code || 'SYSTEM_ERROR', checkResult.data);
    isProcessing = false;
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
    messageRenderer.updateCountdown(seconds);
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
  const btn = document.getElementById("btnGetOtp");

  let result;
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    const response = await fetch(BACKEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "getOtpFinal",
        email,
        software,
        otpSource
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    result = await response.json();
  } catch (error) {
    console.error("Lỗi lấy OTP:", error);
    if (error.name === 'AbortError') {
      messageRenderer.render('SYSTEM_ERROR', {
        error: "Yêu cầu hết thời gian chờ. Vui lòng thử lại."
      });
    } else {
      messageRenderer.render('SYSTEM_ERROR', {
        error: "Server đang gặp sự cố. Vui lòng thử lại sau ít phút."
      });
    }
    isProcessing = false;
    btn.disabled = false;
    btn.textContent = "Lấy OTP";
    return;
  }

  if (result.status === "success") {
    const otpData = {
      otp: result.otp,
      deviceInfo: result.data ? `Đã sử dụng ${result.data.currentDevices}/${result.data.maxDevices} thiết bị` : null
    };
    messageRenderer.renderOTPSuccess(otpData);
  } else {
    messageRenderer.render(result.code || 'SYSTEM_ERROR', result.data);
  }
  isProcessing = false;
  btn.disabled = false;
  btn.textContent = "Lấy OTP";
}