    const chat = document.getElementById('chat');
    const sendBtn = document.getElementById('sendBtn');
    const msgInput = document.getElementById('msgInput');

    sendBtn.addEventListener('click', sendMessage);
    msgInput.addEventListener('keypress', e => {
      if (e.key === 'Enter') sendMessage();
    });

    function sendMessage() {
      const text = msgInput.value.trim();
      if (!text) return;

      const userBubble = document.createElement('div');
      userBubble.className = 'message user-message';
      userBubble.textContent = text;
      chat.appendChild(userBubble);

      msgInput.value = '';
      chat.scrollTop = chat.scrollHeight;

      setTimeout(() => {
        const botBubble = document.createElement('div');
        botBubble.className = 'message';
        botBubble.textContent = "I'm here to help with anything you need!";
        chat.appendChild(botBubble);
        chat.scrollTop = chat.scrollHeight;
      }, 600);
    }