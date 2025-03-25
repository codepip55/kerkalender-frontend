import { Component, OnInit, ViewChild } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faCircleCheck, faCircleQuestion, faCircleXmark, faFloppyDisk } from '@fortawesome/free-regular-svg-icons';
import { faCross, faPlus, faTrash, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgFor } from '@angular/common';
import { AlertService } from '../../../../services/alert.service';
import { ApiService } from '../../../../services/api.service';
import { ActivatedRoute, Router } from '@angular/router';
import { lastValueFrom, Observable } from 'rxjs';
import { format } from 'date-fns';
import { Service } from '../../../../models/service.model';
import { UserService } from '../../../../services/user.service';

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
export class InfoComponent implements OnInit {

  constructor(private alertService: AlertService, private apiService: ApiService, private route: ActivatedRoute, private router: Router, private userService: UserService) {
  }

  @ViewChild('positionName') positionName!: HTMLInputElement;
  @ViewChild('teamName') teamName!: HTMLInputElement;

  protected readonly faCircleQuestion = faCircleQuestion;
  protected readonly faCircleCheck = faCircleCheck;
  protected readonly faCircleXmark = faCircleXmark;
  protected readonly faTrash = faTrash;
  protected readonly faFloppyDisk = faFloppyDisk;

  serviceForm!: FormGroup;
  id: string;
  confirmDelete = false;
  users: any = [];

