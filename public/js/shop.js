/**
 * Магазин - логика отображения лотов и управления заказами
 */

const Shop = {
  lots: [],

  async init() {
    if (!Auth.isLoggedIn) {
      document.body.innerHTML = '<div style="text-align: center; margin-top: 50px;"><h2>Пожалуйста, авторизуйтесь</h2></div>';
      return;
    }

    await this.loadLots();
    this.render();
  },

  async loadLots() {
    try {
      this.lots = await API.user.getLots();
    } catch (error) {
      console.error('Error loading lots:', error);
      alert('Ошибка при загрузке товаров');
    }
  },

  render() {
    const container = document.getElementById('lots-container');
    if (!container) return;

    if (this.lots.length === 0) {
      container.innerHTML = '<p>Товары недоступны</p>';
      return;
    }

    container.innerHTML = this.lots.map(lot => `
      <div class="lot-card">
        ${lot.photo ? `<img src="${lot.photo}" alt="${lot.title}">` : '<div class="lot-image-placeholder">Нет фото</div>'}
        <h3>${lot.title}</h3>
        <p>${lot.description}</p>
        <p class="price">${lot.price} монет</p>
        <p class="quantity">В наличии: ${lot.quantity}</p>
        ${lot.quantity > 0 ? `
          <div class="order-controls">
            <input type="number" min="1" max="${lot.quantity}" value="1" id="qty-${lot.id}" class="qty-input">
            <button onclick="Shop.orderLot('${lot.id}')" class="order-btn">Заказать</button>
          </div>
        ` : '<p class="out-of-stock">Нет в наличии</p>'}
      </div>
    `).join('');
  },

  async orderLot(lotId) {
    try {
      const qtyInput = document.getElementById(`qty-${lotId}`);
      const quantity = parseInt(qtyInput.value, 10);

      if (quantity < 1) {
        alert('Некорректное количество');
        return;
      }

      await API.user.createOrder(lotId, quantity);
      alert('✅ Заказ создан! Проверьте кабинет');
      await this.loadLots();
      this.render();
    } catch (error) {
      alert('❌ Ошибка: ' + error.message);
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Auth.checkStatus().then(() => Shop.init());
});
