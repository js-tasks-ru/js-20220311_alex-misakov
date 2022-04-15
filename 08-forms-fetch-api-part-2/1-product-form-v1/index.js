import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

export default class ProductForm {
  // formControlValues = {
  //   title: '',
  //   description: '',
  //   subcategory: '',
  //   price: 0,
  //   discount: 0,
  //   number: 0,
  //   status: 0,
  //   images: [],
  // }
  constructor (productId) {
    this.productId = productId;
    this.urlPoducts = new URL('api/rest/products', BACKEND_URL);
    this.urlCategories = new URL('api/rest/categories', BACKEND_URL);

    this.getTemplate();
    this.getControlElements();
    this.imageListContainer = this.element.querySelector(`[data-element="imageListContainer"]`);
    // this.addEventListeners();
  }

  async render () {
    await this.getProductData();
    await this.getCategoriesList();
  }

  getTemplate() {
    let element = document.createElement('div');
    element.classList.add('product-form');
    element.innerHTML = `<form data-element="productForm" class="form-grid">
      <div class="form-group form-group__half_left">
        <fieldset>
          <label class="form-label">Название товара</label>
          <input required="" type="text" name="title" class="form-control" placeholder="Название товара">
        </fieldset>
      </div>
      <div class="form-group form-group__wide">
        <label class="form-label">Описание</label>
        <textarea required="" class="form-control" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
      </div>
      <div class="form-group form-group__wide" data-element="sortable-list-container">
        <label class="form-label">Фото</label>
        <div data-element="imageListContainer"></div>
        <button type="button" name="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>
      </div>
      <div class="form-group form-group__half_left">
        <label class="form-label">Категория</label>
        <select class="form-control" name="subcategory">
        </select>
      </div>
      <div class="form-group form-group__half_left form-group__two-col">
        <fieldset>
          <label class="form-label">Цена ($)</label>
          <input required="" type="number" name="price" class="form-control" placeholder="100">
        </fieldset>
        <fieldset>
          <label class="form-label">Скидка ($)</label>
          <input required="" type="number" name="discount" class="form-control" placeholder="0">
        </fieldset>
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Количество</label>
        <input required="" type="number" class="form-control" name="quantity" placeholder="1">
      </div>
      <div class="form-group form-group__part-half">
        <label class="form-label">Статус</label>
        <select class="form-control" name="status">
          <option value="1">Активен</option>
          <option value="0">Неактивен</option>
        </select>
      </div>
      <div class="form-buttons">
        <button type="submit" name="save" class="button-primary-outline">
          Сохранить товар
        </button>
      </div>
    </form>`;

    this.element = element;
  }

  getControlElements() {
    this.controlElements = Array.from(this.element.querySelectorAll(`.form-control`))
      .reduce((previous, current) => {
        previous[current.name] = current;
        return previous;
      }, {});
  }

  async loadProductData() {
    this.urlPoducts.searchParams.set('id', this.productId);

    return await fetchJson(this.urlPoducts);
  }

  async getProductData() {
    const data = await this.loadProductData();

    if (!data) return;

    for (const [key, val] of Object.entries(this.controlElements)) {
      val.value = data[0][key];
    }

    this.imageListContainer.innerHTML = this.getImageList(data[0].images);
  }

  async loadCategoriesData() {
    this.urlCategories.searchParams.set('_sort', `weight`);
    this.urlCategories.searchParams.set('_refs', `subcategory`);

    const data = await fetchJson(this.urlCategories);
    const categoriesData = [];

    data.forEach( category => {
      categoriesData.push(...category.subcategories.map( sub => {
        return { value: sub.id, content: `${category.title} &gt; ${sub.title}` };
      }));
    });

    return categoriesData;
  }

  async getCategoriesList() {
    const categoriesData = await this.loadCategoriesData();

    this.controlElements.subcategory.innerHTML = categoriesData.map( item => {
      return `<option value="${item.value}">${item.content}</option>`;
    }).join('');
  }

  getImageList(images) {
    const imageList = images.map(image => this.getImageListItem(image)).join('');
    return `<ul class="sortable-list">${imageList}</ul>`;
  }

  getImageListItem(item) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${item.url}">
        <input type="hidden" name="source" value="${item.source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="Image" src="${item.url}">
          <span>${item.source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="" alt="delete">
        </button></li>`;
  }

  remove() {
    if (this.element) {
      this.element.remove();
    }
  }

  destroy() {
    // this.removeEventListeners();
    this.remove();
    this.element = null;
  }
}
