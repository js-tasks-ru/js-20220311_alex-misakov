import RangePicker from './components/range-picker/src/index.js';
import SortableTable from './components/sortable-table/src/index.js';
import ColumnChart from './components/column-chart/src/index.js';
import header from './bestsellers-header.js';

const BACKEND_URL = 'https://course-js.javascript.ru/';

export default class Page {

  _updateComponents = async (event) => {
    for (const key of Object.keys(this.components)) {
      if (key === 'rangePicker') continue;

      await this.components[key].update(event.detail);
    }
  }

  render() {
    let wrapper = document.createElement('div');

    wrapper.innerHTML = this.getTemplate();
    this.element = wrapper.firstElementChild;

    this.subElements = this.getSubElements();
    this.initComponents();
    this.addEventListeners();

    return this.element;
  }

  getTemplate() {
    return `<div class="dashboard full-height flex-column">
              <div class="content__top-panel">
                <h2 class="page-title">Панель управления</h2>
                <div data-element="rangePicker"></div>
              </div>
              <div class="dashboard__charts">
                <div data-element="ordersChart" class="dashboard__chart_orders"></div>
                <div data-element="salesChart" class="dashboard__chart_sales"></div>
                <div data-element="customersChart" class="dashboard__chart_customers"></div>
              </div>
              <h3 class="block-title">Лидеры продаж</h3>
              <div data-element="salesLeaders"></div>
            </div>`;
  }

  getSubElements() {
    let elements = this.element.querySelectorAll(`[data-element]`);
    let result = {};

    for (let element of elements) {
      result[element.dataset.element] = element;
    }

    return result;
  }

  initComponents() {
    this.components = {};

    let dt = new Date();
    let range = {
      from: new Date(dt.setMonth(dt.getMonth() - 1)),
      to: new Date(),
    }

    this.components.rangePicker = new RangePicker(range);

    this.components.ordersChart = new ColumnChart({
      url: 'api/dashboard/orders',
      range: range,
      label: 'orders',
      link: '#',
    });

    this.components.salesChart = new ColumnChart({
      url: 'api/dashboard/sales',
      range: range,
      label: 'sales',
      formatHeading: data => {
        return "$" + data.toString().split('').reverse().map((digit, index) => {
          return (index % 3 === 0 && index !== 0) ? `${digit},` : digit;
        }).reverse().join('');
      },
    });

    this.components.customersChart = new ColumnChart({
      url: 'api/dashboard/customers',
      range: range,
      label: 'customers',
    });

    this.components.salesLeaders = new SortableTable(header, {
      url: 'api/dashboard/bestsellers',
      isSortLocally: true,
      sorted: {
        id: 'title',
        order: 'asc',
        begin: 0,
        end: 30,
      },
      range: range,
    });

    for (let component of Object.keys(this.components)) {
      this.subElements[component].append(this.components[component].element);
    }
  }

  addEventListeners() {
    this.components.rangePicker.element.addEventListener(`date-select`, this._updateComponents);

    const sideBarToggler = document.querySelector(`.sidebar__toggler`);
    sideBarToggler.onclick = () => document.body.classList.toggle('is-collapsed-sidebar');
  }

  removeEventListeners() {
    this.components.rangePicker.element.removeEventListener(`date-select`, this._updateComponents);
  }

  remove() {
    for (const key of Object.keys(this.components)) {
      this.components[key].remove();
    }
    this.removeEventListeners();
    this.element.remove();
  }

  destroy() {
    this.remove();
    this.components = {};
    this.element = null;
  }
}
