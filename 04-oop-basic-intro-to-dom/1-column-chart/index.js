export default class ColumnChart {
  constructor(obj = {}) {
    let { data = [], label = '', value = 0, link = null, formatHeading = null, chartHeight = 50 }  = obj;
    this.data = data;
    this.label = label;
    this.value = value;
    this.link = link;
    this.formatHeading = formatHeading;
    this.chartHeight = chartHeight;

    this.render();
  }

  getTemplate() {
    const maxValue = Math.max(...this.data);
    const scale = this.chartHeight / maxValue;

    return this.data.map((item) => {
      return `<div style="--value: ${String(Math.floor(item * scale))}"
               data-tooltip="${(item / maxValue * 100).toFixed(0)}%"></div>`;
    }).join('');
  }

  render() {
    const chart = document.createElement('div');
    chart.className = 'column-chart';
    chart.setAttribute('style', '--chart-height: 50');

    const chartTitle = document.createElement('div');
    chartTitle.className = 'column-chart__title';
    chartTitle.innerHTML = 'Total ' + this.label;

    if (this.link) {
      let a = document.createElement('a');
      a.setAttribute('href', this.link);
      a.className = 'column-chart__link';
      a.innerHTML = 'View all';
      chartTitle.append(a);
    }

    const chartContainer = document.createElement('div');
    chartContainer.className = 'column-chart__container';

    const chartHeader = document.createElement('div');
    chartHeader.className = 'column-chart__header';
    chartHeader.setAttribute('data-element', 'header');
    chartHeader.innerHTML = this.formatHeading ? this.formatHeading(this.value) : String(this.value);

    const chartChart = document.createElement('div');
    chartChart.className = 'column-chart__chart';
    chartChart.setAttribute('data-element', 'body');
    chartChart.innerHTML = this.getTemplate();

    chartContainer.append(chartHeader, chartChart);
    chart.append(chartTitle, chartContainer);

    if (!this.data || this.data.length === 0) {
      const chartLoading = document.createElement('div');
      chartLoading.className = 'column-chart column-chart_loading';
      chartLoading.setAttribute('style', '--chart-height: 50');
      chartLoading.append(chart);
      this.element = chartLoading;
    } else {
      this.element = chart;
    }
  }

  renderChart() {
    let chartBody = document.querySelectorAll('[data-element="body"]');
    chartBody.innerHTML = this.getTemplate();
  }

  update(newData) {
    this.data = newData;
    this.renderChart();
  }

  remove() {
    this.element.remove();
  }

  destroy() {
    this.remove();
  }
}
