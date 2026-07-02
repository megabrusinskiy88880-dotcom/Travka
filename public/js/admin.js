/**
 * Админ-панель - управление товарами и заказами
 */

const AdminPanel = {
  lots: [],
  orders: [],
  users: [],
  currentTab: 'lots',

  async init() {
    if (!Auth.isAdmin) {
      document.body.innerHTML = '<div style="text-align: center; margin-top: 50px;"><h2>⛔ Доступ запрещён</h2></div>';
      return;
    }

    this.setupEventListeners();
    await this.loadData();
    this.renderTabs();
  },

  setupEventListeners() {
    // Кнопки табов
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentTab = e.target.dataset.tab;
        this.renderTabs();
      });
    });

    // Форма для создания лота
    const createLotForm = document.getElementById('create-lot-form');
    if (createLotForm) {
      createLotForm.addEventListener('submit', (e) => this.handleCreateLot(e));
    }
  },

  async loadData() {
    try {
      this.lots = await API.admin.getLots();
      this.orders = await API.admin.getOrders();
      this.users = await API.admin.getUsers();
    } catch (error) {
      alert('Ошибка при загрузке данных: ' + error.message);
    }
  },

  async handleCreateLot(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    try {
      await API.admin.createLot(formData);
      alert('✅ Лот создан!');
      e.target.reset();
      await this.loadData();
      this.renderTabs();
    } catch (error) {
      alert('❌ Ошибка: ' + error.message);
    }
  },

  async deleteLot(id) {
    if (!confirm('Удалить этот лот?')) return;

    try {
      await API.admin.deleteLot(id);
      alert('✅ Лот удалён!');
      await this.loadData();
      this.renderTabs();
    } catch (error) {
      alert('❌ Ошибка: ' + error.message);
    }
  },

  async updateOrderStatus(orderId, newStatus) {
    try {
      await API.admin.updateOrder(orderId, { status: newStatus });
      alert('✅ Заказ обновлён!');
      await this.loadData();
      this.renderTabs();
    } catch (error) {
      alert('❌ Ошибка: ' + error.message);
    }
  },

  renderTabs() {
    const content = document.getElementById('tab-content');
    if (!content) return;

    if (this.currentTab === 'lots') {
      content.innerHTML = this.renderLotsTab();
    } else if (this.currentTab === 'orders') {
      content.innerHTML = this.renderOrdersTab();
    } else if (this.currentTab === 'users') {
      content.innerHTML = this.renderUsersTab();
    }
  },

  renderLotsTab() {
    return `
      <h2>📦 Управление лотами</h2>
      <div class="admin-section">
        <h3>Создать новый лот</h3>
        <form id="create-lot-form" enctype="multipart/form-data">
          <input type="text" name="title" placeholder="Название" required>
          <input type="number" name="price" placeholder="Цена" required>
          <textarea name="description" placeholder="Описание"></textarea>
          <input type="number" name="quantity" placeholder="Количество" value="1">
          <input type="file" name="photo" accept="image/*">
          <button type="submit" class="btn-primary">Создать лот</button>
        </form>
      </div>

      <div class="admin-section">
        <h3>Существующие лоты (${this.lots.length})</h3>
        <div class="lots-table">
          ${this.lots.length === 0 ? '<p>Лотов нет</p>' : this.lots.map(lot => `
            <div class="lot-row">
              <div>${lot.title}</div>
              <div>Цена: ${lot.price}</div>
              <div>В наличии: ${lot.quantity}</div>
              <div>Активен: ${lot.active ? '✅' : '❌'}</div>
              <button onclick="AdminPanel.deleteLot('${lot.id}')" class="btn-danger">Удалить</button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderOrdersTab() {
    return `
      <h2>📋 Управление заказами</h2>
      <div class="admin-section">
        <h3>Все заказы (${this.orders.length})</h3>
        <div class="orders-table">
          ${this.orders.length === 0 ? '<p>Заказов нет</p>' : this.orders.map(order => `
            <div class="order-row">
              <div><strong>${order.nickname}</strong> заказал <strong>${order.lotTitle}</strong></div>
              <div>Количество: ${order.quantity}</div>
              <div>Статус: 
                <select onchange="AdminPanel.updateOrderStatus('${order.id}', this.value)">
                  <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>⏳ Ожидание</option>
                  <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>✅ Подтверждён</option>
                  <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>🎉 Завершён</option>
                  <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>❌ Отменён</option>
                </select>
              </div>
              ${order.coords ? `<div>Координаты: ${order.coords}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    `;
  },

  renderUsersTab() {
    return `
      <h2>👥 Пользователи</h2>
      <div class="admin-section">
        <h3>Всего пользователей: ${this.users.length}</h3>
        <div class="users-table">
          ${this.users.length === 0 ? '<p>Пользователей нет</p>' : this.users.map(user => `
            <div class="user-row">
              <div><strong>${user.nickname}</strong></div>
              <div>ID: ${user.id}</div>
              <div>Создан: ${new Date(user.createdAt).toLocaleString('ru-RU')}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Auth.checkStatus().then(() => AdminPanel.init());
});
