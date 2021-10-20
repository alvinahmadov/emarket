import { Component, Input, OnDestroy, OnInit, ViewChild }     from '@angular/core';
import { TranslateService }                                   from '@ngx-translate/core';
import { Subject }                                            from 'rxjs';
import { takeUntil, takeWhile }                               from 'rxjs/operators';
import Order                                                  from '@modules/server.common/entities/Order';
import { toDate }                                             from '@modules/server.common/utils';
import { OrderProfitChartSummary, OrdersProfitChartService, } from '@app/@core/services/dashboard/orders-profit-chart.service';
import { OrdersChart, OrdersChartService, }                   from '@app/@core/services/dashboard/orders-chart.service';
import { ProfitChart }                                        from '@app/@core/services/dashboard/profit-chart.service';
import { PeriodsService }                                     from '@app/@core/services/dashboard/periods.service';
import { DashboardLoadingIndicatorState }                     from '@app/models/DashboardLoadingIndicatorState';
import { OrdersChartComponent }                               from './charts/orders-chart/orders-chart.component';
import { ProfitChartComponent }                               from './charts/profit-chart/profit-chart.component';

interface IOrdersChartModel
{
	total: any;
	cancelled: any;
	completed: any;
}

// noinspection JSUnusedLocalSymbols
@Component({
	           selector:    'ea-ecommerce-charts',
	           styleUrls:   ['./charts-panel.component.scss'],
	           templateUrl: './charts-panel.component.html',
           })
export class ChartsPanelComponent implements OnInit, OnDestroy
{
	public preservedRanges$ = new Subject<{ from: Date; to: Date }>();
	public clearRange$ = new Subject<void>();
	
	public loading = new DashboardLoadingIndicatorState();
	
	public period: string = ChartsPanelComponent._PERIODS.today;
	public chartPanelSummary: OrderProfitChartSummary[] = [];
	public ordersChartData: OrdersChart;
	public profitChartData: ProfitChart;
	
	@ViewChild('ordersChart')
	public ordersChart: OrdersChartComponent;
	
	@ViewChild('profitChart')
	public profitChart: ProfitChartComponent;
	
	@ViewChild('ordersProfitTab')
	public ordersProfitTab: any;
	
	private _orders: Order[] = [];
	private _ordersToday: IOrdersChartModel;
	private _ordersLastWeek: IOrdersChartModel;
	private _ordersLastMonth: IOrdersChartModel;
	private _ordersCurrentYear: IOrdersChartModel;
	private _ordersYears: IOrdersChartModel;
	private _ordersDateRange: IOrdersChartModel;
	private _ordersWeeksRange: IOrdersChartModel;
	private _ordersMonthsRange: IOrdersChartModel;
	private _ordersYearsRange: IOrdersChartModel;
	
	private _yearsLabelRange = {
		from: null as number,
		to:   null as number,
	};
	private _dateLabelRange = {
		from: null as Date,
		to:   null as Date,
	};
	private _chartPanelSummaryTotal: number = 0;
	private _chartPanelSummaryCompleted: number = 0;
	private _chartPanelSummaryCancelled: number = 0;
	private _isOrderChartSelected: boolean = true;
	private _isDateRangeSelected: boolean = false;
	private _alive = true;
	private _ngDestroy$ = new Subject<void>();
	
	constructor(
			private readonly _translateService: TranslateService,
			private readonly _ordersProfitChartService: OrdersProfitChartService,
			private readonly _periodService: PeriodsService,
			private readonly _ordersChartService: OrdersChartService
	)
	{
		this._ordersProfitChartService
		    .getOrderProfitChartSummary()
		    .pipe(takeWhile(() => this._alive))
		    .subscribe((summary) =>
		               {
			               this.chartPanelSummary = summary;
		               });
		
		this.getOrdersChartData(this.period);
		this.getProfitChartData(this.period);
	}
	
	public static get _PERIODS()
	{
		return {
			today:       'today', // hours in last day
			lastWeek:    'lastWeek', // weekdays in last week
			lastMonth:   'lastMonth', // days in last month
			currentYear: 'currentYear', // months in last year
			years:       'years', // years from first order to last
			rangeDay:    'range day', // 0 days difference
			rangeDays:   'range days', // 1 - 27 days
			rangeWeeks:  'range weeks', // 28 - 60 days
			rangeMonths: 'range months', // 60 - 365 days
			rangeYears:  'range years', // more than 365 days
		};
	}
	
	public get orders(): Order[]
	{
		return this._orders;
	}
	
	@Input()
	public set orders(orders: Order[])
	{
		this._orders = orders;
		this._setupAndDisplayChartsData();
	}
	
	@Input()
	public set isOrdersLoad(isLoading: boolean)
	{
		this._toggleLoading.chartPanelSummary(isLoading);
		this._toggleLoading.chart(isLoading);
	}
	
	private get _translations()
	{
		const rootPrefix = 'DASHBOARD_VIEW.CHARTS';
		
		return {
			TOTAL_ORDERS_OVER_PERIOD:           this._translate(
					`${rootPrefix}.TOTAL_ORDERS`
			),
			TOTAL_COMPLETED_ORDERS_OVER_PERIOD: this._translate(
					`${rootPrefix}.TOTAL_COMPLETED_ORDERS`
			),
			TOTAL_CANCELLED_ORDERS_OVER_PERIOD: this._translate(
					`${rootPrefix}.TOTAL_CANCELLED_ORDERS`
			),
			
			TOTAL_REVENUE_OVER_PERIOD:                  this._translate(
					`${rootPrefix}.TOTAL_REVENUE_ALL_ORDERS`
			),
			TOTAL_REVENUE_COMPLETED_ORDERS_OVER_PERIOD: this._translate(
					`${rootPrefix}.TOTAL_REVENUE_COMPLETED_ORDERS`
			),
			TOTAL_REVENUE_CANCELLED_ORDERS_OVER_PERIOD: this._translate(
					`${rootPrefix}.TOTAL_LOST_REVENUE_CANCELLED_ORDERS`
			),
		};
	}
	
	private get _toggleLoading()
	{
		return {
			chartPanelSummary: (isLoading) =>
					                   (this.loading.chartPanelSummary = isLoading),
			chart:             (isLoading) => (this.loading.chart = isLoading),
		};
	}
	
	public ngOnInit()
	{
		this._resetChartData();
		this._listenLangChange();
	}
	
	public ngOnDestroy()
	{
		this._alive = false;
		this._ngDestroy$.next();
		this._ngDestroy$.complete();
	}
	
	public clearRange()
	{
		this.setPeriodAndGetChartData(ChartsPanelComponent._PERIODS.today);
	}
	
	public setPeriodAndGetChartData(value: string): void
	{
		if(this.period !== value)
		{
			this.period = value;
		}
		this._isDateRangeSelected = false;
		this._setupAndDisplayChartsData();
	}
	
	public selectDateRangeOrderCharts(
			{
				fromDate,
				toDate,
				daysDiff,
			}: {
				fromDate: Date;
				toDate: Date;
				daysDiff: number;
			})
	{
		this._dateLabelRange.from = fromDate;
		this._dateLabelRange.to = toDate;
		this.period = ChartsPanelComponent._calculateCustomPeriod(daysDiff);
		this._isDateRangeSelected = true;
		this._setupAndDisplayChartsData();
	}
	
	public changeTab(selectedTab)
	{
		const isOrdersTabActive = this.ordersProfitTab.tabs.first.active;
		if(!isOrdersTabActive)
		{
			this.profitChart.resizeChart();
			this._isOrderChartSelected = false;
		}
		else
		{
			this._isOrderChartSelected = true;
			this.ordersChart.resizeChart();
		}
		
		if(this._isDateRangeSelected)
		{
			this._sendRangeIfSelected();
		}
		else
		{
			this._clearRangeFromHeader();
		}
		this._setupAndDisplayChartsData();
	}
	
	public getOrdersChartData(period: string)
	{
		this._ordersProfitChartService
		    .getOrdersChartData(period)
		    .pipe(takeWhile(() => this._alive))
		    .subscribe((ordersChartData) => this.ordersChartData = ordersChartData);
	}
	
	public getProfitChartData(period: string)
	{
		this._ordersProfitChartService
		    .getProfitChartData(period)
		    .pipe(takeWhile(() => this._alive))
		    .subscribe((profitChartData) =>
		               {
			               this.profitChartData = profitChartData;
		               });
	}
	
	private _setChartsSummary()
	{
		this.chartPanelSummary = [];
		
		if(this._isOrderChartSelected)
		{
			this._setOrdersChartSummary();
		}
		else
		{
			this._setProfitChartSummary();
		}
	}
	
	private _setOrdersChartSummary()
	{
		this.chartPanelSummary.push({
			                            values:  {
				                            total:     {
					                            title: this._translations.TOTAL_ORDERS_OVER_PERIOD,
					                            value: this._chartPanelSummaryTotal,
				                            },
				                            completed: {
					                            title: this._translations
							                                   .TOTAL_COMPLETED_ORDERS_OVER_PERIOD,
					                            value: this._chartPanelSummaryCompleted,
				                            },
				                            cancelled: {
					                            title: this._translations
							                                   .TOTAL_CANCELLED_ORDERS_OVER_PERIOD,
					                            value: this._chartPanelSummaryCancelled,
				                            },
			                            },
			                            isPrice: false,
		                            });
	}
	
