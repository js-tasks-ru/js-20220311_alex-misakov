export default class NotificationMessage {
  static currentInstance;

  constructor(message = '', { duration = 1000, type = 'success' } = {}) {
    this.message = message;
    this.duration = duration;
    this.type = type;

    this.render();
  }

  getTemplate() {
    return `<div class="notification ${this.type}" style="--value:${this.duration/1000}s">
              <div class="timer"></div>
              <div class="inner-wrapper">
                <div class="notification-header">${this.type}</div>
                <div class="notification-body">${this.message}</div>
            </div>`;
  }

  render() {
    let element = document.createElement('div');

    element.innerHTML = this.getTemplate();

    this.element = element.firstElementChild;
  }

  show(target = document.body) {
    if (NotificationMessage.currentInstance) {
      NotificationMessage.currentInstance.remove();
    }

    target.append(this.element);

    NotificationMessage.currentInstance = this;

    this.timerId = setTimeout(() => {
      this.remove();
    }, this.duration);
  }

  remove() {
    if (this.element) {
      clearInterval(this.timerId);
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
    NotificationMessage.currentInstance = null;
  }
}
