/**
 * Авторизация - управление сессией пользователя
 */

const Auth = {
  isLoggedIn: false,
  nickname: null,
  isAdmin: false,

  async checkStatus() {
    try {
      const user = await API.user.me();
      if (user.loggedIn) {
        this.isLoggedIn = true;
        this.nickname = user.nickname;
        this.updateUI();
      }
    } catch (err) {
      console.log('Not logged in');
    }

    try {
      const admin = await API.admin.me();
      if (admin.isAdmin) {
        this.isAdmin = true;
      }
    } catch (err) {
      console.log('Not admin');
    }
  },

  async userLogin(nickname) {
    try {
      const result = await API.user.login(nickname);
      this.isLoggedIn = true;
      this.nickname = result.nickname;
      this.updateUI();
      return result;
    } catch (error) {
      throw error;
    }
  },

  async userLogout() {
    try {
      await API.user.logout();
      this.isLoggedIn = false;
      this.nickname = null;
      this.updateUI();
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  async adminLogin(password) {
    try {
      const result = await API.admin.login(password);
      this.isAdmin = true;
      return result;
    } catch (error) {
      throw error;
    }
  },

  async adminLogout() {
    try {
      await API.admin.logout();
      this.isAdmin = false;
    } catch (error) {
      console.error('Admin logout error:', error);
    }
  },

  updateUI() {
    const userInfo = document.getElementById('user-info');
    const loginBtn = document.getElementById('login-btn');

    if (userInfo && loginBtn) {
      if (this.isLoggedIn) {
        userInfo.textContent = this.nickname;
        loginBtn.textContent = 'Выход';
        loginBtn.onclick = () => this.userLogout();
      } else {
        userInfo.textContent = 'Не авторизован';
        loginBtn.textContent = 'Вход';
        loginBtn.onclick = () => {
          const nickname = prompt('Введите ваш ник:');
          if (nickname) {
            this.userLogin(nickname).catch(err => alert(err.message));
          }
        };
      }
    }
  }
};

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', () => {
  Auth.checkStatus();
});
