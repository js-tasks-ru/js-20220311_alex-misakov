export default class SortableTable {
  constructor(headersConfig, {
    data = [],
    sorted = {},
    isSortLocally = true,
  } = {}) {
    this.headersConfig = headersConfig;
    this.data = data;
    this.sorted = sorted;
    this.isSortLocally = isSortLocally;

    this.render();
    this.sort(this.sorted.id, this.sorted.order);
    this.createSortHandlers();
  }

  render() {
    let container = document.createElement('div');
    container.setAttribute('class', 'products-list__container');
    container.setAttribute('data-element', 'productsContainer');

    let table = document.createElement('div');
    table.setAttribute('class', 'sortable-table');
    table.innerHTML = this.getTableHeader() + this.getTableBody(this.data);

    container.append(table);
    this.element = container;
    this.subElements = {
      header: table.querySelector(`[data-element="header"]`),
      body: table.querySelector(`[data-element="body"]`),
      previouslySortedField : null,
    };
  }

  createSortHandlers() {

    let handler = event => {
      let order = event.currentTarget.dataset.order === 'desc' ? 'asc' : 'desc';

      this.sort(event.currentTarget.dataset.id, order);
    }

    for (let element of this.subElements.header.children) {
      if (element.dataset.sortable) {
        element.addEventListener('pointerdown', handler);
      }
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

  getTableBody(inputData) {
    return `<div data-element="body" class="sortable-table__body">` + this.getTableRows(inputData);
  }

  getTableRows(inputData) {

    return inputData.map(item => {
      return `<a href="/products/${item.id}" class="sortable-table__row">` +
        this.headersConfig.map(column => {
          return column.id === 'images' ?
            column.template(item[column.id]) :
            `<div class="sortable-table__cell">${item[column.id]}</div>`;
        }).join('');
    }).join('') + `</a>`;
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

    if (!this.headersConfig[index].sortable) return;

    this.subElements.header.children[index].dataset.order = order;

    let sortedArray = this.sortData(field, index, order);

    this.subElements.body.innerHTML = this.getTableRows(sortedArray);
    this.moveArrow(index);
    this.subElements.previouslySortedField = this.subElements.header.children[index];
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

  sortOnServer(field, order) {
    // TO DO
  }

  moveArrow(index) {
    let arrow = `<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>`;

    if (this.subElements.previouslySortedField) {
      this.subElements.previouslySortedField.lastElementChild.remove();
    }
    this.subElements.header.children[index].insertAdjacentHTML('beforeend', arrow);
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