	private _setProfitChartSummary()
	{
		this.chartPanelSummary.push({
			                            values:  {
				                            total:     {
					                            title: this._translations.TOTAL_REVENUE_OVER_PERIOD,
					                            value: this._chartPanelSummaryTotal,
				                            },
				                            completed: {
					                            title: this._translations
							                                   .TOTAL_REVENUE_COMPLETED_ORDERS_OVER_PERIOD,
					                            value: this._chartPanelSummaryCompleted,
				                            },
				                            cancelled: {
					                            title: this._translations
							                                   .TOTAL_REVENUE_CANCELLED_ORDERS_OVER_PERIOD,
					                            value: this._chartPanelSummaryCancelled,
				                            },
			                            },
			                            isPrice: true,
		                            });
	}
	
	private _setupLabelsYearsRange(order: Order)
	{
		const orderYear: number = toDate(order._createdAt).getFullYear();
		
		if(orderYear < this._yearsLabelRange.from)
		{
			this._yearsLabelRange.from = orderYear;
		}
	}
	
	private _resetYearsLabelRange()
	{
		this._yearsLabelRange = {
			from: Number.MAX_SAFE_INTEGER,
			to:   new Date().getFullYear(),
		};
	}
	
	private _setupAndDisplayChartsData()
	{
		this._resetChartData();
		this._resetYearsLabelRange();
		this._resetChartPanelSummaryValues();
		
		this._orders
		    ?.filter((order) =>
		             {
			             switch(this.period)
			             {
				             case ChartsPanelComponent._PERIODS.today:
					             return ChartsPanelComponent._isOrderTodayPeriodMatch(order);
				             case ChartsPanelComponent._PERIODS.lastWeek:
					             return ChartsPanelComponent._isOrderLastWeekPeriodMatch(order);
				             case ChartsPanelComponent._PERIODS.lastMonth:
					             return ChartsPanelComponent._isOrderLastMonthPeriodMatch(order);
				             case ChartsPanelComponent._PERIODS.currentYear:
					             return ChartsPanelComponent._isOrderCurrentYearPeriodMatch(order);
				             case ChartsPanelComponent._PERIODS.years:
					             this._setupLabelsYearsRange(order);
					             return true;
				             case ChartsPanelComponent._PERIODS.rangeDay:
					             return this._isOrderCustomDayPeriodMatch(order);
				             case ChartsPanelComponent._PERIODS.rangeDays:
				             case ChartsPanelComponent._PERIODS.rangeWeeks:
				             case ChartsPanelComponent._PERIODS.rangeMonths:
				             case ChartsPanelComponent._PERIODS.rangeYears:
					             return this._isOrderRangePeriodMatch(order);
			             }
		             })
		    .forEach((order) =>
		             {
			             const orderDateCreated = new Date(order._createdAt);
			
			             const orderHour = orderDateCreated.getHours();
			             const orderWeekDay = orderDateCreated.getDay();
			             const orderDate = orderDateCreated.getDate();
			             const orderMonth = orderDateCreated.getMonth();
			             const orderYear = orderDateCreated.getFullYear();
			
			             const orderDateRange = this._periodService.getDateLabelKey(
					             orderDateCreated
			             );
			             const orderWeekRange = this._periodService.getWeekLabelKey(
					             orderDateCreated,
					             ChartsPanelComponent._getDateWeekNumber
			             );
			             const orderMonthRange = this._periodService.getMonthLabelKey(
					             orderDateCreated
			             );
			
			             if(this._isOrderChartSelected)
			             {
				             this._incrementOrdersAmountSummary(order);
				
				             this._setupOrdersChartData(
						             orderHour,
						             orderWeekDay,
						             orderDate,
						             orderMonth,
						             orderYear,
						             orderDateRange,
						             orderWeekRange,
						             orderMonthRange,
						             order.isCancelled
				             );
			             }
			             else
			             {
				             const orderTotalPrice = order.totalPrice;
				             this._incrementOrdersProfitSummary(order, orderTotalPrice);
				
				             this._setupProfitChartData(
						             orderHour,
						             orderWeekDay,
						             orderDate,
						             orderMonth,
						             orderYear,
						             orderDateRange,
						             orderWeekRange,
						             orderMonthRange,
						             orderTotalPrice,
						             order.isCancelled
				             );
			             }
		             });
		
		if(this._isOrderChartSelected)
		{
			this._displayOrdersChart();
		}
		else
		{
			this._displayProfitChart();
		}
		
		this._setChartsSummary();
	}
	
	private _incrementOrdersAmountSummary(order: Order)
	{
		this._chartPanelSummaryTotal += 1;
		order.isCancelled
		? (this._chartPanelSummaryCancelled += 1)
		: (this._chartPanelSummaryCompleted += 1);
	}
	
	private _incrementOrdersProfitSummary(
			order: Order,
			orderTotalPrice: number
	)
	{
		this._chartPanelSummaryTotal += orderTotalPrice;
		order.isCancelled
		? (this._chartPanelSummaryCancelled += orderTotalPrice)
		: (this._chartPanelSummaryCompleted += orderTotalPrice);
	}
	
	private _setupOrdersChartData(
			orderHour: number,
			orderWeekDay: number,
			orderDate: number,
			orderMonth: number,
			orderYear: number,
			orderDateRange: string,
			orderWeekRange: string,
			orderMonthRange: string,
			isCancelled: boolean
	)
	{
		this._setupOrdersChartTotal(
				orderHour,
				orderWeekDay,
				orderDate,
				orderMonth,
				orderYear,
				orderDateRange,
				orderWeekRange,
				orderMonthRange
		);
		
		if(isCancelled)
		{
			this._setupOrdersChartCanceled(
					orderHour,
					orderWeekDay,
					orderDate,
					orderMonth,
					orderYear,
					orderDateRange,
					orderWeekRange,
					orderMonthRange
			);
		}
		else
		{
			this._setupOrdersChartCompleted(
					orderHour,
					orderWeekDay,
					orderDate,
					orderMonth,
					orderYear,
					orderDateRange,
					orderWeekRange,
					orderMonthRange
			);
		}
	}
	
	private _setupProfitChartData(
			orderHour: number,
			orderWeekDay: number,
			orderDate: number,
			orderMonth: number,
			orderYear: number,
			orderDateRange: string,
			orderWeekRange: string,
			orderMonthRange: string,
			orderTotalPrice: number,
			isCancelled: boolean
	)
	{
		this._setupProfitChartTotal(
				orderHour,
				orderWeekDay,
				orderDate,
				orderMonth,
				orderYear,
				orderDateRange,
				orderWeekRange,
				orderMonthRange,
				orderTotalPrice
		);
		
		if(isCancelled)
		{
			this._setupProfitChartCanceled(
					orderHour,
					orderWeekDay,
					orderDate,
					orderMonth,
					orderYear,
					orderDateRange,
					orderWeekRange,
					orderMonthRange,
					orderTotalPrice
			);
		}
		else
		{
			this._setupProfitChartCompleted(
					orderHour,
					orderWeekDay,
					orderDate,
					orderMonth,
					orderYear,
					orderDateRange,
					orderWeekRange,
					orderMonthRange,
					orderTotalPrice
			);
		}
	}
	
