class Tooltip {
  static #onlyInstance = null;

  _pointerMove = event => {
    if (!this.tooltipContent) {
      return;
    }
    this.element.style.left = (event.clientX + 10) + 'px';
    this.element.style.top = (event.clientY + 10) + 'px';
  }

  _pointerOver = event => {
    this.tooltipContent = event.target.dataset.tooltip;

    if (!this.tooltipContent) {
      return;
    }

    event.target.addEventListener('pointermove', this._pointerMove);

    this.render(this.tooltipContent);
  }

  _pointerOut = event => {
    if (!this.tooltipContent) {
      return;
    }
    event.target.removeEventListener('pointermove', this._pointerMove);
    this.element.remove();
  }

  constructor() {
    if (!Tooltip.#onlyInstance) {
      let toolTip = document.createElement('div');
      toolTip.className = `tooltip`;

      this.element = toolTip;

      Tooltip.#onlyInstance = this;
    } else {
      return Tooltip.#onlyInstance;
    }
  }

  initialize () {
    document.addEventListener('pointerover', this._pointerOver);
    document.addEventListener('pointerout', this._pointerOut);
  }

  render(content) {
    this.element.innerHTML = content;
    document.body.append(this.element);
  }

  destroy() {
    this.element.remove();
    document.removeEventListener('pointerover', this._pointerOver);
    document.removeEventListener('pointerout', this._pointerOut);
    Tooltip.#onlyInstance = null;
  }
}

export default Tooltip;
