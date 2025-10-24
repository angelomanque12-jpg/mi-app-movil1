import { Injectable } from '@angular/core';

export interface Board {
  id: string;
  name: string;
  description?: string;
  owner?: string;
  pins: string[]; // arreglo de IDs de lugares
}

@Injectable({ providedIn: 'root' })
export class BoardsService {
  private STORAGE_KEY = 'user_boards_v1';
  private boards: Board[] = [];

  constructor() {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      this.boards = raw ? JSON.parse(raw) : [];
    } catch (e) {
      this.boards = [];
    }
  }

  getBoards(): Board[] {
    return this.boards.slice();
  }

  createBoard(name: string, description?: string, owner?: string) {
    const id = 'b_' + new Date().getTime();
    const b: Board = { id, name, description, owner: owner || 'Usuario', pins: [] };
    this.boards.unshift(b);
    this.persist();
    return b;
  }

  addPin(boardId: string, placeId: string) {
    const b = this.boards.find(x => x.id === boardId);
    if (!b) return false;
    if (!b.pins.includes(placeId)) b.pins.unshift(placeId);
    this.persist();
    return true;
  }

  removePin(boardId: string, placeId: string) {
    const b = this.boards.find(x => x.id === boardId);
    if (!b) return false;
    b.pins = b.pins.filter(p => p !== placeId);
    this.persist();
    return true;
  }

  private persist() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.boards));
  }
}
