/**
 * Кабинет - управление заказами пользователя
 */

const Cabinet = {
  orders: [],

  async init() {
    if (!Auth.isLoggedIn) {
      document.body.innerHTML = '<div style="text-align: center; margin-top: 50px;"><h2>Пожалуйста, авторизуйтесь</h2></div>';
      return;
    }

    await this.loadOrders();
    this.render();

    // Обновляем заказы каждые 5 секунд
    setInterval(() => this.refreshOrders(), 5000);
  },

  async loadOrders() {
    try {
      this.orders = await API.user.getMyOrders();
    } catch (error) {
      console.error('Error loading orders:', error);
      alert('Ошибка при загрузке заказов');
    }
  },

  async refreshOrders() {
    await this.loadOrders();
    this.render();
  },

  getStatusBadge(status) {
    const statusMap = {
      'pending': { text: '⏳ В ожидании', color: '#ffc107' },
      'confirmed': { text: '✅ Подтверждён', color: '#28a745' },
      'completed': { text: '🎉 Завершён', color: '#17a2b8' },
      'cancelled': { text: '❌ Отменён', color: '#dc3545' }
    };
    const badge = statusMap[status] || { text: status, color: '#6c757d' };
    return `<span style="background: ${badge.color}; color: white; padding: 5px 10px; border-radius: 5px;">${badge.text}</span>`;
  },

  render() {
    const container = document.getElementById('orders-container');
    if (!container) return;

    if (this.orders.length === 0) {
      container.innerHTML = '<p>У вас нет заказов</p>';
      return;
    }

    container.innerHTML = this.orders.map(order => `
      <div class="order-card">
        <h3>${order.lotTitle}</h3>
        <p><strong>Статус:</strong> ${this.getStatusBadge(order.status)}</p>
        <p><strong>Количество:</strong> ${order.quantity}</p>
        <p><strong>Цена за единицу:</strong> ${order.price} монет</p>
        <p><strong>Всего:</strong> ${order.quantity * order.price} монет</p>
        ${order.coords ? `<p><strong>Координаты:</strong> ${order.coords}</p>` : ''}
        ${order.adminNote ? `<p><strong>Заметка админа:</strong> ${order.adminNote}</p>` : ''}
        <small>Создан: ${new Date(order.createdAt).toLocaleString('ru-RU')}</small>
      </div>
    `).join('');
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Auth.checkStatus().then(() => Cabinet.init());
});
