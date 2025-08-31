import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UserService {
  private username = '';
  private users: { [key: string]: string } = {};

  constructor() {
    const usersData = localStorage.getItem('users');
    if (usersData) {
      this.users = JSON.parse(usersData);
    }
    const usernameData = localStorage.getItem('username');
    if (usernameData) {
      this.username = usernameData;
    }
  }

  setUsername(name: string) {
    this.username = name;
    localStorage.setItem('username', name);
  }

  getUsername(): string {
    return this.username;
  }

  registerUser(username: string, password: string): boolean {
    if (this.users[username]) {
      return false;
    }
    this.users[username] = password;
    localStorage.setItem('users', JSON.stringify(this.users));
    return true;
  }

  validateUser(username: string, password: string): boolean {
    return this.users[username] === password;
  }

  getUserExists(username: string): boolean {
    return !!this.users[username];
  }

  logout() {
    this.username = '';
    localStorage.removeItem('username');
  }
}