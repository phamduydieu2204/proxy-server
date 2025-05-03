import { getConstants } from './constants.js';

document.addEventListener("DOMContentLoaded", async () => {
  const { BACKEND_URL } = getConstants();

  const softwareSelect = document.getElementById("softwareName");
  const note = document.getElementById("otpNote");

  const response = await fetch(BACKEND_URL, {
    method: "POST",
    body: JSON.stringify({ action: "getSoftwareListUnique" }),
    headers: { "Content-Type": "application/json" }
  });

  const result = await response.json();
  console.log("📥 Kết quả getSoftwareListUnique:", result);
  if (result.status === "success" && Array.isArray(result.list)) {
    result.list.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      softwareSelect.appendChild(option);
    });
  }

  // Ghi chú cố định luôn hiện dưới nhãn tiêu đề
  if (note) {
    note.innerHTML = `Nếu phần mềm yêu cầu nhập mã từ ứng dụng xác minh, chọn \"Ứng dụng xác minh\".<br />`
      + `Nếu phần mềm yêu cầu nhập mã được gửi tới email đăng nhập, chọn \"Email\".`;
  }
});

document.getElementById("btnGetOtp").addEventListener("click", async () => {
  const emailDangKy = document.getElementById("emailDangKy").value.trim();
  const software = document.getElementById("softwareName").value;
  const otpSource = document.getElementById("otpSource").value;

  if (!emailDangKy || !software || !otpSource) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  const { BACKEND_URL } = getConstants();
  const response = await fetch(BACKEND_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "getOtpByRequest",
      email: emailDangKy,
      software: software,
      otpSource: otpSource
    }),
    headers: { "Content-Type": "application/json" }
  });

  const result = await response.json();
  console.log("📥 Kết quả getOtpByRequest:", result);
  const output = document.getElementById("otpResult");
  if (result.status === "success") {
    let html = `<strong>Mã OTP:</strong> <code>${result.otp}</code>`;
    if (result.message) {
      html += `<div style="margin-top: 8px; font-size: 0.9em; color: #555;">${result.message}</div>`;
    }
    output.innerHTML = html;
  } else {
    output.textContent = "❌ " + (result.message || "Không thể lấy OTP.");
  }
});
