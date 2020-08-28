import { findChild, simpleXPathJQuery, simpleXPathPure } from './xpath-util';

/**
 * Wrapper for simpleXPath. Attempts to call the jquery
 * version, and if that excepts, then falls back to pure js
 * version.
 */
export function xpathFromNode(el, relativeRoot) {
  let result;
  try {
    result = simpleXPathJQuery(el, relativeRoot);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(
      'jQuery-based XPath construction failed! Falling back to manual.'
    );
    result = simpleXPathPure(el, relativeRoot);
  }
  return result;
}

/**
 * Finds an element node using an XPath relative to the document root.
 */
function nodeFromXPathFallback(xpath, root) {
  const steps = xpath.substring(1).split('/');
  let node = root;
  steps.forEach(step => {
    let [name, idx] = step.split('[');
    idx = idx ? parseInt(idx.split(']')[0]) : 1;
    node = findChild(node, name.toLowerCase(), idx);
  });
  return node;
}

/**
 * Finds an element node using an XPath relative to the document root.
 *
 * Example:
 *   node = nodeFromXPath('/html/body/div/p[2]')
 */
export function nodeFromXPath(xpath, root = document) {
  /**
   * Attempt to evaluate a provided XPath. If the evaluation fails, then fall back to a
   * manual evaluation using `nodeFromXPathFallback` that can evaluate very simple XPaths such
   * as those generated by `xpathFromNode`
   */
  function evaluateXPath(xp, root, nsResolver = null) {
    try {
      return document.evaluate(
        '.' + xp,
        root,
        nsResolver,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
    } catch (e) {
      // In the case of an XPath error, fall back to a manual evaluation
      // that should be sufficient for simple expressions.
      //
      // See http://www.w3.org/TR/DOM-Level-3-XPath/xpath.html#XPathException
      //
      // In practice, it is unknown whether this exception occurs often. This may
      // be a good place to insert analytics.
      return nodeFromXPathFallback(xp, root);
    }
  }
  return evaluateXPath(xpath, root);
}
