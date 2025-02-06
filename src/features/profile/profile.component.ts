import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {UUIDTypes} from "uuid";
import {Router} from "@angular/router";

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: any = {};
  userId: string | null = localStorage.getItem('userId');

  credentials: any = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''

  }
  constructor(private http: HttpClient,private router: Router) {}

  ngOnInit(): void {
    this.fetchUserData();
  }

  // Fetch user data from JSON server
  fetchUserData(): void {
    this.http.get<any>(`http://localhost:3000/users/${this.userId}`).subscribe(
      (data) => {
        this.user = data;
        console.log("hhhhhhh",this.user)// Populate the form with user data
      },
      (error) => {
        console.error('Error fetching user data:', error);
      }
    );
  }

  // Update user data
  updateUser(): void {
    this.http.put(`http://localhost:3000/users/${this.userId}`, this.user).subscribe(
      (response) => {
        alert('Profile updated successfully!');
      },
      (error) => {
        console.error('Error updating user data:', error);
      }
    );
  }

  // Delete user account
  deleteUser(): void {
    this.http.delete(`http://localhost:3000/users/${this.userId}`).subscribe(
      (response) => {
        alert('Account deleted successfully!');
        localStorage.removeItem('userId');
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Error deleting user account:', error);
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
        console.log("user",this.user)
        this.fetchUserData();
      }, () => alert('File upload failed!'));
  }

  // Update password
  updatePassword(): void {
    if (!this.credentials.oldPassword || !this.credentials.newPassword || !this.credentials.confirmPassword) {
      alert('Please fill in all fields.');
      return;
    }

    if (this.credentials.newPassword !== this.credentials.confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }

    if (this.credentials.newPassword === this.credentials.oldPassword) {
      alert('New password must be different from the old password.');
      return;
    }

    // Verify old password
    if (this.user.password !== this.credentials.oldPassword) {
      alert('Incorrect old password.');
      return;
    }

    // Update password
    this.http
      .put(`http://localhost:3000/users/${this.userId}`, {
        ...this.user,
        password: this.credentials.newPassword
      })
      .subscribe(
        (response) => {
          alert('Password updated successfully!');
          this.credentials = { oldPassword: '', newPassword: '', confirmPassword: '' }; // Reset form
        },
        (error) => {
          console.error('Error updating password:', error);
          alert('Failed to update password. Please try again.');
        }
      );
  }


}
