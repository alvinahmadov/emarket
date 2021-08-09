import { Component, Input } from "@angular/core";
import { TabsContainer }    from '../../containers/tabs-container';

@Component({
	           selector: "tab",
	           host: {
		           "[class.hidden]": "!active"
	           },
	           templateUrl: "./tab.component.html",
	           styleUrls: ["./tab.component.scss"]
           })
export class TabComponent
{
	@Input()
	public active: boolean;
	@Input()
	public title: string;
	
	public constructor(tabs: TabsContainer)
	{
		tabs.addTab(this);
	}
	
	public get Title()
	{
		return this.title;
	}
}
