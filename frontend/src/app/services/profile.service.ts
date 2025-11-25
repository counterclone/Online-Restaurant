import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Profile {
  id: number;
  userId: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
}

export interface Address {
  id: number;
  userId: number;
  street: string;
  city: string;
  state: string;
  pincode: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  // GET /api/profile
  // Response: Profile
  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/profile`);
  }

  // PUT /api/profile
  // Request: Profile (without id and userId)
  // Response: Profile
  updateProfile(profile: Omit<Profile, 'id' | 'userId'>): Observable<Profile> {
    return this.http.put<Profile>(`${this.apiUrl}/profile`, profile);
  }
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = 'http://localhost:8080/api/addresses';

  constructor(private http: HttpClient) {}

  // GET /api/addresses
  // Response: Address[]
  getAddresses(): Observable<Address[]> {
    return this.http.get<Address[]>(this.apiUrl);
  }

  // GET /api/addresses/{id}
  // Response: Address
  getAddressById(id: number): Observable<Address> {
    return this.http.get<Address>(`${this.apiUrl}/${id}`);
  }

  // POST /api/addresses
  // Request: Address (without id and userId)
  // Response: Address
  createAddress(address: Omit<Address, 'id' | 'userId'>): Observable<Address> {
    return this.http.post<Address>(this.apiUrl, address);
  }

  // PUT /api/addresses/{id}
  // Request: Address (without id and userId)
  // Response: Address
  updateAddress(id: number, address: Omit<Address, 'id' | 'userId'>): Observable<Address> {
    return this.http.put<Address>(`${this.apiUrl}/${id}`, address);
  }

  // DELETE /api/addresses/{id}
  // Response: { message: string }
  deleteAddress(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/${id}`);
  }
}

