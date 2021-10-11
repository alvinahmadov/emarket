import { NgModule }                      from '@angular/core';
import { FormsModule }                   from '@angular/forms';
import { Routes, RouterModule }          from '@angular/router';
import { CommonModule }                  from '@angular/common';
import { NgSelectModule }                from '@ng-select/ng-select';
import { NbSpinnerModule }               from '@nebular/theme';
import { TranslateModule }               from '@ngx-translate/core';
import { ToasterModule }                 from 'angular2-toaster';
import { NgxEchartsModule }              from 'ngx-echarts';
import { PipesModule }                   from '@modules/client.common.angular2/pipes/pipes.module';
import { ThemeModule }                   from '@app/@theme';
import { CurrenciesService }             from "@app/@core/data/currencies.service";
import { LayoutService }                 from '@app/@core/services/dashboard/layout.service';
import { OrdersProfitChartService }      from '@app/@core/services/dashboard/orders-profit-chart.service';
import { OrdersChartService }            from '@app/@core/services/dashboard/orders-chart.service';
import { PeriodsService }                from '@app/@core/services/dashboard/periods.service';
import { ProfitChartService }            from '@app/@core/services/dashboard/profit-chart.service';
import { DashboardComponent }            from './dashboard.component';
import { DashboardSelectStoreComponent } from './dashboard-select-store/dashboard-select-store.component';
import { ChartsPanelComponent }          from './charts-panel/charts-panel.component';
import { OrdersChartComponent }          from './charts-panel/charts/orders-chart/orders-chart.component';
import { ProfitChartComponent }          from './charts-panel/charts/profit-chart/profit-chart.component';
import { ChartPanelHeaderComponent }     from './charts-panel/chart-panel-header/chart-panel-header.component';
import { ChartPanelSummaryComponent }    from './charts-panel/chart-panel-summary/chart-panel-summary.component';
import { LegendChartComponent }          from './charts-panel/legend-chart/legend-chart.component';

export const routes: Routes = [
	{
		path:      '',
		component: DashboardComponent,
	},
];

@NgModule({
	          imports: [
		          CommonModule,
		          ThemeModule,
		          NgxEchartsModule,
		          ToasterModule,
		          TranslateModule.forChild(),
		          RouterModule.forChild(routes),
		          NbSpinnerModule,
		          PipesModule,
		          NgSelectModule,
		          FormsModule,
	          ],
	          declarations: [
		          DashboardComponent,
		          ChartsPanelComponent,
		          ChartPanelHeaderComponent,
		          ChartPanelSummaryComponent,
		          OrdersChartComponent,
		          ProfitChartComponent,
		          LegendChartComponent,
		          DashboardSelectStoreComponent,
	          ],
	          entryComponents: [
		          ChartsPanelComponent,
		          ChartPanelHeaderComponent,
		          ChartPanelSummaryComponent,
		          OrdersChartComponent,
		          ProfitChartComponent,
		          LegendChartComponent,
	          ],
	          providers:       [
		          LayoutService,
		          CurrenciesService,
		          OrdersProfitChartService,
		          OrdersChartService,
		          ProfitChartService,
		          PeriodsService,
	          ],
          })
export class DashboardModule {}
