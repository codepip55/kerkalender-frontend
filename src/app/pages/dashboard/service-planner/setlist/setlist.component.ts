import { Component, OnDestroy, OnInit } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faPencil, faTrash } from '@fortawesome/free-solid-svg-icons';
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
export class SetlistComponent implements OnInit, OnDestroy {

  constructor(private alertService: AlertService, private route: ActivatedRoute, private apiService: ApiService) {
  }

  setlistForm!: FormGroup;
  service_id: string;
  setlist_id: string;
  setlist: any;

  protected readonly faTrash = faTrash;
  protected readonly faFloppyDisk = faFloppyDisk;

  ngOnInit() {
    this.setlistForm = new FormGroup({
      songs: new FormArray([])
    })

    this.init();
  }
  ngOnDestroy() {
    this.setlistForm.reset();
  }

  private async init() {
    // Get service id from route
    const service_id = this.route.parent?.snapshot.paramMap.get('id');
    this.service_id = service_id!;

    // Get setlist by service_id
    let setlist: any = this.apiService.getSetlistByServiceId(this.service_id);
    setlist = await lastValueFrom(setlist);
    // If 404, create setlist
    if (setlist.setlist === null) {
      this.alertService.add({ type: 'warning', message: 'Geen setlist gevonden, maak een nieuwe aan.' });
      // Create setlist
      this.apiService.createSetlist({
        service: this.service_id,
        songs: []
      }).subscribe({ next: (res) => {
          this.alertService.add({ type: 'success', message: 'Setlist aangemaakt.' });
          // @ts-ignore
          this.setlist_id = res._id;
          this.setlist = res;
        }, error: (err) => {
          console.error(err);
          this.alertService.add({ type: 'warning', message: 'Het is niet gelukt om de setlist aan te maken.' });
        }
      })
    } else {
      this.setlist_id = setlist._id;
      this.setlist = setlist;
    }

    // Init form
    if (!setlist.songs) {
      return;
    }
    setlist.songs.forEach((song: any) => {
      const songGroup: FormGroup = new FormGroup({
        title: new FormControl(song.title, Validators.required),
        artist: new FormControl(song.artist),
        spotifyLink: new FormControl(song.spotifyLink),
        key: new FormControl(song.key, Validators.required),
        vocalNotes: new FormControl(song.vocalNotes),
        bandNotes: new FormControl(song.bandNotes)
      });
      this.songs.push(songGroup);
    })
  }
  get songs(): FormArray {
    return this.setlistForm.get('songs') as FormArray;
  }
  songGroup(i: number): FormGroup {
    return this.songs.at(i) as FormGroup;
  }
  addSong(songName: string) {
    // Check if song already exists
    for (let i = 0; i < this.songs.length; i++) {
      if (this.songs.at(i).get('song')?.value === songName) {
        this.alertService.add({ type: 'warning', message: 'Dit lied is al toegevoegd.' });
        return;
      }
    }

    const songGroup: FormGroup = new FormGroup({
      title: new FormControl(songName, Validators.required),
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
      if (this.setlist_id === undefined) {
        this.alertService.add({ type: 'warning', message: 'Kon setlist id niet vinden' });
      }
      this.apiService.updateSetlist(this.setlist_id, {
        service: this.service_id,
        songs: this.setlistForm.value.songs.map((song: any) => {
          return {
            title: song.title,
            artist: song.artist,
            spotify_link: song.spotifyLink,
            key: song.key,
            vocalNotes: song.vocalNotes,
            bandNotes: song.bandNotes
          }
        })
      }).subscribe({ next: (res) => {
        this.alertService.add({ type: 'success', message: 'Setlist bijgewerkt.' });
        }, error: (err) => {
          console.error(err);
          this.alertService.add({type: 'warning', message: 'Het is niet gelukt om de setlist bij te werken.'});
        }
      });
    } else {
      this.alertService.add({ type: 'warning', message: 'Formulier is niet geldig.' });
      console.error('Formulier is niet geldig.');
    }
  }

  protected readonly faPencil = faPencil;
  protected readonly FormGroup = FormGroup;
}
