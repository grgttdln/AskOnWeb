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
    if (!selection.rangeCount) {
      console.warn("No selection range found");
      return null;
    }

    const id = highlightId || this.generateHighlightId();
    console.log("Adding highlight:", {
      text,
      id,
      rangeCount: selection.rangeCount,
    });

    try {
      // Handle multiple ranges (for multi-line selections)
      const ranges = [];
      for (let i = 0; i < selection.rangeCount; i++) {
        ranges.push(selection.getRangeAt(i));
      }

      // Create highlight elements for each range
      const highlightElements = [];

      ranges.forEach((range, index) => {
        const highlight = this.createHighlightElement(
          id,
          text,
          index.toString()
        );
        highlightElements.push(highlight);

        // Clone the range to avoid modification issues
        const clonedRange = range.cloneRange();

        // Check if the range spans multiple elements
        if (this.isRangeComplex(clonedRange)) {
          console.log("Using complex range highlighting for range", index);
          // Use a more robust method for complex ranges
          this.highlightComplexRange(clonedRange, highlight);
        } else {
          // Use the simple method for simple ranges
          const contents = clonedRange.extractContents();
          highlight.appendChild(contents);
          clonedRange.insertNode(highlight);
        }
      });

      // Store highlight data
      this.highlights.set(id, {
        text: text,
        timestamp: Date.now(),
        url: window.location.href,
        elementIds: highlightElements.map((el) => el.id),
        rangeCount: ranges.length,
      });

      this.saveHighlights();

      setTimeout(() => {
        selection.removeAllRanges();
      }, 50);

      return id;
    } catch (error) {
      console.error("Error adding highlight:", error);
      // Fallback to simple text-based highlighting
      return this.fallbackHighlight(text, id);
    }
  }

  createHighlightElement(id, text, index = "0") {
    const highlight = document.createElement("span");
    highlight.className = "askonweb-highlight";
    highlight.id = `${id}_part_${index}`;
    highlight.style.backgroundColor = "#3b82f6";
    highlight.style.color = "inherit";
    highlight.style.borderRadius = "2px";
    highlight.style.padding = "1px 2px";
    highlight.style.margin = "0 1px";
    highlight.style.display = "inline";
    highlight.setAttribute("data-highlight-id", id);
    highlight.setAttribute("data-highlight-text", text);
    highlight.setAttribute("data-highlight-part", index);

    return highlight;
  }

  isRangeComplex(range) {
    const startContainer = range.startContainer;
    const endContainer = range.endContainer;

    if (startContainer !== endContainer) {
      return true;
    }

    const fragment = range.cloneContents();
    return (
      fragment.childNodes.length > 1 ||
      (fragment.childNodes.length === 1 &&
        fragment.firstChild.nodeType !== Node.TEXT_NODE)
    );
  }

  highlightComplexRange(range, highlightElement) {
    try {
      const walker = document.createTreeWalker(
        range.commonAncestorContainer,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode: function (node) {
            return range.intersectsNode(node)
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT;
          },
        }
      );

      const textNodes = [];
      let textNode;
      while ((textNode = walker.nextNode())) {
        textNodes.push(textNode);
      }

      textNodes.forEach((node, index) => {
        try {
          const nodeRange = document.createRange();
          nodeRange.selectNodeContents(node);

          if (node === range.startContainer) {
            nodeRange.setStart(node, range.startOffset);
          }
          if (node === range.endContainer) {
            nodeRange.setEnd(node, range.endOffset);
          }

          const nodeText = nodeRange.toString();
          if (nodeText.trim().length === 0) return;

          const nodeHighlight = this.createHighlightElement(
            highlightElement.getAttribute("data-highlight-id"),
            nodeText,
            index.toString()
          );

          const contents = nodeRange.extractContents();
          nodeHighlight.appendChild(contents);
          nodeRange.insertNode(nodeHighlight);
        } catch (nodeError) {
          console.error("Error highlighting text node", index, ":", nodeError);
        }
      });
    } catch (error) {
      console.error("Error in highlightComplexRange:", error);
      // Fallback to simple highlighting
      const text = highlightElement.getAttribute("data-highlight-text");
      const id = highlightElement.getAttribute("data-highlight-id");
      this.fallbackHighlight(text, id);
    }
  }

  fallbackHighlight(text, highlightId) {
    // Fallback method for when range.surroundContents fails
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null,
      false
    );

    let textNode;
    let found = false;

    while ((textNode = walker.nextNode()) && !found) {
      const content = textNode.textContent;
      const index = content.indexOf(text);

      if (index !== -1) {
        found = true;

        // Split the text node
        const beforeText = content.substring(0, index);
        const afterText = content.substring(index + text.length);

        const parent = textNode.parentNode;

        // Insert text before the match
        if (beforeText) {
          parent.insertBefore(document.createTextNode(beforeText), textNode);
        }

        // Create and insert highlight element
        const highlight = this.createHighlightElement(highlightId, text, "0");
        highlight.textContent = text;
        parent.insertBefore(highlight, textNode);

        // Insert text after the match
        if (afterText) {
          parent.insertBefore(document.createTextNode(afterText), textNode);
        }

        // Remove the original text node
        parent.removeChild(textNode);

        // Store highlight data
        this.highlights.set(highlightId, {
          text: text,
          timestamp: Date.now(),
          url: window.location.href,
          elementIds: [highlight.id],
          rangeCount: 1,
        });

        this.saveHighlights();
      }
    }

    return found ? highlightId : null;
  }

  removeHighlight(highlightId) {
    const highlightData = this.highlights.get(highlightId);
    if (!highlightData) return false;

    let removed = false;

    // Remove all parts of the highlight
    if (highlightData.elementIds) {
      highlightData.elementIds.forEach((elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
          this.removeHighlightElement(element);
          removed = true;
        }
      });
    } else {
      // Fallback: find by data attribute
      const elements = document.querySelectorAll(
        `[data-highlight-id="${highlightId}"]`
      );
      elements.forEach((element) => {
        this.removeHighlightElement(element);
        removed = true;
      });
    }

    if (removed) {
      this.highlights.delete(highlightId);
      this.saveHighlights();
    }

    return removed;
  }

  removeHighlightElement(element) {
    const parent = element.parentNode;
    if (parent) {
      const textNode = document.createTextNode(element.textContent);
      parent.replaceChild(textNode, element);

      parent.normalize();
    }
  }

  clearAllHighlights() {
    const highlights = document.querySelectorAll(".askonweb-highlight");
    highlights.forEach((highlight) => {
      this.removeHighlightElement(highlight);
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
    const textNodes = this.findAllTextNodes(document.body);
    let found = false;

    for (const textNode of textNodes) {
      if (found) break;

      const content = textNode.textContent;
      const index = content.indexOf(text);

      if (index !== -1) {
        found = true;

        // Split the text node
        const beforeText = content.substring(0, index);
        const afterText = content.substring(index + text.length);

        const parent = textNode.parentNode;

        // Insert text before the match
        if (beforeText) {
          parent.insertBefore(document.createTextNode(beforeText), textNode);
        }

        // Create and insert highlight element
        const highlight = this.createHighlightElement(highlightId, text);
        highlight.textContent = text;
        parent.insertBefore(highlight, textNode);

        // Insert text after the match
        if (afterText) {
          parent.insertBefore(document.createTextNode(afterText), textNode);
        }

        // Remove the original text node
        parent.removeChild(textNode);
      }
    }
  }

  findAllTextNodes(node) {
    const textNodes = [];
    const walker = document.createTreeWalker(
      node,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: function (node) {
          if (
            node.parentElement &&
            node.parentElement.classList.contains("askonweb-highlight")
          ) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        },
      },
      false
    );

    let textNode;
    while ((textNode = walker.nextNode())) {
      textNodes.push(textNode);
    }

    return textNodes;
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

window.testHighlight = function (text) {
  console.log("Testing highlight with text:", text);
  const result = highlightManager.fallbackHighlight(text, "test_" + Date.now());
  console.log("Test result:", result);
  return result;
};
