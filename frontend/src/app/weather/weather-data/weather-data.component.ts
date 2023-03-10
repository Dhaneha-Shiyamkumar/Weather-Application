import { Component, OnInit, Input, Output, OnChanges } from '@angular/core';
import { singleWeather } from 'src/app/models/singleWeather.model';
import { singleTimezone } from 'src/app/models/singleTimezone.model';

@Component({
  selector: 'app-weather-data',
  templateUrl: './weather-data.component.html',
  styleUrls: ['./weather-data.component.css']
})
export class WeatherDataComponent implements OnInit {
  @Input() weatherData: singleWeather;
  @Input() timeData: singleTimezone;
  @Input() userGeoTimezone: number; 
  showErrorMessage = false;
  timerIntevalId; 
  currentDate;
  constructor() { }

  ngOnInit(): void { }

  ngOnChanges(changes: OnChanges): void {
    if (this.weatherData && this.timeData) {
      this.weatherData.wind.cardinalDirection = this.setCardinalDirection(this.weatherData.wind.deg);
      this.timeData.isDay = this.setTimes();
      this.initUpdateTime();
    }
  }

  initUpdateTime() {
    clearInterval(this.timerIntevalId);
    const reformatData = this.timeData.formatted.replace(/-/g, '/'); 
    this.currentDate = new Date(reformatData);
    this.updateTimeEverySec();
  }

  
  setTimes() {
  
    const reformatDate = this.timeData.formatted.replace(/-/g, '/');
    this.timeData.date = new Date(reformatDate);

    let sunrise = new Date((this.weatherData.sys.sunrise * 1000));
    sunrise.setSeconds(sunrise.getSeconds() + (this.weatherData.timezone - this.userGeoTimezone));
    this.weatherData.sys.sunriseString = sunrise.toLocaleTimeString();

    let sunset = new Date((this.weatherData.sys.sunset * 1000));
    sunset.setSeconds(sunset.getSeconds() + (this.weatherData.timezone - this.userGeoTimezone));
    this.weatherData.sys.sunsetString = sunset.toLocaleTimeString();

    return this.timeData.date >= sunrise && this.timeData.date <= sunset;
  }

  setCardinalDirection(degree: number): string {
    const directions = ['↑ N', '↗ NE', '→ E', '↘ SE', '↓ S', '↙ SW', '← W', '↖ NW'];
    return directions[Math.round(degree / 45) % 8];
  }

  setWidgetColour = (isDay: boolean) =>
    isDay
      ? 'linear-gradient(MidnightBlue, RoyalBlue)'
      : 'linear-gradient(Black, RoyalBlue)';

  setCloudColour = (isDay: boolean) => (isDay ? 'white' : 'dodgerBlue');

  
  updateTimeEverySec() {
    this.timerIntevalId = setInterval(() => {
      this.currentDate.setSeconds(this.currentDate.getSeconds() + 1);
      this.timeData.currentTime = this.currentDate.toLocaleTimeString();
      this.timeData.date = new Date(this.currentDate);
    }, 1000);
  }


  containsClouds = (feelsLike: string) => feelsLike.toLowerCase().includes('cloud');
  containsSnow = (feelsLike: string) => feelsLike.toLowerCase().includes('snow');
  containsRain = (feelsLike: string) => feelsLike.toLowerCase().includes('rain');

}
