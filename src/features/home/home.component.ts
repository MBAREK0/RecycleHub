import {Component, OnInit} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { v4 as uuidv4 } from 'uuid';
import {CommonModule, NgClass} from "@angular/common";

interface CollectionRequest {
  id: string;
  wasteType: string;
  wastePhotos: string | null;
  estimatedWeight: number;
  collectionAddress: string;
  collectionDate: string;
  collectionTime: string;
  additionalNotes: string;
  status: string;
  userId: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [FormsModule, NgClass,CommonModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{

  collectionRequest: CollectionRequest = {
    id: '',
    wasteType: '',
    wastePhotos: null,
    estimatedWeight: 0,
    collectionAddress: '',
    collectionDate: '',
    collectionTime: '',
    additionalNotes: '',
    status: 'pending',
    userId: localStorage.getItem('userId') || ''
  };

  userRequests: CollectionRequest[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchUserRequests();
  }

  fetchUserRequests(): void {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      alert('User ID not found. Please log in again.');
      this.router.navigate(['/login']);
      return;
    }

    this.http.get<CollectionRequest[]>(`http://localhost:3000/collection-requests?userId=${userId}`).subscribe(
      (data) => {
        this.userRequests = data; // Store the fetched requests
      },
      (error) => {
        console.error('Error fetching user requests:', error);
        alert('Failed to fetch collection requests. Please try again.');
      }
    );
  }

  onSubmit() {
    // Validate required fields
    if (
      !this.collectionRequest.wasteType ||
      !this.collectionRequest.estimatedWeight ||
      !this.collectionRequest.collectionAddress ||
      !this.collectionRequest.collectionDate ||
      !this.collectionRequest.collectionTime
    ) {
      alert('Please fill in all required fields.');
      return;
    }

    // Validate minimum weight (1000g)
    if (this.collectionRequest.estimatedWeight < 1000) {
      alert('The estimated weight must be at least 1000g.');
      return;
    }

    // Prepare the payload
    const payload = {
      ...this.collectionRequest,
      id: uuidv4(), // Generate a unique ID for the request
      wastePhotos: this.collectionRequest.wastePhotos ? this.collectionRequest.wastePhotos : null
    };

    // Submit the request to the server
    this.http.post('http://localhost:3000/collection-requests', payload).subscribe(
      (response) => {
        alert('Collection request submitted successfully!');
        this.resetForm();
      },
      (error) => {
        console.error('Error submitting collection request:', error);
        alert('Failed to submit collection request. Please try again.');
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
        this.collectionRequest.wastePhotos = response.filePath;
      }, () => alert('File upload failed!'));
  }

  resetForm() {
    this.collectionRequest = {
      id: '',
      wasteType: '',
      wastePhotos: null,
      estimatedWeight: 0,
      collectionAddress: '',
      collectionDate: '',
      collectionTime: '',
      additionalNotes: '',
      status: 'pending',
      userId: localStorage.getItem('userId') || ''
    };
  }
}
