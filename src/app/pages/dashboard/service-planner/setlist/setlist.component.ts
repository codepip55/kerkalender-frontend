import { Component, OnInit } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { faFloppyDisk } from '@fortawesome/free-regular-svg-icons';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AlertService } from '../../../../services/alert.service';
import { NgFor } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../../../services/api.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-setlist',
  imports: [
    FaIconComponent,
    ReactiveFormsModule,
    NgFor
  ],
  templateUrl: './setlist.component.html',
  styleUrl: './setlist.component.scss'
})
export class SetlistComponent implements OnInit{

  constructor(private alertService: AlertService, private route: ActivatedRoute, private apiService: ApiService) {
  }

  setlistForm!: FormGroup;
  service_id: number;
  setlist_id: number;

  protected readonly faTrash = faTrash;
  protected readonly faFloppyDisk = faFloppyDisk;

  ngOnInit() {
    this.setlistForm = new FormGroup({
      songs: new FormArray([]),
    })

    this.init();
  }
  private async init() {
    // Get service id from route
    const service_id = this.route.parent?.snapshot.paramMap.get('id');
    this.service_id = parseInt(service_id!);

    // Get setlist by service_id
    let setlist: any = this.apiService.getSetlistByServiceId(this.service_id);
    setlist = await lastValueFrom(setlist);
    console.log(setlist);
  }
  get songs() {
    return this.setlistForm.get('songs') as FormArray;
  }
  addSong(songName: string) {
    // Check if song already exists
    for (let i = 0; i < this.songs.length; i++) {
      if (this.songs.at(i).get('song')?.value === songName) {
        this.alertService.add({ type: 'warning', message: 'Dit lied is al toegevoegd.' });
        return;
      }
    }

    const songGroup = new FormGroup({
      song: new FormControl(songName, Validators.required),
      artist: new FormControl(''),
      spotifyLink: new FormControl(''),
      key: new FormControl('C', Validators.required),
      vocalNotes: new FormControl(''),
      bandNotes: new FormControl('')
    });
    this.songs.push(songGroup);
  }
  removeSong(index: number) {
    this.songs.removeAt(index);
  }
  onSubmit() {
    if (this.setlistForm.valid) {
      this.alertService.add({ type: 'success', message: 'Setlist opgeslagen' });
      console.log(this.setlistForm.value);
    } else {
      this.alertService.add({ type: 'warning', message: 'Formulier is niet geldig.' });
      console.error('Formulier is niet geldig.');
    }
  }
}
