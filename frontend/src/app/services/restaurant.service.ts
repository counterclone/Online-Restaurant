import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Restaurant {
  id: number;
  name: string;
  address: string;
  cuisine: string;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiUrl = 'http://localhost:8080/api/restaurants';

  constructor(private http: HttpClient) {}

  // GET /api/restaurants
  // Response: Restaurant[]
  getAllRestaurants(): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(this.apiUrl);
  }

  // GET /api/restaurants/{id}
  // Response: Restaurant
  getRestaurantById(id: number): Observable<Restaurant> {
    return this.http.get<Restaurant>(`${this.apiUrl}/${id}`);
  }

  // POST /api/restaurants
  // Request: Restaurant (without id)
  // Response: Restaurant
  createRestaurant(restaurant: Omit<Restaurant, 'id'>): Observable<Restaurant> {
    return this.http.post<Restaurant>(this.apiUrl, restaurant);
  }

  // PUT /api/restaurants/{id}
  // Request: Restaurant (without id)
  // Response: Restaurant
  updateRestaurant(id: number, restaurant: Omit<Restaurant, 'id'>): Observable<Restaurant> {
    return this.http.put<Restaurant>(`${this.apiUrl}/${id}`, restaurant);
  }

  // DELETE /api/restaurants/{id}
  // Response: { message: string }
  deleteRestaurant(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }

  // GET /api/restaurants/search?name={name}
  // Response: Restaurant[]
  searchRestaurants(name: string): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}/search`, { params: { name } });
  }

  // GET /api/restaurants/cuisine/{cuisine}
  // Response: Restaurant[]
  getRestaurantsByCuisine(cuisine: string): Observable<Restaurant[]> {
    return this.http.get<Restaurant[]>(`${this.apiUrl}/cuisine/${cuisine}`);
  }
}