  async ngOnInit() {
    this.serviceForm = new FormGroup({
      title: new FormControl('Zondagochtend', Validators.required),
      date: new FormControl('', Validators.required),
      startTime: new FormControl('', Validators.required),
      endTime: new FormControl('', Validators.required),
      location: new FormControl('Reggestroom (Reggestraat 100, Enter)', Validators.required),
      manager: new FormControl('', Validators.required),
      teams: new FormArray([])
    })

    const id = this.route.parent?.snapshot.paramMap.get('id');
    this.id = id!;
    // Initialize form
    if (id === 'new') {
      this.serviceForm.patchValue({
        date: new Date().toISOString().split('T')[0],
        startTime: '11:00',
        endTime: '12:30',
      });
    } else {
      const service = await this.getService(id!);
      console.log('getting service', service);
      this.serviceForm.patchValue({
        title: service.title,
        date: service.date,
        startTime: this.formatTime(service.start_time),
        endTime: this.formatTime(service.end_time),
        location: service.location,
        manager: service.service_manager_id
      });
      service.teams.forEach((team: any) => {
        const teamGroup = new FormGroup({
          team: new FormControl(team.name, Validators.required),
          positions: new FormArray([])
        });
        team.positions.forEach((position: any) => {
          (teamGroup.get('positions') as FormArray).push(new FormGroup({
            name: new FormControl(position.name, Validators.required),
            members: position.members ? new FormArray(position.members.map((member: any) => new FormControl(member))) : new FormArray([])
          }));
        });
        (this.serviceForm.get('teams') as FormArray).push(teamGroup);
      });
    }

    // Get all users
    this.apiService.getUsers().subscribe({
      next: (users: any) => {
        users.forEach((user: any) => {
          this.users.push([user.id, user.name]);
        });
      },
      error: (error) => {
        this.alertService.add({ type: 'danger', message: 'Er is iets fout gegaan.' });
        console.error(error);
      }
    });

    // Listen to page leave
    window.addEventListener('beforeunload', (event) => {
      if (!this.confirmLeave()) {
        event.preventDefault();
        event.returnValue = '';
      }
    });
  }
  private confirmLeave() {
    if (this.serviceForm.dirty) {
      return confirm('Weet je zeker dat je de pagina wilt verlaten? Je hebt nog niet opgeslagen.');
    }
    return true;
  }
  cancel() {
    if (this.confirmLeave()) {
      this.router.navigate(['/dashboard']);
    }
  }
  private async getService(id: string): Promise<Service> {
    const res = this.apiService.getService(parseInt(id));
    const service = await lastValueFrom(res);
    console.log(service);
    // @ts-ignore
    return service;
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

    const newPosition = new FormGroup({
      name: new FormControl(positionName, Validators.required),
      members: new FormArray([])
    })
    positions.push(newPosition);
  }
  removePosition(teamIndex: number, positionIndex: number) {
    const positions = this.teams.at(teamIndex).get('positions') as FormArray;
    positions.removeAt(positionIndex);
  }
  addUser(teamIndex: number, positionIndex:number, userId: any) {
    // Get user by id ([id, name])
    const user = this.users.find((u: any) => u[0] == userId);
    user.user_id = user[0];
    // Add user_id to position.members
    const positions = this.teams.at(teamIndex).get('positions') as FormArray;
    const lastPosition = positions.at(positionIndex) as FormGroup;
    const members = lastPosition.get('members') as FormArray;
    members.push(new FormControl(user));
  }
  removeUser(teamIndex: number, positionIndex: number, userIndex: number) {
    const positions = this.teams.at(teamIndex).get('positions') as FormArray;
    const lastPosition = positions.at(positionIndex) as FormGroup;
    const members = lastPosition.get('members') as FormArray;
    members.removeAt(userIndex);
  }
  onSubmit() {
    if (this.serviceForm.valid) {
      console.log('request', {
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
                name: position.name,
                members: position.members.map((user: any) => {
                  user.user_id = user[0];
                  return {
                    user_id: user.user_id,
                    status: 'waiting'
                  };
                })
              }
            })
          }
        })
      });
      if (this.id === 'new') {
        this.apiService.createService({
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
                  name: position.name,
                  members: position.members.map((user: any) => {
                    user.user_id = user[0];
                    return {
                      user_id: user.user_id,
                      status: 'waiting'
                    };
                  })
                }
              })
            }
          }),
        }).subscribe({ next: (data) => {
          console.log('Service Aangemaakt', data);
          this.alertService.add({ type: 'success', message: 'Service is aangemaakt.' });
          // @ts-ignore
            if (data.id === undefined) {
              return;
            }
          // @ts-ignore
          this.router.navigate(['/dashboard/services/' + data.id]);

          }, error: (error) => {
            this.alertService.add({ type: 'danger', message: 'Er is iets fout gegaan.' });
            console.error(error);
          }});
      } else {
        this.apiService.updateService(parseInt(this.id), {
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
                  name: position.name,
                  members: position.members.map((user: any) => {
                    user.user_id = user[0];
                    return {
                      user_id: user.user_id,
                      status: 'waiting'
                    };
                  })
                }
              })
            }
          })
        }).subscribe({ next: (data) => {
            console.log('Service Geupdatet', data);
            this.alertService.add({ type: 'success', message: 'Service is geupdatet.' });
            // @ts-ignore
            if (data.id === undefined) {
              return;
            }
            // @ts-ignore
            this.router.navigate(['/dashboard/services/' + data.id]);
          }, error: (error) => {
            this.alertService.add({ type: 'danger', message: 'Er is iets fout gegaan.' });
            console.error(error);
          }});
      }
    } else {
      this.alertService.add({ type: 'warning', message: 'Formulier is niet geldig.' });
      console.error('Formulier is niet geldig.');
    }
  }

  formatTime(time: string) {
    const date = new Date();
    const [hours, minutes, seconds] = time.split(':');
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10), parseInt(seconds, 10));

    return date.toLocaleTimeString("nl-NL", {hour: "2-digit", minute: "2-digit"});
  }
  formatDate(date: string) {
    const isoDate = new Date(date).toISOString();
    return format(new Date(isoDate), 'dd/MM/yyyy');
  }
  deleteService() {
    if (this.id === 'new') {
      this.router.navigate(['/dashboard/services']);
      this.alertService.add({ type: 'warning', message: 'Service is niet aangemaakt.' });
    }
    if (this.confirmDelete) {
      this.apiService.deleteService(parseInt(this.id)).subscribe({
        next: (data) => {
          console.log(data);
          this.alertService.add({ type: 'success', message: 'Service is verwijderd.' });
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.alertService.add({ type: 'danger', message: 'Er is iets fout gegaan.' });
          console.error(error);
        }
      });
    } else {
      this.confirmDelete = true;
      this.alertService.add({ type: 'warning', message: 'Weet je zeker dat je deze service wilt verwijderen?' });
    }
  }

  getInitials(user_id: any) {
    const user = this.users.find((u: any) => u[0] == user_id);
    if (user) {
      return user[1].split(' ').map((name: string) => name.charAt(0)).join('');
    }
    return '';
  }
  getName(user_id: any) {
    const user = this.users.find((u: any) => u[0] == user_id);
    if (user) {
      return user[1];
    }
    return '';
  }

  protected readonly faCross = faCross;
  protected readonly faXmark = faXmark;
  protected readonly faPlus = faPlus;
}
