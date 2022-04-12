import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';
const CHUNK_LENGTH = 30;

export default class SortableTable {

  _handler = event => {
    let field = event.target.closest('[class="sortable-table__cell"]');

    if (!field || field.dataset.sortable === `false`) return;

    field.dataset.order = field.dataset.order === 'desc' ? 'asc' : 'desc';
    this.sort(field.dataset.id, field.dataset.order);
    this.moveArrow(field);
  }

  _updateOnScroll = event => {
    let windowRelativeBottom = document.documentElement.getBoundingClientRect().bottom;

    if (windowRelativeBottom <= document.documentElement.clientHeight) {
      this.update();
    }
  }

  constructor(headersConfig, {
    url = '',
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: `asc`,
    },
    isSortLocally = false,
  } = {}) {
    this.headersConfig = headersConfig;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;
    this.url = new URL(url, BACKEND_URL);
    this.currentLength = 0;

    this.getTemplate();
    this.addEventListeners();
    this.render();
  }

  getTemplate() {
    let container = document.createElement('div');
    container.setAttribute('class', 'products-list__container');
    container.setAttribute('data-element', 'productsContainer');

    let table = document.createElement('div');
    table.setAttribute('class', 'sortable-table');
    table.innerHTML = this.getTableHeader() + `<div data-element="body" class="sortable-table__body"></div>`;

    this.subElements = {
      header: table.querySelector(`[data-element="header"]`),
      body: table.querySelector(`[data-element="body"]`),
      previouslySortedField : null,
    };

    container.append(table);
    this.element = container;
  }

  async render() {
    this.url.searchParams.set('_sort', this.sorted.id);
    this.url.searchParams.set('_order', this.sorted.order);

    if (!this.isSortLocally) {
      this.url.searchParams.set('_start', this.currentLength);
      this.url.searchParams.set('_end', CHUNK_LENGTH);
      this.currentLength += CHUNK_LENGTH;
    }

    this.data = await this.loadData();
    this.subElements.body.innerHTML = this.getTableRows(this.data);
  }

  addEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this._handler);
    if (!this.isSortLocally) {
      window.addEventListener('scroll', this._updateOnScroll);
    }
  }

  removeEventListeners() {
    this.subElements.header.removeEventListener('pointerdown', this._handler);
    if (!this.isSortLocally) {
      window.removeEventListener('scroll', this._updateOnScroll);
    }
  }

  getTableHeader() {

    return `<div data-element="header" class="sortable-table__header sortable-table__row">` +
      this.headersConfig.map(column => {
        return `<div class="sortable-table__cell" data-id="${column.id}" data-sortable="${column.sortable}" data-order="asc">
                     <span>${column.title}</span>
                  </div>`;
      }).join('') + `</div>`;
  }

  getTableRows(inputData) {

    return inputData.map(item => {
      return `<a href="/products/${item.id}" class="sortable-table__row">${this.getTableRow(item)}`;
    }).join('') + `</a>`;
  }

  getTableRow(item) {

    return this.headersConfig.map(column => {
      return column.id === 'images' || column.id === 'status'?
        column.template(item[column.id]) :
        `<div class="sortable-table__cell">${item[column.id]}</div>`;
    }).join('');
  }

  sort(field, order='asc') {
    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer(field, order);
    }
  }

  sortOnClient(field, order) {
    let index = this.headersConfig.findIndex(obj => obj.id === field);
    let sortedArray = this.sortData(field, index, order);

    this.subElements.body.innerHTML = this.getTableRows(sortedArray);
  }

  sortData(field, index, order) {
    const directions = {
      asc: 1,
      desc: -1
    }

    const direction = directions[order];

    return [...this.data].sort((a, b) => {
      if (this.headersConfig[index].sortType === 'string') {
        return direction * a[field].localeCompare(b[field], ['ru', 'en'], {caseFirst: 'upper'});
      }
      // if (this.headersConfig[index].sortType === 'any_other_sortType') {
      //   // TO DO - implement sorting by 'any_other_sortType';
      // }
      return direction * (a[field] - b[field]);
    });
  }

  setURL(field, order) {
    this.url.searchParams.set('_sort', field);
    this.url.searchParams.set('_order', order);
    this.url.searchParams.set('_start', this.currentLength);
    this.url.searchParams.set('_end', CHUNK_LENGTH);
  }

  sortOnServer(field, order) {
    this.currentLength = 0;
    this.setURL(field, order);

    this.loadData()
      .then(newData => this.subElements.body.innerHTML = this.getTableRows(newData));
  }

  async loadData() {
    return await fetchJson(this.url);
  }

  update() {
    this.url.searchParams.set('_start', this.currentLength);
    this.url.searchParams.set('_end', String(this.currentLength + CHUNK_LENGTH));
    this.currentLength += CHUNK_LENGTH;

    this.loadData()
      .then(newData => this.subElements.body.insertAdjacentHTML('beforeend', this.getTableRows(newData)));

  }

  moveArrow(field) {
    let arrow = `<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>`;

    if (this.subElements.previouslySortedField) {
      this.subElements.previouslySortedField.lastElementChild.remove();
    }
    field.insertAdjacentHTML('beforeend', arrow);
    this.subElements.previouslySortedField = field;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    this.removeEventListeners();
    this.remove();
    this.element = null;
  }
}
