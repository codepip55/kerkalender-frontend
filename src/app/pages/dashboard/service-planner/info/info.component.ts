import { Component, OnInit, ViewChild } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCircleCheck, faCircleQuestion, faCircleXmark, faFloppyDisk } from '@fortawesome/free-regular-svg-icons';
import { faCross, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor } from '@angular/common';
import { AlertService } from '../../../../services/alert.service';
import { ApiService } from '../../../../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-info',
  imports: [
    FaIconComponent,
    ReactiveFormsModule,
    NgFor
  ],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent implements OnInit{

  constructor(private alertService: AlertService, private apiService: ApiService, private route: ActivatedRoute, private router: Router) {
  }

  @ViewChild('positionName') positionName!: HTMLInputElement;
  @ViewChild('teamName') teamName!: HTMLInputElement;

  protected readonly faCircleQuestion = faCircleQuestion;
  protected readonly faCircleCheck = faCircleCheck;
  protected readonly faCircleXmark = faCircleXmark;
  protected readonly faTrash = faTrash;
  protected readonly faFloppyDisk = faFloppyDisk;

  serviceForm!: FormGroup;

  ngOnInit() {
    this.serviceForm = new FormGroup({
      title: new FormControl('Zondagochtend', Validators.required),
      date: new FormControl('', Validators.required),
      startTime: new FormControl('', Validators.required),
      endTime: new FormControl('', Validators.required),
      location: new FormControl('Reggestroom (Reggestraat 100, Enter)', Validators.required),
      manager: new FormControl('', Validators.required),
      teams: new FormArray([])
    })

    // Initialize if id in route is "new"
    if (this.route.parent?.snapshot.paramMap.get('id') === 'new') {
      this.serviceForm.patchValue({
        date: new Date().toISOString().split('T')[0],
        startTime: '11:00',
        endTime: '12:30',
      });
    }
  }
  get teams () {
    return this.serviceForm.get('teams') as FormArray;
  }
  addTeam(teamName: string) {
    // Check if team already exists
    for (let i = 0; i < this.teams.length; i++) {
      if (this.teams.at(i).get('team')?.value === teamName) {
        this.alertService.add({ type: 'warning', message: 'Dit team bestaat al.' });
        return;
      }
    }

    const teamGroup = new FormGroup({
      team: new FormControl(teamName, Validators.required),
      positions: new FormArray([])
    });
    this.teams.push(teamGroup);
    this.teamName.value = '';
  }
  addPosition(index: number, positionName: string) {
    const positions = this.teams.at(index).get('positions') as FormArray;

    for (let i = 0; i < positions.length; i++) {
      if (positions.at(i).value === positionName) {
        this.alertService.add({ type: 'warning', message: 'Deze positie bestaat al in dit team.' });
        return;
      }
    }

    positions.push(new FormControl(positionName, Validators.required));
  }
  onSubmit() {
    if (this.serviceForm.valid) {
      const res = this.apiService.createService({
        title: this.serviceForm.value.title,
        date: this.serviceForm.value.date.toString(),
        start_time: this.serviceForm.value.startTime,
        end_time: this.serviceForm.value.endTime,
        location: this.serviceForm.value.location,
        notes: 'test',
        service_manager_id: this.serviceForm.value.manager,
        teams: this.serviceForm.value.teams.map((team: any) => {
          return {
            name: team.team,
            positions: team.positions.map((position: any) => {
              return {
                name: position
              }
            })
          }
        }),
      });

      res.subscribe({ next: (data) => {
        this.alertService.add({ type: 'success', message: 'Service is aangemaakt.' });
        // @ts-ignore
        this.router.navigate(['/dashboard/services/' + data.id]);
      }, error: (error) => {
        this.alertService.add({ type: 'danger', message: 'Er is iets fout gegaan.' });
        console.error(error);
      }});
    } else {
      this.alertService.add({ type: 'warning', message: 'Formulier is niet geldig.' });
      console.error('Formulier is niet geldig.');
    }
  }

  protected readonly faCross = faCross;
  protected readonly faXmark = faXmark;
}
