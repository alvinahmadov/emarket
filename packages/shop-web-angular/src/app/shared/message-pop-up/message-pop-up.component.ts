import { Component, Inject, OnInit }     from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

type TMessagePopUpData = {
	confirmButton: string;
	cancelButton: string;
	modalTitle: string;
	commonText: string;
}

@Component({
	           selector:    'message-pop-up',
	           styleUrls:   ['./message-pop-up.component.scss'],
	           templateUrl: './message-pop-up.component.html',
           })
export class MessagePopUpComponent implements OnInit
{
	public PREFIX: string = 'MESSAGE_POP_UP.';
	public confirmButton: string;
	public cancelButton: string;
	public modalTitle: string;
	public commonText: string;
	
	constructor(
			public dialogRef: MatDialogRef<MessagePopUpComponent>,
			@Inject(MAT_DIALOG_DATA) public data: TMessagePopUpData
	)
	{}
	
	public ngOnInit()
	{
		this.initializeText();
	}
	
	public initializeText()
	{
		this.modalTitle = this.PREFIX + this.data.modalTitle;
		this.commonText = this.PREFIX + this.data.commonText;
		this.cancelButton = this.PREFIX + this.data.cancelButton;
		this.confirmButton = this.PREFIX + this.data.confirmButton;
	}
	
	public onNoClick(): void
	{
		this.dialogRef.close();
	}
}
