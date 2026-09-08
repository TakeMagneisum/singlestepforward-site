(function () {
  "use strict";

  const form = document.querySelector("#suggestion-form");
  const result = document.querySelector("#suggestion-result");
  if (!form || !result) return;

  function suggestionText() {
    const data = new FormData(form);
    const value = (name) => String(data.get(name) || "").trim() || "Not provided";
    return [
      "SINGLE STEP FORWARD — RESOURCE SUGGESTION",
      "",
      "Organization or resource: " + value("resource-name"),
      "Topic: " + value("resource-category"),
      "Area served: " + value("resource-area"),
      "Official website or phone: " + value("resource-url"),
      "",
      "What someone should know:",
      value("resource-note"),
      "",
      "Prepared locally from the Single Step Forward prototype.",
      "This note contains no information unless the visitor entered it."
    ].join("\n");
  }

  async function copyText(text, button) {
    try {
      await navigator.clipboard.writeText(text);
      button.textContent = "Copied";
    } catch {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.append(helper);
      helper.select();
      document.execCommand("copy");
      helper.remove();
      button.textContent = "Copied";
    }
  }

  function downloadText(text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "single-step-forward-resource-suggestion.txt";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = suggestionText();
    result.replaceChildren();
    result.hidden = false;

    const message = document.createElement("p");
    message.textContent = "Your suggestion note is ready. Copy or download it to share when the project’s public contact channel is connected.";

    const actions = document.createElement("div");
    actions.className = "result-actions";

    const copyButton = document.createElement("button");
    copyButton.type = "button";
    copyButton.className = "mini-button";
    copyButton.textContent = "Copy note";
    copyButton.addEventListener("click", () => copyText(text, copyButton));

    const downloadButton = document.createElement("button");
    downloadButton.type = "button";
    downloadButton.className = "mini-button secondary";
    downloadButton.textContent = "Download .txt";
    downloadButton.addEventListener("click", () => downloadText(text));

    actions.append(copyButton, downloadButton);
    result.append(message, actions);
  });
})();
