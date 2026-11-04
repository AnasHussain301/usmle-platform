const http = require('http');
const WebSocket = globalThis.WebSocket;

async function main() {
  // Get debug target
  http.get('http://127.0.0.1:9222/json', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', async () => {
      const targets = JSON.parse(data);
      const target = targets[0];
      console.log('Connecting to target:', target.webSocketDebuggerUrl);

      const ws = new WebSocket(target.webSocketDebuggerUrl);
      let id = 1;

      function send(method, params = {}) {
        return new Promise((resolve) => {
          const reqId = id++;
          const handler = (msg) => {
            const parsed = JSON.parse(msg);
            if (parsed.id === reqId) {
              ws.off('message', handler);
              resolve(parsed.result);
            }
          };
          ws.on('message', handler);
          ws.send(JSON.stringify({ id: reqId, method, params }));
        });
      }

      ws.on('open', async () => {
        console.log('WS connected! Enabling console & runtime...');
        await send('Runtime.enable');
        await send('Console.enable');

        ws.on('message', (msg) => {
          const ev = JSON.parse(msg);
          if (ev.method === 'Console.messageAdded') {
            console.log('[BROWSER CONSOLE]', ev.params.message.level, ev.params.message.text);
          }
          if (ev.method === 'Runtime.consoleAPICalled') {
            console.log('[BROWSER API]', ev.params.type, ev.params.args.map(a => a.value || a.description).join(' '));
          }
          if (ev.method === 'Runtime.exceptionThrown') {
            console.error('[BROWSER EXCEPTION]', ev.params.exceptionDetails.text, ev.params.exceptionDetails.exception ? ev.params.exceptionDetails.exception.description : '');
          }
        });

        console.log('Navigating to http://localhost:5000/#mehlman...');
        await send('Page.enable');
        await send('Page.navigate', { url: 'http://localhost:5000/#mehlman' });

        // Wait 3 seconds for scripts to load
        setTimeout(async () => {
          console.log('Calling openMehlmanBook("cvs", 1) in browser...');
          const evalRes = await send('Runtime.evaluate', {
            expression: `
              (async () => {
                try {
                  console.log('typeof pdfjsLib:', typeof pdfjsLib);
                  console.log('typeof openMehlmanBook:', typeof openMehlmanBook);
                  await openMehlmanBook('cvs', 1);
                  console.log('openMehlmanBook finished!');
                  const canvas = document.getElementById('mehlman-pdf-canvas');
                  return {
                    canvasFound: !!canvas,
                    canvasWidth: canvas.width,
                    canvasHeight: canvas.height,
                    canvasStyleWidth: canvas.style.width,
                    canvasStyleHeight: canvas.style.height,
                    numPages: window._mehlmanPdfDoc ? window._mehlmanPdfDoc.numPages : null
                  };
                } catch(e) {
                  console.error('Call failed:', e.stack);
                  return { error: e.message, stack: e.stack };
                }
              })()
            `,
            awaitPromise: true,
            returnByValue: true
          });

          console.log('Eval result:', JSON.stringify(evalRes, null, 2));

          // Wait 3 more seconds for canvas render
          setTimeout(async () => {
            const checkRes = await send('Runtime.evaluate', {
              expression: `
                (() => {
                  const canvas = document.getElementById('mehlman-pdf-canvas');
                  const loading = document.getElementById('mehlman-pdf-loading');
                  return {
                    canvasWidth: canvas ? canvas.width : 0,
                    canvasHeight: canvas ? canvas.height : 0,
                    canvasStyleWidth: canvas ? canvas.style.width : 0,
                    canvasStyleHeight: canvas ? canvas.style.height : 0,
                    loadingHidden: loading ? loading.classList.contains('hidden') : null,
                    numPages: window._mehlmanPdfDoc ? window._mehlmanPdfDoc.numPages : null
                  };
                })()
              `,
              returnByValue: true
            });
            console.log('Post-render status:', JSON.stringify(checkRes, null, 2));
            process.exit(0);
          }, 3000);
        }, 3000);
      });
    });
  });
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
