import { Component, OnInit } from '@angular/core';
import { EmployeeDataService } from '../employee-data.service';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

interface Employee {
  name: string;
  totalWorkingHours: number;
}

@Component({
  selector: 'app-visualization',
  templateUrl: './visualization.component.html',
  styleUrls: ['./visualization.component.scss']
})

export class VisualizationComponent implements OnInit  {
  employees!: Employee[];
  public chart: any;

  constructor(private employeeDataService: EmployeeDataService) {
  }

  ngOnInit(): void {
    this.employeeDataService.getEntries().subscribe(entries => {
      const employeeMap = new Map<string, number>();

      entries.forEach(entry => {
        const startTime = new Date(entry.StarTimeUtc);
        const endTime = new Date(entry.EndTimeUtc);
        const workingTime = endTime.getTime() - startTime.getTime();

        const employeeName = entry.EmployeeName;
        const totalWorkingTime = employeeMap.get(employeeName) || 0;
        employeeMap.set(employeeName, totalWorkingTime + workingTime);
      });

      this.employees = Array.from(employeeMap.entries())
        .map(([name, totalWorkingHours]) => ({
          name,
          totalWorkingHours
        }))
        .sort((a, b) => a.totalWorkingHours - b.totalWorkingHours);

        this.createChart();
    });
  }

  formatTime(milliseconds: number): string {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const minutes = Math.floor(milliseconds / (1000 * 60)) % 60;
    const seconds = Math.floor(milliseconds / 1000) % 60;
    // return `${hours}h ${minutes}m ${seconds}s`;
    return (seconds != 0) ? (`${hours}h ${minutes}m ${seconds}s`) : (`${hours}h ${minutes}m`);
  }

  rowStyle(employee: Employee) {
    let hours = parseInt(this.formatTime(employee.totalWorkingHours).split('h')[0]);
    if (hours < 100) {
      return { backgroundColor: 'red', color: 'white' };
    } else {
      return {};
    }
  }

  createChart() {
    const employeeData = this.employees.filter(employee => employee.name != null);
    const empNames = employeeData.map(employee => employee.name);
    const empWorkingHours = employeeData.map(employee => employee.totalWorkingHours);

    this.chart = new Chart("MyChart", {
      type: 'pie',
      data: {
        labels: empNames,
        datasets: [{
          label: 'Total Working Hours',
          data: empWorkingHours,
          backgroundColor: [
            'darkblue',
            'blue',
            'cornflowerblue',
            'navy',
            'deepskyblue',
            'royalblue',
            'mediumblue',
            'midnightblue',
            'steelblue',
            'dodgerblue'
          ],
          hoverOffset: 4
        }],
      },
      options: {
        aspectRatio: 2.5
      }
    });
  }
}
