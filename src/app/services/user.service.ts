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
    /**
     * Log the current user out.
     *
     * Behavior:
     * - Clears the in-memory `username` and removes the persisted `username` key from localStorage.
     * - This function intentionally does not perform navigation; callers should redirect (e.g. HomePage confirms
     *   logout and performs router navigation or a hard redirect).
     *
     * Side-effects: localStorage is modified.
     */
    this.username = '';
    localStorage.removeItem('username');
  }

  // Mock: generate a reset token and 'send' it (store in localStorage)
  sendResetLink(username: string): string | null {
    if (!this.users[username]) return null;
    const token = Math.random().toString(36).substring(2, 9);
    const tokens = JSON.parse(localStorage.getItem('resetTokens') || '{}');
    tokens[username] = token;
    localStorage.setItem('resetTokens', JSON.stringify(tokens));
    // In a real app, you would email the token; here we return it so UI can display for testing
    return token;
  }

  // Mock: reset password if token matches stored token
  resetPassword(username: string, token: string, newPassword: string): boolean {
    const tokens = JSON.parse(localStorage.getItem('resetTokens') || '{}');
    if (tokens[username] && tokens[username] === token) {
      this.users[username] = newPassword;
      localStorage.setItem('users', JSON.stringify(this.users));
      delete tokens[username];
      localStorage.setItem('resetTokens', JSON.stringify(tokens));
      return true;
    }
    return false;
  }
}