// eslint-disable-next-line func-names
(function () {
  // When the mouseover fires, the cursor might not actually be over
  // the character itself yet. These pairs of x,y offsets are used to
  // probe a few nearby points when no suitable marked range is found.
  const nearby = [0, 0, 0, 5, 0, -5, 5, 0, -5, 0];

  const { CodeMirror } = window;
  const HOVER_CLASS = ' CodeMirror-hover';

  function showTooltip(e, content) {
    const tt = document.createElement('div');
    tt.className = 'CodeMirror-hover-tooltip';
    if (typeof content === 'string') {
      content = document.createTextNode(content);
    }
    tt.appendChild(content);
    document.body.appendChild(tt);

    function position() {
      const { target } = e;
      const targetRect = target.getBoundingClientRect();
      tt.style.top = `${targetRect.bottom}px`;
      tt.style.left = `${targetRect.left}px`;
    }

    // CodeMirror.on(document, 'mousemove', position);
    position(e);
    if (tt.style.opacity != null) { tt.style.opacity = '1'; }
    return tt;
  }

  function rm(elt) {
    if (elt.parentNode) { elt.parentNode.removeChild(elt); }
  }

  function hideTooltip(tt) {
    if (!tt.parentNode) { return; }
    if (tt.style.opacity == null) { rm(tt); }
    setTimeout(() => {
      tt.style.opacity = 0;
    }, 200);
    setTimeout(() => {
      rm(tt);
    }, 600);
  }

  function CodeMirrorOnce(obj, type, func) {
    function cbFunc(event) {
      func(event);
      CodeMirror.off(obj, type, cbFunc);
    }
    CodeMirror.on(obj, type, cbFunc);
  }

  function showTooltipFor(e, content, node, state, cm) {
    const tooltip = showTooltip(e, content);
    let hideTimeOut = null;
    function hide() {
      cm.removeKeyMap(state.keyMap);
      node.className = node.className.replace(HOVER_CLASS, '');
      if (tooltip) {
        hideTooltip(tooltip);
      }
    }
    function hideFromNode(event) {
      hideTimeOut = setTimeout(() => {
        hide(event);
      }, 100);
    }
    CodeMirrorOnce(tooltip, 'mouseenter', () => {
      if (hideTimeOut) {
        clearTimeout(hideTimeOut);
      }
    });
    CodeMirrorOnce(node, 'mouseleave', hideFromNode);
    CodeMirrorOnce(tooltip, 'mouseleave', hide);
    state.keyMap = { Esc: hide };
    cm.addKeyMap(state.keyMap);
  }

  // eslint-disable-next-line consistent-return
  function getTokenAndPosAt(cm, e) {
    const node = e.target || e.srcElement;
    const text = node.innerText || node.textContent;
    for (let i = 0; i < nearby.length; i += 2) {
      const pos = cm.coordsChar({
        left: e.clientX,
        top: e.clientY,
      });
      const token = cm.getTokenAt(pos);
      const tokenCoords = cm.charCoords(pos);
      if (e.clientX - tokenCoords.left > 2) {
        return;
      }
      if (token && token.string === text) {
        // eslint-disable-next-line consistent-return
        return {
          token,
          pos,
        };
      }
    }
  }

  function onMouseOver(cm, e) {
    const node = e.target;
    if (node && !node.classList.contains('CodeMirror-line')) {
      if (/\bCodeMirror-lint-mark-/.test(node.className)) return;
      const state = cm.state.textHover;
      const data = getTokenAndPosAt(cm, e);
      const content = state.options.getTextHover(cm, data, e);
      if (content) {
        node.className += HOVER_CLASS;
        if (typeof content === 'function') {
          content(showTooltipFor, data, e, node, state, cm);
        } else {
          showTooltipFor(e, content, node, state, cm);
        }
      }
    }
  }

  function onMouseOverWithDelay(cm, e) {
    const state = cm.state.textHover; const
      { delay } = state.options;
    clearTimeout(state.timeout);
    state.timeout = setTimeout(() => {
      onMouseOver(cm, e);
    }, delay);
  }

  function TextHoverState(cm, options) {
    this.options = options;
    this.timeout = null;
    if (options.delay) {
      this.onMouseOver = (e) => {
        onMouseOverWithDelay(cm, e);
      };
    } else {
      this.onMouseOver = (e) => {
        onMouseOver(cm, e);
      };
    }
    this.keyMap = null;
  }

  function parseOptions(cm, options) {
    if (options instanceof Function) {
      return {
        getTextHover: options,
      };
    }
    if (!options || options === true) { options = {}; }
    if (!options.getTextHover) { options.getTextHover = cm.getHelper(CodeMirror.Pos(0, 0), 'textHover'); }
    if (!options.getTextHover) {
      throw new Error(
        "Required option 'getTextHover' missing (text-hover addon)",
      );
    }
    return options;
  }

  function optionHandler(cm, val, old) {
    if (old && old !== CodeMirror.Init) {
      CodeMirror.off(
        cm.getWrapperElement(),
        'mouseover',
        cm.state.textHover.onMouseOver,
      );
      delete cm.state.textHover;
    }

    if (val) {
      // eslint-disable-next-line no-multi-assign
      const state = cm.state.textHover = new TextHoverState(cm, parseOptions(
        cm,
        val,
      ));
      CodeMirror.on(cm.getWrapperElement(), 'mouseover', state.onMouseOver);
    }
  }

  CodeMirror.defineOption('textHover', false, optionHandler); // deprecated
}());
