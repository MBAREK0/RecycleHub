import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {FormsModule} from "@angular/forms";

export interface User {
  id: string;
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  phoneNumber: string;
  dateOfBirth: string;
  profilePhoto: string;
  role: string;
  points?: number; // Added for the points system
}

interface CollectionRequest {
  id: string;
  wasteTypes: string[];
  wastePhotos: string | null;
  estimatedWeight: number;
  actualWeight: number | null;
  collectionAddress: string;
  collectionDate: string;
  collectionTime: string;
  additionalNotes: string;
  status: 'pending' | 'occupied' | 'in_progress' | 'validated' | 'rejected' | 'collected'; // Nouveaux statuts
  userId: string;
  city: string;
}

@Component({
  selector: 'app-collector-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule], // Import CommonModule for *ngFor and *ngIf
  templateUrl: './collector-dashboard.component.html',
  styleUrls: ['./collector-dashboard.component.css']
})
export class CollectorDashboardComponent implements OnInit {
  collectionRequests: CollectionRequest[] = [];
  selectedRequest: CollectionRequest | null = null;
  collectorCity: string = '';
  collectorId: string = '';
  actualWeight: number | null = null;
  validationPhotos: string | null = null;

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.fetchCollectorData();
  }

  fetchCollectorData(): void {
    const collectorId = localStorage.getItem('userId');
    if (!collectorId) {
      alert('Collector ID not found. Please log in again.');
      this.router.navigate(['/login']);
      return;
    }

    this.collectorId = collectorId;

    this.http.get<User>(`http://localhost:3000/users/${collectorId}`).subscribe(
      (data) => {
        this.collectorCity = data.city;
        this.fetchCollectionRequests();
      },
      (error) => {
        console.error('Error fetching collector data:', error);
        alert('Failed to fetch collector data. Please try again.');
      }
    );
  }

  fetchCollectionRequests(): void {
    // Récupérer les demandes en statut "pending"
    this.http.get<CollectionRequest[]>(`http://localhost:3000/collection-requests?city=${this.collectorCity}&status=pending`).subscribe(
      (pendingData) => {
        // Récupérer les demandes en statut "occupied"
        this.http.get<CollectionRequest[]>(`http://localhost:3000/collection-requests?city=${this.collectorCity}&status=occupied`).subscribe(
          (occupiedData) => {
            // Fusionner les deux tableaux de résultats
            this.collectionRequests = [...pendingData, ...occupiedData];
          },
          (error) => {
            console.error('Error fetching occupied requests:', error);
            alert('Failed to fetch occupied requests. Please try again.');
          }
        );
      },
      (error) => {
        console.error('Error fetching pending requests:', error);
        alert('Failed to fetch pending requests. Please try again.');
      }
    );
  }

  selectRequest(request: CollectionRequest): void {
    this.selectedRequest = request;
  }

  acceptRequest(): void {
    if (!this.selectedRequest) {
      alert('No request selected.');
      return;
    }

    this.http.patch(`http://localhost:3000/collection-requests/${this.selectedRequest.id}`, { status: 'occupied' }).subscribe(
      (response) => {
        alert('Request accepted successfully!');
        this.fetchCollectionRequests();
        this.selectedRequest = null;
      },
      (error) => {
        console.error('Error accepting request:', error);
        alert('Failed to accept request. Please try again.');
      }
    );
  }
  rejectRequest(): void {
    if (!this.selectedRequest) {
      alert('No request selected.');
      return;
    }

    this.http.patch(`http://localhost:3000/collection-requests/${this.selectedRequest.id}`, { status: 'rejected' }).subscribe(
      (response) => {
        alert('Request rejected successfully!');
        this.fetchCollectionRequests();
        this.selectedRequest = null;
      },
      (error) => {
        console.error('Error accepting request:', error);
        alert('Failed to accept request. Please try again.');
      }
    );
  }

  validateCollection(): void {
    if (!this.selectedRequest || !this.actualWeight) {
      alert('Please select a request and enter the actual weight.');
      return;
    }

    // Plastic Glass Paper Metal validate if the type innthose types
    const validTypes = ['plastic', 'glass', 'paper', 'metal'];
    const invalidTypes = this.selectedRequest.wasteTypes.filter((type) => !validTypes.includes(type));

    if (invalidTypes.length > 0) {
      alert(`Invalid waste types: ${invalidTypes.join(', ')} please reject the collection.`);
      return;
    }

    // Vérification du poids réel
    if (this.actualWeight !== this.selectedRequest.estimatedWeight) {
      this.http.patch(`http://localhost:3000/collection-requests/${this.selectedRequest.id}`, {
        status: 'rejected',
        actualWeight: this.actualWeight,
        validationPhotos: this.validationPhotos
      }).subscribe(
        (response) => {
          alert('Collection rejected: Actual weight does not match estimated weight.');
          this.fetchCollectionRequests();
          this.selectedRequest = null;
          this.actualWeight = null;
          this.validationPhotos = null;
        },
        (error) => {
          console.error('Error rejecting collection:', error);
          alert('Failed to reject collection. Please try again.');
        }
      );
      return;
    }

    // Si le poids est correct, valider la collecte
    const points = this.calculatePoints(this.selectedRequest.wasteTypes, this.actualWeight);

    this.http.patch(`http://localhost:3000/collection-requests/${this.selectedRequest.id}`, {
      status: 'validated', // Nouveau statut
      actualWeight: this.actualWeight,
      validationPhotos: this.validationPhotos
    }).subscribe(
      (response) => {
        this.http.patch(`http://localhost:3000/users/${this.selectedRequest?.userId}`, { points }).subscribe(
          () => {
            alert('Collection validated successfully! Points have been added.');
            this.fetchCollectionRequests();
            this.selectedRequest = null;
            this.actualWeight = null;
            this.validationPhotos = null;
          },
          (error) => {
            console.error('Error updating user points:', error);
            alert('Failed to update user points. Please try again.');
          }
        );
      },
      (error) => {
        console.error('Error validating collection:', error);
        alert('Failed to validate collection. Please try again.');
      }
    );
  }

  calculatePoints(wasteTypes: string[], actualWeight: number): number {
    let points = 0;
    wasteTypes.forEach((type) => {
      switch (type) {
        case 'plastic':
          points += 2 * actualWeight;
          break;
        case 'glass':
          points += 1 * actualWeight;
          break;
        case 'paper':
          points += 1 * actualWeight;
          break;
        case 'metal':
          points += 5 * actualWeight;
          break;
      }
    });
    return points;
  }

  onFileChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('validationPhotos', file);

    this.http.post<{ filePath: string }>('http://localhost:8000/upload', formData)
      .subscribe(
        (response) => {
          this.validationPhotos = response.filePath;
        },
        (error) => {
          console.error('Error uploading file:', error);
          alert('File upload failed!');
        }
      );
  }
}
