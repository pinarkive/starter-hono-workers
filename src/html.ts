/** Single-page UI served from the Worker (no client build step). */

export function pageHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>PinArkive · Workers starter</title>
  <style>
    :root {
      --bg: #0f1115;
      --surface: #181b21;
      --border: #2a2f3a;
      --text: #e8eaed;
      --muted: #9aa0a6;
      --accent: #5b8def;
      --success: #3dd68c;
      --error: #f56565;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      -webkit-font-smoothing: antialiased;
    }
    main {
      max-width: 32rem;
      margin: 0 auto;
      padding: 4rem 1rem;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    header { text-align: center; margin-bottom: 2.5rem; }
    .eyebrow {
      margin: 0 0 0.5rem;
      font-size: 0.7rem;
      font-weight: 600;
      letter-spacing: 0.2em;
      text-transform: uppercase;
      color: var(--muted);
    }
    h1 {
      margin: 0;
      font-size: clamp(1.5rem, 4vw, 1.875rem);
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    .lead {
      margin: 0.75rem 0 0;
      font-size: 0.875rem;
      line-height: 1.6;
      color: var(--muted);
    }
    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1.5rem;
      border-radius: 0.75rem;
      border: 1px solid var(--border);
      background: var(--surface);
    }
    label { font-size: 0.875rem; font-weight: 500; }
    input[type="file"] {
      margin-top: 0.5rem;
      width: 100%;
      font-size: 0.875rem;
      color: var(--muted);
    }
    button[type="submit"] {
      border: none;
      border-radius: 0.5rem;
      padding: 0.65rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      color: #fff;
      background: var(--accent);
      cursor: pointer;
    }
    button[type="submit"]:disabled { opacity: 0.55; cursor: not-allowed; }
    #out { margin-top: 1.5rem; }
    .card {
      border-radius: 0.75rem;
      border: 1px solid var(--border);
      background: var(--surface);
      padding: 1rem;
    }
    .ok { color: var(--success); font-weight: 600; font-size: 0.875rem; margin: 0; }
    .err { color: var(--error); font-weight: 600; font-size: 0.875rem; margin: 0; }
    .cid-label {
      margin: 0.75rem 0 0;
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--muted);
    }
    .cid {
      margin: 0.25rem 0 0;
      word-break: break-all;
      font-family: ui-monospace, monospace;
      font-size: 0.875rem;
    }
    details { margin-top: 1rem; }
    summary { cursor: pointer; font-size: 0.75rem; font-weight: 600; color: var(--accent); }
    pre {
      margin: 0.5rem 0 0;
      max-height: 12rem;
      overflow: auto;
      border-radius: 0.5rem;
      background: var(--bg);
      padding: 0.75rem;
      font-size: 0.75rem;
      color: var(--muted);
    }
  </style>
</head>
<body>
  <main>
    <header>
      <p class="eyebrow">PinArkive</p>
      <h1>Cloudflare Workers upload starter</h1>
      <p class="lead">
        Upload runs on the edge: the Worker forwards your file to PinArkive using a
        Worker secret. The API key is never sent to the browser.
      </p>
    </header>
    <form id="f">
      <div>
        <label for="file">File</label><br />
        <input id="file" name="file" type="file" required />
      </div>
      <button type="submit" id="btn">Upload to PinArkive</button>
    </form>
    <div id="out"></div>
  </main>
  <script>
    (function () {
      var form = document.getElementById("f");
      var btn = document.getElementById("btn");
      var out = document.getElementById("out");
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        out.innerHTML = "";
        var input = document.getElementById("file");
        var file = input.files && input.files[0];
        if (!file) return;
        btn.disabled = true;
        btn.textContent = "Uploading…";
        var fd = new FormData();
        fd.append("file", file);
        fetch("/api/upload", { method: "POST", body: fd })
          .then(function (r) { return r.json(); })
          .then(function (body) {
            var html = "";
            if (!body.ok) {
              html = '<div class="card" role="alert"><p class="err">Upload failed</p>' +
                '<p style="margin:0.25rem 0 0;font-size:0.875rem;color:var(--muted)">' +
                (body.error || "Unknown error") + "</p></div>";
            } else {
              html = '<div class="card"><p class="ok">Success</p>';
              if (body.cid) {
                html += '<p class="cid-label">CID</p><p class="cid">' + body.cid + "</p>";
              } else {
                html += '<p style="margin:0.5rem 0 0;font-size:0.875rem;color:var(--muted)">' +
                  "No <code>cid</code> in response. See raw JSON below.</p>";
              }
              html += "<details><summary>Show raw JSON</summary><pre>" +
                JSON.stringify(body.data, null, 2) + "</pre></details></div>";
            }
            out.innerHTML = html;
          })
          .catch(function () {
            out.innerHTML = '<div class="card" role="alert"><p class="err">Upload failed</p>' +
              '<p style="margin:0.25rem 0 0;font-size:0.875rem;color:var(--muted)">' +
              "Could not reach the Worker.</p></div>";
          })
          .finally(function () {
            btn.disabled = false;
            btn.textContent = "Upload to PinArkive";
          });
      });
    })();
  </script>
</body>
</html>`;
}
