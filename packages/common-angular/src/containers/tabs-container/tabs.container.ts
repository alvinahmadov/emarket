import {
	Component,
	Input,
	EventEmitter,
	Output
}                       from "@angular/core";
//@ts-ignore
import { TabComponent } from '../../components/tabs';

@Component({
	           selector: "tabs",
	           templateUrl: "./tabs.container.html",
	           styleUrls: ["./tabs.container.scss"]
           })
export class TabsContainer
{
	@Input()
	public disabled: boolean;
	@Output()
	public currentTabChange = new EventEmitter<TabComponent>();
	
	ifTabSelected: boolean = false;
	tabs: TabComponent[] = [];
	
	public addTab(tab: TabComponent)
	{
		this.tabs.push(tab);
	}
	
	public selectTab(tab: TabComponent)
	{
		this.tabs.forEach(tab =>
		                  {
			                  tab.active = false;
		                  });
		tab.active = true;
		this.currentTabChange.emit(tab);
	}
	
	public isDisabled()
	{
		if(this.disabled)
		{
			return "block";
		}
		else return "none";
	}
	
	public ngAfterViewInit()
	{
		this.tabs.forEach(tab =>
		                  {
			                  if(tab.active)
			                  {
				                  this.selectTab(tab);
				                  this.ifTabSelected = true;
			                  }
		                  });
		if(!this.ifTabSelected)
		{
			this.selectTab(this.tabs[0]);
		}
	}
}
