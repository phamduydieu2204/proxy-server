// 🎨 MESSAGE RENDERER - Render đẹp mắt cho từng template
import { MESSAGE_TEMPLATES } from './messageTemplates.js';

export class MessageRenderer {
  constructor(container) {
    this.container = container;
  }

  // 🎯 Render message theo template
  render(templateKey, data = {}) {
    const template = MESSAGE_TEMPLATES[templateKey];
    if (!template) {
      console.warn(`Template ${templateKey} not found`);
      return this.renderFallback(data.message || 'Unknown error');
    }

    const messageHTML = this.buildMessageHTML(template, data);
    this.container.innerHTML = messageHTML;
    
    // Add click handlers
    this.attachEventListeners();
  }

  // 🔄 Cập nhật chỉ countdown mà không re-render toàn bộ
  updateCountdown(seconds) {
    const countdownElement = this.container.querySelector('.countdown-seconds');
    if (countdownElement) {
      countdownElement.textContent = seconds;
    } else {
      // Fallback nếu không tìm thấy element
      console.warn('Countdown element not found, using fallback render');
      this.render('COUNTDOWN_WAITING', { seconds });
    }
  }

  // 🏗️ Xây dựng HTML cho message
  buildMessageHTML(template, data) {
    const { type, icon, title, content, suggestions, note, action, actions } = template;
    
    let html = `<div class="message-card message-${type}">`;
    
    // Header với icon và title
    html += `
      <div class="message-header">
        <div class="message-icon">${icon}</div>
        <div class="message-title">${this.replaceVariables(title, data)}</div>
      </div>
    `;
    
    // Content
    if (content) {
      html += `
        <div class="message-content">
          ${this.replaceVariables(content, data)}
        </div>
      `;
    }
    
    // Suggestions
    if (suggestions && suggestions.length > 0) {
      html += `<div class="message-suggestions">`;
      html += `<div class="suggestion-header">💡 Gợi ý:</div>`;
      suggestions.forEach(suggestion => {
        html += `<div class="suggestion-item">• ${this.replaceVariables(suggestion, data)}</div>`;
      });
      html += `</div>`;
    }
    
    // Note
    if (note) {
      html += `
        <div class="message-note">
          <em>${this.replaceVariables(note, data)}</em>
        </div>
      `;
    }
    
    // Action buttons (multiple actions support)
    if (actions && actions.length > 0) {
      html += `<div class="message-actions">`;
      actions.forEach(actionItem => {
        const buttonClass = this.getActionButtonClass(actionItem.type || type);
        html += `
          <a href="${actionItem.link}" target="_blank" class="action-button ${buttonClass}">
            ${actionItem.text}
          </a>
        `;
      });
      html += `</div>`;
    } else if (action) {
      // Backward compatibility for single action
      html += `
        <div class="message-action">
          <a href="${action.link}" target="_blank" class="action-button action-${type}">
            ${action.text}
          </a>
        </div>
      `;
    }
    
    html += `</div>`;
    return html;
  }

  // 🔄 Thay thế variables trong template
  replaceVariables(text, data) {
    if (!data) return text;
    
    return text.replace(/\{(\w+)\}/g, (match, key) => {
      return data[key] !== undefined ? data[key] : match;
    });
  }

  // 🎨 Lấy CSS class cho action button
  getActionButtonClass(type) {
    const classMap = {
      'primary': 'action-primary',
      'facebook': 'action-facebook', 
      'zalo': 'action-zalo',
      'error': 'action-error',
      'warning': 'action-warning',
      'success': 'action-success',
      'info': 'action-info'
    };
    return classMap[type] || 'action-primary';
  }

  // 📱 Render fallback khi không có template
  renderFallback(message) {
    this.container.innerHTML = `
      <div class="message-card message-error">
        <div class="message-header">
          <div class="message-icon">⚠️</div>
          <div class="message-title">Thông báo</div>
        </div>
        <div class="message-content">${message}</div>
      </div>
    `;
  }

  // 🎯 Render OTP success với mã đặc biệt
  renderOTPSuccess(otpData) {
    const { otp, message, deviceInfo } = otpData;
    
    const html = `
      <div class="otp-success-card">
        <div class="otp-header">
          <div class="success-icon">🎉</div>
          <div class="success-title">Lấy mã OTP thành công!</div>
        </div>
        
        <div class="otp-code-container" id="otpCodeContainer">
          <div class="otp-code">${otp}</div>
          <div class="otp-hint">👆 Nhấp để sao chép</div>
        </div>
        
        ${deviceInfo ? `<div class="device-info">${deviceInfo}</div>` : ''}
        
        <div class="otp-timer" id="otpTimer">
          ⏱️ Mã có hiệu lực trong <span id="countdown">30</span>s
        </div>
        
        <div class="otp-instructions">
          <div class="instruction-item">✅ Mã đã được sao chép tự động</div>
          <div class="instruction-item">⚡ Hãy dán ngay vào ứng dụng</div>
        </div>
      </div>
    `;
    
    this.container.innerHTML = html;
    this.startOTPTimer();
    this.attachOTPClickHandler(otp);
  }

  // ⏲️ Đếm ngược timer cho OTP
  startOTPTimer() {
    let remaining = 30;
    const countdownEl = document.getElementById('countdown');
    
    const timer = setInterval(() => {
      remaining--;
      if (countdownEl) {
        countdownEl.textContent = remaining;
      }
      
      if (remaining <= 0) {
        clearInterval(timer);
        this.container.innerHTML = `
          <div class="message-card message-info">
            <div class="message-header">
              <div class="message-icon">⏰</div>
              <div class="message-title">Mã OTP đã hết hạn</div>
            </div>
            <div class="message-content">Vui lòng lấy mã mới để tiếp tục.</div>
          </div>
        `;
      }
    }, 1000);
  }

  // 📋 Xử lý click để copy OTP
  attachOTPClickHandler(otp) {
    const otpContainer = document.getElementById('otpCodeContainer');
    if (otpContainer) {
      otpContainer.addEventListener('click', () => {
        navigator.clipboard.writeText(otp).then(() => {
          this.showToast('✅ Đã sao chép mã OTP!', 'success');
        }).catch(() => {
          this.showToast('❌ Lỗi sao chép, vui lòng copy thủ công', 'error');
        });
      });
    }
  }

  // 🍞 Hiển thị toast notification
  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      animation: slideInDown 0.3s ease;
    `;
    
    // Colors based on type
    if (type === 'success') {
      toast.style.background = '#4CAF50';
      toast.style.color = 'white';
    } else if (type === 'error') {
      toast.style.background = '#F44336';
      toast.style.color = 'white';
    } else {
      toast.style.background = '#2196F3';
      toast.style.color = 'white';
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOutUp 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  // 🎪 Attach event listeners
  attachEventListeners() {
    // Click handlers for action buttons được handle tự động bởi HTML
  }
}

// 🎬 CSS Animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInDown {
    from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    to { opacity: 1; transform: translateX(-50%) translateY(0); }
  }
  
  @keyframes slideOutUp {
    from { opacity: 1; transform: translateX(-50%) translateY(0); }
    to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
  }
`;
document.head.appendChild(style);