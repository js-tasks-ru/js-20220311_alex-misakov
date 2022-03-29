export default class ColumnChart {
  constructor(obj = {}) {
    let { data = [], label = '', value = 0, link = null, formatHeading = (value) => value, chartHeight = 50 }  = obj;
    this.formatHeading = formatHeading;
    this.data = data;
    this.label = label;
    this.value = this.formatHeading(value);
    this.link = link;
    this.chartHeight = chartHeight;

    this.render();
  }

  getTemplate() {
    return `
          <div class="column-chart column-chart_loading" style="--chart-height: ${this.chartHeight}">
            <div class="column-chart__title">
              Total ${ this.label }
              ${ this.getLink() }
            </div>
            <div class="column-chart__container">
               <div data-element="header" class="column-chart__header">
                 ${ this.value }
               </div>
              <div data-element="body" class="column-chart__chart">
                ${ this.getColumnBody() }
              </div>
            </div>
      </div>
    `;
  }

  render() {
    const chart = document.createElement('div');

    chart.innerHTML = this.getTemplate();

    this.element = chart.firstElementChild;

    if (this.data.length) {
      this.element.classList.remove("column-chart_loading");
    }

    this.refToColumnBody = this.element.querySelector('[data-element="body"]');
  }

  renderChart() {
    this.refToColumnBody.innerHTML = this.getColumnBody();
  }

  getColumnBody() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data.map((item) => {
      return `<div style="--value: ${String(Math.floor(item * scale))}"
               data-tooltip="${(item / maxValue * 100).toFixed(0)}%"></div>`;
    }).join('');
  }

  getLink() {
    return this.link
      ? `<a class="column-chart__link" href="${this.link}">View all</a>`
      : "";
  }

  update(newData) {
    this.data = newData;

    if (this.data.length) {
      this.element.classList.remove("column-chart_loading");
      this.renderChart();
    }
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.remove();
    this.element = null;
  }
}
