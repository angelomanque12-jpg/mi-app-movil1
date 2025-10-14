import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PlacesService, PlacePhoto } from '../../services/places.service';

@Component({
  selector: 'app-place-detail',
  templateUrl: './place-detail.page.html',
  styleUrls: ['./place-detail.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class PlaceDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private places = inject(PlacesService);

  place?: PlacePhoto;
  newComment = '';
  newRating = 4;
  showModal = false;
  selectedImage?: string;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id') || this.route.snapshot.queryParamMap.get('id');
    if (id) {
      this.places.getPlaceById(id).subscribe(p => this.place = p);
    }
  }

  submitFeedback() {
    if (!this.place) return;
    const user = 'Anónimo';
    if (this.newComment) this.places.addComment(this.place.id, user, this.newComment);
    if (this.newRating) this.places.addRating(this.place.id, this.newRating);
    // reload local copy
    this.places.getPlaceById(this.place.id).subscribe(p => this.place = p);
    this.newComment = '';
  }

  openImage(url: string) {
    this.selectedImage = url;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedImage = undefined;
  }
}
