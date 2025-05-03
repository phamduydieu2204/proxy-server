import { getConstants } from './constants.js';

document.addEventListener("DOMContentLoaded", async () => {
  const { BACKEND_URL } = getConstants();

  const softwareSelect = document.getElementById("softwareName");
  const response = await fetch(BACKEND_URL, {
    method: "POST",
    body: JSON.stringify({ action: "getSoftwareListUnique" }),
    headers: { "Content-Type": "application/json" }
  });

  const result = await response.json();
  console.log("📥 Kết quả getSoftwareList:", result);
  if (result.status === "success" && Array.isArray(result.list)) {
    result.list.forEach(name => {
      const option = document.createElement("option");
      option.value = name;
      option.textContent = name;
      softwareSelect.appendChild(option);
    });
  }
});

document.getElementById("btnGetOtp").addEventListener("click", async () => {
  const emailDangKy = document.getElementById("emailDangKy").value.trim();
  const software = document.getElementById("softwareName").value;
  const emailDuocCap = document.getElementById("emailDuocCap").value.trim();

  if (!emailDangKy || !software || !emailDuocCap) {
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
      emailCungCap: emailDuocCap
    }),
    headers: { "Content-Type": "application/json" }
  });

  const result = await response.json();
  console.log("📥 Kết quả getOtpByRequest:", result);
  const output = document.getElementById("otpResult");
  if (result.status === "success") {
    output.innerHTML = `<strong>Mã OTP:</strong> <code>${result.otp}</code>`;
  } else {
    output.textContent = "❌ " + (result.message || "Không thể lấy OTP.");
  }
});
