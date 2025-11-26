import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  veg: boolean;
  restaurantId: number;
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getMenuItemsByRestaurant(restaurantId: number): Observable<MenuItem[]> {
    return this.http.get<MenuItem[]>(`${this.apiUrl}/restaurants/${restaurantId}/items`);
  }

  getMenuItemById(itemId: number): Observable<MenuItem> {
    return this.http.get<MenuItem>(`${this.apiUrl}/items/${itemId}`);
  }

  createMenuItem(restaurantId: number, menuItem: Omit<MenuItem, 'id' | 'restaurantId'>): Observable<MenuItem> {
    return this.http.post<MenuItem>(`${this.apiUrl}/restaurants/${restaurantId}/items`, menuItem);
  }

  updateMenuItem(itemId: number, menuItem: Omit<MenuItem, 'id' | 'restaurantId'>): Observable<MenuItem> {
    return this.http.put<MenuItem>(`${this.apiUrl}/items/${itemId}`, menuItem);
  }

  deleteMenuItem(itemId: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/items/${itemId}`);
  }
}

