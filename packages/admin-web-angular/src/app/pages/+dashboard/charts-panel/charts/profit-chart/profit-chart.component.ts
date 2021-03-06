import {
	Component,
	Input,
	OnChanges,
	AfterViewInit,
	OnDestroy,
}                         from '@angular/core';
import { NbThemeService } from '@nebular/theme';
import { takeWhile }      from 'rxjs/operators';
import { ProfitChart }    from '@app/@core/services/dashboard/profit-chart.service';
import { LayoutService }  from '@app/@core/services/dashboard/layout.service';

@Component({
	           selector: 'ea-profit-chart',
	           styleUrls: ['./profit-chart.component.scss'],
	           templateUrl: './profit-chart.component.html',
           })
export class ProfitChartComponent
		implements OnChanges, AfterViewInit, OnDestroy
{
	@Input()
	profitChartData: ProfitChart;
	echartsIntance: any;
	options: any = {};
	private alive = true;
	
	constructor(
			private theme: NbThemeService,
			private layoutService: LayoutService
	)
	{
		this.layoutService
		    .onChangeLayoutSize()
		    .pipe(takeWhile(() => this.alive))
		    .subscribe(() => this.resizeChart());
	}
	
	ngOnChanges(): void
	{
		if(this.echartsIntance)
		{
			this.updateProfitChartOptions(this.profitChartData);
		}
	}
	
	ngAfterViewInit()
	{
		this.theme
		    .getJsTheme()
		    .pipe(takeWhile(() => this.alive))
		    .subscribe((config) =>
		               {
			               const eTheme: any = config.variables.profit;
			               eTheme.axisFontSize = 14;
			
			               this.setOptions(eTheme);
		               });
	}
	
	setOptions(eTheme)
	{
		this.options = {
			backgroundColor: eTheme.bg,
			tooltip: {
				trigger: 'axis',
				axisPointer: {
					type: 'shadow',
					shadowStyle: {
						color: 'rgba(0, 0, 0, 0.3)',
					},
				},
			},
			grid: {
				left: '3%',
				right: '4%',
				bottom: '3%',
				containLabel: true,
			},
			xAxis: [
				{
					type: 'category',
					data: this.profitChartData.chartLabel,
					axisTick: {
						alignWithLabel: true,
					},
					axisLine: {
						lineStyle: {
							color: eTheme.axisLineColor,
						},
					},
					axisLabel: {
						color: eTheme.axisTextColor,
						fontSize: eTheme.axisFontSize,
					},
				},
			],
			yAxis: [
				{
					type: 'value',
					axisLine: {
						lineStyle: {
							color: eTheme.axisLineColor,
						},
					},
					splitLine: {
						lineStyle: {
							color: eTheme.splitLineColor,
						},
					},
					axisLabel: {
						color: eTheme.axisTextColor,
						fontSize: eTheme.axisFontSize,
					},
				},
			],
			series: [
				{
					name: 'Completed',
					type: 'bar',
					barGap: 0,
					barWidth: '20%',
					itemStyle: {
						normal: {
							color: new echarts.graphic.LinearGradient(
									0,
									0,
									0,
									1,
									[
										{
											offset: 0,
											color: eTheme.firstLineGradFrom,
										},
										{
											offset: 1,
											color: eTheme.firstLineGradTo,
										},
									]
							),
						},
					},
					data: this.profitChartData.data[0],
				},
				{
					name: 'Canceled',
					type: 'bar',
					barWidth: '20%',
					itemStyle: {
						normal: {
							color: new echarts.graphic.LinearGradient(
									0,
									0,
									0,
									1,
									[
										{
											offset: 0,
											color: eTheme.secondLineGradFrom,
										},
										{
											offset: 1,
											color: eTheme.secondLineGradTo,
										},
									]
							),
						},
					},
					data: this.profitChartData.data[1],
				},
				{
					name: 'Total orders',
					type: 'bar',
					barWidth: '20%',
					itemStyle: {
						normal: {
							color: new echarts.graphic.LinearGradient(
									0,
									0,
									0,
									1,
									[
										{
											offset: 0,
											color: eTheme.thirdLineGradFrom,
										},
										{
											offset: 1,
											color: eTheme.thirdLineGradTo,
										},
									]
							),
						},
					},
					data: this.profitChartData.data[2],
				},
			],
		};
	}
	
	updateProfitChartOptions(profitChartData: ProfitChart)
	{
		const options = this.options;
		const series = this.getNewSeries(options.series, profitChartData.data);
		
		this.echartsIntance.setOption({
			                              series,
			                              xAxis: {
				                              data: this.profitChartData.chartLabel,
			                              },
		                              });
	}
	
	getNewSeries(series, data: number[][])
	{
		return series.map((line, index) =>
		                  {
			                  return {
				                  ...line,
				                  data: data[index],
			                  };
		                  });
	}
	
	onChartInit(echarts)
	{
		this.echartsIntance = echarts;
	}
	
	resizeChart()
	{
		if(this.echartsIntance)
		{
			// Fix recalculation chart size
			// TODO: investigate more deeply
			setTimeout(() =>
			           {
				           this.echartsIntance.resize();
			           }, 0);
		}
	}
	
	ngOnDestroy(): void
	{
		this.alive = false;
	}
}
