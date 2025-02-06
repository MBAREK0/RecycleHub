import { Component } from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Form fields
  credentials = {
    email: '',
    password: ''
  };

  constructor(private http: HttpClient, private router: Router) {}

  onSubmit() {
    // Validate form fields
    if (!this.credentials.email || !this.credentials.password) {
      alert('Please fill in all fields.');
      return;
    }

    // Fetch users from JSON server
    this.http.get<any[]>('http://localhost:3000/users').subscribe(
      (users) => {
        // Find the user with matching credentials
        const user = users.find(
          (u) => u.email === this.credentials.email && u.password === this.credentials.password
        );

        if (user) {
          localStorage.setItem('userId', user.id);
          localStorage.setItem('userRole', user.role);
          // Redirect based on user role
          if (user.role === 'particulier') {
            this.router.navigate(['/particulier-dashboard']);
          } else if (user.role === 'collecteur') {
            this.router.navigate(['/collecteur-dashboard']);
          }
        } else {
          alert('Invalid email or password.');
        }
      },
      (error) => {
        alert('An error occurred. Please try again.');
      }
    );
  }
}