	private _setupOrdersChartTotal(
			orderHour: number,
			orderWeekDay: number,
			orderDate: number,
			orderMonth: number,
			orderYear: number,
			orderDateRange: string,
			orderWeekRange: string,
			orderMonthRange: string
	)
	{
		switch(this.period)
		{
			case ChartsPanelComponent._PERIODS.today:
				ChartsPanelComponent._incrementTotalOrdersAmount(this._ordersToday, orderHour);
				break;
			case ChartsPanelComponent._PERIODS.lastWeek:
				ChartsPanelComponent._incrementTotalOrdersAmount(
						this._ordersLastWeek,
						orderWeekDay
				);
				break;
			case ChartsPanelComponent._PERIODS.lastMonth:
				ChartsPanelComponent._incrementTotalOrdersAmount(
						this._ordersLastMonth,
						orderDate
				);
				break;
			case ChartsPanelComponent._PERIODS.currentYear:
				ChartsPanelComponent._incrementTotalOrdersAmount(
						this._ordersCurrentYear,
						orderMonth
				);
				break;
			case ChartsPanelComponent._PERIODS.years:
				ChartsPanelComponent._incrementTotalOrdersAmount(this._ordersYears, orderYear);
				break;
			case ChartsPanelComponent._PERIODS.rangeDay:
				ChartsPanelComponent._incrementTotalOrdersAmount(this._ordersToday, orderHour);
				break;
			case ChartsPanelComponent._PERIODS.rangeDays:
				ChartsPanelComponent._incrementTotalOrdersAmount(
						this._ordersDateRange,
						orderDateRange
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeWeeks:
				ChartsPanelComponent._incrementTotalOrdersAmount(
						this._ordersWeeksRange,
						orderWeekRange
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeMonths:
				ChartsPanelComponent._incrementTotalOrdersAmount(
						this._ordersMonthsRange,
						orderMonthRange
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeYears:
				ChartsPanelComponent._incrementTotalOrdersAmount(
						this._ordersYearsRange,
						orderYear
				);
				break;
		}
	}
	
	private _setupOrdersChartCanceled(
			orderHour: number,
			orderWeekDay: number,
			orderDate: number,
			orderMonth: number,
			orderYear: number,
			orderDateRange: string,
			orderWeekRange: string,
			orderMonthRange: string
	)
	{
		switch(this.period)
		{
			case ChartsPanelComponent._PERIODS.today:
				ChartsPanelComponent._incrementCanceledOrdersAmount(
						this._ordersToday,
						orderHour
				);
				break;
			case ChartsPanelComponent._PERIODS.lastWeek:
				ChartsPanelComponent._incrementCanceledOrdersAmount(
						this._ordersLastWeek,
						orderWeekDay
				);
				break;
			case ChartsPanelComponent._PERIODS.lastMonth:
				ChartsPanelComponent._incrementCanceledOrdersAmount(
						this._ordersLastMonth,
						orderDate
				);
				break;
			case ChartsPanelComponent._PERIODS.currentYear:
				ChartsPanelComponent._incrementCanceledOrdersAmount(
						this._ordersCurrentYear,
						orderMonth
				);
				break;
			case ChartsPanelComponent._PERIODS.years:
				ChartsPanelComponent._incrementCanceledOrdersAmount(
						this._ordersYears,
						orderYear
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDay:
				ChartsPanelComponent._incrementCanceledOrdersAmount(
						this._ordersToday,
						orderHour
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDays:
				ChartsPanelComponent._incrementCanceledOrdersAmount(
						this._ordersDateRange,
						orderDateRange
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeWeeks:
				ChartsPanelComponent._incrementCanceledOrdersAmount(
						this._ordersWeeksRange,
						orderWeekRange
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeMonths:
				ChartsPanelComponent._incrementCanceledOrdersAmount(
						this._ordersMonthsRange,
						orderMonthRange
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeYears:
				ChartsPanelComponent._incrementCanceledOrdersAmount(
						this._ordersYearsRange,
						orderYear
				);
				break;
		}
	}
	
	private _setupOrdersChartCompleted(
			orderHour: number,
			orderWeekDay: number,
			orderDate: number,
			orderMonth: number,
			orderYear: number,
			orderDateRange: string,
			orderWeekRange: string,
			orderMonthRange: string
	)
	{
		switch(this.period)
		{
			case ChartsPanelComponent._PERIODS.today:
				ChartsPanelComponent._incrementCompletedOrdersAmount(
						this._ordersToday,
						orderHour
				);
				break;
			case ChartsPanelComponent._PERIODS.lastWeek:
				ChartsPanelComponent._incrementCompletedOrdersAmount(
						this._ordersLastWeek,
						orderWeekDay
				);
				break;
			case ChartsPanelComponent._PERIODS.lastMonth:
				ChartsPanelComponent._incrementCompletedOrdersAmount(
						this._ordersLastMonth,
						orderDate
				);
				break;
			case ChartsPanelComponent._PERIODS.currentYear:
				ChartsPanelComponent._incrementCompletedOrdersAmount(
						this._ordersCurrentYear,
						orderMonth
				);
				break;
			case ChartsPanelComponent._PERIODS.years:
				ChartsPanelComponent._incrementCompletedOrdersAmount(
						this._ordersYears,
						orderYear
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDay:
				ChartsPanelComponent._incrementCompletedOrdersAmount(
						this._ordersToday,
						orderHour
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDays:
				ChartsPanelComponent._incrementCompletedOrdersAmount(
						this._ordersDateRange,
						orderDateRange
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeWeeks:
				ChartsPanelComponent._incrementCompletedOrdersAmount(
						this._ordersWeeksRange,
						orderWeekRange
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeMonths:
				ChartsPanelComponent._incrementCompletedOrdersAmount(
						this._ordersMonthsRange,
						orderMonthRange
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeYears:
				ChartsPanelComponent._incrementCompletedOrdersAmount(
						this._ordersYearsRange,
						orderYear
				);
				break;
		}
	}
	
	private _setupProfitChartTotal(
			orderHour: number,
			orderWeekDay: number,
			orderDate: number,
			orderMonth: number,
			orderYear: number,
			orderDateRange: string,
			orderWeekRange: string,
			orderMonthRange: string,
			orderTotalPrice: number
	)
	{
		switch(this.period)
		{
			case ChartsPanelComponent._PERIODS.today:
				ChartsPanelComponent._incrementTotalOrdersProfit(
						this._ordersToday,
						orderHour,
						orderTotalPrice
				);
				break;
			case ChartsPanelComponent._PERIODS.lastWeek:
				ChartsPanelComponent._incrementTotalOrdersProfit(
						this._ordersLastWeek,
						orderWeekDay,
						orderTotalPrice
				);
				
				break;
			case ChartsPanelComponent._PERIODS.lastMonth:
				ChartsPanelComponent._incrementTotalOrdersProfit(
						this._ordersLastMonth,
						orderDate,
						orderTotalPrice
				);
				
				break;
			case ChartsPanelComponent._PERIODS.currentYear:
				ChartsPanelComponent._incrementTotalOrdersProfit(
						this._ordersCurrentYear,
						orderMonth,
						orderTotalPrice
				);
				
				break;
			case ChartsPanelComponent._PERIODS.years:
				ChartsPanelComponent._incrementTotalOrdersProfit(
						this._ordersYears,
						orderYear,
						orderTotalPrice
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDay:
				ChartsPanelComponent._incrementTotalOrdersProfit(
						this._ordersToday,
						orderHour,
						orderTotalPrice
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDays:
				ChartsPanelComponent._incrementTotalOrdersProfit(
						this._ordersDateRange,
						orderDateRange,
						orderTotalPrice
				);
				
				break;
			case ChartsPanelComponent._PERIODS.rangeWeeks:
				ChartsPanelComponent._incrementTotalOrdersProfit(
						this._ordersWeeksRange,
						orderWeekRange,
						orderTotalPrice
				);
				
				break;
			case ChartsPanelComponent._PERIODS.rangeMonths:
				ChartsPanelComponent._incrementTotalOrdersProfit(
						this._ordersMonthsRange,
						orderMonthRange,
						orderTotalPrice
				);
				
				break;
			case ChartsPanelComponent._PERIODS.rangeYears:
				ChartsPanelComponent._incrementTotalOrdersProfit(
						this._ordersYearsRange,
						orderYear,
						orderTotalPrice
				);
				break;
		}
	}
	
	private _setupProfitChartCanceled(
			orderHour: number,
			orderWeekDay: number,
			orderDate: number,
			orderMonth: number,
			orderYear: number,
			orderDateRange: string,
			orderWeekRange: string,
			orderMonthRange: string,
			orderTotalPrice: number
	)
	{
		switch(this.period)
		{
			case ChartsPanelComponent._PERIODS.today:
				ChartsPanelComponent._incrementCanceledOrdersProfit(
						this._ordersToday,
						orderHour,
						orderTotalPrice
				);
				break;
			case ChartsPanelComponent._PERIODS.lastWeek:
				ChartsPanelComponent._incrementCanceledOrdersProfit(
						this._ordersLastWeek,
						orderWeekDay,
						orderTotalPrice
				);
				
				break;
			case ChartsPanelComponent._PERIODS.lastMonth:
				ChartsPanelComponent._incrementCanceledOrdersProfit(
						this._ordersLastMonth,
						orderDate,
						orderTotalPrice
				);
				
				break;
			case ChartsPanelComponent._PERIODS.currentYear:
				ChartsPanelComponent._incrementCanceledOrdersProfit(
						this._ordersCurrentYear,
						orderMonth,
						orderTotalPrice
				);
				
				break;
			case ChartsPanelComponent._PERIODS.years:
				ChartsPanelComponent._incrementCanceledOrdersProfit(
						this._ordersYears,
						orderYear,
						orderTotalPrice
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDay:
				ChartsPanelComponent._incrementCanceledOrdersProfit(
						this._ordersToday,
						orderHour,
						orderTotalPrice
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDays:
				ChartsPanelComponent._incrementCanceledOrdersProfit(
						this._ordersDateRange,
						orderDateRange,
						orderTotalPrice
				);
				
				break;
			case ChartsPanelComponent._PERIODS.rangeWeeks:
				ChartsPanelComponent._incrementCanceledOrdersProfit(
						this._ordersWeeksRange,
						orderWeekRange,
						orderTotalPrice
				);
				
				break;
			case ChartsPanelComponent._PERIODS.rangeMonths:
				ChartsPanelComponent._incrementCanceledOrdersProfit(
						this._ordersMonthsRange,
						orderMonthRange,
						orderTotalPrice
				);
				
				break;
			case ChartsPanelComponent._PERIODS.rangeYears:
				ChartsPanelComponent._incrementCanceledOrdersProfit(
						this._ordersYearsRange,
						orderYear,
						orderTotalPrice
				);
				break;
		}
	}
	
	private _setupProfitChartCompleted(
			orderHour: number,
			orderWeekDay: number,
			orderDate: number,
			orderMonth: number,
			orderYear: number,
			orderDateRange: string,
			orderWeekRange: string,
			orderMonthRange: string,
			orderTotalPrice: number
	)
	{
		switch(this.period)
		{
			case ChartsPanelComponent._PERIODS.today:
				ChartsPanelComponent._incrementCompletedOrdersProfit(
						this._ordersToday,
						orderHour,
						orderTotalPrice
				);
				break;
			case ChartsPanelComponent._PERIODS.lastWeek:
				ChartsPanelComponent._incrementCompletedOrdersProfit(
						this._ordersLastWeek,
						orderWeekDay,
						orderTotalPrice
				);
				
				break;
			case ChartsPanelComponent._PERIODS.lastMonth:
				ChartsPanelComponent._incrementCompletedOrdersProfit(
						this._ordersLastMonth,
						orderDate,
						orderTotalPrice
				);
				
				break;
			case ChartsPanelComponent._PERIODS.currentYear:
				ChartsPanelComponent._incrementCompletedOrdersProfit(
						this._ordersCurrentYear,
						orderMonth,
						orderTotalPrice
				);
				
				break;
			case ChartsPanelComponent._PERIODS.years:
				ChartsPanelComponent._incrementCompletedOrdersProfit(
						this._ordersYears,
						orderYear,
						orderTotalPrice
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDay:
				ChartsPanelComponent._incrementCompletedOrdersProfit(
						this._ordersToday,
						orderHour,
						orderTotalPrice
				);
				break;
			case ChartsPanelComponent._PERIODS.rangeDays:
				ChartsPanelComponent._incrementCompletedOrdersProfit(
						this._ordersDateRange,
						orderDateRange,
						orderTotalPrice
				);
				
				break;
			case ChartsPanelComponent._PERIODS.rangeWeeks:
				ChartsPanelComponent._incrementCompletedOrdersProfit(
						this._ordersWeeksRange,
						orderWeekRange,
						orderTotalPrice
				);
				
				break;
			case ChartsPanelComponent._PERIODS.rangeMonths:
				ChartsPanelComponent._incrementCompletedOrdersProfit(
						this._ordersMonthsRange,
						orderMonthRange,
						orderTotalPrice
				);
				
				break;
			case ChartsPanelComponent._PERIODS.rangeYears:
				ChartsPanelComponent._incrementCompletedOrdersProfit(
						this._ordersYearsRange,
						orderYear,
						orderTotalPrice
				);
				break;
		}
	}
	
	private _setupOrdersChartTotalCommon(orderHour: number)
	{
		ChartsPanelComponent._incrementTotalOrdersAmount(this._ordersToday, orderHour);
	}
	
	private _setupOrdersChartTotalOptionSelected(
			orderWeekDay: number,
			orderDate: number,
			orderMonth: number,
			orderYear: number
	)
	{
		ChartsPanelComponent._incrementTotalOrdersAmount(this._ordersLastWeek, orderWeekDay);
		
		ChartsPanelComponent._incrementTotalOrdersAmount(this._ordersLastMonth, orderDate);
		
		ChartsPanelComponent._incrementTotalOrdersAmount(this._ordersCurrentYear, orderMonth);
		
		ChartsPanelComponent._incrementTotalOrdersAmount(this._ordersYears, orderYear);
	}
	
	private _setupOrdersChartTotalRangeSelected(
			orderDateRange: string,
			orderWeekRange: string,
			orderMonthRange: string,
			orderYear: number
	)
	{
		ChartsPanelComponent._incrementTotalOrdersAmount(this._ordersDateRange, orderDateRange);
		
		ChartsPanelComponent._incrementTotalOrdersAmount(
				this._ordersWeeksRange,
				orderWeekRange
		);
		
		ChartsPanelComponent._incrementTotalOrdersAmount(
				this._ordersMonthsRange,
				orderMonthRange
		);
		
		ChartsPanelComponent._incrementTotalOrdersAmount(this._ordersYearsRange, orderYear);
	}
	
	private _setupOrdersChartCancelledCommon(orderHour: number)
	{
		ChartsPanelComponent._incrementCanceledOrdersAmount(this._ordersToday, orderHour);
	}
	
	private _setupOrdersChartCancelledOptionSelected(
			orderWeekDay: number,
			orderDate: number,
			orderMonth: number,
			orderYear: number
	)
	{
		ChartsPanelComponent._incrementCanceledOrdersAmount(this._ordersLastWeek, orderWeekDay);
		
		ChartsPanelComponent._incrementCanceledOrdersAmount(this._ordersLastMonth, orderDate);
		
		ChartsPanelComponent._incrementCanceledOrdersAmount(
				this._ordersCurrentYear,
				orderMonth
		);
		
		ChartsPanelComponent._incrementCanceledOrdersAmount(this._ordersYears, orderYear);
	}
	
	private _setupOrdersChartCancelledRangeSelected(
			orderDateRange: string,
			orderWeekRange: string,
			orderMonthRange: string,
			orderYear: number
	)
	{
		ChartsPanelComponent._incrementCanceledOrdersAmount(
				this._ordersDateRange,
				orderDateRange
		);
		
		ChartsPanelComponent._incrementCanceledOrdersAmount(
				this._ordersWeeksRange,
				orderWeekRange
		);
		
		ChartsPanelComponent._incrementCanceledOrdersAmount(
				this._ordersMonthsRange,
				orderMonthRange
		);
		
		ChartsPanelComponent._incrementCanceledOrdersAmount(this._ordersYearsRange, orderYear);
	}
	
	private _setupOrdersChartCompletedCommon(orderHour: number)
	{
		ChartsPanelComponent._incrementCompletedOrdersAmount(this._ordersToday, orderHour);
	}
	
	private _setupOrdersChartCompletedOptionSelected(
			orderWeekDay: number,
			orderDate: number,
			orderMonth: number,
			orderYear: number
	)
	{
		ChartsPanelComponent._incrementCompletedOrdersAmount(
				this._ordersLastWeek,
				orderWeekDay
		);
		
		ChartsPanelComponent._incrementCompletedOrdersAmount(this._ordersLastMonth, orderDate);
		
		ChartsPanelComponent._incrementCompletedOrdersAmount(
				this._ordersCurrentYear,
				orderMonth
		);
		
		ChartsPanelComponent._incrementCompletedOrdersAmount(this._ordersYears, orderYear);
	}
	
	private _setupOrdersChartCompletedRangeSelected(
			orderDateRange: string,
			orderWeekRange: string,
			orderMonthRange: string,
			orderYear: number
	)
	{
		ChartsPanelComponent._incrementCompletedOrdersAmount(
				this._ordersDateRange,
				orderDateRange
		);
		
		ChartsPanelComponent._incrementCompletedOrdersAmount(
				this._ordersWeeksRange,
				orderWeekRange
		);
		
		ChartsPanelComponent._incrementCompletedOrdersAmount(
				this._ordersMonthsRange,
				orderMonthRange
		);
		
		ChartsPanelComponent._incrementCompletedOrdersAmount(this._ordersYearsRange, orderYear);
	}
	
	private _setupProfitChartTotalCommon(
			orderHour: number,
			orderTotalPrice: number
	)
	{
		ChartsPanelComponent._incrementTotalOrdersProfit(
				this._ordersToday,
				orderHour,
				orderTotalPrice
		);
	}
	
	private _setupProfitChartTotalOptionSelected(
			orderWeekDay: number,
			orderDate: number,
			orderMonth: number,
			orderYear: number,
			orderTotalPrice: number
	)
	{
		ChartsPanelComponent._incrementTotalOrdersProfit(
				this._ordersLastWeek,
				orderWeekDay,
				orderTotalPrice
		);
		
		ChartsPanelComponent._incrementTotalOrdersProfit(
				this._ordersLastMonth,
				orderDate,
				orderTotalPrice
		);
		
		ChartsPanelComponent._incrementTotalOrdersProfit(
				this._ordersCurrentYear,
				orderMonth,
				orderTotalPrice
		);
		
		ChartsPanelComponent._incrementTotalOrdersProfit(
				this._ordersYears,
				orderYear,
				orderTotalPrice
		);
	}
	
	private _setupProfitChartTotalRangeSelected(
			orderDateRange: string,
			orderWeekRange: string,
			orderMonthRange: string,
			orderYear: number,
			orderTotalPrice: number
	)
	{
		ChartsPanelComponent._incrementTotalOrdersProfit(
				this._ordersDateRange,
				orderDateRange,
				orderTotalPrice
		);
		
		ChartsPanelComponent._incrementTotalOrdersProfit(
				this._ordersWeeksRange,
				orderWeekRange,
				orderTotalPrice
		);
		
		ChartsPanelComponent._incrementTotalOrdersProfit(
				this._ordersMonthsRange,
				orderMonthRange,
				orderTotalPrice
		);
		
		ChartsPanelComponent._incrementTotalOrdersProfit(
				this._ordersYearsRange,
				orderYear,
				orderTotalPrice
		);
	}
	
	private _setupProfitChartCancelledCommon(
			orderHour: number,
			orderTotalPrice: number
	)
	{
		ChartsPanelComponent._incrementCanceledOrdersProfit(
				this._ordersToday,
				orderHour,
				orderTotalPrice
		);
	}
	
	private _setupProfitChartCancelledOptionSelected(
			orderWeekDay: number,
			orderDate: number,
			orderMonth: number,
			orderYear: number,
			orderTotalPrice: number
	)
	{
		ChartsPanelComponent._incrementCanceledOrdersProfit(
				this._ordersLastWeek,
				orderWeekDay,
				orderTotalPrice
		);
		
		ChartsPanelComponent._incrementCanceledOrdersProfit(
				this._ordersLastMonth,
				orderDate,
				orderTotalPrice
		);
		
		ChartsPanelComponent._incrementCanceledOrdersProfit(
				this._ordersCurrentYear,
				orderMonth,
				orderTotalPrice
		);
		
		ChartsPanelComponent._incrementCanceledOrdersProfit(
				this._ordersYears,
				orderYear,
				orderTotalPrice
		);
	}
	
	private _setupProfitChartCancelledRangeSelected(
			orderDateRange: string,
			orderTotalPrice: number,
			orderWeekRange: string,
			orderMonthRange: string,
			orderYear: number
	)
	{
		ChartsPanelComponent._incrementCanceledOrdersProfit(
				this._ordersDateRange,
				orderDateRange,
				orderTotalPrice
		);
		
		ChartsPanelComponent._incrementCanceledOrdersProfit(
				this._ordersWeeksRange,
				orderWeekRange,
				orderTotalPrice
		);
		
		ChartsPanelComponent._incrementCanceledOrdersProfit(
				this._ordersMonthsRange,
				orderMonthRange,
				orderTotalPrice
		);
		
		ChartsPanelComponent._incrementCanceledOrdersProfit(
				this._ordersYearsRange,
				orderYear,
				orderTotalPrice
		);
	}
	
	private _setupProfitChartCompletedCommon(
			orderHour: number,
			orderTotalPrice: number
	)
	{
		ChartsPanelComponent._incrementCompletedOrdersProfit(
				this._ordersToday,
				orderHour,
				orderTotalPrice
		);
	}
	
	private _setupProfitChartCompletedOptionSelected(
			orderWeekDay: number,
			orderDate: number,
			orderMonth: number,
			orderYear: number,
			orderTotalPrice: number
	)
	{
		ChartsPanelComponent._incrementCompletedOrdersProfit(
				this._ordersLastWeek,
				orderWeekDay,
				orderTotalPrice
		);
		
		ChartsPanelComponent._incrementCompletedOrdersProfit(
				this._ordersLastMonth,
				orderDate,
				orderTotalPrice
		);
		
		ChartsPanelComponent._incrementCompletedOrdersProfit(
				this._ordersCurrentYear,
				orderMonth,
				orderTotalPrice
		);
		
		ChartsPanelComponent._incrementCompletedOrdersProfit(
				this._ordersYears,
				orderYear,
				orderTotalPrice
		);
	}
	
	private _setupProfitChartCompletedRangeSelected(
			orderDateRange: string,
			orderTotalPrice: number,
			orderWeekRange: string,
			orderMonthRange: string,
			orderYear: number
	)
	{
		ChartsPanelComponent._incrementCompletedOrdersProfit(
				this._ordersDateRange,
				orderDateRange,
				orderTotalPrice
		);
		
		ChartsPanelComponent._incrementCompletedOrdersProfit(
				this._ordersWeeksRange,
				orderWeekRange,
				orderTotalPrice
		);
		
		ChartsPanelComponent._incrementCompletedOrdersProfit(
				this._ordersMonthsRange,
				orderMonthRange,
				orderTotalPrice
		);
		
		ChartsPanelComponent._incrementCompletedOrdersProfit(
				this._ordersYearsRange,
				orderYear,
				orderTotalPrice
		);
	}
	
	private static _incrementTotalOrdersAmount(
			varToStore: IOrdersChartModel,
			key: number | string
	)
	{
		if(!varToStore.total[key])
		{
			varToStore.total[key] = 0;
		}
		varToStore.total[key] += 1;
	}
	
	private static _incrementCanceledOrdersAmount(
			varToStore: IOrdersChartModel,
			key: number | string
	)
	{
		if(!varToStore.cancelled[key])
		{
			varToStore.cancelled[key] = 0;
		}
		varToStore.cancelled[key] += 1;
	}
	
	private static _incrementCompletedOrdersAmount(
			varToStore: IOrdersChartModel,
			key: number | string
	)
	{
		if(!varToStore.completed[key])
		{
			varToStore.completed[key] = 0;
		}
		varToStore.completed[key] += 1;
	}
	
	private static _incrementTotalOrdersProfit(
			varToStore: IOrdersChartModel,
			key: number | string,
			value: number
	)
	{
		if(!varToStore.total[key])
		{
			varToStore.total[key] = 0;
		}
		varToStore.total[key] += value;
	}
	
	private static _incrementCanceledOrdersProfit(
			varToStore: IOrdersChartModel,
			key: number | string,
			value: number
	)
	{
		if(!varToStore.cancelled[key])
		{
			varToStore.cancelled[key] = 0;
		}
		varToStore.cancelled[key] += value;
	}
	
	private static _incrementCompletedOrdersProfit(
			varToStore: IOrdersChartModel,
			key: number | string,
			value: number
	)
	{
		if(!varToStore.completed[key])
		{
			varToStore.completed[key] = 0;
		}
		varToStore.completed[key] += value;
	}
	
	private _displayOrdersChart()
	{
		if(this.period === ChartsPanelComponent._PERIODS.today)
		{
			this._setupOrdersChartForToday();
		}
		else if(this.period === ChartsPanelComponent._PERIODS.lastWeek)
		{
			this._setupOrdersChartForLastWeek();
		}
		else if(this.period === ChartsPanelComponent._PERIODS.lastMonth)
		{
			this._setupOrdersChartForLastMonth();
		}
		else if(this.period === ChartsPanelComponent._PERIODS.currentYear)
		{
			this._setupOrdersChartForCurrentYear();
		}
		else if(this.period === ChartsPanelComponent._PERIODS.years)
		{
			this._setupOrdersChartForYears();
		}
		else if(this.period === ChartsPanelComponent._PERIODS.rangeDay)
		{
			this._setupOrdersChartForToday();
		}
		else if(this.period === ChartsPanelComponent._PERIODS.rangeDays)
		{
			this._setupOrdersChartForDaysRange();
		}
		else if(this.period === ChartsPanelComponent._PERIODS.rangeWeeks)
		{
			this._setupOrdersChartForWeeksRange();
		}
		else if(this.period === ChartsPanelComponent._PERIODS.rangeMonths)
		{
			this._setupOrdersChartForMonthsRange();
		}
		else if(this.period === ChartsPanelComponent._PERIODS.rangeYears)
		{
			this._setupOrdersChartForYearsRange();
		}
	}
	
	private _displayProfitChart()
	{
		if(this.period === ChartsPanelComponent._PERIODS.today)
		{
			this._setupProfitChartForToday();
		}
		else if(this.period === ChartsPanelComponent._PERIODS.lastWeek)
		{
			this._setupProfitChartForLastWeek();
		}
		else if(this.period === ChartsPanelComponent._PERIODS.lastMonth)
		{
			this._setupProfitChartForLastMonth();
		}
		else if(this.period === ChartsPanelComponent._PERIODS.currentYear)
		{
			this._setupProfitChartForCurrentYear();
		}
		else if(this.period === ChartsPanelComponent._PERIODS.years)
		{
			this._setupProfitChartForYears();
		}
		else if(this.period === ChartsPanelComponent._PERIODS.rangeDay)
		{
			this._setupProfitChartForToday();
		}
		else if(this.period === ChartsPanelComponent._PERIODS.rangeDays)
		{
			this._setupProfitChartForDaysRange();
		}
		else if(this.period === ChartsPanelComponent._PERIODS.rangeWeeks)
		{
			this._setupProfitChartForWeeksRange();
		}
		else if(this.period === ChartsPanelComponent._PERIODS.rangeMonths)
		{
			this._setupProfitChartForMonthsRange();
		}
		else if(this.period === ChartsPanelComponent._PERIODS.rangeYears)
		{
			this._setupProfitChartForYearsRange();
		}
	}
	
	private _setupOrdersChartForToday()
	{
		const hours = this._periodService.getHours();
		const initialLinesData = ChartsPanelComponent._getInitialChartData(hours.length);
		
		this.ordersChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
					hours.length,
					hours
			),
			linesData:  initialLinesData,
		};
		
		Object.keys(this._ordersToday.total).forEach((key) =>
		                                             {
			                                             const val = this._ordersToday.total[key];
			                                             const indexKey = ChartsPanelComponent._getIndexKey(key, hours.length - 1);
			
			                                             this.ordersChartData.linesData[0][indexKey] = val;
		                                             });
		Object.keys(this._ordersToday.cancelled).forEach((key) =>
		                                                 {
			                                                 const val = this._ordersToday.cancelled[key];
			                                                 const indexKey = ChartsPanelComponent._getIndexKey(key, hours.length - 1);
			
			                                                 this.ordersChartData.linesData[1][indexKey] = val;
		                                                 });
		Object.keys(this._ordersToday.completed).forEach((key) =>
		                                                 {
			                                                 const val = this._ordersToday.completed[key];
			                                                 const indexKey = ChartsPanelComponent._getIndexKey(key, hours.length - 1);
			
			                                                 this.ordersChartData.linesData[2][indexKey] = val;
		                                                 });
	}
	
	private _setupOrdersChartForLastWeek()
	{
		const weeksDays = this._periodService.getWeekDays();
		const initialLinesData = ChartsPanelComponent._getInitialChartData(weeksDays.length);
		
		this.ordersChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
					weeksDays.length,
					weeksDays
			),
			linesData:  initialLinesData,
		};
		
		Object.keys(this._ordersLastWeek.total).forEach((key) =>
		                                                {
			                                                const val = this._ordersLastWeek.total[key];
			                                                const indexKey = ChartsPanelComponent._getIndexKey(key, weeksDays.length - 1);
			
			                                                this.ordersChartData.linesData[0][indexKey] = val;
		                                                });
		Object.keys(this._ordersLastWeek.cancelled).forEach((key) =>
		                                                    {
			                                                    const val = this._ordersLastWeek.cancelled[key];
			                                                    const indexKey = ChartsPanelComponent._getIndexKey(key, weeksDays.length - 1);
			
			                                                    this.ordersChartData.linesData[1][indexKey] = val;
		                                                    });
		Object.keys(this._ordersLastWeek.completed).forEach((key) =>
		                                                    {
			                                                    const val = this._ordersLastWeek.completed[key];
			                                                    const indexKey = ChartsPanelComponent._getIndexKey(key, weeksDays.length - 1);
			
			                                                    this.ordersChartData.linesData[2][indexKey] = val;
		                                                    });
	}
	
	private _setupOrdersChartForLastMonth()
	{
		const dates = this._periodService.getDatesLastMonth();
		const initialLinesData = ChartsPanelComponent._getInitialChartData(dates.length);
		
		this.ordersChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
					dates.length,
					dates
			),
			linesData:  initialLinesData,
		};
		
		// Because the dates strat from 1 but array indexes start from 0 and we use dates for indexing.
		const indexFromDate = (key) => +key - 1;
		
		Object.keys(this._ordersLastMonth.total).forEach((key) =>
		                                                 {
			                                                 const val = this._ordersLastMonth.total[key];
			
			                                                 const indexKey = indexFromDate(key);
			                                                 this.ordersChartData.linesData[0][indexKey] = val;
		                                                 });
		Object.keys(this._ordersLastMonth.cancelled).forEach((key) =>
		                                                     {
			                                                     const val = this._ordersLastMonth.cancelled[key];
			
			                                                     const indexKey = indexFromDate(key);
			                                                     this.ordersChartData.linesData[1][indexKey] = val;
		                                                     });
		Object.keys(this._ordersLastMonth.completed).forEach((key) =>
		                                                     {
			                                                     const val = this._ordersLastMonth.completed[key];
			
			                                                     const indexKey = indexFromDate(key);
			                                                     this.ordersChartData.linesData[2][indexKey] = val;
		                                                     });
		
		console.log(this.ordersChartData.linesData);
	}
	
	private _setupOrdersChartForCurrentYear()
	{
		const months = this._periodService.getMonths();
		const initialLinesData = ChartsPanelComponent._getInitialChartData(months.length);
		
		this.ordersChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
					months.length,
					months
			),
			linesData:  initialLinesData,
		};
		
		Object.keys(this._ordersCurrentYear.total)
		      .forEach((key) => this.ordersChartData.linesData[0][key] = this._ordersCurrentYear.total[key]);
		Object.keys(this._ordersCurrentYear.cancelled)
		      .forEach((key) => this.ordersChartData.linesData[1][key] = this._ordersCurrentYear.cancelled[key]);
		Object.keys(this._ordersCurrentYear.completed)
		      .forEach((key) => this.ordersChartData.linesData[2][key] = this._ordersCurrentYear.completed[key]);
	}
	
	private _setupOrdersChartForYears()
	{
		const years = this._periodService.getYearLabels(this._yearsLabelRange);
		
		if(years.length === 1)
		{
			years.push(`${this._yearsLabelRange.to}`);
		}
		
		const initialLinesData = ChartsPanelComponent._getInitialChartData(years.length);
		
		this.ordersChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
					years.length,
					years
			),
			linesData:  initialLinesData,
		};
		
		const indexByKey = this._generageIndexesByKeys(years);
		
		Object.keys(this._ordersYears.total)
		      .forEach((key) => this.ordersChartData.linesData[0][indexByKey[key]] = this._ordersYears.total[key]);
		Object.keys(this._ordersYears.cancelled)
		      .forEach((key) => this.ordersChartData.linesData[1][indexByKey[key]] = this._ordersYears.cancelled[key]);
		Object.keys(this._ordersYears.completed)
		      .forEach((key) => this.ordersChartData.linesData[2][indexByKey[key]] = this._ordersYears.completed[key]);
	}
	
	private _setupOrdersChartForDaysRange()
	{
		const { keys, labels } = this._periodService.getDatesLabelsKeys(
				this._dateLabelRange
		);
		
		const initialLinesData = ChartsPanelComponent._getInitialChartData(labels.length);
		
		this.ordersChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
					labels.length,
					labels
			),
			linesData:  initialLinesData,
		};
		
		const indexByKey = this._generageIndexesByKeys(keys);
		
		Object.keys(this._ordersDateRange.total)
		      .forEach((key) => this.ordersChartData.linesData[0][indexByKey[key]] = this._ordersDateRange.total[key]);
		Object.keys(this._ordersDateRange.cancelled)
		      .forEach((key) => this.ordersChartData.linesData[1][indexByKey[key]] = this._ordersDateRange.cancelled[key]);
		Object.keys(this._ordersDateRange.completed)
		      .forEach((key) => this.ordersChartData.linesData[2][indexByKey[key]] = this._ordersDateRange.completed[key]);
	}
	
	private _setupOrdersChartForWeeksRange()
	{
		const { keys, labels } = this._periodService.getWeekLabelsKeys(
				this._dateLabelRange,
				ChartsPanelComponent._getDateWeekNumber
		);
		
		const initialLinesData = ChartsPanelComponent._getInitialChartData(labels.length);
		
		this.ordersChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
					labels.length,
					labels
			),
			linesData:  initialLinesData,
		};
		
		const indexByKey = this._generageIndexesByKeys(keys);
		
		Object.keys(this._ordersWeeksRange.total)
		      .forEach((key) => this.ordersChartData.linesData[0][indexByKey[key]] = this._ordersWeeksRange.total[key]);
		Object.keys(this._ordersWeeksRange.cancelled)
		      .forEach((key) => this.ordersChartData.linesData[1][indexByKey[key]] = this._ordersWeeksRange.cancelled[key]);
		Object.keys(this._ordersWeeksRange.completed)
		      .forEach((key) => this.ordersChartData.linesData[2][indexByKey[key]] = this._ordersWeeksRange.completed[key]);
	}
	
	private _setupOrdersChartForMonthsRange()
	{
		const { keys, labels } = this._periodService.getMonthLabelsKeys(
				this._dateLabelRange
		);
		
		const initialLinesData = ChartsPanelComponent._getInitialChartData(labels.length);
		
		this.ordersChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
					labels.length,
					labels
			),
			linesData:  initialLinesData,
		};
		
		const indexByKey = this._generageIndexesByKeys(keys);
		
		Object.keys(this._ordersMonthsRange.total)
		      .forEach((key) => this.ordersChartData.linesData[0][indexByKey[key]] = this._ordersMonthsRange.total[key]);
		Object.keys(this._ordersMonthsRange.cancelled)
		      .forEach((key) => this.ordersChartData.linesData[1][indexByKey[key]] = this._ordersMonthsRange.cancelled[key]);
		Object.keys(this._ordersMonthsRange.completed)
		      .forEach((key) => this.ordersChartData.linesData[2][indexByKey[key]] = this._ordersMonthsRange.completed[key]);
	}
	
	private _setupOrdersChartForYearsRange()
	{
		const years = this._periodService.getYearsByRange(this._dateLabelRange);
		const initialLinesData = ChartsPanelComponent._getInitialChartData(years.length);
		
		this.ordersChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
					years.length,
					years
			),
			linesData:  initialLinesData,
		};
		
		const indexByKey = this._generageIndexesByKeys(years);
		
		Object.keys(this._ordersYearsRange.total)
		      .forEach((key) => this.ordersChartData.linesData[0][indexByKey[key]] = this._ordersYearsRange.total[key]);
		Object.keys(this._ordersYearsRange.cancelled)
		      .forEach((key) => this.ordersChartData.linesData[1][indexByKey[key]] = this._ordersYearsRange.cancelled[key]);
		Object.keys(this._ordersYearsRange.completed)
		      .forEach((key) => this.ordersChartData.linesData[2][indexByKey[key]] = this._ordersYearsRange.completed[key]);
	}
	
