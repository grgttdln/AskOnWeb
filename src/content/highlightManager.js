// Highlight Manager for AskOnWeb Extension
class HighlightManager {
  constructor() {
    this.highlights = new Map();
    this.highlightCounter = 0;
    this.init();
  }

  init() {
    // Load existing highlights from storage
    this.loadHighlights();

    // Listen for messages from the extension
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.action === "addHighlight") {
        this.addHighlight(message.text, message.highlightId);
        sendResponse({ success: true });
      } else if (message.action === "removeHighlight") {
        this.removeHighlight(message.highlightId);
        sendResponse({ success: true });
      } else if (message.action === "clearAllHighlights") {
        this.clearAllHighlights();
        sendResponse({ success: true });
      }
    });

    // Save highlights when page is about to unload
    window.addEventListener("beforeunload", () => {
      this.saveHighlights();
    });
  }

  generateHighlightId() {
    return `highlight_${Date.now()}_${++this.highlightCounter}`;
  }

  addHighlight(text, highlightId = null) {
    const selection = window.getSelection();
    if (!selection.rangeCount) return null;

    const range = selection.getRangeAt(0);
    const id = highlightId || this.generateHighlightId();

    // Create highlight element
    const highlight = document.createElement("span");
    highlight.className = "askonweb-highlight";
    highlight.id = id;
    highlight.style.backgroundColor = "#3b82f6";
    highlight.style.color = "inherit";
    highlight.style.borderRadius = "2px";
    highlight.style.padding = "1px 2px";
    highlight.style.margin = "0 1px";
    highlight.setAttribute("data-highlight-id", id);
    highlight.setAttribute("data-highlight-text", text);

    try {
      range.surroundContents(highlight);

      this.highlights.set(id, {
        text: text,
        timestamp: Date.now(),
        url: window.location.href,
      });

      this.saveHighlights();

      selection.removeAllRanges();

      return id;
    } catch (error) {
      console.error("Error adding highlight:", error);
      return null;
    }
  }

  removeHighlight(highlightId) {
    const highlight =
      document.getElementById(highlightId) ||
      document.querySelector(`[data-highlight-id="${highlightId}"]`);

    if (highlight) {
      // Replace highlight with its text content
      const parent = highlight.parentNode;
      const textNode = document.createTextNode(highlight.textContent);
      parent.replaceChild(textNode, highlight);

      // Remove from storage
      this.highlights.delete(highlightId);
      this.saveHighlights();

      return true;
    }
    return false;
  }

  clearAllHighlights() {
    const highlights = document.querySelectorAll(".askonweb-highlight");
    highlights.forEach((highlight) => {
      const parent = highlight.parentNode;
      const textNode = document.createTextNode(highlight.textContent);
      parent.replaceChild(textNode, highlight);
    });

    this.highlights.clear();
    this.saveHighlights();
  }

  saveHighlights() {
    const highlightsData = {
      url: window.location.href,
      highlights: Array.from(this.highlights.entries()),
    };

    chrome.storage.local.get(["pageHighlights"], (result) => {
      const allHighlights = result.pageHighlights || {};
      allHighlights[window.location.href] = highlightsData;

      chrome.storage.local.set({ pageHighlights: allHighlights });
    });
  }

  loadHighlights() {
    chrome.storage.local.get(["pageHighlights"], (result) => {
      const allHighlights = result.pageHighlights || {};
      const pageHighlights = allHighlights[window.location.href];

      if (pageHighlights && pageHighlights.highlights) {
        // Restore highlights for this page
        pageHighlights.highlights.forEach(([id, data]) => {
          this.highlights.set(id, data);
          this.restoreHighlight(id, data.text);
        });
      }
    });
  }

  restoreHighlight(highlightId, text) {
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let textNode;
    while ((textNode = walker.nextNode())) {
      const content = textNode.textContent;
      const index = content.indexOf(text);

      if (index !== -1) {
        const beforeText = content.substring(0, index);
        const afterText = content.substring(index + text.length);

        const parent = textNode.parentNode;

        if (beforeText) {
          parent.insertBefore(document.createTextNode(beforeText), textNode);
        }

        const highlight = document.createElement("span");
        highlight.className = "askonweb-highlight";
        highlight.id = highlightId;
        highlight.style.backgroundColor = "#3b82f6";
        highlight.style.color = "inherit";
        highlight.style.borderRadius = "2px";
        highlight.style.padding = "1px 2px";
        highlight.style.margin = "0 1px";
        highlight.setAttribute("data-highlight-id", highlightId);
        highlight.setAttribute("data-highlight-text", text);
        highlight.textContent = text;

        parent.insertBefore(highlight, textNode);

        if (afterText) {
          parent.insertBefore(document.createTextNode(afterText), textNode);
        }

        parent.removeChild(textNode);
        break;
      }
    }
  }

  getHighlightIdByText(text) {
    for (const [id, data] of this.highlights) {
      if (data.text === text) {
        return id;
      }
    }
    return null;
  }
}

const highlightManager = new HighlightManager();

window.askonwebHighlightManager = highlightManager;
