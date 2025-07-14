export function getConstants() {
    return {
      BACKEND_URL: 'https://sleepy-bastion-81523-f30e287dba50.herokuapp.com/api/proxy',
      SERVICES: [
        { value: 'ChatGPT Plus', label: 'ChatGPT Plus' },
        { value: 'Grok Ai', label: 'Grok Ai' },
        { value: 'VOC_AI', label: 'VOC_AI' }
      ]
    };
  }