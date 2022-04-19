import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
   CHUNK_LENGTH = 30;

  _sortOnClick = event => {
    const field = event.target.closest('[data-sortable="true"]');

    if (!field) return;

    field.dataset.order = field.dataset.order === 'desc' ? 'asc' : 'desc';
    this.sorted.id = field.dataset.id;
    this.sorted.order = field.dataset.order;

    this.sort(field.dataset.id, field.dataset.order);
    this.removeArrowElement();
    this.addArrowElement(field);
  }

  _updateOnScroll = async event => {
    const windowRelativeBottom = document.documentElement.getBoundingClientRect().bottom;

    if (windowRelativeBottom <= document.documentElement.clientHeight && !this.loading) {
      this.loading = true;

      await this.update();

      this.loading = false;
    }
  }

  constructor(headersConfig, {
    url = '',
    isSortLocally = false,
    sorted = {
      id: headersConfig.find(item => item.sortable).id,
      order: `asc`,
      begin : isSortLocally ? null : 0,
      end : isSortLocally ? null : this.CHUNK_LENGTH,
    },
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
    const container = document.createElement('div');
    container.setAttribute('class', 'products-list__container');
    container.setAttribute('data-element', 'productsContainer');

    const table = document.createElement('div');
    table.setAttribute('class', 'sortable-table');
    table.innerHTML = `${this.getTableHeader()}
      <div data-element="body" class="sortable-table__body"></div>
      <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
      <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">No products</div>`;

    this.subElements = this.getSubElements(table);
    container.append(table);
    this.element = container;
  }

  async render() {
    this.data =  await this.loadData();
    this.subElements.body.innerHTML = this.getTableBody(this.data);
    this.addArrowElement(this.subElements.header.querySelector(`[data-id=${this.sorted.id}]`));
  }

  getSubElements(table) {
    return {
      header: table.querySelector(`[data-element="header"]`),
      body: table.querySelector(`[data-element="body"]`),
    }
  }

  addEventListeners() {
    this.subElements.header.addEventListener('pointerdown', this._sortOnClick);
    if (!this.isSortLocally) {
      window.addEventListener('scroll', this._updateOnScroll);
    }
  }

  removeEventListeners() {
    this.subElements.header.removeEventListener('pointerdown', this._sortOnClick);
    if (!this.isSortLocally) {
      window.removeEventListener('scroll', this._updateOnScroll);
    }
  }

  getTableHeader() {
    return `<div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.getHeaderRow()}</div>`;
  }

  getHeaderRow() {
    return this.headersConfig.map(column => {
      return `<div class="sortable-table__cell" data-id="${column.id}" data-sortable="${column.sortable}" data-order="asc">
          <span>${column.title}</span>
      </div>`;
    }).join('');
  }

  getTableBody(inputData) {
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

  sort(field, order) {
    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer(field, order);
    }
  }

  sortOnClient(field, order) {
    const index = this.headersConfig.findIndex(obj => obj.id === field);
    const sortedArray = this.sortData(field, index, order);

    this.subElements.body.innerHTML = this.getTableBody(sortedArray);
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
      return direction * (a[field] - b[field]);
    });
  }

  async sortOnServer(field, order) {
    const newData = await this.loadData();
    this.subElements.body.innerHTML = this.getTableBody(newData);
  }

  async loadData() {
    this.url.searchParams.set('_sort', this.sorted.id);
    this.url.searchParams.set('_order', this.sorted.order);

    if (this.sorted.begin != null && this.sorted.end != null) {
      this.url.searchParams.set('_start', this.sorted.begin);
      this.url.searchParams.set('_end', this.sorted.end);
    }

    return await fetchJson(this.url);
  }

  async update() {
    this.sorted.begin = this.sorted.end;
    this.sorted.end += this.CHUNK_LENGTH;

    this.element.classList.add(`sortable-table_loading`);

    const newData = await this.loadData();
    this.subElements.body.insertAdjacentHTML('beforeend', this.getTableBody(newData));

    this.element.classList.remove(`sortable-table_loading`);
  }

  removeArrowElement() {
    this.subElements.header.querySelector(`[data-element="arrow"]`).remove();
  }

  addArrowElement(field) {
    field.insertAdjacentHTML('beforeend',
      `<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>`);
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