	private _setupProfitChartForToday()
	{
		const hours = this._periodService.getHours();
		const initialLinesData = ChartsPanelComponent._getInitialChartData(hours.length);
		
		this.profitChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
					hours.length,
					hours
			),
			data:       initialLinesData,
		};
		
		Object.keys(this._ordersToday.total)
		      .forEach((key) =>
		               {
			               const indexKey = ChartsPanelComponent._getIndexKey(key, hours.length - 1);
			               this.profitChartData.data[2][indexKey] = this._ordersToday.total[key];
		               });
		Object.keys(this._ordersToday.cancelled)
		      .forEach((key) =>
		               {
			               const indexKey = ChartsPanelComponent._getIndexKey(key, hours.length - 1);
			               this.profitChartData.data[1][indexKey] = this._ordersToday.cancelled[key];
		               });
		Object.keys(this._ordersToday.completed)
		      .forEach((key) =>
		               {
			               const indexKey = ChartsPanelComponent._getIndexKey(key, hours.length - 1);
			               this.profitChartData.data[0][indexKey] = this._ordersToday.completed[key];
		               });
	}
	
	private _setupProfitChartForLastWeek()
	{
		const weeks = this._periodService.getWeekDays();
		const initialLinesData = ChartsPanelComponent._getInitialChartData(weeks.length);
		
		this.profitChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
					weeks.length,
					weeks
			),
			data:       initialLinesData,
		};
		
		Object.keys(this._ordersLastWeek.total)
		      .forEach((key) =>
		               {
			               const indexKey = ChartsPanelComponent._getIndexKey(key, weeks.length - 1);
			               this.profitChartData.data[2][indexKey] = this._ordersLastWeek.total[key];
		               });
		Object.keys(this._ordersLastWeek.cancelled)
		      .forEach((key) =>
		               {
			               const indexKey = ChartsPanelComponent._getIndexKey(key, weeks.length - 1);
			               this.profitChartData.data[1][indexKey] = this._ordersLastWeek.cancelled[key];
		               });
		Object.keys(this._ordersLastWeek.completed)
		      .forEach((key) =>
		               {
			               const indexKey = ChartsPanelComponent._getIndexKey(key, weeks.length - 1);
			               this.profitChartData.data[0][indexKey] = this._ordersLastWeek.completed[key];
		               });
	}
	
	private _setupProfitChartForLastMonth()
	{
		const dates = this._periodService.getDatesLastMonth();
		const initialLinesData = ChartsPanelComponent._getInitialChartData(dates.length);
		
		this.profitChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
					dates.length,
					dates
			),
			data:       initialLinesData,
		};
		
		// Because the dates strat from 1 but array indexes start from 0 and we use dates for indexing.
		const indexFromDate = (key) => +key - 1;
		
		Object.keys(this._ordersLastMonth.total)
		      .forEach((key) =>
		               {
			               const indexKey = indexFromDate(key);
			               this.profitChartData.data[2][indexKey] = this._ordersLastMonth.total[key];
		               });
		Object.keys(this._ordersLastMonth.cancelled)
		      .forEach((key) =>
		               {
			               const indexKey = indexFromDate(key);
			               this.profitChartData.data[1][indexKey] = this._ordersLastMonth.cancelled[key];
		               });
		Object.keys(this._ordersLastMonth.completed)
		      .forEach((key) =>
		               {
			               const indexKey = indexFromDate(key);
			               this.profitChartData.data[0][indexKey] = this._ordersLastMonth.completed[key];
		               });
	}
	
	private _setupProfitChartForCurrentYear()
	{
		const months = this._periodService.getMonths();
		const initialLinesData = ChartsPanelComponent._getInitialChartData(months.length);
		
		this.profitChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
					months.length,
					months
			),
			data:       initialLinesData,
		};
		
		Object.keys(this._ordersCurrentYear.total)
		      .forEach((key) => this.profitChartData.data[2][key] = this._ordersCurrentYear.total[key]);
		Object.keys(this._ordersCurrentYear.cancelled)
		      .forEach((key) => this.profitChartData.data[1][key] = this._ordersCurrentYear.cancelled[key]);
		Object.keys(this._ordersCurrentYear.completed)
		      .forEach((key) => this.profitChartData.data[0][key] = this._ordersCurrentYear.completed[key]);
	}
	
	private _setupProfitChartForYears()
	{
		const years = this._periodService.getYearLabels(this._yearsLabelRange);
		
		const initialLinesData = ChartsPanelComponent._getInitialChartData(years.length);
		
		this.profitChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
					years.length,
					years
			),
			data:       initialLinesData,
		};
		
		const indexByKey = this._generageIndexesByKeys(years);
		
		Object.keys(this._ordersYears.total)
		      .forEach((key) => this.profitChartData.data[2][indexByKey[key]] = this._ordersYears.total[key]);
		Object.keys(this._ordersYears.cancelled)
		      .forEach((key) => this.profitChartData.data[1][indexByKey[key]] = this._ordersYears.cancelled[key]);
		Object.keys(this._ordersYears.completed)
		      .forEach((key) => this.profitChartData.data[0][indexByKey[key]] = this._ordersYears.completed[key]);
	}
	
	private _setupProfitChartForDaysRange()
	{
		const { keys, labels } = this._periodService.getDatesLabelsKeys(
				this._dateLabelRange
		);
		
		const initialLinesData = ChartsPanelComponent._getInitialChartData(labels.length);
		
		this.profitChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
					labels.length,
					labels
			),
			data:       initialLinesData,
		};
		
		const indexByKey = this._generageIndexesByKeys(keys);
		
		Object.keys(this._ordersDateRange.total)
		      .forEach((key) => this.profitChartData.data[2][indexByKey[key]] = this._ordersDateRange.total[key]);
		Object.keys(this._ordersDateRange.cancelled)
		      .forEach((key) => this.profitChartData.data[1][indexByKey[key]] = this._ordersDateRange.cancelled[key]);
		Object.keys(this._ordersDateRange.completed)
		      .forEach((key) => this.profitChartData.data[0][indexByKey[key]] = this._ordersDateRange.completed[key]);
	}
	
	private _setupProfitChartForWeeksRange()
	{
		const { keys, labels } = this._periodService.getWeekLabelsKeys(
				this._dateLabelRange,
				ChartsPanelComponent._getDateWeekNumber
		);
		
		const initialLinesData = ChartsPanelComponent._getInitialChartData(labels.length);
		
		this.profitChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
					labels.length,
					labels
			),
			data:       initialLinesData,
		};
		
		const indexByKey = this._generageIndexesByKeys(keys);
		
		Object.keys(this._ordersWeeksRange.total)
		      .forEach((key) => this.profitChartData.data[2][indexByKey[key]] = this._ordersWeeksRange.total[key]);
		Object.keys(this._ordersWeeksRange.cancelled)
		      .forEach((key) => this.profitChartData.data[1][indexByKey[key]] = this._ordersWeeksRange.cancelled[key]);
		Object.keys(this._ordersWeeksRange.completed)
		      .forEach((key) => this.profitChartData.data[0][indexByKey[key]] = this._ordersWeeksRange.completed[key]);
	}
	
	private _setupProfitChartForMonthsRange()
	{
		const { keys, labels } = this._periodService.getMonthLabelsKeys(
				this._dateLabelRange
		);
		
		const initialLinesData = ChartsPanelComponent._getInitialChartData(labels.length);
		
		this.profitChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
					labels.length,
					labels
			),
			data:       initialLinesData,
		};
		
		const indexByKey = this._generageIndexesByKeys(keys);
		
		Object.keys(this._ordersMonthsRange.total)
		      .forEach((key) => this.profitChartData.data[2][indexByKey[key]] = this._ordersMonthsRange.total[key]);
		Object.keys(this._ordersMonthsRange.cancelled)
		      .forEach((key) => this.profitChartData.data[1][indexByKey[key]] = this._ordersMonthsRange.cancelled[key]);
		Object.keys(this._ordersMonthsRange.completed)
		      .forEach((key) => this.profitChartData.data[0][indexByKey[key]] = this._ordersMonthsRange.completed[key]);
	}
	
	private _setupProfitChartForYearsRange()
	{
		const years = this._periodService.getYearsByRange(this._dateLabelRange);
		const initialLinesData = ChartsPanelComponent._getInitialChartData(years.length);
		
		this.profitChartData = {
			chartLabel: this._ordersChartService.getDataLabels(
					years.length,
					years
			),
			data:       initialLinesData,
		};
		
		const indexByKey = this._generageIndexesByKeys(years);
		
		Object.keys(this._ordersYearsRange.total)
		      .forEach((key) => this.profitChartData.data[2][indexByKey[key]] = this._ordersYearsRange.total[key]);
		Object.keys(this._ordersYearsRange.cancelled)
		      .forEach((key) => this.profitChartData.data[1][indexByKey[key]] = this._ordersYearsRange.cancelled[key]);
		Object.keys(this._ordersYearsRange.completed)
		      .forEach((key) => this.profitChartData.data[0][indexByKey[key]] = this._ordersYearsRange.completed[key]);
	}
	
	private static _isOrderTodayPeriodMatch(order: Order): boolean
	{
		const dateToCompare = new Date();
		const orderDate = new Date(order._createdAt);
		
		// If we want to show yesterday orders.
		// dateToCompare.setDate(dateToCompare.getDate() - 1);
		
		const dateToCompareDay = dateToCompare.getDate();
		const dateToCompareWeek = ChartsPanelComponent._getDateWeekNumber(dateToCompare);
		const dateToCompareMonth = dateToCompare.getMonth();
		const dateToCompareYear = dateToCompare.getFullYear();
		
		const orderDay = orderDate.getDate();
		const orderWeek = ChartsPanelComponent._getDateWeekNumber(orderDate);
		const orderMonth = orderDate.getMonth();
		const orderYear = orderDate.getFullYear();
		
		return (
				orderDay === dateToCompareDay &&
				orderWeek === dateToCompareWeek &&
				orderMonth === dateToCompareMonth &&
				orderYear === dateToCompareYear
		);
	}
	
	private static _isOrderLastWeekPeriodMatch(order: Order): boolean
	{
		const dateToCompare = new Date();
		const orderDate = new Date(order._createdAt);
		
		dateToCompare.setDate(dateToCompare.getDate() - 7);
		
		const dateToCompareWeek = ChartsPanelComponent._getDateWeekNumber(dateToCompare);
		const dateToCompareYear = dateToCompare.getFullYear();
		
		const orderWeek = ChartsPanelComponent._getDateWeekNumber(orderDate);
		const orderYear = orderDate.getFullYear();
		
		// TODO: See correctness of these conditions
		return (
				(orderWeek === dateToCompareWeek &&
				 orderYear === dateToCompareYear) ||
				((orderWeek === 1 || orderWeek === 52) &&
				 orderWeek === dateToCompareWeek &&
				 Math.abs(orderYear - dateToCompareYear) === 1)
		);
	}
	
	private static _isOrderLastMonthPeriodMatch(order: Order): boolean
	{
		const orderDate = new Date(order._createdAt);
		const today = new Date();
		
		return (
				orderDate.getFullYear() === today.getFullYear() &&
				orderDate.getMonth() === today.getMonth()
		);
	}
	
	private static _isOrderCurrentYearPeriodMatch(order: Order): boolean
	{
		const dateToCompare = new Date();
		const orderDate = new Date(order._createdAt);
		
		return orderDate.getFullYear() === dateToCompare.getFullYear();
	}
	
	private _isOrderCustomDayPeriodMatch(order: Order): boolean
	{
		const dateToCompareDay = this._dateLabelRange.from.getDate();
		const dateToCompareWeek = ChartsPanelComponent._getDateWeekNumber(
				this._dateLabelRange.from
		);
		const dateToCompareMonth = this._dateLabelRange.from.getMonth();
		const dateToCompareYear = this._dateLabelRange.from.getFullYear();
		
		const orderDate = new Date(order._createdAt);
		const orderDay = orderDate.getDate();
		const orderWeek = ChartsPanelComponent._getDateWeekNumber(orderDate);
		const orderMonth = orderDate.getMonth();
		const orderYear = orderDate.getFullYear();
		
		return (
				orderDay === dateToCompareDay &&
				orderWeek === dateToCompareWeek &&
				orderMonth === dateToCompareMonth &&
				orderYear === dateToCompareYear
		);
	}
	
	private _isOrderRangePeriodMatch(order: Order): boolean
	{
		const from = this._dateLabelRange.from;
		const to = this._dateLabelRange.to;
		const orderDate = new Date(order._createdAt);
		
		return (
				orderDate.getTime() >= from.getTime() &&
				orderDate.getTime() <= to.getTime()
		);
	}
	
	private _resetChartData()
	{
		this._ordersToday = {
			total:     {},
			cancelled: {},
			completed: {},
		};
		this._ordersLastWeek = {
			total:     {},
			cancelled: {},
			completed: {},
		};
		this._ordersLastMonth = {
			total:     {},
			cancelled: {},
			completed: {},
		};
		this._ordersCurrentYear = {
			total:     {},
			cancelled: {},
			completed: {},
		};
		this._ordersYears = {
			total:     {},
			cancelled: {},
			completed: {},
		};
		this._ordersDateRange = {
			total:     {},
			cancelled: {},
			completed: {},
		};
		this._ordersWeeksRange = {
			total:     {},
			cancelled: {},
			completed: {},
		};
		this._ordersMonthsRange = {
			total:     {},
			cancelled: {},
			completed: {},
		};
		this._ordersYearsRange = {
			total:     {},
			cancelled: {},
			completed: {},
		};
	}
	
	private _resetChartPanelSummaryValues()
	{
		this._chartPanelSummaryTotal = 0;
		this._chartPanelSummaryCompleted = 0;
		this._chartPanelSummaryCancelled = 0;
	}
	
	private _sendRangeIfSelected()
	{
		this.preservedRanges$.next(this._dateLabelRange);
	}
	
	private _clearRangeFromHeader()
	{
		this.clearRange$.next();
	}
	
	private _translate(key: string)
	{
		let translationResult = '';
		
		this._translateService.get(key)
		    .subscribe((res) => translationResult = res);
		
		return translationResult;
	}
	
	private static _getIndexKey(key: string, maxIndexValue: number)
	{
		let indexKey = +key;
		
		indexKey = indexKey === 0 ? maxIndexValue : (indexKey - 1);
		
		return indexKey;
	}
	
	private static _calculateCustomPeriod(daysDiff: number)
	{
		switch(true)
		{
			case daysDiff === 0:
				return ChartsPanelComponent._PERIODS.rangeDay;
			case daysDiff > 0 && daysDiff <= 27:
				return ChartsPanelComponent._PERIODS.rangeDays;
			case daysDiff > 27 && daysDiff <= 60:
				return ChartsPanelComponent._PERIODS.rangeWeeks;
			case daysDiff > 60 && daysDiff <= 365:
				return ChartsPanelComponent._PERIODS.rangeMonths;
			case daysDiff > 365:
				return ChartsPanelComponent._PERIODS.rangeYears;
		}
	}
	
	private static _getInitialChartData(dataLength: number): number[][]
	{
		const dataRow = Array.from('0'.repeat(dataLength)).map((x) => +x);
		
		return [
			JSON.parse(JSON.stringify(dataRow)),
			JSON.parse(JSON.stringify(dataRow)),
			JSON.parse(JSON.stringify(dataRow)),
		];
	}
	
	private _generageIndexesByKeys(keys: string[])
	{
		const indexByKey = {};
		keys.forEach((key, index) => (indexByKey[key] = index));
		
		return indexByKey;
	}
	
	private static _getDateWeekNumber(date)
	{
		const target = new Date(date.valueOf());
		const dayNumber = (date.getUTCDay() + 6) % 7;
		let firstThursday;
		
		target.setUTCDate(target.getUTCDate() - dayNumber + 3);
		firstThursday = target.valueOf();
		target.setUTCMonth(0, 1);
		
		if(target.getUTCDay() !== 4)
		{
			target.setUTCMonth(0, 1 + ((4 - target.getUTCDay() + 7) % 7));
		}
		
		return (
				Math.ceil(
						(firstThursday - (target as any)) / (7 * 24 * 3600 * 1000)
				) + 1
		);
	}
	
	private _listenLangChange()
	{
		this._translateService.onLangChange
		    .pipe(takeUntil(this._ngDestroy$))
		    .subscribe(() =>
		               {
			               this._refreshChartData();
			               this._setChartsSummary();
		               });
	}
	
	private _refreshChartData()
	{
		switch(this.period)
		{
			case ChartsPanelComponent._PERIODS.lastWeek:
				this._refreshLastWeekChartData();
				break;
			case ChartsPanelComponent._PERIODS.lastMonth:
				this._refreshLastMonthChartData();
				break;
			case ChartsPanelComponent._PERIODS.currentYear:
				this._refreshCurrentYearChartData();
				break;
			case ChartsPanelComponent._PERIODS.rangeDays:
				this._refreshDaysRangeChartData();
				break;
			case ChartsPanelComponent._PERIODS.rangeWeeks:
				this._refreshWeeksRangeChartData();
				break;
			case ChartsPanelComponent._PERIODS.rangeMonths:
				this._refreshMonthsRangeChartData();
				break;
		}
	}
	
	private _refreshLastWeekChartData()
	{
		this._isOrderChartSelected
		? this._setupOrdersChartForLastWeek()
		: this._setupProfitChartForLastWeek();
	}
	
	private _refreshLastMonthChartData()
	{
		this._isOrderChartSelected
		? this._setupOrdersChartForLastMonth()
		: this._setupProfitChartForLastMonth();
	}
	
	private _refreshCurrentYearChartData()
	{
		this._isOrderChartSelected
		? this._setupOrdersChartForCurrentYear()
		: this._setupProfitChartForCurrentYear();
	}
	
	private _refreshDaysRangeChartData()
	{
		this._isOrderChartSelected
		? this._setupOrdersChartForDaysRange()
		: this._setupProfitChartForDaysRange();
	}
	
	private _refreshWeeksRangeChartData()
	{
		this._isOrderChartSelected
		? this._setupOrdersChartForWeeksRange()
		: this._setupProfitChartForWeeksRange();
	}
	
	private _refreshMonthsRangeChartData()
	{
		this._isOrderChartSelected
		? this._setupOrdersChartForMonthsRange()
		: this._setupProfitChartForMonthsRange();
	}
}
