import { readFileSync } from 'fs';
import { join } from 'path';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
      vscode.commands.registerCommand('bts---jimin-pet.open', async () => {
        await vscode.commands.executeCommand('workbench.view.explorer');
        await vscode.commands.executeCommand('jiminPetView.focus');
      })
	);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'jiminPetView',
      new JiminPetViewProvider(context.extensionUri)
    )
  );
}

export function deactivate() {}

class JiminPetViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly extensionUri: vscode.Uri) {}

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'assets')]
    };
    webviewView.webview.html = getWebviewContent(webviewView.webview, this.extensionUri);
  }
}

function getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri): string {
  const assetUri = (fileName: string) => {
    const file = readFileSync(join(extensionUri.fsPath, 'assets', fileName));
    return `data:image/png;base64,${file.toString('base64')}`;
  };
	const nonce = getNonce();
	const walkingRight = assetUri('walking1.png');
	const walkingLeft = assetUri('walking2.png');
	const phrases = [
		{ image: assetUri('wow.png'), text: "you're amazing" },
		{ image: assetUri('singing.png'), text: 'ARMYYYYYYY' },
		{ image: assetUri('saranghae.png'), text: 'saranghae!' },
		{ image: assetUri('sad.png'), text: 'drink water, ARMY!' },
		{ image: assetUri('resting.png'), text: 'take break!' },
		{ image: assetUri('happy.png'), text: 'you got this!!!' },
		{ image: assetUri('fighting.png'), text: 'fighting' },
    { image: assetUri('confused.png'), text: 'borago??' },
    { image: assetUri('lachimolala.png'), text: 'lachimolala!!!' }
	];

	return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}';">
  <title>Jimin Pet</title>
  <style>
    :root { color-scheme: light dark; }
    body {
      align-items: center;
      background: var(--vscode-editor-background);
      color: var(--vscode-foreground);
      display: flex;
      font-family: var(--vscode-font-family);
      justify-content: center;
      margin: 0;
      min-height: 100vh;
      overflow: hidden;
    }
    .stage {
      background: var(--vscode-textBlockQuote-background);
      border: 1px solid var(--vscode-panel-border);
      border-radius: 12px;
      height: 220px;
      min-height: 180px;
      min-width: 0;
      overflow: hidden;
      position: relative;
      width: 100%;
    }
    .stage::after {
      background: var(--vscode-textLink-foreground);
      bottom: 12%;
      content: '';
      height: 2px;
      left: 5%;
      opacity: .3;
      position: absolute;
      right: 5%;
    }
    #pet {
      animation: patrol 8s ease-in-out infinite alternate;
      bottom: 12%;
      cursor: pointer;
      height: 104px;
      object-fit: contain;
      position: absolute;
      user-select: none;
      width: 104px;
      z-index: 1;
    }
    #pet.speaking { animation-play-state: paused; }
    #pet.confused { transform: scale(1.15); }
    #phrase {
      background: var(--vscode-editorWidget-background);
      border: 1px solid var(--vscode-widget-border);
      border-radius: 8px;
      bottom: calc(12% + 112px);
      box-sizing: border-box;
      display: none;
      left: 0;
      max-width: 80%;
      padding: 8px 12px;
      position: absolute;
      text-align: center;
      transform: translateX(-50%);
      z-index: 2;
    }
    #phrase.visible { display: block; }
    @keyframes patrol {
      from { left: 5%; }
      to { left: calc(95% - 104px); }
    }
  </style>
</head>
<body>
  <main class="stage" aria-label="Jimin pet">
    <img id="pet" src="${walkingRight}" alt="Jimin pet walking" draggable="false">
    <div id="phrase" role="status" aria-live="polite"></div>
  </main>
  <script nonce="${nonce}">
    const pet = document.getElementById('pet');
    const phrase = document.getElementById('phrase');
    const walkingRight = ${JSON.stringify(walkingRight)};
    const walkingLeft = ${JSON.stringify(walkingLeft)};
    const phrases = ${JSON.stringify(phrases)};
    let movingRight = true;
    let isSpeaking = false;
    let resetTimer;

    pet.addEventListener('animationiteration', () => {
      movingRight = !movingRight;
      pet.src = movingRight ? walkingRight : walkingLeft;
    });

    function showRandomPhrase() {
      if (isSpeaking) return;
      isSpeaking = true;
      const selected = phrases[Math.floor(Math.random() * phrases.length)];
      pet.src = selected.image;
      pet.alt = selected.text;
      phrase.textContent = selected.text;
      phrase.classList.add('visible');
      pet.classList.add('speaking');
      pet.classList.toggle('confused', selected.text === 'borago??');
      phrase.style.left = pet.offsetLeft + pet.offsetWidth / 2 + 'px';
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        pet.src = movingRight ? walkingRight : walkingLeft;
        pet.alt = 'Jimin pet walking';
        phrase.classList.remove('visible');
        pet.classList.remove('speaking');
        pet.classList.remove('confused');
        isSpeaking = false;
      }, 2600);
    }

    pet.addEventListener('pointerenter', showRandomPhrase);
    pet.addEventListener('touchstart', showRandomPhrase, { passive: true });
  </script>
</body>
</html>`;
}

function getNonce(): string {
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let result = '';
	for (let index = 0; index < 32; index++) {
		result += characters.charAt(Math.floor(Math.random() * characters.length));
	}
	return result;
}