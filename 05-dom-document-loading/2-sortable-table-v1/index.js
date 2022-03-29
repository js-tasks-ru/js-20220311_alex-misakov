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
    table.append(this.getTableHeader());
    table.append(this.getTableBody());

    container.append(table);
    this.element = container;
    this.refToTableBody = table;
    this.refToElements = this.createRefToElements();
  }

  getTableHeader() {
    let header = document.createElement('div');
    header.setAttribute('class', 'sortable-table__header sortable-table__row');
    header.setAttribute('data-element', 'header');

    let headerRows = '';
    let spanArrow = `<span data-element="arrow" class="sortable-table__sort-arrow"><span class="sort-arrow"></span></span>`;

    for (let headerCell of this.headerConfig ) {
      // headerRows += `<div class="sortable-table__cell" data-id="${headerCell.id}"
      //                     data-sortable="${headerCell.sortable}"
      //                     data-order="asc">
      //                     <span>${headerCell.title}</span>
      //                     ${headerCell.sortable ? spanArrow : ""}
      //                </div>`;

      headerRows += `<div class="sortable-table__cell" data-id="${headerCell.id}"
                          data-sortable="${headerCell.sortable}">
                          <span>${headerCell.title}</span>
                          ${headerCell.sortable ? spanArrow : ""}
                     </div>`;
    }
    header.innerHTML = headerRows;

    return header;
  }

  getTableBody() {
    let table = document.createElement('div');
    table.setAttribute('class', 'sortable-table__body');
    table.setAttribute('data-element', 'body');

    let tableRows = ``;

    for (let tableCell of this.data ) {
      tableRows += `<a href="/products/${tableCell.id}" class="sortable-table__row">`;

      for (let field of this.headerConfig) {
        if (field.id === 'images') {
          tableRows += field.template(tableCell[field.id]);
        } else {
          tableRows += `<div class="sortable-table__cell">${tableCell[field.id]}</div>`;
        }
      }
      tableRows += `</a>`;
    }
    table.innerHTML = tableRows;

    return table;
  }

  createRefToElements() {
    let refToRows = this.element.querySelectorAll(`[class="sortable-table__row"]`);

    let refToElements = [];

    for (let ref of refToRows) {
      let currentRef = {};
      let refToCells = Array.from(ref.querySelectorAll(`[class="sortable-table__cell"]`));
      currentRef.row = ref;
      currentRef.cells = {};

      let i = 0;
      for (let field of this.headerConfig) {
        currentRef.cells[field.id] = refToCells[i++];
      }

      refToElements.push(currentRef);
    }

    return refToElements;
  }

  sort(field, order) {
    let col = this.headerConfig.find((item) => item.id === field);

    if (!col.sortable) {
      return;
    }

    const directions = {
      asc: 1,
      desc: -1
    }
    const direction = directions[order];

    this.refToElements.sort((rowA, rowB) => {
      if (col.sortType === 'string') {
        return direction * rowA.cells[field].innerHTML.localeCompare(rowB.cells[field].innerHTML, ['ru', 'en'], {caseFirst: 'upper'});
      }
      return direction * (rowA.cells[field].innerHTML - rowB.cells[field].innerHTML);
    });

    let sortedArray = [];

    for (let elem of this.refToElements) {
      sortedArray.push(elem.row);
    }

    this.refToTableBody.append(...sortedArray);
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
