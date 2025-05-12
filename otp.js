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


  if (note) {
    note.style.display = "none";
  }
});

document.getElementById("btnGetOtp").addEventListener("click", async () => {
  const email = document.getElementById("emailDangKy").value.trim();
  const software = document.getElementById("softwareName").value;
  const otpSource = "authy"; // mặc định luôn dùng Authy
  const output = document.getElementById("otpResult");
  const btn = document.getElementById("btnGetOtp");

  btn.disabled = true;
  btn.textContent = "⏳ Đang xử lý...";
  output.innerHTML = `<div style="color: #555;">🔄 Đang kiểm tra thông tin và lấy OTP...</div>`;


  if (!email || !software || !otpSource) {
    alert("Vui lòng điền đầy đủ thông tin!");
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
    output.innerHTML = `<div style="color: red;">❌ ${checkResult.message}</div>`;
    return;
  }

const now = Date.now();
const msUntilNextOtp = 30000 - (now % 30000);
const secondsLeft = Math.ceil(msUntilNextOtp / 1000);

if (secondsLeft < 20) {
  const delay = msUntilNextOtp + 1000; // đợi sang chu kỳ kế tiếp
  let seconds = Math.ceil(delay / 1000);

  output.innerHTML = `<div style="color: #555;">⏳ Vui lòng đợi ${seconds}s để lấy mã OTP...</div>`;
  clearInterval(otpCountdown);
  otpCountdown = setInterval(() => {
    seconds--;
    output.innerHTML = `<div style="color: #555;">⏳ Vui lòng đợi ${seconds}s để lấy mã OTP...</div>`;
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
    deviceNote.textContent = result.message ? `${result.message.split("/")[0].trim()} thiết bị` : "";
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
    output.textContent = "❌ " + (result.message || "Không thể lấy OTP.");
  }
  const btn = document.getElementById("btnGetOtp");
  btn.disabled = false;
  btn.textContent = "Lấy OTP";
}