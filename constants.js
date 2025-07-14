export function getConstants() {
    return {
      BACKEND_URL: 'https://sleepy-bastion-81523-f30e287dba50.herokuapp.com/api/proxy',
      SERVICES: [
        { value: 'ChatGPT Plus', label: 'ChatGPT Plus' },
        { value: 'Claude Pro', label: 'Claude Pro' },
        { value: 'Perplexity AI', label: 'Perplexity AI' },
        { value: 'Midjourney', label: 'Midjourney' },
        { value: 'GitHub Copilot', label: 'GitHub Copilot' }
      ]
    };
  }