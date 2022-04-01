export default class SortableTable {
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;

    this.render();
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

  getTableHeader() {

    return `<div data-element="header" class="sortable-table__header sortable-table__row">` +
      this.headerConfig.map(column => {
        return `<div class="sortable-table__cell" data-id="${column.id}" data-sortable="${column.sortable}" data-order="">
                   <span>${column.title}
                     <span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>
                   </span>
                </div>`;
      }).join('') + `</div>`;
  }

  getTableBody(inputData) {
    return `<div data-element="body" class="sortable-table__body">` + this.getTableRows(inputData);
  }

  getTableRows(inputData) {

    return inputData.map(item => {
      return `<a href="/products/${item.id}" class="sortable-table__row">` +
        this.headerConfig.map(column => {
          return column.id === 'images' ?
            column.template(item[column.id]) :
            `<div class="sortable-table__cell">${item[column.id]}</div>`;
        }).join('');
    }).join('') + `</a>`;
  }

  sort(field, order) {
    let index = this.headerConfig.findIndex(obj => obj.id === field);

    if (!this.headerConfig[index].sortable) return;

    if (this.subElements.previouslySortedField) {
      this.subElements.previouslySortedField.dataset.order = ``;
    }

    this.subElements.header.children[index].dataset.order = order;
    this.subElements.previouslySortedField = this.subElements.header.children[index];

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
      if (this.headerConfig[index].sortType === 'string') {
        return direction * a[field].localeCompare(b[field], ['ru', 'en'], {caseFirst: 'upper'});
      }
      return direction * (a[field] - b[field]);
    });
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
