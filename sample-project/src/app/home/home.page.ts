import { Component, OnInit } from '@angular/core';
import { CacheStrategy } from 'rx-cache-observer';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  message: string;

  constructor(private apiService: ApiService) { }

  ngOnInit() {
  }

  getJoke() {
    this.apiService.getJoke().subscribe((data) => {
      console.log('joke', data);
      this.message = data.value;
    },
      (error) => {
        console.error('got an error', error);
      });
  }

  getPerson() {
    this.apiService.getPerson(1).subscribe((data) => {
      console.log('person', data);
      this.message = data.result.properties.name;
    },
      (error) => {
        console.error('got an error', error);
      });
  }

  setStrategy(value) {
    switch (value.detail.value) {
      case 'none': this.apiService.strategy = undefined; break;
      case '5secs': this.apiService.strategy = { expiresMs: 5000 }; break;
      case 'fresh': this.apiService.strategy = { alwaysGetValue: true }; break;
      case 'freshdup': this.apiService.strategy = CacheStrategy.Fresh; break;
    }
  }

}
