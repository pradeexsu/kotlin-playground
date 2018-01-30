import './index.scss'
import Map from 'es6-map/polyfill';

const webDemoURL = __WEBDEMO_URL__;
const jsExecutors = new Map();

class JsExecutor {
  constructor(kotlinVersion, jsLibs) {
    this.kotlinVersion = kotlinVersion;
    this.reloadIframeScripts(jsLibs)
  }

  executeJsCode(jsCode, jsLibs) {
    const codeOutput = this.iframe.contentWindow.eval(jsCode);
    this.reloadIframeScripts(jsLibs);
    return codeOutput;
  }

  _initializeKotlin() {
    setTimeout(() => {
      try {
        this.iframe.contentWindow.eval("if(kotlin.BufferedOutput!==undefined){kotlin.out = new kotlin.BufferedOutput()}" +
          "else{kotlin.kotlin.io.output = new kotlin.kotlin.io.BufferedOutput()}");
      } catch (e) {
        this._initializeKotlin()
      }
    }, 3000);
  }

  reloadIframeScripts(jsLibs) {
    if (this.iframe !== undefined) {
      document.body.removeChild(this.iframe)
    }
    const iframe = document.createElement('iframe');
    iframe.className = "k2js-iframe";
    document.body.appendChild(iframe);
    this.iframe = iframe;
    const iframeHead = this.iframe.contentWindow.document.head;
    Array.from(jsLibs).forEach(
      lib => {
        const script = document.createElement('script');
        script.src = lib;
        iframeHead.appendChild(script);
      }
    );
    const kotlinScript = document.createElement('script');
    kotlinScript.src = `${webDemoURL}/static/kotlin/${this.kotlinVersion}/kotlin.js`;
    iframeHead.appendChild(kotlinScript);
    this._initializeKotlin();

    const jqueryScript = document.createElement('script');
    jqueryScript.src = `${webDemoURL}/static/lib/jquery/dist/jquery.min.js`;
    iframeHead.appendChild(jqueryScript);
  }
}

function getJsExecutor(kotlinVersion, jsLibs) {
  let executor;
  if (jsExecutors.has(kotlinVersion)) {
    executor = jsExecutors.get(kotlinVersion);
  } else {
    executor = new JsExecutor(kotlinVersion, jsLibs);
    jsExecutors.set(kotlinVersion, executor);
  }
  return executor;
}

export default getJsExecutor;
