import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from "@angular/forms";
import { v4 as uuidv4 } from 'uuid';
import {User} from "../../../core/interfaces/User";

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  // Form fields
  user:User = {
    id: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    address: '',
    city:'',
    phoneNumber: '',
    dateOfBirth: '',
    profilePhoto: '',
    role:''
  };

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    if (this.user.password !== this.user.confirmPassword) {
      alert('Passwords do not match!');
      return;
    }

    const payload = {
      ...this.user,
      role: 'particulier',
      id:  uuidv4()
    };

    this.http.post('http://localhost:3000/users', payload).subscribe(
      (response) => {
        this.router.navigate(['/login']);
      },
      (error) => {
        alert('Registration failed. Please try again.');
      }
    );
  }

  onFileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePhoto', file);

    this.http.post<{ filePath: string }>('http://localhost:8000/upload', formData)
      .subscribe(response => {
        this.user.profilePhoto = response.filePath;
      }, () => alert('File upload failed!'));
  }
}
