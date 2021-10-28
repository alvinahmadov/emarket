import { EventEmitter, Input, Directive } from '@angular/core';
import { ControlValueAccessor }           from '@angular/forms';

export type InputType = "text" | "password" | "email" | "color" |
                        "date" | "tel" | "submit" | "search" | "number" |
                        "file" | "hidden";

@Directive()
export abstract class InputComponent implements ControlValueAccessor
{
	@Input()
	public placeholder: string = '';
	
	@Input()
	public type: InputType = 'text';
	
	@Input()
	public disabled: boolean = false;
	
	@Input()
	public required: boolean = false;
	private changes: EventEmitter<string> = new EventEmitter<string>();
	private touches: EventEmitter<void> = new EventEmitter<void>();
	
	private _value: string;
	
	public get value(): string
	{
		return this._value;
	}
	
	public set value(value: string)
	{
		if(this._value !== value)
		{
			this._value = value;
			this.changes.emit(value);
		}
	}
	
	public writeValue(value: any)
	{
		if(typeof value !== 'string')
		{
			throw new Error('Written value is not string!');
		}
		
		if(!value)
		{
			value = '';
		}
		
		this._value = value;
	}
	
	public registerOnChange(fn: (value: string) => void)
	{
		this.changes.subscribe(fn);
	}
	
	public registerOnTouched(fn: () => void)
	{
		this.touches.subscribe(fn);
	}
	
	// Allows Angular to disable the input.
	public setDisabledState(isDisabled: boolean): void
	{
		this.disabled = isDisabled;
	}
	
	public touch()
	{
		this.touches.emit();
	}
}
