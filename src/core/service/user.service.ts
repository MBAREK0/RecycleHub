import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from 'rxjs';
import { User } from "../interfaces/User";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) {}

  // Get user by id
  getUserById(id: string | null): Observable<User> {
    return this.http.get<User>(`http://localhost:3000/users/${id}`);
  }
}
